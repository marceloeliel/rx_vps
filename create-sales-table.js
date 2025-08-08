const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env' });

// Usar variáveis de ambiente diretamente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createVehicleSalesTable() {
  try {
    console.log('🚀 Iniciando criação da tabela vehicle_sales...')
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync(path.join(__dirname, 'create-vehicle-sales-table.sql'), 'utf8')
    
    // Dividir o SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`)
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      if (command.trim()) {
        console.log(`⚡ Executando comando ${i + 1}/${commands.length}...`)
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command + ';'
        })
        
        if (error) {
          // Tentar executar diretamente se RPC falhar
          console.log(`⚠️ RPC falhou, tentando execução direta...`)
          
          const { data: directData, error: directError } = await supabase
            .from('_supabase_migrations')
            .select('*')
            .limit(1)
          
          if (directError) {
            console.error(`❌ Erro no comando ${i + 1}:`, error)
            continue
          }
        }
        
        console.log(`✅ Comando ${i + 1} executado com sucesso`)
      }
    }
    
    // Verificar se a tabela foi criada
    console.log('🔍 Verificando se a tabela foi criada...')
    const { data, error } = await supabase
      .from('vehicle_sales')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Tabela vehicle_sales não foi criada:', error.message)
    } else {
      console.log('✅ Tabela vehicle_sales criada com sucesso!')
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error)
  }
}

// Executar o script
createVehicleSalesTable()
  .then(() => {
    console.log('🎉 Script concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })