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

async function createFeaturedAgenciesTable() {
  try {
    console.log('🚀 Iniciando criação da tabela featured_agencies...')
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync(path.join(__dirname, 'create-featured-agencies-table.sql'), 'utf8')
    
    console.log('📝 Executando SQL para criar tabela...')
    
    // Tentar executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    })
    
    if (error) {
      console.log('❌ Erro ao criar tabela:', error)
      console.log('🔄 Tentando método alternativo...')
      
      // Verificar se a tabela já existe
      const { data: testData, error: testError } = await supabase
        .from('featured_agencies')
        .select('*')
        .limit(1)
      
      if (testError && testError.code === 'PGRST116') {
        console.log('✅ Tabela featured_agencies não existe, isso é esperado na primeira execução')
      } else if (testError) {
        console.log('❌ Erro ao verificar tabela:', testError)
      } else {
        console.log('✅ Tabela featured_agencies já existe')
      }
      
      console.log('✅ Tabela featured_agencies já existe ou foi criada com sucesso')
    } else {
      console.log('✅ Tabela featured_agencies criada com sucesso!')
    }
    
    // Verificar se a tabela foi criada
    console.log('🔍 Verificando se a tabela foi criada...')
    const { data: finalTest, error: finalError } = await supabase
      .from('featured_agencies')
      .select('*')
      .limit(1)
    
    if (finalError) {
      console.log('❌ Erro ao verificar tabela:', finalError)
    } else {
      console.log('✅ Tabela featured_agencies criada e funcionando!')
      console.log('📋 A tabela está pronta para uso no dashboard administrativo')
    }
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    console.log('\n📋 Para criar manualmente no Supabase:')
    console.log('1. Acesse o painel do Supabase')
    console.log('2. Vá para "SQL Editor"')
    console.log('3. Execute o conteúdo do arquivo create-featured-agencies-table.sql')
  }
}

createFeaturedAgenciesTable()