-- Script para listar arquivos existentes no bucket carousel-images
-- Execute este script para ver quais arquivos você já tem no bucket

SELECT 
  name,
  id,
  updated_at,
  created_at,
  last_accessed_at,
  metadata
FROM storage.objects 
WHERE bucket_id = 'carousel-images'
ORDER BY created_at DESC;

-- Se você quiser ver as URLs públicas também:
SELECT 
  name,
  'https://' || (SELECT ref FROM storage.buckets WHERE id = 'carousel-images' LIMIT 1) || '.supabase.co/storage/v1/object/public/carousel-images/' || name as public_url,
  created_at
FROM storage.objects 
WHERE bucket_id = 'carousel-images'
ORDER BY created_at DESC;
