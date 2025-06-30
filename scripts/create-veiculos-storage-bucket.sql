-- Criar bucket para fotos de veículos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('veiculos', 'veiculos', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir que usuários façam upload de suas próprias fotos
CREATE POLICY "Usuários podem fazer upload de fotos de veículos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'veiculos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários vejam suas próprias fotos
CREATE POLICY "Usuários podem ver suas fotos de veículos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'veiculos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários atualizem suas próprias fotos
CREATE POLICY "Usuários podem atualizar suas fotos de veículos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'veiculos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários deletem suas próprias fotos
CREATE POLICY "Usuários podem deletar suas fotos de veículos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'veiculos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir visualização pública das fotos (para compradores)
CREATE POLICY "Fotos de veículos são públicas para visualização" ON storage.objects
FOR SELECT USING (bucket_id = 'veiculos');
