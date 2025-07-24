-- Criar tabela de períodos de teste
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_trial_periods_user_id ON trial_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_periods_end_date ON trial_periods(end_date);
CREATE INDEX IF NOT EXISTS idx_trial_periods_converted ON trial_periods(converted_to_paid);

-- RLS policies
ALTER TABLE trial_periods ENABLE ROW LEVEL SECURITY;

-- Policy para usuários verem apenas seus próprios períodos de teste
CREATE POLICY "Users can view own trial periods" ON trial_periods
    FOR SELECT USING (auth.uid() = user_id);

-- Policy para serviço gerenciar períodos de teste
CREATE POLICY "Service role can manage trial periods" ON trial_periods
    FOR ALL USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_trial_periods_updated_at
    BEFORE UPDATE ON trial_periods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 