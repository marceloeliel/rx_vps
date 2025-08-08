-- Create lead_sources table
CREATE TABLE IF NOT EXISTS lead_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    lead_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(agency_id, source_name)
);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    target_value NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create customer_satisfaction table
CREATE TABLE IF NOT EXISTS customer_satisfaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES vehicle_sales(id) ON DELETE SET NULL,
    customer_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create lead_tracking table
CREATE TABLE IF NOT EXISTS lead_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    source TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('novo', 'contatado', 'negociacao', 'convertido', 'perdido')),
    vehicle_interest_id UUID REFERENCES veiculos(id) ON DELETE SET NULL,
    notes TEXT,
    converted_to_sale_id UUID REFERENCES vehicle_sales(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    converted_at TIMESTAMP WITH TIME ZONE
);

-- Create function to calculate performance metrics
CREATE OR REPLACE FUNCTION calculate_performance_metrics(
    p_agency_id UUID,
    p_period_start TIMESTAMP WITH TIME ZONE,
    p_period_end TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
DECLARE
    v_total_leads INTEGER;
    v_converted_leads INTEGER;
    v_total_sales INTEGER;
    v_avg_satisfaction NUMERIC;
BEGIN
    -- Calculate total leads
    SELECT COUNT(*) INTO v_total_leads
    FROM lead_tracking
    WHERE agency_id = p_agency_id
    AND created_at BETWEEN p_period_start AND p_period_end;

    -- Calculate converted leads
    SELECT COUNT(*) INTO v_converted_leads
    FROM lead_tracking
    WHERE agency_id = p_agency_id
    AND status = 'convertido'
    AND converted_at BETWEEN p_period_start AND p_period_end;

    -- Calculate total sales
    SELECT COUNT(*) INTO v_total_sales
    FROM vehicle_sales
    WHERE agency_id = p_agency_id
    AND created_at BETWEEN p_period_start AND p_period_end;

    -- Calculate average satisfaction
    SELECT AVG(rating) INTO v_avg_satisfaction
    FROM customer_satisfaction
    WHERE agency_id = p_agency_id
    AND created_at BETWEEN p_period_start AND p_period_end;

    -- Insert or update lead conversion rate
    INSERT INTO performance_metrics (
        agency_id,
        metric_name,
        metric_value,
        target_value,
        unit,
        period_start,
        period_end
    ) VALUES (
        p_agency_id,
        'taxa_conversao_leads',
        CASE WHEN v_total_leads > 0 THEN (v_converted_leads::NUMERIC / v_total_leads) * 100 ELSE 0 END,
        50, -- Target value of 50%
        'percentual',
        p_period_start,
        p_period_end
    ) ON CONFLICT (agency_id, metric_name, period_start, period_end)
    DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        updated_at = TIMEZONE('utc', NOW());

    -- Insert or update total sales
    INSERT INTO performance_metrics (
        agency_id,
        metric_name,
        metric_value,
        target_value,
        unit,
        period_start,
        period_end
    ) VALUES (
        p_agency_id,
        'total_vendas',
        v_total_sales,
        10, -- Target value of 10 sales
        'quantidade',
        p_period_start,
        p_period_end
    ) ON CONFLICT (agency_id, metric_name, period_start, period_end)
    DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        updated_at = TIMEZONE('utc', NOW());

    -- Insert or update customer satisfaction
    INSERT INTO performance_metrics (
        agency_id,
        metric_name,
        metric_value,
        target_value,
        unit,
        period_start,
        period_end
    ) VALUES (
        p_agency_id,
        'satisfacao_cliente',
        COALESCE(v_avg_satisfaction, 0),
        4.5, -- Target value of 4.5 stars
        'estrelas',
        p_period_start,
        p_period_end
    ) ON CONFLICT (agency_id, metric_name, period_start, period_end)
    DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        updated_at = TIMEZONE('utc', NOW());
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lead_sources_agency_id ON lead_sources(agency_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_agency_id ON performance_metrics(agency_id);
CREATE INDEX IF NOT EXISTS idx_customer_satisfaction_agency_id ON customer_satisfaction(agency_id);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_agency_id ON lead_tracking(agency_id);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_status ON lead_tracking(status);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_created_at ON lead_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_period ON performance_metrics(period_start, period_end);

-- Create RLS policies
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_satisfaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tracking ENABLE ROW LEVEL SECURITY;

-- Policy for lead_sources
CREATE POLICY "Users can view their agency's lead sources"
    ON lead_sources FOR SELECT
    USING (agency_id IN (
        SELECT id FROM dados_agencia WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their agency's lead sources"
    ON lead_sources FOR ALL
    USING (agency_id IN (
        SELECT id FROM dados_agencia WHERE user_id = auth.uid()
    ));

-- Policy for performance_metrics
CREATE POLICY "Users can view their agency's performance metrics"
    ON performance_metrics FOR SELECT
    USING (agency_id IN (
        SELECT id FROM dados_agencia WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their agency's performance metrics"
    ON performance_metrics FOR ALL
    USING (agency_id IN (
        SELECT id FROM dados_agencia WHERE user_id = auth.uid()
    ));

-- Policy for customer_satisfaction
CREATE POLICY "Users can view their agency's satisfaction ratings"
    ON customer_satisfaction FOR SELECT
    USING (agency_id IN (
        SELECT id FROM dados_agencia WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their agency's satisfaction ratings"
    ON customer_satisfaction FOR ALL
    USING (agency_id IN (
        SELECT id FROM dados_agencia WHERE user_id = auth.uid()
    ));

-- Policy for lead_tracking
CREATE POLICY "Users can view their agency's leads"
    ON lead_tracking FOR SELECT
    USING (agency_id IN (
        SELECT id FROM dados_agencia WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their agency's leads"
    ON lead_tracking FOR ALL
    USING (agency_id IN (
        SELECT id FROM dados_agencia WHERE user_id = auth.uid()
    ));