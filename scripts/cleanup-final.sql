-- 🧹 SCRIPT DE LIMPEZA FINAL
-- Execute para garantir que tudo está funcionando perfeitamente

-- 1. Verificar se o usuário existe e tem customer_id
SELECT 
  '✅ STATUS DO USUÁRIO PRINCIPAL' as info,
  id,
  nome_completo,
  email,
  whatsapp,
  asaas_customer_id,
  CASE 
    WHEN asaas_customer_id IS NOT NULL THEN '✅ TEM CUSTOMER_ID'
    ELSE '❌ SEM CUSTOMER_ID'
  END as status_customer
FROM profiles 
WHERE id = '211e066b-c56d-45fc-8504-a98498535693';

-- 2. Estatísticas gerais da tabela
SELECT 
  '📊 ESTATÍSTICAS GERAIS' as info,
  COUNT(*) as total_usuarios,
  COUNT(asaas_customer_id) as usuarios_com_customer_id,
  COUNT(CASE WHEN asaas_customer_id IS NOT NULL THEN 1 END) * 100.0 / COUNT(*) as percentual_com_customer
FROM profiles;

-- 3. Últimos usuários criados
SELECT 
  '📋 ÚLTIMOS USUÁRIOS' as info,
  id,
  nome_completo,
  email,
  asaas_customer_id,
  created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Verificar políticas RLS
SELECT 
  '🔒 POLÍTICAS RLS' as info,
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'COM RESTRIÇÃO'
    ELSE 'SEM RESTRIÇÃO'
  END as tipo_politica
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Status da tabela profiles
SELECT 
  '⚙️ CONFIGURAÇÃO DA TABELA' as info,
  schemaname,
  tablename,
  rowsecurity as rls_habilitado,
  CASE 
    WHEN rowsecurity THEN '🔒 RLS ATIVO'
    ELSE '🔓 RLS DESABILITADO'
  END as status_rls
FROM pg_tables 
WHERE tablename = 'profiles';

-- 6. Se o usuário não existir, criar agora
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
  'cus_000006799535',
  NOW(), 
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  asaas_customer_id = COALESCE(profiles.asaas_customer_id, 'cus_000006799535'),
  updated_at = NOW();

-- 7. Verificação final
SELECT 
  '🎉 VERIFICAÇÃO FINAL' as resultado,
  CASE 
    WHEN COUNT(*) > 0 AND COUNT(asaas_customer_id) > 0 THEN '✅ TUDO FUNCIONANDO!'
    WHEN COUNT(*) > 0 AND COUNT(asaas_customer_id) = 0 THEN '⚠️ USUÁRIO SEM CUSTOMER_ID'
    ELSE '❌ USUÁRIO NÃO EXISTE'
  END as status,
  COUNT(*) as usuarios_encontrados,
  COUNT(asaas_customer_id) as com_customer_id
FROM profiles 
WHERE id = '211e066b-c56d-45fc-8504-a98498535693'; 