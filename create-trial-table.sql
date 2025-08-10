-- SQL para criar a tabela trial_periods no Supabase
-- Execute este código no Supabase Dashboard > SQL Editor

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

-- Política para service role (para operações administrativas)
CREATE POLICY "Service role can manage trial periods" ON trial_periods
  FOR ALL USING (current_setting('role') = 'service_role');