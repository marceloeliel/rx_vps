-- Limpar dados existentes primeiro
DELETE FROM carousel_images;

-- Inserir imagens de exemplo do Unsplash (carros de luxo)
-- Usando apenas as colunas que existem na tabela
INSERT INTO carousel_images (
    name,
    storage_path,
    public_url,
    title,
    description,
    display_order
) VALUES 
(
    'ferrari-vermelha',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'Ferrari Vermelha',
    'Ferrari esportiva vermelha em estrada panorâmica',
    1
),
(
    'porsche-prata',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'Porsche Prata',
    'Porsche clássico prata em ambiente urbano moderno',
    2
),
(
    'bmw-azul',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
    'BMW Azul',
    'BMW azul elegante com design contemporâneo',
    3
),
(
    'mercedes-preta',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'Mercedes Preta',
    'Mercedes-Benz preta representando luxo e sofisticação',
    4
),
(
    'audi-branca',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'Audi Branca',
    'Audi branca com design futurista e linhas elegantes',
    5
),
(
    'lamborghini-amarela',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80',
    'Lamborghini Amarela',
    'Lamborghini amarela demonstrando potência e velocidade',
    6
);

-- Verificar se as imagens foram inseridas
SELECT 
    name,
    title,
    display_order,
    CASE 
        WHEN LENGTH(public_url) > 50 
        THEN CONCAT(LEFT(public_url, 50), '...')
        ELSE public_url 
    END as url_preview,
    created_at
FROM carousel_images 
ORDER BY display_order;

-- Mostrar estrutura da tabela para debug
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'carousel_images' 
AND table_schema = 'public'
ORDER BY ordinal_position;
