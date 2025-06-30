-- EXECUTAR ESTE SCRIPT AGORA NO SUPABASE SQL EDITOR
-- Resolver de vez o problema do customer_id

-- Inserir o usuário com customer_id mais recente
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
  'cus_000006799511', -- Customer ID dos logs
  NOW(), 
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  asaas_customer_id = 'cus_000006799511',
  updated_at = NOW();

-- Verificar se funcionou
SELECT 
  id,
  nome_completo,
  email,
  whatsapp,
  asaas_customer_id,
  created_at
FROM profiles 
WHERE id = '211e066b-c56d-45fc-8504-a98498535693'; 