-- Criar bucket para logos das agências
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agencia-logos',
  'agencia-logos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Política para permitir que usuários vejam todas as logos (público)
CREATE POLICY "Public can view agency logos" ON storage.objects
FOR SELECT USING (bucket_id = 'agencia-logos');

-- Política para permitir que usuários façam upload de suas próprias logos
CREATE POLICY "Users can upload own agency logo" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'agencia-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários atualizem suas próprias logos
CREATE POLICY "Users can update own agency logo" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'agencia-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários deletem suas próprias logos
CREATE POLICY "Users can delete own agency logo" ON storage.objects
FOR DELETE USING (
  bucket_id = 'agencia-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Comentários para documentação
COMMENT ON POLICY "Public can view agency logos" ON storage.objects IS 'Permite visualização pública das logos das agências';
COMMENT ON POLICY "Users can upload own agency logo" ON storage.objects IS 'Permite que usuários façam upload apenas de suas próprias logos';
COMMENT ON POLICY "Users can update own agency logo" ON storage.objects IS 'Permite que usuários atualizem apenas suas próprias logos';
COMMENT ON POLICY "Users can delete own agency logo" ON storage.objects IS 'Permite que usuários deletem apenas suas próprias logos';
