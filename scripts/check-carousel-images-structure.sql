-- Verificar a estrutura atual da tabela carousel_images
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'carousel_images' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar dados existentes
SELECT id, name, title, 
       CASE 
           WHEN LENGTH(public_url) > 50 
           THEN CONCAT(LEFT(public_url, 50), '...')
           ELSE public_url 
       END as url_preview,
       created_at
FROM carousel_images 
ORDER BY created_at DESC
LIMIT 10;
