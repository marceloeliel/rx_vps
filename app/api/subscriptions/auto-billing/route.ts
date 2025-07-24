import { NextRequest, NextResponse } from 'next/server'
import { 
  getExpiredSubscriptions, 
  getBlockableSubscriptions,
  updateSubscriptionStatus,
  renewSubscription,
  type UserSubscription 
} from '@/lib/supabase/subscriptions'

// Função para criar cobrança no Asaas
async function createAsaasCharge(
  customerId: string, 
  value: number, 
  description: string
): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'PIX',
        value: value,
        dueDate: new Date().toISOString().split('T')[0], // Data atual
        description: description,
        externalReference: `subscription_renewal_${Date.now()}`,
        pixAddressKey: process.env.ASAAS_PIX_KEY
      })
    })

    if (!response.ok) {
      console.error('Erro ao criar cobrança no Asaas:', await response.text())
      return null
    }

    const payment = await response.json()
    return payment.id

  } catch (error) {
    console.error('Erro na requisição para Asaas:', error)
    return null
  }
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
        if (!subscription.asaas_customer_id) {
          results.errors.push(`Assinatura ${subscription.id}: customer_id não encontrado`)
          continue
        }

        // Criar cobrança no Asaas
        const paymentId = await createAsaasCharge(
          subscription.asaas_customer_id,
          subscription.plan_value,
          `Renovação ${subscription.plan_type} - ${new Date().toLocaleDateString('pt-BR')}`
        )

        if (!paymentId) {
          results.errors.push(`Assinatura ${subscription.id}: erro ao criar cobrança`)
          continue
        }

        // Renovar assinatura (muda status para pending_payment)
        const renewed = await renewSubscription(subscription.id)
        
        if (renewed) {
          // Atualizar com ID do pagamento
          await updateSubscriptionStatus(subscription.id, 'pending_payment', paymentId)
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