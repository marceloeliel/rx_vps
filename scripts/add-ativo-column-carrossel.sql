-- Adicionar coluna 'ativo' na tabela carrossel se não existir
DO $$ 
BEGIN
    -- Verificar se a coluna 'ativo' já existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'carrossel' 
        AND column_name = 'ativo'
    ) THEN
        -- Adicionar a coluna 'ativo'
        ALTER TABLE carrossel ADD COLUMN ativo BOOLEAN DEFAULT true;
        
        -- Atualizar todas as linhas existentes para ativo = true
        UPDATE carrossel SET ativo = true WHERE ativo IS NULL;
        
        RAISE NOTICE '✅ Coluna "ativo" adicionada com sucesso à tabela carrossel';
    ELSE
        RAISE NOTICE '⚠️ Coluna "ativo" já existe na tabela carrossel';
    END IF;
    
    -- Verificar se outras colunas essenciais existem e adicionar se necessário
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'carrossel' 
        AND column_name = 'titulo'
    ) THEN
        ALTER TABLE carrossel ADD COLUMN titulo TEXT;
        RAISE NOTICE '✅ Coluna "titulo" adicionada';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'carrossel' 
        AND column_name = 'descricao'
    ) THEN
        ALTER TABLE carrossel ADD COLUMN descricao TEXT;
        RAISE NOTICE '✅ Coluna "descricao" adicionada';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'carrossel' 
        AND column_name = 'ordem'
    ) THEN
        ALTER TABLE carrossel ADD COLUMN ordem INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Coluna "ordem" adicionada';
    END IF;
END $$;

-- Verificar estrutura final da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'carrossel'
ORDER BY ordinal_position;

-- Mostrar dados atuais
SELECT 
    id,
    url,
    titulo,
    descricao,
    ordem,
    ativo,
    criado_em
FROM carrossel 
ORDER BY ordem ASC, criado_em ASC
LIMIT 10;
