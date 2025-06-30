-- Criar bucket para imagens do carrossel da página principal (versão simplificada)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'carousel-images',
  'carousel-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Nota: As políticas RLS para o bucket serão configuradas pelo administrador do Supabase
-- Por enquanto, o bucket será público para leitura por padrão
