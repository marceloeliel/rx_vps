const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function createTrialTable() {
  try {
    console.log('🚀 Iniciando criação da tabela trial_periods...')
    
    // Usar as credenciais do projeto
    const supabaseUrl = 'https://ecdmpndeunbzhaihabvi.supabase.co'
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkzMTEwNywiZXhwIjoyMDYxNTA3MTA3fQ.2CdNPp5I8RVsIqU1IJH3T_OHZDnveO7ZOZt4bn9QVn0'
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não encontradas')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('🔧 Criando tabela trial_periods...')
    
    // SQL para criar a tabela
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
      
      -- Criar índices para melhor performance
      CREATE INDEX IF NOT EXISTS idx_trial_periods_user_id ON trial_periods(user_id);
      CREATE INDEX IF NOT EXISTS idx_trial_periods_end_date ON trial_periods(end_date);
      
      -- Habilitar RLS (Row Level Security)
      ALTER TABLE trial_periods ENABLE ROW LEVEL SECURITY;
      
      -- Política para usuários verem apenas seus próprios períodos de teste
      CREATE POLICY "Users can view own trial periods" ON trial_periods
        FOR SELECT USING (auth.uid() = user_id);
      
      -- Política para inserção (apenas o próprio usuário)
      CREATE POLICY "Users can insert own trial periods" ON trial_periods
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      -- Política para atualização (apenas o próprio usuário)
      CREATE POLICY "Users can update own trial periods" ON trial_periods
        FOR UPDATE USING (auth.uid() = user_id);
    `
    
    // Executar o SQL usando rpc
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    })
    
    if (error) {
      console.error('❌ Erro ao criar tabela:', error)
      
      // Tentar método alternativo - verificar se a tabela já existe
      console.log('🔍 Verificando se a tabela já existe...')
      const { data: testData, error: testError } = await supabase
        .from('trial_periods')
        .select('*')
        .limit(1)
      
      if (testError && testError.code === 'PGRST116') {
        console.log('❌ Tabela não existe e não foi possível criar via API')
        console.log('📝 Execute este SQL manualmente no Supabase Dashboard:')
        console.log(createTableSQL)
        return false
      } else if (!testError) {
        console.log('✅ Tabela trial_periods já existe!')
        return true
      } else {
        console.log('❌ Erro ao verificar tabela:', testError)
        return false
      }
    } else {
      console.log('✅ Tabela trial_periods criada com sucesso!')
      return true
    }
    
  } catch (error) {
    console.error('💥 Erro:', error)
    console.log('📝 Execute este SQL manualmente no Supabase Dashboard:')
    console.log(`
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
    `)
    return false
  }
}

// Executar
createTrialTable()
  .then((success) => {
    if (success) {
      console.log('🎉 Processo concluído com sucesso!')
    } else {
      console.log('⚠️ Processo concluído com avisos')
    }
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Falha:', error)
    process.exit(1)
  })