const { createClient } = require('@supabase/supabase-js')

async function createTrialTableFinal() {
  try {
    console.log('🚀 Criando tabela trial_periods no Supabase...')
    
    // Credenciais do projeto
    const supabaseUrl = 'https://ecdmpndeunbzhaihabvi.supabase.co'
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkzMTEwNywiZXhwIjoyMDYxNTA3MTA3fQ.2CdNPp5I8RVsIqU1IJH3T_OHZDnveO7ZOZt4bn9QVn0'
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('📋 Executando SQL para criar tabela...')
    
    // Executar SQL diretamente usando query
    const { data, error } = await supabase
      .from('_realtime_schema')
      .select('*')
      .limit(1)
    
    // Como não podemos usar exec_sql, vamos tentar criar via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql: `
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
          
          CREATE INDEX IF NOT EXISTS idx_trial_periods_user_id ON trial_periods(user_id);
          CREATE INDEX IF NOT EXISTS idx_trial_periods_end_date ON trial_periods(end_date);
          
          ALTER TABLE trial_periods ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can view own trial periods" ON trial_periods
            FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can insert own trial periods" ON trial_periods
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Users can update own trial periods" ON trial_periods
            FOR UPDATE USING (auth.uid() = user_id);
        `
      })
    })
    
    if (!response.ok) {
      console.log('❌ Não foi possível criar via API REST')
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

CREATE INDEX IF NOT EXISTS idx_trial_periods_user_id ON trial_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_periods_end_date ON trial_periods(end_date);

ALTER TABLE trial_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trial periods" ON trial_periods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trial periods" ON trial_periods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trial periods" ON trial_periods
  FOR UPDATE USING (auth.uid() = user_id);`)
      
      return false
    }
    
    console.log('✅ Tabela criada com sucesso!')
    
    // Testar se a tabela foi criada
    const { data: testData, error: testError } = await supabase
      .from('trial_periods')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.log('❌ Erro ao testar tabela:', testError.message)
      return false
    }
    
    console.log('✅ Tabela trial_periods está funcionando!')
    return true
    
  } catch (error) {
    console.error('💥 Erro:', error)
    console.log('\n📝 EXECUTE ESTE SQL NO SUPABASE DASHBOARD:')
    console.log('\n1. Acesse: https://supabase.com/dashboard')
    console.log('2. Vá para SQL Editor')
    console.log('3. Execute:')
    console.log(`\nCREATE TABLE IF NOT EXISTS trial_periods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basico', 'premium', 'premium_plus')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  converted_to_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trial_periods_user_id ON trial_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_periods_end_date ON trial_periods(end_date);

ALTER TABLE trial_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trial periods" ON trial_periods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trial periods" ON trial_periods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trial periods" ON trial_periods
  FOR UPDATE USING (auth.uid() = user_id);`)
    
    return false
  }
}

// Executar
createTrialTableFinal()
  .then((success) => {
    if (success) {
      console.log('🎉 Tabela criada com sucesso!')
      console.log('📋 Próximo passo: Ativar o hook real no código')
    } else {
      console.log('⚠️ Execute o SQL manualmente no Supabase')
    }
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Falha:', error)
    process.exit(1)
  })