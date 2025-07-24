const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createDadosAgenciaTable() {
  console.log('🚀 Verificando/criando tabela dados_agencia...')

  try {
    // Verificar se a tabela existe
    const { data: existingTable, error: checkError } = await supabase
      .from('dados_agencia')
      .select('id')
      .limit(1)

    if (!checkError) {
      console.log('✅ Tabela dados_agencia já existe')
      return
    }

    // Criar a tabela
    const { error: createError } = await supabase.rpc('create_dados_agencia_table')

    if (createError) {
      console.error('❌ Erro ao criar tabela:', createError)
      return
    }

    console.log('✅ Tabela dados_agencia criada com sucesso')
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

createDadosAgenciaTable() 