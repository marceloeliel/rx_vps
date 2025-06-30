-- Adicionar coluna asaas_customer_id na tabela profiles
-- Esta coluna vai armazenar o ID do customer no Asaas para facilitar buscas

-- Verificar se a coluna já existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'asaas_customer_id'
    ) THEN
        -- Adicionar a coluna
        ALTER TABLE profiles 
        ADD COLUMN asaas_customer_id VARCHAR(50);
        
        -- Adicionar comentário
        COMMENT ON COLUMN profiles.asaas_customer_id IS 'ID do customer no Asaas (ex: cus_000006799258)';
        
        RAISE NOTICE 'Coluna asaas_customer_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna asaas_customer_id já existe!';
    END IF;
END $$;

-- Criar índice para melhorar performance nas buscas
CREATE INDEX IF NOT EXISTS idx_profiles_asaas_customer_id 
ON profiles(asaas_customer_id);

-- Verificar a estrutura atualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position; 