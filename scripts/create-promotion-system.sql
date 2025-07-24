-- ====================================
-- SISTEMA DE PROMOÇÃO - 30 DIAS GRATUITOS
-- ====================================

-- 1. Tabela para controlar campanhas promocionais
CREATE TABLE IF NOT EXISTS promotional_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  free_days INTEGER DEFAULT 30,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Configurações específicas
  applies_to_new_users BOOLEAN DEFAULT true,
  requires_valid_document BOOLEAN DEFAULT true,
  max_uses INTEGER, -- NULL = ilimitado
  current_uses INTEGER DEFAULT 0
);

-- 2. Inserir campanha padrão de 30 dias (ativa por 3 meses)
INSERT INTO promotional_campaigns (
  name,
  description,
  is_active,
  free_days,
  start_date,
  end_date,
  applies_to_new_users,
  requires_valid_document
) VALUES (
  '30 Dias Gratuitos - Lançamento',
  'Promoção de lançamento: 30 dias gratuitos para novos usuários com CPF/CNPJ válido',
  true,
  30,
  NOW(),
  NOW() + INTERVAL '3 months',
  true,
  true
) ON CONFLICT DO NOTHING;

-- 3. Adicionar colunas na tabela profiles para controle promocional
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS promotional_campaign_id UUID REFERENCES promotional_campaigns(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS promotional_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS promotional_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_promotional_user BOOLEAN DEFAULT false;

-- 4. Adicionar validação de documentos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS document_validated BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS document_validation_date TIMESTAMP WITH TIME ZONE;

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_promotional_campaign ON profiles(promotional_campaign_id);
CREATE INDEX IF NOT EXISTS idx_profiles_promotional_dates ON profiles(promotional_start_date, promotional_end_date);
CREATE INDEX IF NOT EXISTS idx_profiles_is_promotional ON profiles(is_promotional_user) WHERE is_promotional_user = true;
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_active ON promotional_campaigns(is_active) WHERE is_active = true;

-- 6. Função para aplicar promoção a novo usuário
CREATE OR REPLACE FUNCTION apply_promotional_campaign(user_id UUID, document TEXT)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  promotional_end_date TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  active_campaign promotional_campaigns%ROWTYPE;
  calculated_end_date TIMESTAMP WITH TIME ZONE;
  is_valid_doc BOOLEAN := false;
BEGIN
  -- Verificar se existe campanha ativa
  SELECT * INTO active_campaign
  FROM promotional_campaigns
  WHERE is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
    AND applies_to_new_users = true
  ORDER BY created_at DESC
  LIMIT 1;

  -- Se não há campanha ativa
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Nenhuma campanha promocional ativa', NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;

  -- Validar documento se necessário
  IF active_campaign.requires_valid_document THEN
    -- Validação básica de CPF/CNPJ (pode ser expandida)
    IF document IS NOT NULL AND LENGTH(REGEXP_REPLACE(document, '[^0-9]', '', 'g')) IN (11, 14) THEN
      is_valid_doc := true;
    END IF;
    
    IF NOT is_valid_doc THEN
      RETURN QUERY SELECT false, 'Documento inválido. CPF deve ter 11 dígitos e CNPJ 14 dígitos', NULL::TIMESTAMP WITH TIME ZONE;
      RETURN;
    END IF;
  END IF;

  -- Calcular data de fim da promoção
  calculated_end_date := NOW() + (active_campaign.free_days || ' days')::INTERVAL;

  -- Aplicar promoção ao usuário
  UPDATE profiles SET
    promotional_campaign_id = active_campaign.id,
    promotional_start_date = NOW(),
    promotional_end_date = calculated_end_date,
    is_promotional_user = true,
    document_validated = is_valid_doc,
    document_validation_date = CASE WHEN is_valid_doc THEN NOW() ELSE NULL END,
    plano_atual = 'promocional',
    plano_data_fim = calculated_end_date,
    updated_at = NOW()
  WHERE id = user_id;

  -- Atualizar contador de usos da campanha
  UPDATE promotional_campaigns 
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE id = active_campaign.id;

  RETURN QUERY SELECT true, 'Promoção aplicada com sucesso!', calculated_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para verificar se usuário tem acesso promocional
CREATE OR REPLACE FUNCTION check_promotional_access(user_id UUID)
RETURNS TABLE (
  has_access BOOLEAN,
  is_promotional BOOLEAN,
  days_remaining INTEGER,
  end_date TIMESTAMP WITH TIME ZONE,
  campaign_name TEXT
) AS $$
DECLARE
  user_profile profiles%ROWTYPE;
  campaign promotional_campaigns%ROWTYPE;
  remaining_days INTEGER := 0;
BEGIN
  -- Buscar perfil do usuário
  SELECT * INTO user_profile FROM profiles WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false, 0, NULL::TIMESTAMP WITH TIME ZONE, NULL::TEXT;
    RETURN;
  END IF;

  -- Se não é usuário promocional
  IF NOT user_profile.is_promotional_user OR user_profile.promotional_end_date IS NULL THEN
    -- Verificar se tem plano pago ativo
    IF user_profile.plano_atual IS NOT NULL AND user_profile.plano_data_fim IS NOT NULL AND user_profile.plano_data_fim > NOW() THEN
      RETURN QUERY SELECT true, false, 0, user_profile.plano_data_fim, 'Plano Pago';
    ELSE
      RETURN QUERY SELECT false, false, 0, NULL::TIMESTAMP WITH TIME ZONE, NULL::TEXT;
    END IF;
    RETURN;
  END IF;

  -- Verificar se promoção ainda está válida
  IF user_profile.promotional_end_date > NOW() THEN
    remaining_days := EXTRACT(DAY FROM user_profile.promotional_end_date - NOW())::INTEGER;
    
    -- Buscar informações da campanha
    SELECT * INTO campaign FROM promotional_campaigns WHERE id = user_profile.promotional_campaign_id;
    
    RETURN QUERY SELECT 
      true, 
      true, 
      remaining_days, 
      user_profile.promotional_end_date,
      COALESCE(campaign.name, 'Promoção')::TEXT;
  ELSE
    RETURN QUERY SELECT false, true, 0, user_profile.promotional_end_date, 'Promoção Expirada';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para expirar promoções automaticamente
CREATE OR REPLACE FUNCTION expire_promotional_users()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER := 0;
BEGIN
  -- Atualizar usuários com promoção expirada
  UPDATE profiles SET
    is_promotional_user = false,
    plano_atual = NULL,
    plano_data_fim = NULL,
    updated_at = NOW()
  WHERE is_promotional_user = true
    AND promotional_end_date IS NOT NULL
    AND promotional_end_date <= NOW()
    AND (plano_atual = 'promocional' OR plano_atual IS NULL);

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. View para relatórios de campanhas
CREATE OR REPLACE VIEW campaign_statistics AS
SELECT 
  pc.id,
  pc.name,
  pc.description,
  pc.is_active,
  pc.free_days,
  pc.start_date,
  pc.end_date,
  pc.current_uses,
  pc.max_uses,
  
  -- Estatísticas de usuários
  COUNT(p.id) as total_users_enrolled,
  COUNT(CASE WHEN p.promotional_end_date > NOW() THEN 1 END) as active_promotional_users,
  COUNT(CASE WHEN p.promotional_end_date <= NOW() THEN 1 END) as expired_promotional_users,
  
  -- Conversões (usuários que migraram para plano pago)
  COUNT(CASE 
    WHEN p.is_promotional_user = false 
    AND p.plano_atual IS NOT NULL 
    AND p.plano_atual != 'promocional' 
    THEN 1 
  END) as converted_to_paid,
  
  pc.created_at,
  pc.updated_at
FROM promotional_campaigns pc
LEFT JOIN profiles p ON p.promotional_campaign_id = pc.id
GROUP BY pc.id, pc.name, pc.description, pc.is_active, pc.free_days, 
         pc.start_date, pc.end_date, pc.current_uses, pc.max_uses,
         pc.created_at, pc.updated_at
ORDER BY pc.created_at DESC;

-- 10. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_promotional_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_promotional_campaigns_updated_at
    BEFORE UPDATE ON promotional_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_promotional_campaigns_updated_at();

-- 11. Políticas RLS (Row Level Security)
ALTER TABLE promotional_campaigns ENABLE ROW LEVEL SECURITY;

-- Política para leitura de campanhas ativas (todos podem ver)
CREATE POLICY "promotional_campaigns_select_active" ON promotional_campaigns
    FOR SELECT USING (is_active = true);

-- Política para administradores (completo acesso)
CREATE POLICY "promotional_campaigns_admin_all" ON promotional_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.tipo_usuario = 'admin'
        )
    );

