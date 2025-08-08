-- Create vehicle_leads table
CREATE TABLE IF NOT EXISTS vehicle_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lead_type TEXT NOT NULL CHECK (lead_type IN ('favorite', 'contact_whatsapp', 'contact_email', 'view_details')),
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create vehicle_favorites table
CREATE TABLE IF NOT EXISTS vehicle_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, vehicle_id)
);

-- Create function to update lead_sources when a lead is created
CREATE OR REPLACE FUNCTION update_lead_source() RETURNS TRIGGER AS $$
BEGIN
    -- Increment lead count for the source
    INSERT INTO lead_sources (agency_id, source_name, lead_count)
    VALUES (NEW.agency_id, NEW.lead_type, 1)
    ON CONFLICT (agency_id, source_name)
    DO UPDATE SET
        lead_count = lead_sources.lead_count + 1,
        updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update lead_sources
CREATE TRIGGER update_lead_source_trigger
    AFTER INSERT ON vehicle_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_source();

-- Create function to update performance metrics when a lead is created
CREATE OR REPLACE FUNCTION update_lead_metrics() RETURNS TRIGGER AS $$
DECLARE
    v_total_leads INTEGER;
    v_converted_leads INTEGER;
    v_period_start TIMESTAMP WITH TIME ZONE;
    v_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Set period to current month
    v_period_start := DATE_TRUNC('month', TIMEZONE('utc', NOW()));
    v_period_end := v_period_start + INTERVAL '1 month';

    -- Calculate total leads for the month
    SELECT COUNT(*) INTO v_total_leads
    FROM vehicle_leads
    WHERE agency_id = NEW.agency_id
    AND created_at BETWEEN v_period_start AND v_period_end;

    -- Calculate converted leads (those that resulted in contact)
    SELECT COUNT(*) INTO v_converted_leads
    FROM vehicle_leads
    WHERE agency_id = NEW.agency_id
    AND lead_type IN ('contact_whatsapp', 'contact_email')
    AND created_at BETWEEN v_period_start AND v_period_end;

    -- Update or insert lead conversion rate metric
    INSERT INTO performance_metrics (
        agency_id,
        metric_name,
        metric_value,
        target_value,
        unit,
        period_start,
        period_end
    ) VALUES (
        NEW.agency_id,
        'taxa_conversao_leads',
        CASE WHEN v_total_leads > 0 THEN (v_converted_leads::NUMERIC / v_total_leads) * 100 ELSE 0 END,
        50, -- Target value of 50%
        'percentual',
        v_period_start,
        v_period_end
    ) ON CONFLICT (agency_id, metric_name, period_start, period_end)
    DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        updated_at = TIMEZONE('utc', NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update performance metrics
CREATE TRIGGER update_lead_metrics_trigger
    AFTER INSERT ON vehicle_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_metrics();

-- Create RLS policies
ALTER TABLE vehicle_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_favorites ENABLE ROW LEVEL SECURITY;

-- Policy for vehicle_leads
CREATE POLICY "Users can view their own leads"
    ON vehicle_leads FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Agencies can view leads for their vehicles"
    ON vehicle_leads FOR SELECT
    USING (agency_id IN (
        SELECT id FROM dados_agencia WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create their own leads"
    ON vehicle_leads FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Policy for vehicle_favorites
CREATE POLICY "Users can view their own favorites"
    ON vehicle_favorites FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own favorites"
    ON vehicle_favorites FOR ALL
    USING (user_id = auth.uid());