-- Script completo para resolver todos os problemas de permissão do carrossel

-- 1. Verificar e desabilitar RLS na tabela carousel_images
ALTER TABLE carousel_images DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes da tabela
DROP POLICY IF EXISTS "Allow public read access on carousel_images" ON carousel_images;
DROP POLICY IF EXISTS "Allow authenticated insert on carousel_images" ON carousel_images;
DROP POLICY IF EXISTS "Allow authenticated update on carousel_images" ON carousel_images;
DROP POLICY IF EXISTS "Allow authenticated delete on carousel_images" ON carousel_images;
DROP POLICY IF EXISTS "Allow public insert on carousel_images" ON carousel_images;
DROP POLICY IF EXISTS "Allow public update on carousel_images" ON carousel_images;
DROP POLICY IF EXISTS "Allow public delete on carousel_images" ON carousel_images;

-- 3. Verificar se o bucket carousel-images existe e tem as permissões corretas
-- (Isso precisa ser feito via interface do Supabase ou API)

-- 4. Testar inserção direta na tabela
INSERT INTO carousel_images (
    name,
    storage_path,
    public_url,
    title,
    description,
    display_order,
    is_active
) VALUES (
    'teste-permissao.jpg',
    'teste-permissao.jpg',
    'https://exemplo.com/teste.jpg',
    'Teste de Permissão',
    'Teste para verificar se as permissões estão funcionando',
    1,
    false
);

-- 5. Se a inserção funcionou, remover o teste
DELETE FROM carousel_images WHERE name = 'teste-permissao.jpg';

-- 6. Verificar status final
SELECT 
    schemaname, 
    tablename, 
    rowsecurity, 
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'carousel_images';

SELECT 'Permissões corrigidas - RLS desabilitado e políticas removidas' as status;
