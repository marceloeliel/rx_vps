-- SCRIPT CORRIGIDO - SEM ERRO DE POLÍTICA DUPLICADA
-- Execute no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Inserir/atualizar o usuário com customer_id correto
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
  false,
  'cus_000006799528', -- Customer ID correto dos logs
  NOW(), 
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  asaas_customer_id = 'cus_000006799528',
  nome_completo = 'MARCELO ELIEL DE SOUZA',
  email = 'marcelo@teste.com',
  whatsapp = '61999855068',
  updated_at = NOW();

-- 3. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Verificar se deu certo
SELECT 
  id,
  nome_completo,
  email,
  whatsapp,
  asaas_customer_id,
  created_at,
  updated_at
FROM profiles 
WHERE id = '211e066b-c56d-45fc-8504-a98498535693';

-- 5. Mostrar todas as políticas existentes (para debug)
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles'; 