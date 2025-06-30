-- Alternativa mais permissiva - permite acesso público para administração
-- Use este script se você quiser permitir acesso sem autenticação

-- Desabilitar RLS temporariamente para permitir acesso público
ALTER TABLE carousel_images DISABLE ROW LEVEL SECURITY;

-- OU manter RLS mas com políticas mais permissivas:
-- ALTER TABLE carousel_images ENABLE ROW LEVEL SECURITY;

-- Política permissiva para SELECT (leitura pública)
-- CREATE POLICY "Allow public read access on carousel_images" 
-- ON carousel_images FOR SELECT 
-- USING (true);

-- Política permissiva para INSERT (inserção pública)
-- CREATE POLICY "Allow public insert on carousel_images" 
-- ON carousel_images FOR INSERT 
-- WITH CHECK (true);

-- Política permissiva para UPDATE (atualização pública)
-- CREATE POLICY "Allow public update on carousel_images" 
-- ON carousel_images FOR UPDATE 
-- USING (true)
-- WITH CHECK (true);

-- Política permissiva para DELETE (exclusão pública)
-- CREATE POLICY "Allow public delete on carousel_images" 
-- ON carousel_images FOR DELETE 
-- USING (true);

SELECT 'RLS desabilitado para carousel_images - acesso público permitido' as status;
