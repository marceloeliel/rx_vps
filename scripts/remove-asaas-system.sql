-- Script para remover completamente o sistema Asaas
-- Execute este script no SQL Editor do Supabase

-- 1. Remover colunas relacionadas ao Asaas da tabela profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS asaas_customer_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS asaas_subscription_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS plano_payment_method;
ALTER TABLE profiles DROP COLUMN IF EXISTS plano_valor;
ALTER TABLE profiles DROP COLUMN IF EXISTS plano_payment_id;

-- 2. Remover tabelas de pagamentos e assinaturas
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;

-- 3. Remover tabelas específicas do Asaas se existirem
DROP TABLE IF EXISTS asaas_customers CASCADE;
DROP TABLE IF EXISTS asaas_payments CASCADE;
DROP TABLE IF EXISTS asaas_subscriptions CASCADE;
DROP TABLE IF EXISTS asaas_webhooks CASCADE;

-- 4. Remover índices relacionados ao Asaas
DROP INDEX IF EXISTS idx_profiles_asaas_customer_id;
DROP INDEX IF EXISTS idx_profiles_asaas_subscription_id;
DROP INDEX IF EXISTS idx_profiles_plano_atual;
DROP INDEX IF EXISTS idx_payments_user_id;
DROP INDEX IF EXISTS idx_payments_asaas_payment_id;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_subscriptions_user_id;
DROP INDEX IF EXISTS idx_subscriptions_asaas_subscription_id;
DROP INDEX IF EXISTS idx_subscriptions_status;

-- 5. Verificar se as colunas foram removidas
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar se as tabelas foram removidas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('payments', 'subscriptions', 'asaas_customers', 'asaas_payments', 'asaas_subscriptions', 'asaas_webhooks');

-- 7. Mostrar estrutura atual da tabela profiles
\d profiles;

COMMENT ON SCRIPT IS 'Script executado para remover completamente o sistema Asaas da plataforma'; 