import { NextRequest, NextResponse } from 'next/server'
import { 
  getExpiredSubscriptions, 
  getBlockableSubscriptions,
  updateSubscriptionStatus,
  renewSubscription,
  canCreateBillingForUser,
  type UserSubscription 
} from '@/lib/supabase/subscriptions'

// Função de cobrança no Asaas removida - sistema de pagamentos desabilitado
// async function createAsaasCharge(...) { ... }

// Sistema de pagamentos Asaas foi completamente desabilitado
async function createAsaasCharge(
  customerId: string, 
  value: number, 
  description: string
): Promise<string | null> {
  console.log('⚠️ Sistema de pagamentos Asaas desabilitado - cobrança não criada')
  return null
}

// POST - Processar cobranças automáticas (chamado por cron job)
export async function POST(request: NextRequest) {
  try {
    // Verificar autorização (pode ser uma chave secreta)
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET_KEY}`
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const results = {
      processedExpired: 0,
      processedBlocked: 0,
      errors: [] as string[]
    }

    // 1. Processar assinaturas que venceram (criar cobrança automática)
    const expiredSubscriptions = await getExpiredSubscriptions()
    
    for (const subscription of expiredSubscriptions) {
      try {
        // Verificação de asaas_customer_id removida - sistema de pagamentos desabilitado

        // Verificar se pode criar cobrança (validação adicional de período de teste)
        const billingValidation = await canCreateBillingForUser(subscription.user_id)
        
        if (!billingValidation.canCreate) {
          const trialEndDate = billingValidation.trialEndDate
          const trialEndStr = trialEndDate ? trialEndDate.toLocaleDateString('pt-BR') : 'data não disponível'
          results.errors.push(`Assinatura ${subscription.id}: ${billingValidation.reason} até ${trialEndStr}`)
          continue
        }

        // Criação de cobrança no Asaas desabilitada - sistema de pagamentos removido
        console.log(`⚠️ Sistema Asaas desabilitado - pulando cobrança para assinatura ${subscription.id}`)
        
        // Sistema desabilitado - pular criação de cobrança
        results.errors.push(`Assinatura ${subscription.id}: sistema de pagamentos desabilitado`)
        continue

        // Renovar assinatura (muda status para pending_payment)
        const renewed = await renewSubscription(subscription.id)
        
        if (renewed) {
          // Atualizar com ID do pagamento
          await updateSubscriptionStatus(subscription.id, 'pending_payment', undefined)
          results.processedExpired++
        } else {
          results.errors.push(`Assinatura ${subscription.id}: erro ao renovar`)
        }

      } catch (error) {
        results.errors.push(`Assinatura ${subscription.id}: ${error}`)
      }
    }

    // 2. Processar assinaturas que excederam período de tolerância (bloquear)
    const blockableSubscriptions = await getBlockableSubscriptions()
    
    for (const subscription of blockableSubscriptions) {
      try {
        const blocked = await updateSubscriptionStatus(subscription.id, 'blocked')
        
        if (blocked) {
          results.processedBlocked++
        } else {
          results.errors.push(`Assinatura ${subscription.id}: erro ao bloquear`)
        }

      } catch (error) {
        results.errors.push(`Assinatura ${subscription.id}: ${error}`)
      }
    }

    return NextResponse.json({
      message: 'Processamento de cobrança automática concluído',
      results: {
        ...results,
        totalExpired: expiredSubscriptions.length,
        totalBlocked: blockableSubscriptions.length
      }
    })

  } catch (error) {
    console.error('Erro no processamento automático:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error 
    }, { status: 500 })
  }
}

// GET - Status do sistema de cobrança automática (para debug)
export async function GET() {
  try {
    const expiredSubscriptions = await getExpiredSubscriptions()
    const blockableSubscriptions = await getBlockableSubscriptions()

    return NextResponse.json({
      status: 'Sistema funcionando',
      statistics: {
        expiredSubscriptions: expiredSubscriptions.length,
        blockableSubscriptions: blockableSubscriptions.length,
        lastCheck: new Date().toISOString()
      },
      expired: expiredSubscriptions.map(sub => ({
        id: sub.id,
        user_id: sub.user_id,
        plan_type: sub.plan_type,
        end_date: sub.end_date,
        status: sub.status
      })),
      blockable: blockableSubscriptions.map(sub => ({
        id: sub.id,
        user_id: sub.user_id,
        plan_type: sub.plan_type,
        grace_period_ends_at: sub.grace_period_ends_at,
        status: sub.status
      }))
    })

  } catch (error) {
    console.error('Erro ao verificar status:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}