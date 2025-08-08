-- Script SQL para remover completamente as referências do sistema Asaas
-- Execute este script no SQL Editor do painel do Supabase

-- 1. Verificar se a coluna asaas_customer_id existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'asaas_customer_id';

-- 2. Remover a coluna asaas_customer_id da tabela profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS asaas_customer_id;

-- 3. Remover o índice relacionado (se existir)
DROP INDEX IF EXISTS idx_profiles_asaas_customer_id;

-- 4. Verificação final - listar todas as colunas da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 5. Verificar se existem outras referências ao Asaas
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE column_name LIKE '%asaas%' 
OR column_name LIKE '%payment%'
OR column_name LIKE '%subscription%'
ORDER BY table_name, column_name;

-- Mensagem de confirmação
SELECT 'Remoção do sistema Asaas concluída com sucesso!' as status;