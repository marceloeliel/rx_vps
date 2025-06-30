-- Criar bucket para imagens do carrossel da página principal
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'carousel-images',
  'carousel-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Política para permitir que todos vejam as imagens do carrossel (público)
CREATE POLICY "Public can view carousel images" ON storage.objects
FOR SELECT USING (bucket_id = 'carousel-images');

-- Política para permitir que apenas administradores façam upload
CREATE POLICY "Only admins can upload carousel images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'carousel-images' 
  AND auth.jwt() ->> 'role' = 'admin'
);

-- Política para permitir que apenas administradores atualizem
CREATE POLICY "Only admins can update carousel images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'carousel-images' 
  AND auth.jwt() ->> 'role' = 'admin'
);

-- Política para permitir que apenas administradores deletem
CREATE POLICY "Only admins can delete carousel images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'carousel-images' 
  AND auth.jwt() ->> 'role' = 'admin'
);

-- Comentários para documentação
COMMENT ON POLICY "Public can view carousel images" ON storage.objects IS 'Permite visualização pública das imagens do carrossel';
COMMENT ON POLICY "Only admins can upload carousel images" ON storage.objects IS 'Apenas administradores podem fazer upload de imagens do carrossel';
COMMENT ON POLICY "Only admins can update carousel images" ON storage.objects IS 'Apenas administradores podem atualizar imagens do carrossel';
COMMENT ON POLICY "Only admins can delete carousel images" ON storage.objects IS 'Apenas administradores podem deletar imagens do carrossel';
