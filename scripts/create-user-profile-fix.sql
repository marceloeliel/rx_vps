-- Script para criar o perfil do usuário na tabela profiles
-- Executar no Supabase SQL Editor

-- Verificar se o usuário já existe
SELECT id, email, nome_completo, asaas_customer_id 
FROM profiles 
WHERE id = '211e066b-c56d-45fc-8504-a98498535693';

-- Se não existir (resultado vazio), inserir o usuário
INSERT INTO profiles (
  id,
  email,
  nome_completo,
  whatsapp,
  asaas_customer_id,
  created_at,
  updated_at
) VALUES (
  '211e066b-c56d-45fc-8504-a98498535693',
  'marcelo@teste.com',
  'MARCELO ELIEL DE SOUZA',
  '61999855068',
  'cus_000006799489',
  NOW(),
  NOW()
) 
ON CONFLICT (id) DO UPDATE SET
  asaas_customer_id = 'cus_000006799489',
  updated_at = NOW();

-- Verificar se foi inserido/atualizado corretamente
SELECT id, email, nome_completo, whatsapp, asaas_customer_id, created_at, updated_at
FROM profiles 
WHERE id = '211e066b-c56d-45fc-8504-a98498535693'; 