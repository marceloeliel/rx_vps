-- Inserir dados de exemplo na tabela carrossel se estiver vazia
DO $$
BEGIN
    -- Verificar se a tabela está vazia
    IF NOT EXISTS (SELECT 1 FROM carrossel LIMIT 1) THEN
        -- Inserir imagens de exemplo
        INSERT INTO carrossel (url, titulo, descricao, ordem, ativo) VALUES
        ('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=600&fit=crop', 'Ferrari Vermelha', 'Ferrari esportiva vermelha em alta velocidade', 1, true),
        ('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=600&fit=crop', 'Lamborghini Amarela', 'Lamborghini amarela em estrada moderna', 2, true),
        ('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=600&fit=crop', 'Porsche Prata', 'Porsche prata em pista de corrida', 3, true),
        ('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&h=600&fit=crop', 'BMW Azul', 'BMW azul em ambiente urbano', 4, true),
        ('https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&h=600&fit=crop', 'Audi Branca', 'Audi branca em showroom moderno', 5, true);
        
        RAISE NOTICE '✅ Dados de exemplo inseridos na tabela carrossel';
    ELSE
        RAISE NOTICE '⚠️ Tabela carrossel já contém dados';
    END IF;
END $$;

-- Mostrar dados inseridos
SELECT 
    id,
    url,
    titulo,
    descricao,
    ordem,
    ativo
FROM carrossel 
ORDER BY ordem ASC;
