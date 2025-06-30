-- SCRIPT FINAL - RESOLUÇÃO DO PROBLEMA CUSTOMER_ID
-- Execute este SQL no Supabase para resolver definitivamente o problema

-- 1. Inserir o usuário na tabela profiles com o customer_id mais recente
INSERT INTO profiles (
    id,
    nome_completo,
    email,
    whatsapp,
    tipo_usuario,
    perfil_configurado,
    asaas_customer_id,
    created_at,
    updated_at
) VALUES (
    '211e066b-c56d-45fc-8504-a98498535693',
    'MARCELO ELIEL DE SOUZA',
    'marcelo@teste.com',
    '61999855068',
    'cliente',
    true,
    'cus_000006799498', -- Customer ID mais recente dos logs
    NOW(),
    NOW()
) 
ON CONFLICT (id) DO UPDATE SET
    nome_completo = EXCLUDED.nome_completo,
    email = EXCLUDED.email,
    whatsapp = EXCLUDED.whatsapp,
    asaas_customer_id = EXCLUDED.asaas_customer_id,
    updated_at = NOW();

-- 2. Verificar se foi inserido corretamente
SELECT 
    id, 
    nome_completo, 
    email, 
    whatsapp,
    asaas_customer_id, 
    created_at
FROM profiles 
WHERE id = '211e066b-c56d-45fc-8504-a98498535693';

-- 3. Confirmar que a coluna asaas_customer_id existe e está preenchida
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(asaas_customer_id) as usuarios_com_customer_id
FROM profiles; 