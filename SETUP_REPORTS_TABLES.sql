-- =====================================================
-- INSTRUÇÕES PARA CRIAR TABELAS DE RELATÓRIOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Criar tabela para origens de leads
CREATE TABLE IF NOT EXISTS lead_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL,
  source_name VARCHAR(100) NOT NULL,
  lead_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agency_id, source_name)
);

-- 2. Criar tabela para métricas de performance
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  target_value DECIMAL(10,2),
  unit VARCHAR(20),
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela para satisfação do cliente
CREATE TABLE IF NOT EXISTS customer_satisfaction (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL,
  sale_id UUID,
  customer_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela para rastreamento de leads
CREATE TABLE IF NOT EXISTS lead_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  source VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'negociacao', 'convertido', 'perdido')),
  vehicle_interest_id UUID,
  notes TEXT,
  converted_to_sale_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_lead_sources_agency_id ON lead_sources(agency_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_agency_id ON performance_metrics(agency_id);
CREATE INDEX IF NOT EXISTS idx_customer_satisfaction_agency_id ON customer_satisfaction(agency_id);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_agency_id ON lead_tracking(agency_id);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_status ON lead_tracking(status);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_source ON lead_tracking(source);

-- 6. Criar triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lead_sources_updated_at BEFORE UPDATE ON lead_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_metrics_updated_at BEFORE UPDATE ON performance_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_satisfaction_updated_at BEFORE UPDATE ON customer_satisfaction FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lead_tracking_updated_at BEFORE UPDATE ON lead_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Habilitar Row Level Security (RLS)
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_satisfaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tracking ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas de segurança (assumindo que agency_id corresponde ao user ID)
CREATE POLICY "Users can view their own agency lead sources" ON lead_sources
    FOR SELECT USING (agency_id = auth.uid());

CREATE POLICY "Users can insert their own agency lead sources" ON lead_sources
    FOR INSERT WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Users can update their own agency lead sources" ON lead_sources
    FOR UPDATE USING (agency_id = auth.uid());

CREATE POLICY "Users can view their own agency performance metrics" ON performance_metrics
    FOR SELECT USING (agency_id = auth.uid());

CREATE POLICY "Users can insert their own agency performance metrics" ON performance_metrics
    FOR INSERT WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Users can update their own agency performance metrics" ON performance_metrics
    FOR UPDATE USING (agency_id = auth.uid());

CREATE POLICY "Users can view their own agency customer satisfaction" ON customer_satisfaction
    FOR SELECT USING (agency_id = auth.uid());

CREATE POLICY "Users can insert their own agency customer satisfaction" ON customer_satisfaction
    FOR INSERT WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Users can update their own agency customer satisfaction" ON customer_satisfaction
    FOR UPDATE USING (agency_id = auth.uid());

CREATE POLICY "Users can view their own agency lead tracking" ON lead_tracking
    FOR SELECT USING (agency_id = auth.uid());

CREATE POLICY "Users can insert their own agency lead tracking" ON lead_tracking
    FOR INSERT WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Users can update their own agency lead tracking" ON lead_tracking
    FOR UPDATE USING (agency_id = auth.uid());

CREATE POLICY "Users can delete their own agency lead tracking" ON lead_tracking
    FOR DELETE USING (agency_id = auth.uid());

-- 9. Inserir dados de exemplo (opcional - substitua 'YOUR_AGENCY_ID' pelo ID real da agência)
/*
INSERT INTO lead_sources (agency_id, source_name, lead_count) VALUES
('YOUR_AGENCY_ID', 'Site', 45),
('YOUR_AGENCY_ID', 'WhatsApp', 32),
('YOUR_AGENCY_ID', 'Indicação', 28),
('YOUR_AGENCY_ID', 'Redes Sociais', 15),
('YOUR_AGENCY_ID', 'Google Ads', 25),
('YOUR_AGENCY_ID', 'Facebook', 18)
ON CONFLICT (agency_id, source_name) DO UPDATE SET
  lead_count = EXCLUDED.lead_count,
  updated_at = NOW();

INSERT INTO customer_satisfaction (agency_id, rating, feedback) VALUES
('YOUR_AGENCY_ID', 4, 'Ótimo atendimento'),
('YOUR_AGENCY_ID', 5, 'Excelente processo de venda'),
('YOUR_AGENCY_ID', 4, 'Muito satisfeito com o serviço');
*/

-- =====================================================
-- INSTRUÇÕES:
-- 1. Copie e cole este SQL no Supabase Dashboard
-- 2. Execute no SQL Editor
-- 3. Para inserir dados de exemplo, descomente a seção 9
--    e substitua 'YOUR_AGENCY_ID' pelo ID real da agência
-- =====================================================