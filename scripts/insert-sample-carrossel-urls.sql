-- Inserir URLs de exemplo na tabela carrossel
-- A tabela tem estrutura: id, created_at, url_1, url_2, url_3, url_4, url_5, url_6

-- Limpar dados existentes (opcional)
DELETE FROM carrossel;

-- Inserir uma linha com 6 URLs de carros do Unsplash
INSERT INTO carrossel (
  url_1,
  url_2, 
  url_3,
  url_4,
  url_5,
  url_6
) VALUES (
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop&auto=format'
);

-- Verificar dados inseridos
SELECT 
  id,
  created_at,
  CASE WHEN url_1 IS NOT NULL THEN '✅' ELSE '❌' END as url_1_status,
  CASE WHEN url_2 IS NOT NULL THEN '✅' ELSE '❌' END as url_2_status,
  CASE WHEN url_3 IS NOT NULL THEN '✅' ELSE '❌' END as url_3_status,
  CASE WHEN url_4 IS NOT NULL THEN '✅' ELSE '❌' END as url_4_status,
  CASE WHEN url_5 IS NOT NULL THEN '✅' ELSE '❌' END as url_5_status,
  CASE WHEN url_6 IS NOT NULL THEN '✅' ELSE '❌' END as url_6_status
FROM carrossel;

-- Mostrar URLs completas
SELECT 
  'URL 1' as slot, url_1 as url FROM carrossel WHERE url_1 IS NOT NULL
UNION ALL
SELECT 'URL 2' as slot, url_2 as url FROM carrossel WHERE url_2 IS NOT NULL  
UNION ALL
SELECT 'URL 3' as slot, url_3 as url FROM carrossel WHERE url_3 IS NOT NULL
UNION ALL
SELECT 'URL 4' as slot, url_4 as url FROM carrossel WHERE url_4 IS NOT NULL
UNION ALL
SELECT 'URL 5' as slot, url_5 as url FROM carrossel WHERE url_5 IS NOT NULL
UNION ALL
SELECT 'URL 6' as slot, url_6 as url FROM carrossel WHERE url_6 IS NOT NULL;
