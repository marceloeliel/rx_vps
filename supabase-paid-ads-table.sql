-- Criação da tabela paid_ads para sistema de anúncios pagos
CREATE TABLE IF NOT EXISTS paid_ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  vehicle_count INTEGER DEFAULT 0 CHECK (vehicle_count >= 0),
  satisfaction_rate INTEGER DEFAULT 0 CHECK (satisfaction_rate >= 0 AND satisfaction_rate <= 100),
  response_time VARCHAR(50) NOT NULL,
  primary_color VARCHAR(7) DEFAULT '#f97316', -- Orange
  secondary_color VARCHAR(7) DEFAULT '#ea580c', -- Orange dark
  contact_url TEXT,
  inventory_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  position_order INTEGER DEFAULT 999,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_paid_ads_active ON paid_ads(is_active);
CREATE INDEX IF NOT EXISTS idx_paid_ads_position ON paid_ads(position_order);
CREATE INDEX IF NOT EXISTS idx_paid_ads_featured ON paid_ads(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_paid_ads_dates ON paid_ads(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_paid_ads_active_position ON paid_ads(is_active, position_order) WHERE is_active = true;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_paid_ads_updated_at 
  BEFORE UPDATE ON paid_ads 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Função para validar datas
CREATE OR REPLACE FUNCTION validate_paid_ad_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar se end_date é posterior a start_date
    IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL AND NEW.end_date <= NEW.start_date THEN
        RAISE EXCEPTION 'Data de fim deve ser posterior à data de início';
    END IF;
    
    -- Validar se start_date não é muito no passado (mais de 1 ano)
    IF NEW.start_date IS NOT NULL AND NEW.start_date < NOW() - INTERVAL '1 year' THEN
        RAISE EXCEPTION 'Data de início não pode ser mais de 1 ano no passado';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_paid_ad_dates_trigger
  BEFORE INSERT OR UPDATE ON paid_ads
  FOR EACH ROW
  EXECUTE FUNCTION validate_paid_ad_dates();

-- RLS (Row Level Security) - Configuração de segurança
ALTER TABLE paid_ads ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (anúncios ativos)
CREATE POLICY "Anúncios ativos são visíveis publicamente"
  ON paid_ads FOR SELECT
  USING (
    is_active = true 
    AND (end_date IS NULL OR end_date >= NOW())
    AND (start_date IS NULL OR start_date <= NOW())
  );

-- Política para administradores (necessário configurar auth)
-- CREATE POLICY "Administradores podem gerenciar anúncios"
--   ON paid_ads FOR ALL
--   USING (auth.jwt() ->> 'role' = 'admin');

-- Inserir dados de exemplo
INSERT INTO paid_ads (
  title,
  description,
  image_url,
  company_name,
  location,
  rating,
  review_count,
  vehicle_count,
  satisfaction_rate,
  response_time,
  primary_color,
  secondary_color,
  contact_url,
  inventory_url,
  is_featured,
  position_order
) VALUES 
(
  'Premium Motors',
  'Agência especializada em carros de luxo e elétricos',
  'https://s2-autoesporte.glbimg.com/AF9s1Xm_Y85ejgJ3l6Ssz_vQlxY=/0x0:1920x1280/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_cf9d035bf26b4646b105bd958f32089d/internal_photos/bs/2023/i/u/Y6RhJBSZu5wBqzisBngw/link-1-.jpg',
  'Premium Motors',
  'São Paulo, SP',
  4.9,
  89,
  150,
  98,
  '24h',
  '#f97316',
  '#ea580c',
  '#contato',
  '#estoque',
  true,
  1
),
(
  'AutoMax',
  'Especialista em picapes e utilitários',
  'https://cdn.autopapo.com.br/box/uploads/2020/02/17174829/nova-ram-2500-2020-dianteira-732x488.jpeg',
  'AutoMax',
  'Rio de Janeiro, RJ',
  4.5,
  67,
  85,
  95,
  '12h',
  '#3b82f6',
  '#1d4ed8',
  '#contato',
  '#estoque',
  false,
  2
),
(
  'EliteAutos',
  'Carros premium e importados',
  'https://i.bstr.es/drivingeco/2020/07/toyota-corolla-sedan-GR-7.jpg',
  'Elite Autos',
  'Belo Horizonte, MG',
  4.7,
  124,
  200,
  97,
  '6h',
  '#10b981',
  '#059669',
  '#contato',
  '#estoque',
  false,
  3
);

-- Comentários para documentação
COMMENT ON TABLE paid_ads IS 'Tabela para gerenciamento de anúncios pagos na plataforma RX Veículos';
COMMENT ON COLUMN paid_ads.position_order IS 'Ordem de exibição dos anúncios (menor número = maior prioridade)';
COMMENT ON COLUMN paid_ads.is_featured IS 'Indica se o anúncio é destacado (aparece primeiro)';
COMMENT ON COLUMN paid_ads.primary_color IS 'Cor principal do anúncio em hexadecimal';
COMMENT ON COLUMN paid_ads.secondary_color IS 'Cor secundária do anúncio em hexadecimal';
COMMENT ON COLUMN paid_ads.satisfaction_rate IS 'Taxa de satisfação em porcentagem (0-100)';

-- View para anúncios ativos (facilita consultas)
CREATE OR REPLACE VIEW active_paid_ads AS
SELECT *
FROM paid_ads
WHERE is_active = true
  AND (end_date IS NULL OR end_date >= NOW())
  AND (start_date IS NULL OR start_date <= NOW())
ORDER BY is_featured DESC, position_order ASC, created_at DESC;

COMMENT ON VIEW active_paid_ads IS 'View que retorna apenas anúncios pagos ativos e válidos';

-- Função para buscar anúncios ativos
CREATE OR REPLACE FUNCTION get_active_paid_ads(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  image_url TEXT,
  company_name VARCHAR,
  location VARCHAR,
  rating DECIMAL,
  review_count INTEGER,
  vehicle_count INTEGER,
  satisfaction_rate INTEGER,
  response_time VARCHAR,
  primary_color VARCHAR,
  secondary_color VARCHAR,
  contact_url TEXT,
  inventory_url TEXT,
  is_featured BOOLEAN,
  position_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.image_url,
    p.company_name,
    p.location,
    p.rating,
    p.review_count,
    p.vehicle_count,
    p.satisfaction_rate,
    p.response_time,
    p.primary_color,
    p.secondary_color,
    p.contact_url,
    p.inventory_url,
    p.is_featured,
    p.position_order
  FROM active_paid_ads p
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_active_paid_ads IS 'Função que retorna anúncios pagos ativos com limite configurável'; 