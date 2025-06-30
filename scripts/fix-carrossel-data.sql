-- Script para corrigir dados da tabela carrossel
SELECT 'Corrigindo dados da tabela carrossel...' as status;

-- Remover registros com URL vazia ou inválida
DELETE FROM carrossel 
WHERE url IS NULL 
   OR url = '' 
   OR url NOT LIKE 'http%';

-- Se não há registros, inserir dados de exemplo
INSERT INTO carrossel (url, titulo, descricao, ordem, ativo)
SELECT 
  unnest(ARRAY[
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&h=600&fit=crop&crop=center'
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
WHERE NOT EXISTS (SELECT 1 FROM carrossel WHERE ativo = true LIMIT 1);

-- Garantir que pelo menos uma imagem esteja ativa
UPDATE carrossel 
SET ativo = true 
WHERE id = (SELECT id FROM carrossel ORDER BY ordem LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM carrossel WHERE ativo = true);

-- Reordenar registros
UPDATE carrossel 
SET ordem = subquery.new_ordem
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY ordem, criado_em) as new_ordem
  FROM carrossel
) AS subquery
WHERE carrossel.id = subquery.id;

-- Mostrar resultado
SELECT 
  COUNT(*) as total_imagens,
  COUNT(*) FILTER (WHERE ativo = true) as imagens_ativas,
  'Dados corrigidos com sucesso!' as status
FROM carrossel;
