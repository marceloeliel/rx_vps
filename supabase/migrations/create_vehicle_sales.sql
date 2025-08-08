-- Criar tabela para vendas de veículos
CREATE TABLE IF NOT EXISTS vehicle_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Informações do veículo no momento da venda
  vehicle_title VARCHAR(255) NOT NULL,
  vehicle_brand VARCHAR(100) NOT NULL,
  vehicle_model VARCHAR(100) NOT NULL,
  vehicle_year INTEGER NOT NULL,
  
  -- Informações financeiras
  sale_price DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 5.00, -- Porcentagem de comissão
  commission_amount DECIMAL(12,2) NOT NULL,
  
  -- Informações do cliente
  buyer_name VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255),
  buyer_phone VARCHAR(20),
  buyer_document VARCHAR(20), -- CPF/CNPJ
  
  -- Status da venda
  status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'negociacao', 'concluida', 'cancelada')),
  
  -- Informações adicionais
  notes TEXT,
  contract_url VARCHAR(500), -- URL do contrato gerado
  payment_method VARCHAR(50), -- À vista, financiado, etc.
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_agency_id ON vehicle_sales(agency_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_vehicle_id ON vehicle_sales(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_seller_id ON vehicle_sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_buyer_id ON vehicle_sales(buyer_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_status ON vehicle_sales(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_created_at ON vehicle_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_completed_at ON vehicle_sales(completed_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE vehicle_sales ENABLE ROW LEVEL SECURITY;

-- Políticas para vehicle_sales
CREATE POLICY "Agencies can view their own sales" ON vehicle_sales
  FOR SELECT USING (auth.uid() = agency_id OR auth.uid() = seller_id);

CREATE POLICY "Agencies can insert their own sales" ON vehicle_sales
  FOR INSERT WITH CHECK (auth.uid() = agency_id OR auth.uid() = seller_id);

CREATE POLICY "Agencies can update their own sales" ON vehicle_sales
  FOR UPDATE USING (auth.uid() = agency_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can view their purchases" ON vehicle_sales
  FOR SELECT USING (auth.uid() = buyer_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_vehicle_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Se o status mudou para 'concluida', definir completed_at
  IF NEW.status = 'concluida' AND OLD.status != 'concluida' THEN
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_vehicle_sales_updated_at
  BEFORE UPDATE ON vehicle_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_sales_updated_at();

-- Função para obter estatísticas de vendas de uma agência
CREATE OR REPLACE FUNCTION get_agency_sales_stats(agency_uuid UUID)
RETURNS TABLE (
  total_sales BIGINT,
  completed_sales BIGINT,
  pending_sales BIGINT,
  negotiation_sales BIGINT,
  total_revenue DECIMAL(12,2),
  total_commission DECIMAL(12,2),
  average_ticket DECIMAL(12,2),
  sales_today BIGINT,
  sales_this_week BIGINT,
  sales_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_sales,
    COUNT(*) FILTER (WHERE status = 'concluida') as completed_sales,
    COUNT(*) FILTER (WHERE status = 'pendente') as pending_sales,
    COUNT(*) FILTER (WHERE status = 'negociacao') as negotiation_sales,
    COALESCE(SUM(sale_price) FILTER (WHERE status = 'concluida'), 0) as total_revenue,
    COALESCE(SUM(commission_amount) FILTER (WHERE status = 'concluida'), 0) as total_commission,
    CASE 
      WHEN COUNT(*) FILTER (WHERE status = 'concluida') > 0 THEN
        COALESCE(AVG(sale_price) FILTER (WHERE status = 'concluida'), 0)
      ELSE 0
    END as average_ticket,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as sales_today,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', NOW())) as sales_this_week,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', NOW())) as sales_this_month
  FROM vehicle_sales
  WHERE agency_id = agency_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter vendas de uma agência com paginação
CREATE OR REPLACE FUNCTION get_agency_sales(
  agency_uuid UUID,
  status_filter VARCHAR(50) DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  vehicle_title VARCHAR(255),
  vehicle_brand VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_year INTEGER,
  sale_price DECIMAL(12,2),
  commission_amount DECIMAL(12,2),
  buyer_name VARCHAR(255),
  seller_name VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vs.id,
    vs.vehicle_title,
    vs.vehicle_brand,
    vs.vehicle_model,
    vs.vehicle_year,
    vs.sale_price,
    vs.commission_amount,
    vs.buyer_name,
    p.nome as seller_name,
    vs.status,
    vs.created_at,
    vs.completed_at
  FROM vehicle_sales vs
  LEFT JOIN profiles p ON p.id = vs.seller_id
  WHERE vs.agency_id = agency_uuid
    AND (status_filter IS NULL OR vs.status = status_filter)
  ORDER BY vs.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir alguns dados de exemplo para teste
INSERT INTO vehicle_sales (
  vehicle_id,
  agency_id,
  seller_id,
  vehicle_title,
  vehicle_brand,
  vehicle_model,
  vehicle_year,
  sale_price,
  commission_rate,
  commission_amount,
  buyer_name,
  buyer_email,
  buyer_phone,
  status,
  created_at
) 
SELECT 
  v.id as vehicle_id,
  v.profile_id as agency_id,
  v.profile_id as seller_id,
  v.titulo as vehicle_title,
  v.marca_nome as vehicle_brand,
  v.modelo_nome as vehicle_model,
  v.ano_fabricacao as vehicle_year,
  v.preco as sale_price,
  5.00 as commission_rate,
  (v.preco * 0.05) as commission_amount,
  CASE 
    WHEN random() < 0.33 THEN 'João Silva'
    WHEN random() < 0.66 THEN 'Maria Oliveira'
    ELSE 'Pedro Santos'
  END as buyer_name,
  CASE 
    WHEN random() < 0.33 THEN 'joao@email.com'
    WHEN random() < 0.66 THEN 'maria@email.com'
    ELSE 'pedro@email.com'
  END as buyer_email,
  CASE 
    WHEN random() < 0.33 THEN '(11) 99999-1111'
    WHEN random() < 0.66 THEN '(11) 99999-2222'
    ELSE '(11) 99999-3333'
  END as buyer_phone,
  CASE 
    WHEN random() < 0.4 THEN 'concluida'
    WHEN random() < 0.7 THEN 'negociacao'
    ELSE 'pendente'
  END as status,
  NOW() - (random() * interval '30 days') as created_at
FROM veiculos v
WHERE v.ativo = true
LIMIT 10
ON CONFLICT DO NOTHING;