-- 12. Comentários para documentação
COMMENT ON TABLE promotional_campaigns IS 'Tabela para gerenciar campanhas promocionais com períodos gratuitos';
COMMENT ON COLUMN promotional_campaigns.free_days IS 'Número de dias gratuitos oferecidos pela campanha';
COMMENT ON COLUMN promotional_campaigns.applies_to_new_users IS 'Se a campanha se aplica apenas a novos usuários';
COMMENT ON COLUMN promotional_campaigns.requires_valid_document IS 'Se a campanha exige documento válido (CPF/CNPJ)';

COMMENT ON FUNCTION apply_promotional_campaign IS 'Aplica campanha promocional a um usuário com validação de documento';
COMMENT ON FUNCTION check_promotional_access IS 'Verifica se usuário tem acesso promocional ativo';
COMMENT ON FUNCTION expire_promotional_users IS 'Expira usuários com promoção vencida (para uso em cron job)';

-- 13. Dados de exemplo para desenvolvimento
INSERT INTO promotional_campaigns (
  name,
  description,
  is_active,
  free_days,
  start_date,
  end_date,
  applies_to_new_users,
  requires_valid_document,
  max_uses
) VALUES 
(
  'Black Friday 2025',
  'Promoção especial Black Friday: 45 dias gratuitos',
  false,
  45,
  '2025-11-20',
  '2025-11-30',
  true,
  true,
  1000
),
(
  'Teste Desenvolvimento',
  'Campanha para testes em desenvolvimento',
  false,
  7,
  NOW(),
  NOW() + INTERVAL '1 week',
  true,
  false,
  NULL
) ON CONFLICT DO NOTHING;

-- ✅ Script concluído
-- Este script cria todo o sistema de promoções com:
-- - Controle de campanhas ativas/inativas
-- - Validação de documentos
-- - Aplicação automática de promoções
-- - Verificação de acesso promocional
-- - Expiração automática
-- - Relatórios e estatísticas
-- - Segurança e políticas RLS 