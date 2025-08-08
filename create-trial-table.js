const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function createTrialTable() {
  try {
    console.log('🚀 Iniciando criação da tabela trial_periods...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis de ambiente do Supabase não encontradas')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('🔧 Criando tabela trial_periods...')
    
    // Criar a tabela usando SQL direto
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS trial_periods (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        plan_type TEXT NOT NULL CHECK (plan_type IN ('basico', 'premium', 'premium_plus')),
        start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        converted_to_paid BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    // Tentar criar usando uma query simples
    try {
      const { error: createError } = await supabase
        .from('trial_periods')
        .select('*')
        .limit(1)
      
      if (createError && createError.code === 'PGRST116') {
        console.log('📋 Tabela não existe, tentando criar...')
        
        // Se a tabela não existe, vamos criar um período de teste manualmente para forçar a criação
        // Isso é um workaround já que não temos acesso direto ao SQL
        console.log('⚠️ Não é possível criar tabela via API. A tabela precisa ser criada manualmente no Supabase.')
        console.log('📝 SQL para executar no Supabase:')
        console.log(createTableSQL)
        
        return false
      } else if (!createError) {
        console.log('✅ Tabela trial_periods já existe!')
        return true
      } else {
        console.log('❌ Erro ao verificar tabela:', createError)
        return false
      }
    } catch (error) {
      console.log('❌ Erro ao verificar/criar tabela:', error)
      return false
    }
    
  } catch (error) {
    console.error('💥 Erro:', error)
    return false
  }
}

createTrialTable()
  .then((success) => {
    if (success) {
      console.log('🎉 Tabela trial_periods está disponível!')
    } else {
      console.log('⚠️ Tabela trial_periods precisa ser criada manualmente')
    }
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Falha no script:', error)
    process.exit(1)
  })