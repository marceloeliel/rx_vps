-- Script para verificar se a coluna asaas_customer_id existe e está funcionando
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a coluna existe
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'asaas_customer_id';

-- 2. Verificar estrutura completa da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Verificar se existem usuários com asaas_customer_id preenchido
SELECT 
    id,
    nome_completo,
    email,
    asaas_customer_id,
    created_at,
    updated_at
FROM profiles 
WHERE asaas_customer_id IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

-- 4. Verificar os últimos usuários criados
SELECT 
    id,
    nome_completo,
    email,
    asaas_customer_id,
    created_at
FROM profiles 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 5. Se a coluna não existir, criar ela
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'asaas_customer_id'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN asaas_customer_id VARCHAR(50);
        
        RAISE NOTICE 'Coluna asaas_customer_id criada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna asaas_customer_id já existe!';
    END IF;
END $$;

-- 6. Criar índice se não existir
CREATE INDEX IF NOT EXISTS idx_profiles_asaas_customer_id 
ON profiles(asaas_customer_id);

-- 8. Verificar se o índice foi criado
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'profiles' 
  AND indexname LIKE '%asaas%';

-- 9. Teste básico de insert/update/select
-- ATENÇÃO: Execute este bloco apenas se quiser fazer um teste real
/*
DO $$ 
DECLARE
    test_user_id UUID;
    test_customer_id VARCHAR(50) := 'cus_test_' || extract(epoch from now())::bigint;
BEGIN
    -- Buscar um usuário existente para teste
    SELECT id INTO test_user_id 
    FROM profiles 
    WHERE asaas_customer_id IS NULL 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Teste de update
        UPDATE profiles 
        SET asaas_customer_id = test_customer_id,
            updated_at = NOW()
        WHERE id = test_user_id;
        
        -- Verificar se foi salvo
        IF EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = test_user_id 
            AND asaas_customer_id = test_customer_id
        ) THEN
            RAISE NOTICE 'Teste de update bem-sucedido! User: %, Customer: %', test_user_id, test_customer_id;
            
            -- Limpar o teste
            UPDATE profiles 
            SET asaas_customer_id = NULL 
            WHERE id = test_user_id;
        ELSE
            RAISE NOTICE 'Teste de update falhou!';
        END IF;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para teste';
    END IF;
END $$;
*/ 