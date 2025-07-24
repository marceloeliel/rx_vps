import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { 
  getUserActiveSubscription, 
  createSubscription, 
  updateSubscriptionStatus,
  checkUserAccess,
  PLAN_CONFIGS,
  type UserSubscription
} from '@/lib/supabase/subscriptions'
import { createTrialPeriod, checkTrialPeriod } from '@/lib/supabase/trial'

// GET - Buscar assinatura ativa do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    }

    const subscription = await getUserActiveSubscription(userId)
    
    if (!subscription) {
      return NextResponse.json({ 
        message: 'Nenhuma assinatura ativa encontrada',
        subscription: null 
      })
    }

    // Verificar status de acesso
    const accessCheck = await checkUserAccess(userId)

    return NextResponse.json({
      subscription,
      access: accessCheck,
      plans: PLAN_CONFIGS
    })

  } catch (error) {
    console.error('Erro ao buscar assinatura:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar nova assinatura
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, planType, asaasCustomerId, startTrial = false } = body

    if (!userId || !planType) {
      return NextResponse.json({ 
        error: 'userId e planType são obrigatórios' 
      }, { status: 400 })
    }

    if (!PLAN_CONFIGS[planType as keyof typeof PLAN_CONFIGS]) {
      return NextResponse.json({ 
        error: 'Plano inválido. Opções: basico, premium, premium_plus' 
      }, { status: 400 })
    }

    // Verificar se já existe assinatura ativa
    const existingSubscription = await getUserActiveSubscription(userId)
    if (existingSubscription) {
      return NextResponse.json({ 
        error: 'Usuário já possui uma assinatura ativa',
        subscription: existingSubscription
      }, { status: 409 })
    }

    // Se solicitado período de teste
    if (startTrial) {
      // Verificar se usuário já teve período de teste
      const trialStatus = await checkTrialPeriod(userId)
      if (trialStatus.isInTrial || trialStatus.trialPeriod) {
        return NextResponse.json({
          error: 'Usuário já utilizou ou está utilizando o período de teste',
          trialPeriod: trialStatus.trialPeriod
        }, { status: 409 })
      }

      // Criar período de teste
      const trialPeriod = await createTrialPeriod(userId, planType as keyof typeof PLAN_CONFIGS)
      if (!trialPeriod) {
        return NextResponse.json({
          error: 'Erro ao criar período de teste'
        }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Período de teste iniciado com sucesso',
        trialPeriod
      }, { status: 201 })
    }

    // Se não for trial, criar assinatura normal
    const subscription = await createSubscription(userId, planType, asaasCustomerId)

    if (!subscription) {
      return NextResponse.json({ 
        error: 'Erro ao criar assinatura' 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Assinatura criada com sucesso',
      subscription
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar assinatura:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar status da assinatura
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriptionId, status, paymentId } = body

    if (!subscriptionId || !status) {
      return NextResponse.json({ 
        error: 'subscriptionId e status são obrigatórios' 
      }, { status: 400 })
    }

    const validStatuses = ['active', 'pending_payment', 'blocked', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Status inválido. Opções: ${validStatuses.join(', ')}` 
      }, { status: 400 })
    }

    const success = await updateSubscriptionStatus(subscriptionId, status, paymentId)

    if (!success) {
      return NextResponse.json({ 
        error: 'Erro ao atualizar status da assinatura' 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Status da assinatura atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 