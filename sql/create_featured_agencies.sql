-- Criação da tabela featured_agencies para gerenciar agências em destaque
CREATE TABLE IF NOT EXISTS featured_agencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agencia_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  highlight_text VARCHAR(500),
  image_url TEXT,
  banner_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  
  -- Índices para performance
  CONSTRAINT featured_agencies_order_check CHECK (display_order >= 0)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_featured_agencies_active ON featured_agencies(is_active);
CREATE INDEX IF NOT EXISTS idx_featured_agencies_order ON featured_agencies(display_order);
CREATE INDEX IF NOT EXISTS idx_featured_agencies_dates ON featured_agencies(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_featured_agencies_agencia ON featured_agencies(agencia_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_featured_agencies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_featured_agencies_updated_at
  BEFORE UPDATE ON featured_agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_featured_agencies_updated_at();

-- Comentários para documentação
COMMENT ON TABLE featured_agencies IS 'Tabela para gerenciar agências em destaque na página principal';
COMMENT ON COLUMN featured_agencies.agencia_id IS 'ID da agência (referência para profiles)';
COMMENT ON COLUMN featured_agencies.title IS 'Título da propaganda da agência';
COMMENT ON COLUMN featured_agencies.description IS 'Descrição detalhada da agência';
COMMENT ON COLUMN featured_agencies.highlight_text IS 'Texto de destaque/chamada da agência';
COMMENT ON COLUMN featured_agencies.image_url IS 'URL da imagem principal da agência';
COMMENT ON COLUMN featured_agencies.banner_url IS 'URL do banner/propaganda da agência';
COMMENT ON COLUMN featured_agencies.display_order IS 'Ordem de exibição (menor número = maior prioridade)';
COMMENT ON COLUMN featured_agencies.is_active IS 'Se a agência está ativa para exibição';
COMMENT ON COLUMN featured_agencies.start_date IS 'Data de início da exibição';
COMMENT ON COLUMN featured_agencies.end_date IS 'Data de fim da exibição (NULL = sem limite)';