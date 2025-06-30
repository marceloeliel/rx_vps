-- DESABILITAR RLS TEMPORARIAMENTE PARA RESOLVER O PROBLEMA
-- Execute no Supabase SQL Editor

-- 1. Desabilitar RLS na tabela profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Inserir o usuário com customer_id mais recente
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
  'cus_000006799528', -- Customer ID mais recente dos logs
  NOW(), 
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  asaas_customer_id = 'cus_000006799528',
  updated_at = NOW();

-- 3. Reabilitar RLS (IMPORTANTE!)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar política permissiva para usuários autenticados
CREATE POLICY "Users can manage own profile" ON profiles
FOR ALL USING (auth.uid() = id);

-- 5. Verificar se funcionou
SELECT 
  id,
  nome_completo,
  email,
  whatsapp,
  asaas_customer_id,
  created_at
FROM profiles 
WHERE id = '211e066b-c56d-45fc-8504-a98498535693'; 