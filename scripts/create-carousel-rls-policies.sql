-- Habilitar RLS na tabela carousel_images
ALTER TABLE carousel_images ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT (leitura) para todos
CREATE POLICY "Allow public read access on carousel_images" 
ON carousel_images FOR SELECT 
USING (true);

-- Política para permitir INSERT (inserção) para usuários autenticados
CREATE POLICY "Allow authenticated insert on carousel_images" 
ON carousel_images FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir UPDATE (atualização) para usuários autenticados
CREATE POLICY "Allow authenticated update on carousel_images" 
ON carousel_images FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir DELETE (exclusão) para usuários autenticados
CREATE POLICY "Allow authenticated delete on carousel_images" 
ON carousel_images FOR DELETE 
USING (auth.role() = 'authenticated');

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'carousel_images';

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'carousel_images';
