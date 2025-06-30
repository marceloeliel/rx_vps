-- Script para verificar se tudo está configurado corretamente

-- 1. Verificar se a tabela existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'carousel_images') 
    THEN '✅ Tabela carousel_images existe'
    ELSE '❌ Tabela carousel_images NÃO existe'
  END as tabela_status;

-- 2. Verificar se há dados na tabela (apenas se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'carousel_images') THEN
        -- Mostrar estatísticas da tabela
        RAISE NOTICE '📊 Estatísticas da tabela carousel_images:';
        
        -- Contar total de imagens
        PERFORM (
            SELECT RAISE(NOTICE, 'Total de imagens: %', COUNT(*))
            FROM carousel_images
        );
        
        -- Contar imagens ativas
        PERFORM (
            SELECT RAISE(NOTICE, 'Imagens ativas: %', COUNT(*))
            FROM carousel_images 
            WHERE is_active = true
        );
        
        -- Contar imagens inativas
        PERFORM (
            SELECT RAISE(NOTICE, 'Imagens inativas: %', COUNT(*))
            FROM carousel_images 
            WHERE is_active = false
        );
        
    ELSE
        RAISE NOTICE '❌ Tabela não existe. Execute create-carousel-images-table.sql primeiro.';
    END IF;
END $$;

-- 3. Listar todas as imagens (apenas se a tabela existir)
SELECT 
  '📋 Lista de imagens no carrossel:' as info;

-- Esta query só executa se a tabela existir
SELECT 
  ROW_NUMBER() OVER (ORDER BY display_order) as "#",
  title,
  CASE WHEN is_active THEN '✅ Ativo' ELSE '⏸️ Inativo' END as status,
  display_order as ordem,
  LEFT(storage_path, 30) || '...' as arquivo,
  created_at::date as criado_em
FROM carousel_images 
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'carousel_images')
ORDER BY display_order;

-- 4. Verificar se o bucket existe (informativo)
SELECT '💡 Lembre-se: Verifique se o bucket "carousel-images" existe no Supabase Storage!' as dica;
