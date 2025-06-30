-- Criar tabela para URLs do carrossel
CREATE TABLE IF NOT EXISTS public.imagens_carrossel (
    id SERIAL PRIMARY KEY,
    url_1 TEXT,
    url_2 TEXT,
    url_3 TEXT,
    url_4 TEXT,
    url_5 TEXT,
    url_6 TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários para documentar os campos
COMMENT ON TABLE public.imagens_carrossel IS 'Tabela para armazenar URLs das imagens do carrossel da página inicial';
COMMENT ON COLUMN public.imagens_carrossel.url_1 IS 'URL da primeira imagem do carrossel';
COMMENT ON COLUMN public.imagens_carrossel.url_2 IS 'URL da segunda imagem do carrossel';
COMMENT ON COLUMN public.imagens_carrossel.url_3 IS 'URL da terceira imagem do carrossel';
COMMENT ON COLUMN public.imagens_carrossel.url_4 IS 'URL da quarta imagem do carrossel';
COMMENT ON COLUMN public.imagens_carrossel.url_5 IS 'URL da quinta imagem do carrossel';
COMMENT ON COLUMN public.imagens_carrossel.url_6 IS 'URL da sexta imagem do carrossel';

-- Inserir registro inicial vazio se não existir nenhum
INSERT INTO public.imagens_carrossel (url_1, url_2, url_3, url_4, url_5, url_6)
SELECT NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM public.imagens_carrossel);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.imagens_carrossel ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY IF NOT EXISTS "Permitir leitura pública das imagens do carrossel"
ON public.imagens_carrossel
FOR SELECT
TO public
USING (true);

-- Política para permitir escrita apenas para usuários autenticados
CREATE POLICY IF NOT EXISTS "Permitir escrita para usuários autenticados"
ON public.imagens_carrossel
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
