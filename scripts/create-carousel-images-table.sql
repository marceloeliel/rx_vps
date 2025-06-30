-- Criar tabela para metadados das imagens do carrossel
CREATE TABLE IF NOT EXISTS carousel_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_carousel_images_active ON carousel_images(is_active);
CREATE INDEX IF NOT EXISTS idx_carousel_images_order ON carousel_images(display_order);
CREATE INDEX IF NOT EXISTS idx_carousel_images_created ON carousel_images(created_at);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_carousel_images_updated_at 
    BEFORE UPDATE ON carousel_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE carousel_images IS 'Tabela para armazenar metadados das imagens do carrossel da home';
COMMENT ON COLUMN carousel_images.id IS 'ID único da imagem';
COMMENT ON COLUMN carousel_images.name IS 'Nome original do arquivo';
COMMENT ON COLUMN carousel_images.storage_path IS 'Caminho do arquivo no Supabase Storage';
COMMENT ON COLUMN carousel_images.public_url IS 'URL pública da imagem';
COMMENT ON COLUMN carousel_images.title IS 'Título da imagem para exibição';
COMMENT ON COLUMN carousel_images.description IS 'Descrição da imagem para acessibilidade';
COMMENT ON COLUMN carousel_images.display_order IS 'Ordem de exibição no carrossel (1 = primeiro)';
COMMENT ON COLUMN carousel_images.is_active IS 'Se a imagem está ativa no carrossel';

-- Verificar se a tabela foi criada com sucesso
SELECT 'Tabela carousel_images criada com sucesso!' as status;
