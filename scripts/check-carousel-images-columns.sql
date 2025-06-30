-- Script para verificar as colunas da tabela carousel_images
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = 'carousel_images'
ORDER BY 
  ordinal_position;
