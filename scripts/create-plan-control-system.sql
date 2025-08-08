-- =====================================================
-- SISTEMA COMPLETO DE CONTROLE DE PLANOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Criar tabela de configurações de planos
CREATE TABLE IF NOT EXISTS plan_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id VARCHAR(50) NOT NULL UNIQUE, -- 'basico', 'profissional', 'empresarial', 'ilimitado'
  plan_name VARCHAR(100) NOT NULL,
  plan_price DECIMAL(10,2) NOT NULL,
  
  -- Limites do plano
  max_vehicles INTEGER NOT NULL DEFAULT 0, -- 0 = ilimitado
  max_featured_vehicles INTEGER NOT NULL DEFAULT 0,
  max_photos_per_vehicle INTEGER NOT NULL DEFAULT 5,
  max_video_uploads INTEGER NOT NULL DEFAULT 0,
  
  -- Recursos disponíveis
  has_basic_ads BOOLEAN DEFAULT true,
  has_featured_ads BOOLEAN DEFAULT false,
  has_premium_ads BOOLEAN DEFAULT false,
  has_priority_support BOOLEAN DEFAULT false,
  has_24_7_support BOOLEAN DEFAULT false,
  has_email_support BOOLEAN DEFAULT true,
  has_phone_support BOOLEAN DEFAULT false,
  has_whatsapp_support BOOLEAN DEFAULT false,
  
  -- Estatísticas e relatórios
  has_basic_stats BOOLEAN DEFAULT true,
  has_advanced_stats BOOLEAN DEFAULT false,
  has_complete_stats BOOLEAN DEFAULT false,
  has_custom_reports BOOLEAN DEFAULT false,
  has_advanced_reports BOOLEAN DEFAULT false,
  has_admin_panel BOOLEAN DEFAULT false,
  has_api_access BOOLEAN DEFAULT false,
  has_dedicated_consulting BOOLEAN DEFAULT false,
  
  -- Configurações adicionais
  storage_limit_mb INTEGER DEFAULT 100, -- Limite de armazenamento em MB
  api_calls_per_month INTEGER DEFAULT 0, -- 0 = sem acesso à API
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir configurações dos planos
INSERT INTO plan_configurations (
  plan_id, plan_name, plan_price, max_vehicles, max_featured_vehicles, 
  max_photos_per_vehicle, has_basic_ads, has_email_support, has_basic_stats, storage_limit_mb
) VALUES 
('basico', 'Básico', 59.90, 5, 0, 5, true, true, true, 100),
('profissional', 'Profissional', 299.00, 30, 3, 10, true, true, true, 500),
('empresarial', 'Empresarial', 897.90, 400, 40, 15, true, true, true, 2000),
('ilimitado', 'Ilimitado', 1897.90, 0, 100, 20, true, true, true, 10000)
ON CONFLICT (plan_id) DO UPDATE SET
  plan_name = EXCLUDED.plan_name,
  plan_price = EXCLUDED.plan_price,
  max_vehicles = EXCLUDED.max_vehicles,
  max_featured_vehicles = EXCLUDED.max_featured_vehicles,
  max_photos_per_vehicle = EXCLUDED.max_photos_per_vehicle,
  storage_limit_mb = EXCLUDED.storage_limit_mb,
  updated_at = NOW();

-- Atualizar recursos específicos por plano
UPDATE plan_configurations SET 
  has_featured_ads = true,
  has_priority_support = true,
  has_advanced_stats = true,
  has_custom_reports = true,
  has_admin_panel = true
WHERE plan_id = 'profissional';

UPDATE plan_configurations SET 
  has_featured_ads = true,
  has_premium_ads = true,
  has_24_7_support = true,
  has_phone_support = true,
  has_whatsapp_support = true,
  has_advanced_stats = true,
  has_complete_stats = true,
  has_custom_reports = true,
  has_advanced_reports = true,
  has_admin_panel = true
WHERE plan_id = 'empresarial';

UPDATE plan_configurations SET 
  has_featured_ads = true,
  has_premium_ads = true,
  has_24_7_support = true,
  has_priority_support = true,
  has_phone_support = true,
  has_whatsapp_support = true,
  has_advanced_stats = true,
  has_complete_stats = true,
  has_custom_reports = true,
  has_advanced_reports = true,
  has_admin_panel = true,
  has_api_access = true,
  has_dedicated_consulting = true,
  api_calls_per_month = 10000
