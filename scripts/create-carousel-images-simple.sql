-- Verifica se a tabela já existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'carousel_images') THEN
    -- Cria a tabela carousel_images com estrutura simplificada
    CREATE TABLE carousel_images (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      url TEXT NOT NULL,
      title TEXT,
      description TEXT,
      "order" INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE 'Tabela carousel_images criada com sucesso!';
  ELSE
    -- Verifica se a coluna order existe
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'carousel_images' AND column_name = 'order'
    ) THEN
      -- Adiciona a coluna order se não existir
      ALTER TABLE carousel_images ADD COLUMN "order" INTEGER DEFAULT 0;
      RAISE NOTICE 'Coluna order adicionada à tabela carousel_images!';
    END IF;
    
    -- Verifica se a coluna url existe
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'carousel_images' AND column_name = 'url'
    ) THEN
      -- Adiciona a coluna url se não existir
      ALTER TABLE carousel_images ADD COLUMN url TEXT;
      RAISE NOTICE 'Coluna url adicionada à tabela carousel_images!';
    END IF;
    
    RAISE NOTICE 'Tabela carousel_images já existe. Verificação de colunas concluída.';
  END IF;
END $$;

-- Insere algumas imagens de exemplo se a tabela estiver vazia
INSERT INTO carousel_images (url, title, description, "order")
SELECT 
  unnest(ARRAY[
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'
  ]) AS url,
  unnest(ARRAY[
    'Carro Esportivo Vermelho',
    'Carro Clássico na Estrada',
    'Carro Esportivo Azul'
  ]) AS title,
  unnest(ARRAY[
    'Um belo carro esportivo vermelho em uma estrada panorâmica',
    'Carro clássico vintage em uma estrada rural',
    'Carro esportivo azul moderno em exposição'
  ]) AS description,
  generate_series(1, 3) AS "order"
WHERE NOT EXISTS (SELECT 1 FROM carousel_images LIMIT 1);
