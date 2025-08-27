-- Script SQL para adicionar Plano Individual no Supabase
-- Execute no SQL Editor do Supabase

-- 1. Inserir configuração do plano individual na tabela plan_configurations
INSERT INTO plan_configurations (
  plan_id,
  plan_name,
  max_vehicles,
  max_featured_vehicles,
  storage_limit_mb,
  api_calls_per_month,
  can_create_basic_ads,
  can_create_featured_ads,
  can_create_premium_ads,
  has_email_support,
  has_phone_support,
  has_whatsapp_support,
  has_priority_support,
  has_24_7_support,
  has_basic_stats,
  has_advanced_stats,
  has_complete_stats,
  has_custom_reports,
  has_advanced_reports,
  has_admin_panel,
  has_api_access,
  has_dedicated_consulting
) VALUES (
  'individual',
  'Individual',
  1,
  0,
  50,
  0,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false
) ON CONFLICT (plan_id) DO UPDATE SET
  plan_name = EXCLUDED.plan_name,
  max_vehicles = EXCLUDED.max_vehicles,
  max_featured_vehicles = EXCLUDED.max_featured_vehicles,
  storage_limit_mb = EXCLUDED.storage_limit_mb,
  api_calls_per_month = EXCLUDED.api_calls_per_month,
  can_create_basic_ads = EXCLUDED.can_create_basic_ads,
  can_create_featured_ads = EXCLUDED.can_create_featured_ads,
  can_create_premium_ads = EXCLUDED.can_create_premium_ads,
  has_email_support = EXCLUDED.has_email_support,
  has_phone_support = EXCLUDED.has_phone_support,
  has_whatsapp_support = EXCLUDED.has_whatsapp_support,
  has_priority_support = EXCLUDED.has_priority_support,
  has_24_7_support = EXCLUDED.has_24_7_support,
  has_basic_stats = EXCLUDED.has_basic_stats,
  has_advanced_stats = EXCLUDED.has_advanced_stats,
  has_complete_stats = EXCLUDED.has_complete_stats,
  has_custom_reports = EXCLUDED.has_custom_reports,
  has_advanced_reports = EXCLUDED.has_advanced_reports,
  has_admin_panel = EXCLUDED.has_admin_panel,
  has_api_access = EXCLUDED.has_api_access,
  has_dedicated_consulting = EXCLUDED.has_dedicated_consulting;

-- 2. Verificar se a inserção foi bem-sucedida
SELECT * FROM plan_configurations WHERE plan_id = 'individual';

-- 3. Comentários sobre o plano individual:
-- - Permite apenas 1 veículo
-- - Não permite criar anúncios (básicos, destacados ou premium)
-- - Tem apenas suporte básico por email
-- - Não tem acesso ao painel administrativo
-- - Não tem estatísticas ou relatórios
-- - Limite de armazenamento de 50MB
-- - Sem chamadas de API

-- 4. Para testar o sistema de planos após a inserção:
-- SELECT * FROM get_user_plan_limits('USER_ID_AQUI');