WHERE plan_id = 'ilimitado';

-- 3. Criar tabela de uso atual dos usuários
CREATE TABLE IF NOT EXISTS user_plan_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contadores de uso atual
  current_vehicles INTEGER DEFAULT 0,
  current_featured_vehicles INTEGER DEFAULT 0,
  current_storage_used_mb INTEGER DEFAULT 0,
  current_api_calls_month INTEGER DEFAULT 0,
  
  -- Data de reset mensal (para API calls)
  monthly_reset_date DATE DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 4. Criar tabela de histórico de uso
CREATE TABLE IF NOT EXISTS user_usage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'vehicle_added', 'vehicle_removed', 'featured_added', 'api_call', etc.
  resource_type VARCHAR(50) NOT NULL, -- 'vehicle', 'featured', 'storage', 'api'
  quantity_changed INTEGER DEFAULT 1,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Função para verificar se usuário pode adicionar veículo
CREATE OR REPLACE FUNCTION can_add_vehicle(user_uuid UUID)
RETURNS TABLE (
  can_add BOOLEAN,
  reason TEXT,
  current_count INTEGER,
  max_allowed INTEGER
) AS $$
DECLARE
  user_profile profiles%ROWTYPE;
  plan_config plan_configurations%ROWTYPE;
  current_usage user_plan_usage%ROWTYPE;
BEGIN
  -- Buscar perfil do usuário
  SELECT * INTO user_profile FROM profiles WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Usuário não encontrado', 0, 0;
    RETURN;
  END IF;
  
  -- Se não tem plano, usar básico como padrão
  IF user_profile.plano_atual IS NULL THEN
    user_profile.plano_atual := 'basico';
  END IF;
  
  -- Buscar configuração do plano
  SELECT * INTO plan_config FROM plan_configurations WHERE plan_id = user_profile.plano_atual;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Plano não encontrado', 0, 0;
    RETURN;
  END IF;
  
  -- Buscar uso atual
  SELECT * INTO current_usage FROM user_plan_usage WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    -- Criar registro de uso se não existir
    INSERT INTO user_plan_usage (user_id) VALUES (user_uuid);
    current_usage.current_vehicles := 0;
  END IF;
  
  -- Verificar se pode adicionar (0 = ilimitado)
  IF plan_config.max_vehicles = 0 THEN
    RETURN QUERY SELECT true, 'Plano permite veículos ilimitados', current_usage.current_vehicles, 0;
  ELSIF current_usage.current_vehicles < plan_config.max_vehicles THEN
    RETURN QUERY SELECT true, 'Pode adicionar veículo', current_usage.current_vehicles, plan_config.max_vehicles;
  ELSE
    RETURN QUERY SELECT false, 'Limite de veículos atingido para o plano ' || plan_config.plan_name, current_usage.current_vehicles, plan_config.max_vehicles;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para verificar se usuário pode destacar veículo
CREATE OR REPLACE FUNCTION can_feature_vehicle(user_uuid UUID)
RETURNS TABLE (
  can_feature BOOLEAN,
  reason TEXT,
  current_count INTEGER,
  max_allowed INTEGER
) AS $$
DECLARE
  user_profile profiles%ROWTYPE;
  plan_config plan_configurations%ROWTYPE;
  current_usage user_plan_usage%ROWTYPE;
BEGIN
  -- Buscar perfil do usuário
  SELECT * INTO user_profile FROM profiles WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Usuário não encontrado', 0, 0;
    RETURN;
  END IF;
  
  -- Se não tem plano, usar básico como padrão
  IF user_profile.plano_atual IS NULL THEN
    user_profile.plano_atual := 'basico';
  END IF;
  
  -- Buscar configuração do plano
  SELECT * INTO plan_config FROM plan_configurations WHERE plan_id = user_profile.plano_atual;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Plano não encontrado', 0, 0;
    RETURN;
  END IF;
  
  -- Buscar uso atual
  SELECT * INTO current_usage FROM user_plan_usage WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    -- Criar registro de uso se não existir
    INSERT INTO user_plan_usage (user_id) VALUES (user_uuid);
    current_usage.current_featured_vehicles := 0;
  END IF;
  
  -- Verificar se pode destacar
  IF current_usage.current_featured_vehicles < plan_config.max_featured_vehicles THEN
    RETURN QUERY SELECT true, 'Pode destacar veículo', current_usage.current_featured_vehicles, plan_config.max_featured_vehicles;
  ELSE
    RETURN QUERY SELECT false, 'Limite de destaques atingido para o plano ' || plan_config.plan_name, current_usage.current_featured_vehicles, plan_config.max_featured_vehicles;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para obter recursos do plano do usuário
