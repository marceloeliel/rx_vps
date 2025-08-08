const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuração do Supabase
const supabaseUrl = 'https://ecdmpndeunbzhaihabvi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkzMTEwNywiZXhwIjoyMDYxNTA3MTA3fQ.2CdNPp5I8RVsIqU1IJH3T_OHZDnveO7ZOZt4bn9QVn0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executePlanSystem() {
  try {
    console.log('🚀 Executando sistema de controle de planos...')
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('./scripts/create-plan-control-system.sql', 'utf8')
    
    // Dividir o SQL em comandos menores para evitar problemas
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`📝 Executando ${sqlCommands.length} comandos SQL...`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i]
      
      if (command.includes('CREATE TABLE') || command.includes('INSERT INTO') || command.includes('UPDATE') || command.includes('CREATE OR REPLACE FUNCTION') || command.includes('CREATE POLICY') || command.includes('ALTER TABLE') || command.includes('CREATE INDEX') || command.includes('CREATE TRIGGER')) {
        try {
          console.log(`⏳ Executando comando ${i + 1}/${sqlCommands.length}...`)
          
          const { error } = await supabase.rpc('exec', {
            sql: command + ';'
          })
          
          if (error) {
            console.log(`⚠️  Erro no comando ${i + 1}: ${error.message}`)
            errorCount++
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`)
            successCount++
          }
          
          // Pequena pausa entre comandos
          await new Promise(resolve => setTimeout(resolve, 100))
          
        } catch (err) {
          console.log(`❌ Falha no comando ${i + 1}: ${err.message}`)
          errorCount++
        }
      }
    }
    
    console.log(`\n📊 Resumo da execução:`)
    console.log(`✅ Sucessos: ${successCount}`)
    console.log(`❌ Erros: ${errorCount}`)
    
    if (errorCount === 0) {
      console.log('🎉 Sistema de controle de planos criado com sucesso!')
    } else {
      console.log('⚠️  Sistema criado com alguns erros. Verifique os logs acima.')
    }
    
    // Testar as funções criadas
    console.log('\n🔍 Testando funções criadas...')
    
    try {
      const { data: planConfigs, error: planError } = await supabase
        .from('plan_configurations')
        .select('*')
        .limit(5)
      
      if (planError) {
        console.log(`❌ Erro ao buscar configurações de planos: ${planError.message}`)
      } else {
        console.log(`✅ Encontradas ${planConfigs?.length || 0} configurações de planos`)
        if (planConfigs && planConfigs.length > 0) {
          console.log('📋 Planos disponíveis:')
          planConfigs.forEach(plan => {
            console.log(`   - ${plan.plan_name} (${plan.plan_id}): R$ ${plan.plan_price} - Máx. ${plan.max_vehicles === 0 ? 'ilimitados' : plan.max_vehicles} veículos`)
          })
        }
      }
    } catch (err) {
      console.log(`❌ Erro no teste: ${err.message}`)
    }
    
  } catch (error) {
    console.error('💥 Erro durante a execução:', error)
  }
}

// Executar
executePlanSystem()
  .then(() => {
    console.log('\n✨ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Falha:', error)
    process.exit(1)
  })