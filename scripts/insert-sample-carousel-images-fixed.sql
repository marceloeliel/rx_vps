-- Script para inserir imagens de exemplo no carrossel
-- Execute este script APÓS executar create-carousel-images-table.sql
-- IMPORTANTE: Ajuste os valores conforme suas imagens reais no bucket

-- Verificar se a tabela existe antes de tentar inserir
DO $$
BEGIN
    -- Verificar se a tabela existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'carousel_images') THEN
        RAISE NOTICE 'Tabela carousel_images encontrada. Procedendo com inserção...';
        
        -- Limpar dados antigos apenas se a tabela existir
        DELETE FROM carousel_images;
        RAISE NOTICE 'Dados antigos removidos.';
        
    ELSE
        RAISE EXCEPTION 'Tabela carousel_images não existe. Execute create-carousel-images-table.sql primeiro.';
    END IF;
END $$;

-- Inserir imagens de exemplo
-- SUBSTITUA os valores abaixo pelos dados reais das suas imagens no bucket carousel-images

INSERT INTO carousel_images (name, storage_path, public_url, title, description, display_order, is_active) VALUES
-- Exemplo 1 - SUBSTITUA pelos dados reais
('ferrari-488-gtb.jpg', 'carousel-ferrari-488.jpg', 'https://seu-projeto.supabase.co/storage/v1/object/public/carousel-images/carousel-ferrari-488.jpg', 'Ferrari 488 GTB', 'Ferrari 488 GTB vermelha em estrada de montanha', 1, true),

-- Exemplo 2 - SUBSTITUA pelos dados reais
('lamborghini-huracan.jpg', 'carousel-lamborghini.jpg', 'https://seu-projeto.supabase.co/storage/v1/object/public/carousel-images/carousel-lamborghini.jpg', 'Lamborghini Huracan', 'Lamborghini Huracan amarela em cidade moderna', 2, true),

-- Exemplo 3 - SUBSTITUA pelos dados reais
('porsche-911.jpg', 'carousel-porsche.jpg', 'https://seu-projeto.supabase.co/storage/v1/object/public/carousel-images/carousel-porsche.jpg', 'Porsche 911 Turbo S', 'Porsche 911 Turbo S prata em pista de corrida', 3, true),

-- Exemplo 4 - SUBSTITUA pelos dados reais
('mercedes-amg.jpg', 'carousel-mercedes.jpg', 'https://seu-projeto.supabase.co/storage/v1/object/public/carousel-images/carousel-mercedes.jpg', 'Mercedes AMG GT', 'Mercedes AMG GT preta em showroom elegante', 4, true),

-- Exemplo 5 - SUBSTITUA pelos dados reais
('bmw-m8.jpg', 'carousel-bmw.jpg', 'https://seu-projeto.supabase.co/storage/v1/object/public/carousel-images/carousel-bmw.jpg', 'BMW M8 Competition', 'BMW M8 Competition azul em estrada costeira', 5, true),

-- Exemplo 6 - SUBSTITUA pelos dados reais
('audi-r8.jpg', 'carousel-audi.jpg', 'https://seu-projeto.supabase.co/storage/v1/object/public/carousel-images/carousel-audi.jpg', 'Audi R8 V10', 'Audi R8 V10 branca em garagem subterrânea', 6, true)

ON CONFLICT (storage_path) DO NOTHING;

-- Verificar se as imagens foram inseridas corretamente
SELECT 
  'Inserção concluída!' as status,
  COUNT(*) as total_imagens
FROM carousel_images;

-- Mostrar as imagens inseridas
SELECT 
  id,
  name,
  title,
  display_order,
  is_active,
  created_at
FROM carousel_images 
ORDER BY display_order;
