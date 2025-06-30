import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createClient()

    console.log('Webhook Asaas recebido:', body)

    // Verificar se é uma notificação válida do Asaas
    if (!body.event || !body.payment) {
      return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
    }

    const { event, payment } = body

    // Processar diferentes tipos de eventos
    switch (event) {
      case 'PAYMENT_CREATED':
        await handlePaymentCreated(payment, supabase)
        break

      case 'PAYMENT_RECEIVED':
        await handlePaymentReceived(payment, supabase)
        break

      case 'PAYMENT_CONFIRMED':
        await handlePaymentConfirmed(payment, supabase)
        break

      case 'PAYMENT_OVERDUE':
        await handlePaymentOverdue(payment, supabase)
        break

      case 'PAYMENT_DELETED':
        await handlePaymentDeleted(payment, supabase)
        break

      case 'PAYMENT_RESTORED':
        await handlePaymentRestored(payment, supabase)
        break

      case 'PAYMENT_REFUNDED':
        await handlePaymentRefunded(payment, supabase)
        break

      case 'PAYMENT_RECEIVED_IN_CASH_UNDONE':
        await handlePaymentReceivedInCashUndone(payment, supabase)
        break

      case 'PAYMENT_CHARGEBACK_REQUESTED':
        await handlePaymentChargebackRequested(payment, supabase)
        break

      case 'PAYMENT_CHARGEBACK_DISPUTE':
        await handlePaymentChargebackDispute(payment, supabase)
        break

      case 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL':
        await handlePaymentAwaitingChargebackReversal(payment, supabase)
        break

      case 'PAYMENT_DUNNING_RECEIVED':
        await handlePaymentDunningReceived(payment, supabase)
        break

      case 'PAYMENT_DUNNING_REQUESTED':
        await handlePaymentDunningRequested(payment, supabase)
        break

      case 'PAYMENT_BANK_SLIP_VIEWED':
        await handlePaymentBankSlipViewed(payment, supabase)
        break

      case 'PAYMENT_CHECKOUT_VIEWED':
        await handlePaymentCheckoutViewed(payment, supabase)
        break

      default:
        console.log(`Evento não tratado: ${event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook Asaas:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

// Handlers para diferentes tipos de eventos

async function handlePaymentCreated(payment: any, supabase: any) {
  console.log('Pagamento criado:', payment.id)
  
  // Salvar ou atualizar informações do pagamento no banco
  await updatePaymentStatus(payment, 'PENDING', supabase)
}

async function handlePaymentReceived(payment: any, supabase: any) {
  console.log('Pagamento recebido:', payment.id)
  
  // Atualizar status do pagamento e ativar plano se for assinatura
  await updatePaymentStatus(payment, 'RECEIVED', supabase)
  await activateSubscriptionIfNeeded(payment, supabase)
}

async function handlePaymentConfirmed(payment: any, supabase: any) {
  console.log('Pagamento confirmado:', payment.id)
  
  // Atualizar status e ativar serviços
  await updatePaymentStatus(payment, 'CONFIRMED', supabase)
  await activateSubscriptionIfNeeded(payment, supabase)
}

async function handlePaymentOverdue(payment: any, supabase: any) {
  console.log('Pagamento vencido:', payment.id)
  
  // Atualizar status e enviar notificações
  await updatePaymentStatus(payment, 'OVERDUE', supabase)
  await handleOverdueSubscription(payment, supabase)
}

async function handlePaymentDeleted(payment: any, supabase: any) {
  console.log('Pagamento deletado:', payment.id)
  
  await updatePaymentStatus(payment, 'DELETED', supabase)
}

async function handlePaymentRestored(payment: any, supabase: any) {
  console.log('Pagamento restaurado:', payment.id)
  
  await updatePaymentStatus(payment, 'PENDING', supabase)
}

async function handlePaymentRefunded(payment: any, supabase: any) {
  console.log('Pagamento estornado:', payment.id)
  
  await updatePaymentStatus(payment, 'REFUNDED', supabase)
  await deactivateSubscriptionIfNeeded(payment, supabase)
}

async function handlePaymentReceivedInCashUndone(payment: any, supabase: any) {
  console.log('Confirmação de pagamento em dinheiro desfeita:', payment.id)
  
  await updatePaymentStatus(payment, 'PENDING', supabase)
}

async function handlePaymentChargebackRequested(payment: any, supabase: any) {
  console.log('Chargeback solicitado:', payment.id)
  
  await updatePaymentStatus(payment, 'CHARGEBACK_REQUESTED', supabase)
}

async function handlePaymentChargebackDispute(payment: any, supabase: any) {
  console.log('Contestação de chargeback:', payment.id)
  
  await updatePaymentStatus(payment, 'CHARGEBACK_DISPUTE', supabase)
}

async function handlePaymentAwaitingChargebackReversal(payment: any, supabase: any) {
  console.log('Aguardando reversão de chargeback:', payment.id)
  
  await updatePaymentStatus(payment, 'AWAITING_CHARGEBACK_REVERSAL', supabase)
}

async function handlePaymentDunningReceived(payment: any, supabase: any) {
  console.log('Cobrança de negativação recebida:', payment.id)
  
  await updatePaymentStatus(payment, 'DUNNING_RECEIVED', supabase)
}

async function handlePaymentDunningRequested(payment: any, supabase: any) {
  console.log('Negativação solicitada:', payment.id)
  
  await updatePaymentStatus(payment, 'DUNNING_REQUESTED', supabase)
}

async function handlePaymentBankSlipViewed(payment: any, supabase: any) {
  console.log('Boleto visualizado:', payment.id)
  
  // Registrar evento de visualização (opcional)
}

async function handlePaymentCheckoutViewed(payment: any, supabase: any) {
  console.log('Checkout visualizado:', payment.id)
  
  // Registrar evento de visualização (opcional)
}

// Funções auxiliares

async function updatePaymentStatus(payment: any, status: string, supabase: any) {
  try {
    // Tentar encontrar o usuário pela referência externa ou customer ID
    let userId = payment.externalReference

    if (!userId && payment.customer) {
      // Buscar pelo customer ID do Asaas
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('asaas_customer_id', payment.customer)
        .single()

      if (profile) {
        userId = profile.id
      }
    }

    if (!userId) {
      console.error('Usuário não encontrado para o pagamento:', payment.id)
      return
    }

    // Atualizar ou inserir registro de pagamento
    const { error } = await supabase
      .from('payments')
      .upsert({
        user_id: userId,
        asaas_payment_id: payment.id,
        amount: payment.value,
        billing_type: payment.billingType,
        status: status,
        due_date: payment.dueDate,
        payment_date: payment.paymentDate || null,
        description: payment.description,
        external_reference: payment.externalReference,
        invoice_url: payment.invoiceUrl || null,
        bank_slip_url: payment.bankSlipUrl || null,
        pix_qr_code: payment.pixQrCode || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'asaas_payment_id'
      })

    if (error) {
      console.error('Erro ao atualizar pagamento:', error)
    }
  } catch (error) {
    console.error('Erro ao processar atualização de pagamento:', error)
  }
}

async function activateSubscriptionIfNeeded(payment: any, supabase: any) {
  try {
    if (payment.subscription) {
      // Buscar o usuário pela assinatura
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('asaas_subscription_id', payment.subscription)
        .single()

      if (profile) {
        // Ativar plano do usuário
        const { error } = await supabase
          .from('profiles')
          .update({
            plano_data_inicio: new Date().toISOString(),
            plano_data_fim: calculatePlanEndDate(payment),
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)

        if (error) {
          console.error('Erro ao ativar assinatura:', error)
        } else {
          console.log('Assinatura ativada para usuário:', profile.id)
        }
      }
    }
  } catch (error) {
    console.error('Erro ao ativar assinatura:', error)
  }
}

async function handleOverdueSubscription(payment: any, supabase: any) {
  try {
    if (payment.subscription) {
      // Buscar o usuário pela assinatura
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('asaas_subscription_id', payment.subscription)
        .single()

      if (profile) {
        // Marcar como vencido mas não desativar imediatamente
        // Pode implementar uma lógica de carência
        console.log('Assinatura vencida para usuário:', profile.id)
      }
    }
  } catch (error) {
    console.error('Erro ao processar assinatura vencida:', error)
  }
}

async function deactivateSubscriptionIfNeeded(payment: any, supabase: any) {
  try {
    if (payment.subscription) {
      // Buscar o usuário pela assinatura
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('asaas_subscription_id', payment.subscription)
        .single()

      if (profile) {
        // Desativar plano do usuário
        const { error } = await supabase
          .from('profiles')
          .update({
            plano_data_fim: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)

        if (error) {
          console.error('Erro ao desativar assinatura:', error)
        } else {
          console.log('Assinatura desativada para usuário:', profile.id)
        }
      }
    }
  } catch (error) {
    console.error('Erro ao desativar assinatura:', error)
  }
}

function calculatePlanEndDate(payment: any): string {
  // Calcular data de fim baseada no ciclo da assinatura
  const now = new Date()
  
  // Por padrão, assumir ciclo mensal
  const endDate = new Date(now)
  endDate.setMonth(endDate.getMonth() + 1)
  
  return endDate.toISOString()
} 