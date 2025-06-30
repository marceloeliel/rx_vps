-- Criar tabela carrossel com estrutura simples e em português
CREATE TABLE IF NOT EXISTS carrossel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  titulo TEXT,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para ordenação
CREATE INDEX IF NOT EXISTS idx_carrossel_ordem ON carrossel(ordem);
CREATE INDEX IF NOT EXISTS idx_carrossel_ativo ON carrossel(ativo);

-- Migrar dados da tabela carousel_images se existir
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'carousel_images') THEN
    -- Migrar dados existentes
    INSERT INTO carrossel (url, titulo, descricao, ordem, ativo)
    SELECT 
      COALESCE(url, public_url, storage_path) as url,
      COALESCE(title, name) as titulo,
      description as descricao,
      COALESCE("order", display_order, position, 0) as ordem,
      true as ativo
    FROM carousel_images
    WHERE COALESCE(url, public_url, storage_path) IS NOT NULL
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Dados migrados da tabela carousel_images para carrossel';
  END IF;
END $$;

-- Inserir imagens de exemplo se a tabela estiver vazia
INSERT INTO carrossel (url, titulo, descricao, ordem, ativo)
SELECT 
  unnest(ARRAY[
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&h=600&fit=crop'
  ]) AS url,
  unnest(ARRAY[
    'Carro Esportivo Vermelho',
    'Carro Clássico na Estrada',
    'Carro Esportivo Azul',
    'Carro de Luxo Branco',
    'Carro Esportivo Preto'
  ]) AS titulo,
  unnest(ARRAY[
    'Um belo carro esportivo vermelho em uma estrada panorâmica',
    'Carro clássico vintage em uma estrada rural',
    'Carro esportivo azul moderno em exposição',
    'Carro de luxo branco em ambiente urbano',
    'Carro esportivo preto com design agressivo'
  ]) AS descricao,
  generate_series(1, 5) AS ordem,
  true AS ativo
WHERE NOT EXISTS (SELECT 1 FROM carrossel LIMIT 1);

-- Atualizar timestamp de atualização automaticamente
CREATE OR REPLACE FUNCTION update_carrossel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar timestamp
DROP TRIGGER IF EXISTS trigger_update_carrossel_updated_at ON carrossel;
CREATE TRIGGER trigger_update_carrossel_updated_at
  BEFORE UPDATE ON carrossel
  FOR EACH ROW
  EXECUTE FUNCTION update_carrossel_updated_at();

-- Mostrar resultado
SELECT 
  COUNT(*) as total_imagens,
  COUNT(*) FILTER (WHERE ativo = true) as imagens_ativas
FROM carrossel;
