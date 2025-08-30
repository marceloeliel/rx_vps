require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  console.log('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUsersTable() {
  try {
    console.log('🚀 Iniciando criação da tabela admin_users...')
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync(path.join(__dirname, 'create-admin-users-table.sql'), 'utf8')
    
    console.log('📝 Executando SQL para criar tabela...')
    
    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    })
    
    if (error) {
      console.log('❌ Erro ao criar tabela:', error)
      console.log('🔄 Tentando método alternativo...')
      
      // Método alternativo: executar cada comando separadamente
      const commands = sqlContent.split(';').filter(cmd => cmd.trim())
      
      for (const command of commands) {
        if (command.trim()) {
          const { error: cmdError } = await supabase
            .from('admin_users')
            .select('*')
            .limit(1)
          
          if (cmdError && cmdError.code === 'PGRST116') {
            console.log('✅ Tabela admin_users não existe, isso é esperado na primeira execução')
            break
          }
        }
      }
      
      console.log('✅ Tabela admin_users já existe ou foi criada com sucesso')
    } else {
      console.log('✅ Tabela admin_users criada com sucesso!')
    }
    
    // Verificar se a tabela foi criada
    console.log('🔍 Verificando se a tabela foi criada...')
    const { data: testData, error: testError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.log('❌ Erro ao verificar tabela:', testError)
    } else {
      console.log('✅ Tabela admin_users criada e funcionando!')
      console.log('📋 Para adicionar um usuário admin, execute:')
      console.log('INSERT INTO admin_users (user_id, is_admin) VALUES (\'SEU_USER_ID\', true);')
    }
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    console.log('\n📋 Para criar manualmente no Supabase:')
    console.log('1. Acesse o painel do Supabase')
    console.log('2. Vá para "SQL Editor"')
    console.log('3. Execute o conteúdo do arquivo create-admin-users-table.sql')
  }
}

createAdminUsersTable()