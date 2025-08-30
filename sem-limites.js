#!/usr/bin/env node

/**
 * 🚀 SCRIPT: SEM LIMITES
 * 
 * Este script libera usuários do período de trial e concede acesso ilimitado
 * 
 * USO:
 * node sem-limites.js <email_do_usuario>
 * 
 * EXEMPLOS:
 * node sem-limites.js rxnegocio@yahoo.com
 * node sem-limites.js marcelo@teste.com
 * node sem-limites.js usuario@exemplo.com
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  console.log('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function liberarUsuarioSemLimites(email) {
  try {
    console.log(`🔍 Procurando usuário ${email}...`)
    
    // Buscar o usuário pelo email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('❌ Erro ao buscar usuários:', userError)
      return false
    }
    
    const user = userData.users.find(u => u.email === email)
    
    if (!user) {
      console.error(`❌ Usuário ${email} não encontrado!`)
      console.log('\n📋 Usuários disponíveis:')
      userData.users.forEach(u => {
        console.log(`  - ${u.email} (${u.id})`)
      })
      return false
    }
    
    console.log('✅ Usuário encontrado:', user.email)
    console.log('🆔 ID do usuário:', user.id)
    
    // Buscar o perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError)
      return false
    }
    
    console.log('📋 Perfil atual:')
    console.log('  - Nome:', profileData.nome_completo)
    console.log('  - Plano atual:', profileData.plano_atual)
    console.log('  - Acesso ilimitado:', profileData.unlimited_access)
    console.log('  - Data início plano:', profileData.plano_data_inicio)
    console.log('  - Data fim plano:', profileData.plano_data_fim)
    
    // Verificar se existe na tabela trial_periods
    const { data: trialData, error: trialError } = await supabase
      .from('trial_periods')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (trialError && trialError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar trial:', trialError)
    } else if (trialData) {
      console.log('📅 Dados do trial:')
      console.log('  - Tipo do plano:', trialData.plan_type)
      console.log('  - Data início:', trialData.start_date)
      console.log('  - Data fim:', trialData.end_date)
      console.log('  - Convertido para pago:', trialData.converted_to_paid)
    } else {
      console.log('ℹ️ Usuário não está na tabela trial_periods')
    }
    
    // Atualizar o perfil para acesso ilimitado
    console.log('\n🔄 Atualizando perfil para acesso ilimitado...')
    
    const updateData = {
      unlimited_access: true,
      plano_atual: 'ilimitado',
      plano_data_inicio: new Date().toISOString(),
      plano_data_fim: null, // Sem data de fim para acesso ilimitado
      updated_at: new Date().toISOString()
    }
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
    
    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError)
      return false
    }
    
    console.log('✅ Perfil atualizado com sucesso!')
    
    // Se existir na tabela trial_periods, marcar como convertido
    if (trialData) {
      console.log('\n🔄 Atualizando status do trial...')
      
      const { error: trialUpdateError } = await supabase
        .from('trial_periods')
        .update({ 
          converted_to_paid: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      
      if (trialUpdateError) {
        console.warn('⚠️ Não foi possível atualizar trial_periods:', trialUpdateError)
      } else {
        console.log('✅ Trial marcado como convertido para pago!')
      }
    }
    
    // Verificar se a atualização foi bem-sucedida
    console.log('\n🔍 Verificando atualização...')
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('unlimited_access, plano_atual, plano_data_inicio, plano_data_fim')
      .eq('id', user.id)
      .single()
    
    if (verifyError) {
      console.error('❌ Erro ao verificar atualização:', verifyError)
      return false
    }
    
    console.log('✅ Verificação final:')
    console.log('  - Acesso ilimitado:', verifyData.unlimited_access)
    console.log('  - Plano atual:', verifyData.plano_atual)
    console.log('  - Data início plano:', verifyData.plano_data_inicio)
    console.log('  - Data fim plano:', verifyData.plano_data_fim)
    
    console.log('\n🎉 USUÁRIO LIBERADO COM SUCESSO!')
    console.log('📧 Email:', user.email)
    console.log('🔓 Status: Acesso ilimitado ativo')
    console.log('📅 Data de liberação:', new Date().toLocaleString('pt-BR'))
    
    return true
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
    return false
  }
}

async function main() {
  const email = process.argv[2]
  
  if (!email) {
    console.log('🚀 SCRIPT: SEM LIMITES')
    console.log('========================')
    console.log('')
    console.log('Este script libera usuários do período de trial e concede acesso ilimitado')
    console.log('')
    console.log('USO:')
    console.log('  node sem-limites.js <email_do_usuario>')
    console.log('')
    console.log('EXEMPLOS:')
    console.log('  node sem-limites.js rxnegocio@yahoo.com')
    console.log('  node sem-limites.js marcelo@teste.com')
    console.log('  node sem-limites.js usuario@exemplo.com')
    console.log('')
    console.log('⚠️  IMPORTANTE: Certifique-se de que o usuário existe no sistema')
    console.log('')
    process.exit(1)
  }
  
  console.log('🚀 SCRIPT: SEM LIMITES')
  console.log('========================')
  console.log('📧 Email:', email)
  console.log('📅 Data:', new Date().toLocaleString('pt-BR'))
  console.log('')
  
  const success = await liberarUsuarioSemLimites(email)
  
  if (success) {
    console.log('\n✅ Script executado com sucesso!')
    process.exit(0)
  } else {
    console.log('\n❌ Script falhou! Verifique os erros acima.')
    process.exit(1)
  }
}

// Executar o script
main().catch((error) => {
  console.error('❌ Erro fatal:', error)
  process.exit(1)
})

