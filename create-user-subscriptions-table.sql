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

-- Políticas de segurança
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL USING (current_setting('role') = 'service_role');

-- Comentários para documentação
COMMENT ON TABLE user_subscriptions IS 'Tabela para gerenciar assinaturas dos usuários';
COMMENT ON COLUMN user_subscriptions.plan_type IS 'Tipo do plano: basico, premium, premium_plus, ilimitado';
COMMENT ON COLUMN user_subscriptions.status IS 'Status da assinatura: active, pending_payment, blocked, cancelled';
COMMENT ON COLUMN user_subscriptions.grace_period_ends_at IS 'Data limite do período de tolerância para pagamentos pendentes';