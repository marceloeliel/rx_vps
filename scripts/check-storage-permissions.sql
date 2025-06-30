-- Script para verificar permissões do storage bucket

-- Verificar se o bucket existe
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'carousel-images';

-- Verificar políticas do storage bucket
SELECT 
    id,
    name,
    bucket_id,
    definition,
    check_expression
FROM storage.policies 
WHERE bucket_id = 'carousel-images';

-- Informações sobre como corrigir via interface
SELECT 'Verifique as configurações do bucket carousel-images no Supabase Dashboard' as instrucao;
SELECT 'Storage > carousel-images > Configuration > Public bucket: ON' as configuracao_1;
SELECT 'Storage > carousel-images > Policies > Deve ter políticas públicas' as configuracao_2;
