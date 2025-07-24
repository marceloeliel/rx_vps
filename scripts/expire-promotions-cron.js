#!/usr/bin/env node

/**
 * CRON JOB - Expiração de Promoções
 * 
 * Este script deve rodar diariamente para:
 * 1. Expirar usuários com promoção vencida
 * 2. Gerar cobranças automáticas para usuários que devem pagar
 * 3. Enviar notificações (se configurado)
 * 
 * Configurar no crontab:
 * 0 8 * * * /usr/bin/node /path/to/expire-promotions-cron.js
 */

const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente SUPABASE não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Função principal do cron job
 */
async function main() {
  console.log('🚀 Iniciando verificação de promoções expiradas...')
  console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}`)
  
  try {
    // 1. Expirar usuários promocionais vencidos
    await expirePromotionalUsers()
    
    // 2. Processar usuários que precisam de cobrança
    await processExpiredPromotionalUsers()
    
    // 3. Enviar notificações (se configurado)
    await sendExpirationNotifications()
    
    console.log('✅ Processamento concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro durante o processamento:', error)
    process.exit(1)
  }
}

/**
 * Expira usuários promocionais vencidos
 */
async function expirePromotionalUsers() {
  console.log('\n📋 Verificando usuários promocionais expirados...')
  
  try {
    const { data, error } = await supabase.rpc('expire_promotional_users')
    
    if (error) {
      throw error
    }
    
    const expiredCount = data || 0
    console.log(`✅ ${expiredCount} usuários promocionais expirados`)
    
    return expiredCount
  } catch (error) {
    console.error('❌ Erro ao expirar usuários promocionais:', error)
    throw error
  }
}

/**
 * Processa usuários que expiraram recentemente e precisam de cobrança
 */
async function processExpiredPromotionalUsers() {
  console.log('\n💳 Processando cobranças automáticas...')
  
  try {
    // Buscar usuários que expiraram nas últimas 24h e são agências
    const { data: expiredUsers, error } = await supabase
      .from('profiles')
      .select(`
        id, email, nome_completo, tipo_usuario, asaas_customer_id,
        promotional_end_date, promotional_campaign_id
      `)
      .eq('tipo_usuario', 'agencia')
      .eq('is_promotional_user', false)
      .gte('promotional_end_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .lt('promotional_end_date', new Date().toISOString())
      .not('promotional_end_date', 'is', null)
    
    if (error) {
      throw error
    }
    
    console.log(`📊 Encontrados ${expiredUsers?.length || 0} usuários para processamento`)
    
    let billingCreated = 0
    let billingErrors = 0
    
    for (const user of expiredUsers || []) {
      try {
        console.log(`🔄 Processando usuário: ${user.email}`)
        
        // Gerar cobrança automática via API
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/subscriptions/auto-billing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}` // Para autenticação interna
          },
          body: JSON.stringify({
            userId: user.id,
            reason: 'promotional_expired'
          })
        })
        
        if (response.ok) {
          billingCreated++
          console.log(`✅ Cobrança criada para: ${user.email}`)
        } else {
          billingErrors++
          console.log(`❌ Erro ao criar cobrança para: ${user.email}`)
        }
        
        // Aguardar um pouco entre requisições para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        billingErrors++
        console.error(`❌ Erro ao processar ${user.email}:`, error)
      }
    }
    
    console.log(`✅ Cobranças criadas: ${billingCreated}`)
    console.log(`❌ Erros de cobrança: ${billingErrors}`)
    
  } catch (error) {
    console.error('❌ Erro ao processar cobranças automáticas:', error)
    throw error
  }
}

/**
 * Envia notificações para usuários próximos do vencimento
 */
async function sendExpirationNotifications() {
  console.log('\n📧 Verificando notificações de vencimento...')
  
  try {
    // Buscar usuários promocionais que vencem em 3 dias
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    
    const { data: usersToNotify, error } = await supabase
      .from('profiles')
      .select(`
        id, email, nome_completo, tipo_usuario,
        promotional_end_date, promotional_campaign_id
      `)
      .eq('is_promotional_user', true)
      .gte('promotional_end_date', new Date().toISOString())
      .lte('promotional_end_date', threeDaysFromNow.toISOString())
    
    if (error) {
      throw error
    }
    
    console.log(`📊 ${usersToNotify?.length || 0} usuários para notificar`)
    
    // Aqui você pode integrar com serviços de email como:
    // - SendGrid
    // - Mailgun
    // - Amazon SES
    // - Ou qualquer outro provedor
    
    for (const user of usersToNotify || []) {
      // Exemplo de log (substituir por envio real de email)
      console.log(`📧 Notificação enviada para: ${user.email}`)
      
      // Exemplo de integração:
      // await sendEmail({
      //   to: user.email,
      //   subject: 'Seu período promocional expira em breve',
      //   template: 'promotional-expiration',
      //   data: {
      //     name: user.nome_completo,
      //     expirationDate: user.promotional_end_date
      //   }
      // })
    }
    
  } catch (error) {
    console.error('❌ Erro ao enviar notificações:', error)
    // Não lançar erro aqui para não parar o processo principal
  }
}

/**
 * Função para log com timestamp
 */
function logWithTimestamp(message) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

/**
 * Tratamento de sinais do sistema
 */
process.on('SIGINT', () => {
  console.log('\n⚠️  Processo interrompido pelo usuário')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n⚠️  Processo terminado pelo sistema')
  process.exit(0)
})

// Executar função principal
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 Cron job finalizado com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Cron job finalizado com erro:', error)
      process.exit(1)
    })
}

module.exports = {
  main,
  expirePromotionalUsers,
  processExpiredPromotionalUsers,
  sendExpirationNotifications
} 