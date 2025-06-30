-- Script para debugar problemas com a tabela carrossel
SELECT 'Verificando se a tabela carrossel existe...' as status;

-- Verificar se a tabela existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'carrossel') 
    THEN '✅ Tabela carrossel existe'
    ELSE '❌ Tabela carrossel NÃO existe'
  END as tabela_status;

-- Se a tabela existe, mostrar sua estrutura
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'carrossel') THEN
    RAISE NOTICE '📋 Estrutura da tabela carrossel:';
  END IF;
END $$;

-- Mostrar colunas da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'carrossel'
ORDER BY ordinal_position;

-- Contar registros
SELECT 
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE ativo = true) as registros_ativos,
  COUNT(*) FILTER (WHERE ativo = false) as registros_inativos
FROM carrossel;

-- Mostrar primeiros 5 registros
SELECT 
  id,
  LEFT(url, 50) || '...' as url_preview,
  titulo,
  LEFT(descricao, 30) || '...' as descricao_preview,
  ordem,
  ativo,
  criado_em
FROM carrossel 
ORDER BY ordem 
LIMIT 5;

-- Verificar se há URLs válidas
SELECT 
  COUNT(*) as urls_validas
FROM carrossel 
WHERE url IS NOT NULL 
  AND url != '' 
  AND url LIKE 'http%';

-- Mostrar possíveis problemas
SELECT 
  'Possíveis problemas encontrados:' as diagnostico;

SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '⚠️ Tabela vazia - nenhuma imagem cadastrada'
    WHEN COUNT(*) FILTER (WHERE ativo = true) = 0 THEN '⚠️ Nenhuma imagem ativa'
    WHEN COUNT(*) FILTER (WHERE url IS NULL OR url = '') > 0 THEN '⚠️ Existem registros com URL vazia'
    WHEN COUNT(*) FILTER (WHERE url NOT LIKE 'http%') > 0 THEN '⚠️ Existem URLs inválidas'
    ELSE '✅ Tudo parece estar OK'
  END as problema
FROM carrossel;
