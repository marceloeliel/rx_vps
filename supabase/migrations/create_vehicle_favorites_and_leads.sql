-- Criar tabela para favoritos de veículos
CREATE TABLE IF NOT EXISTS vehicle_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vehicle_id)
);

-- Criar tabela para leads de veículos
CREATE TABLE IF NOT EXISTS vehicle_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lead_type VARCHAR(50) NOT NULL CHECK (lead_type IN ('favorite', 'contact_whatsapp', 'contact_email', 'view_details')),
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vehicle_favorites_user_id ON vehicle_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_favorites_vehicle_id ON vehicle_favorites(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_leads_agency_id ON vehicle_leads(agency_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_leads_vehicle_id ON vehicle_leads(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_leads_user_id ON vehicle_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_leads_created_at ON vehicle_leads(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE vehicle_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_leads ENABLE ROW LEVEL SECURITY;

-- Políticas para vehicle_favorites
CREATE POLICY "Users can view their own favorites" ON vehicle_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON vehicle_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON vehicle_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para vehicle_leads
CREATE POLICY "Users can view their own leads" ON vehicle_leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" ON vehicle_leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Agencies can view leads for their vehicles" ON vehicle_leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM veiculos v 
      WHERE v.id = vehicle_leads.vehicle_id 
      AND v.profile_id = auth.uid()
    )
  );

-- Política para permitir inserção de leads por qualquer usuário autenticado
CREATE POLICY "Allow authenticated users to create leads" ON vehicle_leads
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para agências visualizarem leads de seus veículos
CREATE POLICY "Agencies can view all leads for their agency" ON vehicle_leads
  FOR SELECT USING (auth.uid() = agency_id OR auth.uid() = user_id);

-- Função para obter estatísticas de leads de uma agência
CREATE OR REPLACE FUNCTION get_agency_lead_stats(agency_uuid UUID)
RETURNS TABLE (
  total_leads BIGINT,
  leads_today BIGINT,
  leads_this_week BIGINT,
  leads_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as leads_today,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', NOW())) as leads_this_week,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', NOW())) as leads_this_month
  FROM vehicle_leads vl
  WHERE vl.agency_id = agency_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter leads de uma agência com dados do usuário
CREATE OR REPLACE FUNCTION get_agency_leads_with_user_data(agency_uuid UUID, limit_count INTEGER DEFAULT 50, offset_count INTEGER DEFAULT 0)
RETURNS TABLE (
  lead_id UUID,
  user_id UUID,
  vehicle_id UUID,
  lead_type VARCHAR,
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  user_name TEXT,
  user_email TEXT,
  user_whatsapp TEXT,
  vehicle_title TEXT,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_price DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vl.id as lead_id,
    vl.user_id,
    vl.vehicle_id,
    vl.lead_type,
    vl.contact_info,
    vl.created_at,
    p.nome_completo as user_name,
    p.email as user_email,
    p.whatsapp as user_whatsapp,
    v.titulo as vehicle_title,
    v.marca_nome as vehicle_brand,
    v.modelo_nome as vehicle_model,
    v.ano_fabricacao as vehicle_year,
    v.preco as vehicle_price
  FROM vehicle_leads vl
  JOIN profiles p ON p.id = vl.user_id
  JOIN veiculos v ON v.id = vl.vehicle_id
  WHERE vl.agency_id = agency_uuid
  ORDER BY vl.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;