const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  console.log('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUserSubscriptionsTable() {
  console.log('🚀 Iniciando criação da tabela user_subscriptions...')
  
  try {
    // SQL para criar a tabela user_subscriptions
    const createTableSQL = `
      -- Criar tabela user_subscriptions
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        plan_type TEXT NOT NULL CHECK (plan_type IN ('basico', 'premium', 'premium_plus', 'ilimitado')),
        plan_value DECIMAL(10,2) NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('active', 'pending_payment', 'blocked', 'cancelled')) DEFAULT 'active',
        last_payment_id TEXT,
        grace_period_ends_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Criar índices para melhor performance
      CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
      CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON user_subscriptions(end_date);
      CREATE INDEX IF NOT EXISTS idx_user_subscriptions_grace_period ON user_subscriptions(grace_period_ends_at);
      
      -- Habilitar RLS (Row Level Security)
      ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
    `
    
    console.log('📝 Executando SQL para criar tabela...')
    const { data: tableResult, error: tableError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    })
    
    if (tableError) {
      console.error('❌ Erro ao criar tabela:', tableError)
      throw tableError
    }
    
    console.log('✅ Tabela user_subscriptions criada com sucesso!')
    
    // SQL para criar políticas de segurança
    const createPoliciesSQL = `
      -- Políticas de segurança
      CREATE POLICY IF NOT EXISTS "Users can view own subscriptions" ON user_subscriptions
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can insert own subscriptions" ON user_subscriptions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can update own subscriptions" ON user_subscriptions
        FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Service role can manage subscriptions" ON user_subscriptions
        FOR ALL USING (current_setting('role') = 'service_role');
    `
    
    console.log('🔒 Criando políticas de segurança...')
    const { data: policiesResult, error: policiesError } = await supabase.rpc('exec_sql', {
      sql: createPoliciesSQL
    })
    
    if (policiesError) {
      console.error('⚠️ Erro ao criar políticas (pode ser normal se já existirem):', policiesError)
    } else {
      console.log('✅ Políticas de segurança criadas com sucesso!')
    }
    
    // Verificar se a tabela foi criada corretamente
    console.log('🔍 Verificando se a tabela foi criada...')
    const { data: checkResult, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(1)
    
    if (checkError) {
      console.error('❌ Erro ao verificar tabela:', checkError)
    } else {
      console.log('✅ Tabela user_subscriptions está funcionando corretamente!')
      console.log('📊 Registros encontrados:', checkResult?.length || 0)
    }
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    console.log('\n📋 Para criar manualmente no Supabase:')
    console.log('1. Acesse o painel do Supabase')
    console.log('2. Vá para "SQL Editor"')
    console.log('3. Execute o conteúdo do arquivo create-user-subscriptions-table.sql')
    process.exit(1)
  }
}

// Executar a migração
createUserSubscriptionsTable()
  .then(() => {
    console.log('\n🎉 Migração concluída com sucesso!')
    console.log('A tabela user_subscriptions está pronta para uso.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Falha na migração:', error)
    process.exit(1)
  })