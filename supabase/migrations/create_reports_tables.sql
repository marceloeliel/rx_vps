-- Criar tabela para origem dos leads
CREATE TABLE IF NOT EXISTS lead_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_name VARCHAR(100) NOT NULL, -- Site, WhatsApp, Indicação, Redes Sociais, etc.
  lead_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar duplicatas
  UNIQUE(agency_id, source_name)
);

-- Criar tabela para métricas de performance
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL, -- Taxa de Conversão, Ticket Médio, Vendas/Mês, Satisfação
  metric_value DECIMAL(12,2) NOT NULL,
  target_value DECIMAL(12,2) NOT NULL,
  unit VARCHAR(10) NOT NULL, -- %, R$, '', /5
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para avaliações de satisfação
CREATE TABLE IF NOT EXISTS customer_satisfaction (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES vehicle_sales(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para tracking de leads individuais
CREATE TABLE IF NOT EXISTS lead_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  source VARCHAR(100) NOT NULL, -- Site, WhatsApp, Indicação, Redes Sociais
  status VARCHAR(50) NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'negociacao', 'convertido', 'perdido')),
  vehicle_interest_id UUID REFERENCES veiculos(id) ON DELETE SET NULL,
  notes TEXT,
  converted_to_sale_id UUID REFERENCES vehicle_sales(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_lead_sources_agency_id ON lead_sources(agency_id);
CREATE INDEX IF NOT EXISTS idx_lead_sources_source_name ON lead_sources(source_name);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_agency_id ON performance_metrics(agency_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_period ON performance_metrics(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_customer_satisfaction_agency_id ON customer_satisfaction(agency_id);
CREATE INDEX IF NOT EXISTS idx_customer_satisfaction_sale_id ON customer_satisfaction(sale_id);
CREATE INDEX IF NOT EXISTS idx_customer_satisfaction_rating ON customer_satisfaction(rating);

CREATE INDEX IF NOT EXISTS idx_lead_tracking_agency_id ON lead_tracking(agency_id);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_source ON lead_tracking(source);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_status ON lead_tracking(status);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_created_at ON lead_tracking(created_at);

-- Criar triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lead_sources_updated_at BEFORE UPDATE ON lead_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at BEFORE UPDATE ON performance_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_satisfaction_updated_at BEFORE UPDATE ON customer_satisfaction
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_tracking_updated_at BEFORE UPDATE ON lead_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Criar função para atualizar automaticamente lead_sources quando um lead é criado
CREATE OR REPLACE FUNCTION update_lead_source_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Incrementar contador para a fonte do lead
    INSERT INTO lead_sources (agency_id, source_name, lead_count)
    VALUES (NEW.agency_id, NEW.source, 1)
    ON CONFLICT (agency_id, source_name)
    DO UPDATE SET 
        lead_count = lead_sources.lead_count + 1,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_lead_source_count
    AFTER INSERT ON lead_tracking
    FOR EACH ROW EXECUTE FUNCTION update_lead_source_count();

-- Criar função para calcular métricas de performance automaticamente
CREATE OR REPLACE FUNCTION calculate_performance_metrics(p_agency_id UUID, p_period_start DATE, p_period_end DATE)
RETURNS VOID AS $$
DECLARE
    v_total_leads INTEGER;
    v_converted_leads INTEGER;
    v_conversion_rate DECIMAL(5,2);
    v_total_sales DECIMAL(12,2);
    v_sales_count INTEGER;
    v_average_ticket DECIMAL(12,2);
    v_avg_satisfaction DECIMAL(2,1);
BEGIN
    -- Calcular total de leads no período
    SELECT COUNT(*) INTO v_total_leads
    FROM lead_tracking
    WHERE agency_id = p_agency_id
    AND created_at::DATE BETWEEN p_period_start AND p_period_end;
    
    -- Calcular leads convertidos
    SELECT COUNT(*) INTO v_converted_leads
    FROM lead_tracking
    WHERE agency_id = p_agency_id
    AND status = 'convertido'
    AND created_at::DATE BETWEEN p_period_start AND p_period_end;
    
    -- Calcular taxa de conversão
    v_conversion_rate := CASE WHEN v_total_leads > 0 THEN (v_converted_leads::DECIMAL / v_total_leads::DECIMAL) * 100 ELSE 0 END;
    
    -- Calcular vendas do período
    SELECT COALESCE(SUM(sale_price), 0), COUNT(*) INTO v_total_sales, v_sales_count
    FROM vehicle_sales
    WHERE agency_id = p_agency_id
    AND created_at::DATE BETWEEN p_period_start AND p_period_end
    AND status = 'concluida';
    
    -- Calcular ticket médio
    v_average_ticket := CASE WHEN v_sales_count > 0 THEN v_total_sales / v_sales_count ELSE 0 END;
    
    -- Calcular satisfação média
    SELECT COALESCE(AVG(rating), 0) INTO v_avg_satisfaction
    FROM customer_satisfaction cs
    JOIN vehicle_sales vs ON cs.sale_id = vs.id
    WHERE cs.agency_id = p_agency_id
    AND cs.created_at::DATE BETWEEN p_period_start AND p_period_end;
    
    -- Inserir/atualizar métricas
    INSERT INTO performance_metrics (agency_id, metric_name, metric_value, target_value, unit, period_start, period_end)
    VALUES 
        (p_agency_id, 'Taxa de Conversão', v_conversion_rate, 15.00, '%', p_period_start, p_period_end),
        (p_agency_id, 'Ticket Médio', v_average_ticket, 50000.00, 'R$', p_period_start, p_period_end),
        (p_agency_id, 'Vendas/Mês', v_sales_count, 10.00, '', p_period_start, p_period_end),
        (p_agency_id, 'Satisfação', v_avg_satisfaction, 4.50, '/5', p_period_start, p_period_end)
    ON CONFLICT (agency_id, metric_name, period_start, period_end) 
    DO UPDATE SET 
        metric_value = EXCLUDED.metric_value,
        updated_at = NOW();
END;
$$ language 'plpgsql';

-- Habilitar RLS (Row Level Security)
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_satisfaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tracking ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
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