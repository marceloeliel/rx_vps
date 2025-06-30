-- Script para verificar se as tabelas do Asaas existem
-- Execute este script no SQL Editor do Supabase para verificar se as tabelas foram criadas

-- Verificar se as tabelas existem
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('asaas_customers', 'asaas_payments', 'asaas_subscriptions', 'asaas_webhooks')
ORDER BY table_name;

-- Se as tabelas não existirem, você precisa executar o script create-payments-tables.sql

-- Verificar estrutura das tabelas (se existirem)
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('asaas_customers', 'asaas_payments', 'asaas_subscriptions', 'asaas_webhooks')
ORDER BY table_name, ordinal_position; 