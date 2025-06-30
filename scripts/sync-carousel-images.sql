-- Script para sincronizar imagens existentes no bucket com a tabela de metadados
-- Execute este script APÓS criar a tabela carousel_images

-- Primeiro, vamos limpar registros antigos se existirem
DELETE FROM carousel_images;

-- Agora vamos inserir as imagens baseadas nos arquivos que você já tem no bucket
-- IMPORTANTE: Substitua os nomes dos arquivos pelos nomes reais das suas imagens

-- Exemplo de como inserir suas imagens reais:
-- Substitua 'nome-do-arquivo.jpg' pelo nome real do arquivo no seu bucket
-- Substitua a URL base pela URL real do seu projeto Supabase

INSERT INTO carousel_images (name, storage_path, public_url, title, description, display_order, is_active) VALUES
-- Imagem 1 - substitua pelo nome real do arquivo
('Carro Luxo 1', 'seu-arquivo-1.jpg', 'https://seu-projeto.supabase.co/storage/v1/object/public/carousel-images/seu-arquivo-1.jpg', 'Carro de Luxo', 'Descrição do primeiro carro', 1, true),

-- Imagem 2 - substitua pelo nome real do arquivo  
('Carro Luxo 2', 'seu-arquivo-2.jpg', 'https://seu-projeto.supabase.co/storage/v1/object/public/carousel-images/seu-arquivo-2.jpg', 'Carro Esportivo', 'Descrição do segundo carro', 2, true),

-- Imagem 3 - substitua pelo nome real do arquivo
('Carro Luxo 3', 'seu-arquivo-3.jpg', 'https://seu-projeto.supabase.co/storage/v1/object/public/carousel-images/seu-arquivo-3.jpg', 'Carro Premium', 'Descrição do terceiro carro', 3, true)

-- Adicione mais linhas conforme necessário para todas as suas imagens
ON CONFLICT (storage_path) DO NOTHING;

-- Verificar se as imagens foram inseridas corretamente
SELECT * FROM carousel_images ORDER BY display_order;
