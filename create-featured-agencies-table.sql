-- Criar tabela featured_agencies para agências em destaque
CREATE TABLE IF NOT EXISTS featured_agencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agencia_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  highlight_text TEXT,
  image_url TEXT,
  banner_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_featured_agencies_agencia_id ON featured_agencies(agencia_id);
CREATE INDEX IF NOT EXISTS idx_featured_agencies_is_active ON featured_agencies(is_active);
CREATE INDEX IF NOT EXISTS idx_featured_agencies_display_order ON featured_agencies(display_order);
CREATE INDEX IF NOT EXISTS idx_featured_agencies_start_date ON featured_agencies(start_date);
CREATE INDEX IF NOT EXISTS idx_featured_agencies_end_date ON featured_agencies(end_date);

-- Habilitar RLS (Row Level Security)
ALTER TABLE featured_agencies ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Everyone can view active featured agencies" ON featured_agencies
  FOR SELECT USING (is_active = true AND (end_date IS NULL OR end_date > NOW()));

CREATE POLICY "Admin users can manage featured agencies" ON featured_agencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_admin = true
    )
  );

CREATE POLICY "Agency owners can view their featured status" ON featured_agencies
  FOR SELECT USING (agencia_id = auth.uid());

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_featured_agencies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_featured_agencies_updated_at
  BEFORE UPDATE ON featured_agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_featured_agencies_updated_at();

-- Comentários para documentação
COMMENT ON TABLE featured_agencies IS 'Tabela para gerenciar agências em destaque na plataforma';
COMMENT ON COLUMN featured_agencies.agencia_id IS 'ID da agência (referência para profiles)';
COMMENT ON COLUMN featured_agencies.title IS 'Título da agência em destaque';
COMMENT ON COLUMN featured_agencies.description IS 'Descrição da agência';
COMMENT ON COLUMN featured_agencies.highlight_text IS 'Texto de destaque especial';
COMMENT ON COLUMN featured_agencies.display_order IS 'Ordem de exibição (menor número = maior prioridade)';
COMMENT ON COLUMN featured_agencies.is_active IS 'Se a agência está ativa no destaque';
COMMENT ON COLUMN featured_agencies.start_date IS 'Data de início do destaque';
COMMENT ON COLUMN featured_agencies.end_date IS 'Data de fim do destaque (NULL = sem fim)';