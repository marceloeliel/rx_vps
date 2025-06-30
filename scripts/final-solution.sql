-- 🚀 SOLUÇÃO FINAL - EXECUTE ESTE SCRIPT NO SUPABASE SQL EDITOR
-- Resolve todos os problemas de uma vez

-- 1. Desabilitar RLS temporariamente para permitir inserção
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Inserir/atualizar o usuário com dados corretos
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
  'cus_000006799535', -- Customer ID mais recente dos logs
  NOW(), 
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  asaas_customer_id = 'cus_000006799535',
  nome_completo = 'MARCELO ELIEL DE SOUZA',
  email = 'marcelo@teste.com',
  whatsapp = '61999855068',
  tipo_usuario = 'cliente',
  updated_at = NOW();

-- 3. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Verificar se o usuário foi criado corretamente
SELECT 
  '✅ USUÁRIO CRIADO COM SUCESSO!' as status,
  id,
  nome_completo,
  email,
  whatsapp,
  asaas_customer_id,
  created_at,
  updated_at
FROM profiles 
WHERE id = '211e066b-c56d-45fc-8504-a98498535693';

-- 5. Verificar total de perfis na tabela
SELECT 
  '📊 ESTATÍSTICAS DA TABELA' as info,
  COUNT(*) as total_perfis,
  COUNT(asaas_customer_id) as perfis_com_customer_id
FROM profiles;

-- 6. Mostrar últimos perfis criados
SELECT 
  '📋 ÚLTIMOS PERFIS CRIADOS' as info,
  id,
  nome_completo,
  asaas_customer_id,
  created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5; 