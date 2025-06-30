-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asaas_payment_id VARCHAR(255) UNIQUE NOT NULL,
  asaas_customer_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  billing_type VARCHAR(50) NOT NULL, -- BOLETO, CREDIT_CARD, PIX, etc
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, RECEIVED, CONFIRMED, OVERDUE, etc
  due_date DATE,
  payment_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  external_reference VARCHAR(255),
  invoice_url TEXT,
  bank_slip_url TEXT,
  pix_qr_code TEXT,
  pix_qr_code_url TEXT,
  installment_count INTEGER,
  installment_value DECIMAL(10,2),
  subscription_id UUID,
  plan_id VARCHAR(100), -- basico, profissional, empresarial
  metadata JSONB, -- Para armazenar dados extras do Asaas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_asaas_payment_id ON payments(asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_billing_type ON payments(billing_type);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asaas_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  asaas_customer_id VARCHAR(255),
  plan_id VARCHAR(100) NOT NULL, -- basico, profissional, empresarial
  billing_type VARCHAR(50) NOT NULL, -- BOLETO, CREDIT_CARD, PIX
  cycle VARCHAR(50) NOT NULL, -- MONTHLY, YEARLY, etc
  value DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, OVERDUE, CANCELLED
  next_due_date DATE,
  started_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  external_reference VARCHAR(255),
  metadata JSONB, -- Para armazenar dados extras do Asaas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para assinaturas
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_asaas_subscription_id ON subscriptions(asaas_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_due_date ON subscriptions(next_due_date);

-- Adicionar colunas na tabela profiles se não existirem
DO $$
BEGIN
  -- Adicionar asaas_customer_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'asaas_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN asaas_customer_id VARCHAR(255);
  END IF;

  -- Adicionar asaas_subscription_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'asaas_subscription_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN asaas_subscription_id VARCHAR(255);
  END IF;

  -- Adicionar plano_payment_method se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'plano_payment_method'
  ) THEN
    ALTER TABLE profiles ADD COLUMN plano_payment_method VARCHAR(50);
  END IF;

  -- Adicionar plano_valor se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'plano_valor'
  ) THEN
    ALTER TABLE profiles ADD COLUMN plano_valor DECIMAL(10,2);
  END IF;
END
$$;

-- Criar índices para as novas colunas em profiles
CREATE INDEX IF NOT EXISTS idx_profiles_asaas_customer_id ON profiles(asaas_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_asaas_subscription_id ON profiles(asaas_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_plano_atual ON profiles(plano_atual);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger para payments
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger para subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Criar políticas RLS (Row Level Security)

-- Habilitar RLS nas tabelas
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para payments
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Criar view para estatísticas de pagamentos (opcional)
CREATE OR REPLACE VIEW payment_stats AS
SELECT 
  user_id,
  COUNT(*) as total_payments,
  SUM(CASE WHEN status = 'RECEIVED' OR status = 'CONFIRMED' THEN amount ELSE 0 END) as total_paid,
  SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END) as total_pending,
  SUM(CASE WHEN status = 'OVERDUE' THEN amount ELSE 0 END) as total_overdue,
  COUNT(CASE WHEN status = 'RECEIVED' OR status = 'CONFIRMED' THEN 1 END) as successful_payments,
  COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) as overdue_payments,
  MAX(payment_date) as last_payment_date,
  MIN(created_at) as first_payment_date
FROM payments
GROUP BY user_id;

-- Comentários nas tabelas
COMMENT ON TABLE payments IS 'Tabela para armazenar histórico de pagamentos integrados com Asaas';
COMMENT ON TABLE subscriptions IS 'Tabela para armazenar assinaturas recorrentes integradas com Asaas';
COMMENT ON COLUMN payments.asaas_payment_id IS 'ID do pagamento no sistema Asaas';
COMMENT ON COLUMN payments.billing_type IS 'Tipo de cobrança: BOLETO, CREDIT_CARD, PIX, etc';
COMMENT ON COLUMN payments.status IS 'Status do pagamento: PENDING, RECEIVED, CONFIRMED, OVERDUE, etc';
COMMENT ON COLUMN subscriptions.asaas_subscription_id IS 'ID da assinatura no sistema Asaas';
COMMENT ON COLUMN subscriptions.cycle IS 'Ciclo da assinatura: MONTHLY, YEARLY, etc'; 