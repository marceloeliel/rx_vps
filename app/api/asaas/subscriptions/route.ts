import { NextRequest, NextResponse } from 'next/server'
import { createAsaasSubscription, listAsaasSubscriptions, AsaasSubscription } from '@/lib/asaas-api'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validar dados obrigatórios
    if (!body.customer || !body.billingType || !body.value || !body.nextDueDate || !body.cycle) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios: customer, billingType, value, nextDueDate, cycle' 
      }, { status: 400 })
    }

    // Preparar dados da assinatura
    const subscriptionData: AsaasSubscription = {
      customer: body.customer,
      billingType: body.billingType,
      value: body.value,
      nextDueDate: body.nextDueDate,
      cycle: body.cycle,
      description: body.description,
      endDate: body.endDate,
      maxPayments: body.maxPayments,
      externalReference: body.externalReference,
      split: body.split,
      creditCard: body.creditCard,
      creditCardHolderInfo: body.creditCardHolderInfo,
      creditCardToken: body.creditCardToken,
      discount: body.discount,
      interest: body.interest,
      fine: body.fine
    }

    const subscription = await createAsaasSubscription(subscriptionData)

    // Salvar informações da assinatura no banco de dados local
    if (body.saveToDatabase) {
      const { error: saveError } = await supabase
        .from('profiles')
        .update({
          plano_atual: body.planId || 'basico',
          plano_data_inicio: new Date().toISOString(),
          plano_data_fim: body.endDate || null,
          asaas_subscription_id: subscription.id
        })
        .eq('id', user.id)

      if (saveError) {
        console.error('Erro ao salvar assinatura no banco local:', saveError)
      }
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Erro ao criar assinatura Asaas:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    const params = {
      customer: searchParams.get('customer') || undefined,
      billingType: searchParams.get('billingType') || undefined,
      status: searchParams.get('status') || undefined,
      externalReference: searchParams.get('externalReference') || undefined,
      order: searchParams.get('order') || undefined,
      sort: searchParams.get('sort') || undefined,
      offset: parseInt(searchParams.get('offset') || '0'),
      limit: parseInt(searchParams.get('limit') || '100')
    }

    const subscriptions = await listAsaasSubscriptions(params)

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Erro ao listar assinaturas Asaas:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
} 