CREATE OR REPLACE FUNCTION get_user_plan_features(user_uuid UUID)
RETURNS TABLE (
  plan_id VARCHAR(50),
  plan_name VARCHAR(100),
  plan_price DECIMAL(10,2),
  max_vehicles INTEGER,
  max_featured_vehicles INTEGER,
  max_photos_per_vehicle INTEGER,
  has_basic_ads BOOLEAN,
  has_featured_ads BOOLEAN,
  has_premium_ads BOOLEAN,
  has_priority_support BOOLEAN,
  has_24_7_support BOOLEAN,
  has_email_support BOOLEAN,
  has_phone_support BOOLEAN,
  has_whatsapp_support BOOLEAN,
  has_basic_stats BOOLEAN,
  has_advanced_stats BOOLEAN,
  has_complete_stats BOOLEAN,
  has_custom_reports BOOLEAN,
  has_advanced_reports BOOLEAN,
  has_admin_panel BOOLEAN,
  has_api_access BOOLEAN,
  has_dedicated_consulting BOOLEAN,
  storage_limit_mb INTEGER,
  api_calls_per_month INTEGER
) AS $$
DECLARE
  user_profile profiles%ROWTYPE;
  plan_config plan_configurations%ROWTYPE;
BEGIN
  -- Buscar perfil do usuário
  SELECT * INTO user_profile FROM profiles WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Se não tem plano, usar básico como padrão
  IF user_profile.plano_atual IS NULL THEN
    user_profile.plano_atual := 'basico';
  END IF;
  
  -- Buscar configuração do plano
  SELECT * INTO plan_config FROM plan_configurations WHERE plan_id = user_profile.plano_atual;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Retornar recursos do plano
  RETURN QUERY SELECT 
    plan_config.plan_id,
    plan_config.plan_name,
    plan_config.plan_price,
    plan_config.max_vehicles,
    plan_config.max_featured_vehicles,
    plan_config.max_photos_per_vehicle,
    plan_config.has_basic_ads,
    plan_config.has_featured_ads,
    plan_config.has_premium_ads,
    plan_config.has_priority_support,
    plan_config.has_24_7_support,
    plan_config.has_email_support,
    plan_config.has_phone_support,
    plan_config.has_whatsapp_support,
    plan_config.has_basic_stats,
    plan_config.has_advanced_stats,
    plan_config.has_complete_stats,
    plan_config.has_custom_reports,
    plan_config.has_advanced_reports,
    plan_config.has_admin_panel,
    plan_config.has_api_access,
    plan_config.has_dedicated_consulting,
    plan_config.storage_limit_mb,
    plan_config.api_calls_per_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para atualizar contadores de uso
