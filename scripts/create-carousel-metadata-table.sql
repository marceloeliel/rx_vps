-- Criar tabela para metadados das imagens do carrossel
CREATE TABLE IF NOT EXISTS carousel_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_carousel_images_active ON carousel_images(is_active);
CREATE INDEX IF NOT EXISTS idx_carousel_images_order ON carousel_images(display_order);
CREATE INDEX IF NOT EXISTS idx_carousel_images_created_at ON carousel_images(created_at);

-- RLS (Row Level Security)
ALTER TABLE carousel_images ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos vejam imagens ativas
CREATE POLICY "Public can view active carousel images" ON carousel_images
FOR SELECT USING (is_active = true);

-- Política para permitir que apenas administradores gerenciem
CREATE POLICY "Only admins can manage carousel images" ON carousel_images
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_carousel_images_updated_at 
    BEFORE UPDATE ON carousel_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE carousel_images IS 'Metadados das imagens do carrossel da página principal';
COMMENT ON COLUMN carousel_images.storage_path IS 'Caminho do arquivo no Supabase Storage';
COMMENT ON COLUMN carousel_images.public_url IS 'URL pública da imagem';
COMMENT ON COLUMN carousel_images.display_order IS 'Ordem de exibição no carrossel (menor = primeiro)';
COMMENT ON COLUMN carousel_images.is_active IS 'Se a imagem está ativa no carrossel';
COMMENT ON COLUMN carousel_images.alt_text IS 'Texto alternativo para acessibilidade';
