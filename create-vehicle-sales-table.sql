-- Criar tabela vehicle_sales se não existir
CREATE TABLE IF NOT EXISTS vehicle_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES veiculos(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencias(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  vehicle_title TEXT NOT NULL,
  vehicle_brand TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  sale_price DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 5.0,
  commission_amount DECIMAL(12,2) NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT,
  buyer_phone TEXT,
  buyer_document TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'negociacao', 'concluida', 'cancelada')),
  notes TEXT,
  contract_url TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_agency_id ON vehicle_sales(agency_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_status ON vehicle_sales(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_created_at ON vehicle_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_vehicle_id ON vehicle_sales(vehicle_id);

-- Habilitar RLS
ALTER TABLE vehicle_sales ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY IF NOT EXISTS "Agências podem ver suas vendas" ON vehicle_sales
  FOR SELECT USING (
    agency_id IN (
      SELECT id FROM agencias WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Agências podem inserir vendas" ON vehicle_sales
  FOR INSERT WITH CHECK (
    agency_id IN (
      SELECT id FROM agencias WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Agências podem atualizar suas vendas" ON vehicle_sales
  FOR UPDATE USING (
    agency_id IN (
      SELECT id FROM agencias WHERE user_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_vehicle_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Atualizar completed_at quando status muda para 'concluida'
  IF NEW.status = 'concluida' AND OLD.status != 'concluida' THEN
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_vehicle_sales_updated_at
  BEFORE UPDATE ON vehicle_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_sales_updated_at();

-- Função para obter estatísticas de vendas da agência
CREATE OR REPLACE FUNCTION get_agency_sales_stats(agency_uuid UUID)
RETURNS TABLE (
  total_sales BIGINT,
  completed_sales BIGINT,
  pending_sales BIGINT,
  negotiation_sales BIGINT,
  total_revenue DECIMAL,
  total_commission DECIMAL,
  average_ticket DECIMAL,
  sales_today BIGINT,
  sales_this_week BIGINT,
  sales_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_sales,
    COUNT(*) FILTER (WHERE vs.status = 'concluida')::BIGINT as completed_sales,
    COUNT(*) FILTER (WHERE vs.status = 'pendente')::BIGINT as pending_sales,
    COUNT(*) FILTER (WHERE vs.status = 'negociacao')::BIGINT as negotiation_sales,
    COALESCE(SUM(vs.sale_price) FILTER (WHERE vs.status = 'concluida'), 0) as total_revenue,
    COALESCE(SUM(vs.commission_amount) FILTER (WHERE vs.status = 'concluida'), 0) as total_commission,
    COALESCE(AVG(vs.sale_price) FILTER (WHERE vs.status = 'concluida'), 0) as average_ticket,
    COUNT(*) FILTER (WHERE vs.created_at >= CURRENT_DATE)::BIGINT as sales_today,
    COUNT(*) FILTER (WHERE vs.created_at >= DATE_TRUNC('week', CURRENT_DATE))::BIGINT as sales_this_week,
    COUNT(*) FILTER (WHERE vs.created_at >= DATE_TRUNC('month', CURRENT_DATE))::BIGINT as sales_this_month
  FROM vehicle_sales vs
  WHERE vs.agency_id = agency_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter vendas da agência com paginação
CREATE OR REPLACE FUNCTION get_agency_sales(
  agency_uuid UUID,
  status_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  vehicle_id UUID,
  agency_id UUID,
  buyer_id UUID,
  seller_id UUID,
  vehicle_title TEXT,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  sale_price DECIMAL,
  commission_rate DECIMAL,
  commission_amount DECIMAL,
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  buyer_document TEXT,
  status TEXT,
  notes TEXT,
  contract_url TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  seller_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vs.id,
    vs.vehicle_id,
    vs.agency_id,
    vs.buyer_id,
    vs.seller_id,
    vs.vehicle_title,
    vs.vehicle_brand,
    vs.vehicle_model,
    vs.vehicle_year,
    vs.sale_price,
    vs.commission_rate,
    vs.commission_amount,
    vs.buyer_name,
    vs.buyer_email,
    vs.buyer_phone,
    vs.buyer_document,
    vs.status,
    vs.notes,
    vs.contract_url,
    vs.payment_method,
    vs.created_at,
    vs.updated_at,
    vs.completed_at,
    vs.metadata,
    COALESCE(p.nome, 'Vendedor não encontrado') as seller_name
  FROM vehicle_sales vs
  LEFT JOIN profiles p ON vs.seller_id = p.id
  WHERE vs.agency_id = agency_uuid
    AND (status_filter IS NULL OR vs.status = status_filter)
  ORDER BY vs.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;