CREATE OR REPLACE FUNCTION update_user_usage(
  user_uuid UUID,
  action_type VARCHAR(50),
  resource_type VARCHAR(50),
  quantity_change INTEGER DEFAULT 1,
  description_text TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage user_plan_usage%ROWTYPE;
BEGIN
  -- Buscar ou criar registro de uso
  SELECT * INTO current_usage FROM user_plan_usage WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    INSERT INTO user_plan_usage (user_id) VALUES (user_uuid);
    SELECT * INTO current_usage FROM user_plan_usage WHERE user_id = user_uuid;
  END IF;
  
  -- Atualizar contadores baseado no tipo de recurso
  CASE resource_type
    WHEN 'vehicle' THEN
      UPDATE user_plan_usage 
      SET current_vehicles = current_vehicles + quantity_change,
          updated_at = NOW()
      WHERE user_id = user_uuid;
      
    WHEN 'featured' THEN
      UPDATE user_plan_usage 
      SET current_featured_vehicles = current_featured_vehicles + quantity_change,
          updated_at = NOW()
      WHERE user_id = user_uuid;
      
    WHEN 'storage' THEN
      UPDATE user_plan_usage 
      SET current_storage_used_mb = current_storage_used_mb + quantity_change,
          updated_at = NOW()
      WHERE user_id = user_uuid;
      
    WHEN 'api' THEN
      UPDATE user_plan_usage 
      SET current_api_calls_month = current_api_calls_month + quantity_change,
          updated_at = NOW()
      WHERE user_id = user_uuid;
  END CASE;
  
  -- Registrar no histórico
  INSERT INTO user_usage_history (
    user_id, action_type, resource_type, quantity_changed, description
  ) VALUES (
    user_uuid, action_type, resource_type, quantity_change, description_text
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger para atualizar contadores automaticamente quando veículos são adicionados/removidos
CREATE OR REPLACE FUNCTION sync_vehicle_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Veículo adicionado
    PERFORM update_user_usage(
      NEW.user_id::UUID, 
      'vehicle_added', 
      'vehicle', 
      1, 
      'Veículo adicionado: ' || NEW.titulo
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Veículo removido
    PERFORM update_user_usage(
      OLD.user_id::UUID, 
      'vehicle_removed', 
      'vehicle', 
      -1, 
      'Veículo removido: ' || OLD.titulo
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger na tabela veiculos (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'veiculos') THEN
    DROP TRIGGER IF EXISTS trigger_sync_vehicle_count ON veiculos;
    CREATE TRIGGER trigger_sync_vehicle_count
      AFTER INSERT OR DELETE ON veiculos
      FOR EACH ROW EXECUTE FUNCTION sync_vehicle_count();
  END IF;
END $$;

-- 10. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_plan_configurations_plan_id ON plan_configurations(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_plan_usage_user_id ON user_plan_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_history_user_id ON user_usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_history_action_type ON user_usage_history(action_type);
CREATE INDEX IF NOT EXISTS idx_user_usage_history_resource_type ON user_usage_history(resource_type);
CREATE INDEX IF NOT EXISTS idx_user_usage_history_created_at ON user_usage_history(created_at);

-- 11. Habilitar RLS nas novas tabelas
ALTER TABLE plan_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plan_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage_history ENABLE ROW LEVEL SECURITY;

-- 12. Criar políticas RLS
-- Configurações de planos são públicas para leitura
CREATE POLICY "Plan configurations are publicly readable" ON plan_configurations
  FOR SELECT USING (true);

-- Usuários podem ver apenas seu próprio uso
CREATE POLICY "Users can view own usage" ON user_plan_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON user_plan_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON user_plan_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem ver apenas seu próprio histórico
CREATE POLICY "Users can view own usage history" ON user_usage_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage history" ON user_usage_history
  FOR INSERT WITH CHECK (true); -- Permitir inserção pelo sistema

-- 13. Função para reset mensal de API calls
CREATE OR REPLACE FUNCTION reset_monthly_api_calls()
RETURNS INTEGER AS $$
DECLARE
  reset_count INTEGER := 0;
BEGIN
  UPDATE user_plan_usage 
  SET current_api_calls_month = 0,
      monthly_reset_date = DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
      updated_at = NOW()
  WHERE monthly_reset_date <= CURRENT_DATE;
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  
  RETURN reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 
-- 1. Execute este script no Supabase SQL Editor
-- 
-- 2. Para verificar se um usuário pode adicionar veículo:
--    SELECT * FROM can_add_vehicle('user-uuid-here');
-- 
-- 3. Para verificar se um usuário pode destacar veículo:
--    SELECT * FROM can_feature_vehicle('user-uuid-here');
-- 
-- 4. Para obter recursos do plano do usuário:
--    SELECT * FROM get_user_plan_features('user-uuid-here');
-- 
-- 5. Para atualizar uso manualmente:
--    SELECT update_user_usage('user-uuid', 'vehicle_added', 'vehicle', 1, 'Descrição');
-- 
-- 6. Para reset mensal de API calls (executar via cron):
--    SELECT reset_monthly_api_calls();
-- 
-- =====================================================