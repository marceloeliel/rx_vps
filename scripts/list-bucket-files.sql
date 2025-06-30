-- Script para listar arquivos no bucket carousel-images
-- Este script ajuda a identificar quais imagens você já tem no bucket

-- NOTA: Este script usa funções específicas do Supabase
-- Se não funcionar, você pode verificar manualmente no Dashboard do Supabase

SELECT 
  '🔍 Para verificar arquivos no bucket carousel-images:' as instrucoes;

SELECT 
  '1. Vá para o Supabase Dashboard' as passo_1;

SELECT 
  '2. Acesse Storage > carousel-images' as passo_2;

SELECT 
  '3. Anote os nomes dos arquivos e URLs' as passo_3;

SELECT 
  '4. Use essas informações no script insert-sample-carousel-images-fixed.sql' as passo_4;

-- Exemplo de como as URLs devem ficar:
SELECT 
  'Exemplo de URL:' as exemplo,
  'https://seu-projeto.supabase.co/storage/v1/object/public/carousel-images/nome-do-arquivo.jpg' as formato_url;

-- Template para inserção manual:
SELECT 
  'Template para inserção:' as template;

SELECT 
  $template$
INSERT INTO carousel_images (name, storage_path, public_url, title, description, display_order, is_active) VALUES
('nome-original.jpg', 'nome-no-bucket.jpg', 'URL-COMPLETA-AQUI', 'Título da Imagem', 'Descrição da imagem', 1, true);
$template$ as exemplo_insert;
