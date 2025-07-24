-- Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('basico', 'premium', 'premium_plus')),
    plan_value DECIMAL(10,2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_payment', 'blocked', 'cancelled')),
    last_payment_id TEXT,
    asaas_customer_id TEXT,
    grace_period_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON user_subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_grace_period ON user_subscriptions(grace_period_ends_at);

-- RLS policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy para usuários verem apenas suas próprias assinaturas
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy para usuários atualizarem suas próprias assinaturas
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy para inserir assinaturas (via API)
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
    FOR ALL USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular data de vencimento (30 dias)
CREATE OR REPLACE FUNCTION calculate_subscription_end_date(start_date TIMESTAMP WITH TIME ZONE)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN start_date + INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Função para calcular fim do período de tolerância (5 dias após vencimento)
CREATE OR REPLACE FUNCTION calculate_grace_period_end(end_date TIMESTAMP WITH TIME ZONE)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN end_date + INTERVAL '5 days';
END;
$$ LANGUAGE plpgsql; 