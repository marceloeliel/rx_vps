import { createClient } from '@/lib/supabase/client'

// Configurações dos planos
const PLAN_CONFIGURATIONS = [
  {
    plan_id: 'basico',
    plan_name: 'Básico',
    max_vehicles: 5,
    max_featured_vehicles: 1,
    storage_limit_mb: 100,
    api_calls_per_month: 0,
    can_create_basic_ads: true,
    can_create_featured_ads: false,
    can_create_premium_ads: false,
    has_email_support: true,
    has_phone_support: false,
    has_whatsapp_support: false,
    has_priority_support: false,
    has_24_7_support: false,
    has_basic_stats: true,
    has_advanced_stats: false,
    has_complete_stats: false,
    has_custom_reports: false,
    has_advanced_reports: false,
    has_admin_panel: false,
    has_api_access: false,
    has_dedicated_consulting: false
  },
  {
    plan_id: 'profissional',
    plan_name: 'Profissional',
    max_vehicles: 30,
    max_featured_vehicles: 3,
    storage_limit_mb: 500,
    api_calls_per_month: 1000,
    can_create_basic_ads: true,
    can_create_featured_ads: true,
    can_create_premium_ads: false,
    has_email_support: true,
    has_phone_support: true,
    has_whatsapp_support: false,
    has_priority_support: true,
    has_24_7_support: false,
    has_basic_stats: true,
    has_advanced_stats: true,
    has_complete_stats: false,
    has_custom_reports: true,
    has_advanced_reports: false,
    has_admin_panel: true,
    has_api_access: false,
    has_dedicated_consulting: false
  },
  {
    plan_id: 'empresarial',
    plan_name: 'Empresarial',
    max_vehicles: 400,
    max_featured_vehicles: 40,
    storage_limit_mb: 2000,
    api_calls_per_month: 10000,
    can_create_basic_ads: true,
    can_create_featured_ads: true,
    can_create_premium_ads: true,
    has_email_support: true,
    has_phone_support: true,
    has_whatsapp_support: true,
    has_priority_support: true,
    has_24_7_support: true,
    has_basic_stats: true,
    has_advanced_stats: true,
    has_complete_stats: true,
    has_custom_reports: true,
    has_advanced_reports: true,
    has_admin_panel: true,
    has_api_access: true,
    has_dedicated_consulting: false
  },
  {
    plan_id: 'ilimitado',
    plan_name: 'Ilimitado',
    max_vehicles: 0, // 0 = ilimitado
    max_featured_vehicles: 100,
    storage_limit_mb: 10000,
    api_calls_per_month: 0, // 0 = ilimitado
    can_create_basic_ads: true,
    can_create_featured_ads: true,
    can_create_premium_ads: true,
    has_email_support: true,
    has_phone_support: true,
    has_whatsapp_support: true,
    has_priority_support: true,
    has_24_7_support: true,
    has_basic_stats: true,
    has_advanced_stats: true,
    has_complete_stats: true,
    has_custom_reports: true,
    has_advanced_reports: true,
    has_admin_panel: true,
    has_api_access: true,
    has_dedicated_consulting: true
  }
]

export async function createPlanControlTables() {
  const supabase = createClient()
  
  try {
    console.log('🚀 Iniciando criação das tabelas de controle de planos...')
    
    // 1. Criar tabela plan_configurations
    console.log('📋 Criando tabela plan_configurations...')
    const { error: planConfigError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS plan_configurations (
          id SERIAL PRIMARY KEY,
          plan_id VARCHAR(50) UNIQUE NOT NULL,
          plan_name VARCHAR(100) NOT NULL,
          max_vehicles INTEGER NOT NULL DEFAULT 0,
          max_featured_vehicles INTEGER NOT NULL DEFAULT 0,
          storage_limit_mb INTEGER NOT NULL DEFAULT 100,
          api_calls_per_month INTEGER NOT NULL DEFAULT 0,
          can_create_basic_ads BOOLEAN NOT NULL DEFAULT true,
          can_create_featured_ads BOOLEAN NOT NULL DEFAULT false,
          can_create_premium_ads BOOLEAN NOT NULL DEFAULT false,
          has_email_support BOOLEAN NOT NULL DEFAULT true,
          has_phone_support BOOLEAN NOT NULL DEFAULT false,
          has_whatsapp_support BOOLEAN NOT NULL DEFAULT false,
          has_priority_support BOOLEAN NOT NULL DEFAULT false,
          has_24_7_support BOOLEAN NOT NULL DEFAULT false,
          has_basic_stats BOOLEAN NOT NULL DEFAULT true,
          has_advanced_stats BOOLEAN NOT NULL DEFAULT false,
          has_complete_stats BOOLEAN NOT NULL DEFAULT false,
          has_custom_reports BOOLEAN NOT NULL DEFAULT false,
          has_advanced_reports BOOLEAN NOT NULL DEFAULT false,
          has_admin_panel BOOLEAN NOT NULL DEFAULT false,
          has_api_access BOOLEAN NOT NULL DEFAULT false,
          has_dedicated_consulting BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (planConfigError) {
      console.error('❌ Erro ao criar plan_configurations:', planConfigError)
      throw planConfigError
    }
    
    // 2. Criar tabela user_plan_usage
    console.log('📊 Criando tabela user_plan_usage...')
    const { error: usageError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_plan_usage (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          current_vehicles INTEGER NOT NULL DEFAULT 0,
          current_featured_vehicles INTEGER NOT NULL DEFAULT 0,
          storage_used_mb INTEGER NOT NULL DEFAULT 0,
          api_calls_this_month INTEGER NOT NULL DEFAULT 0,
          last_api_reset DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `
    })
    
    if (usageError) {
      console.error('❌ Erro ao criar user_plan_usage:', usageError)
      throw usageError
    }
    
    // 3. Criar tabela user_usage_history
    console.log('📈 Criando tabela user_usage_history...')
    const { error: historyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_usage_history (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          action_type VARCHAR(50) NOT NULL,
          resource_type VARCHAR(50) NOT NULL,
          resource_id VARCHAR(100),
          old_value INTEGER,
          new_value INTEGER,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (historyError) {
      console.error('❌ Erro ao criar user_usage_history:', historyError)
      throw historyError
    }
    
    console.log('✅ Tabelas criadas com sucesso!')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Erro geral na criação das tabelas:', error)
    return { success: false, error }
  }
}

export async function insertPlanConfigurations() {
  const supabase = createClient()
  
  try {
    console.log('📝 Inserindo configurações dos planos...')
    
    for (const config of PLAN_CONFIGURATIONS) {
      const { error } = await supabase
        .from('plan_configurations')
        .upsert(config, { onConflict: 'plan_id' })
      
      if (error) {
        console.error(`❌ Erro ao inserir plano ${config.plan_id}:`, error)
        throw error
      }
      
      console.log(`✅ Plano ${config.plan_name} configurado`)
    }
    
    console.log('✅ Todas as configurações de planos foram inseridas!')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Erro ao inserir configurações:', error)
    return { success: false, error }
  }
}

export async function createPlanFunctions() {
  const supabase = createClient()
  
  try {
    console.log('⚙️ Criando funções de controle de planos...')
    
    // Função para verificar se pode adicionar veículo
    const { error: canAddVehicleError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION can_add_vehicle(p_user_id UUID)
        RETURNS JSONB AS $$
        DECLARE
          user_profile RECORD;
          plan_config RECORD;
          usage_data RECORD;
          result JSONB;
        BEGIN
          -- Buscar perfil do usuário
          SELECT plano_atual INTO user_profile FROM profiles WHERE id = p_user_id;
          
          IF user_profile.plano_atual IS NULL THEN
            RETURN jsonb_build_object(
              'can_add', false,
              'reason', 'Usuário não possui plano ativo',
              'current_count', 0,
              'max_allowed', 0
            );
          END IF;
          
          -- Buscar configuração do plano
          SELECT * INTO plan_config FROM plan_configurations WHERE plan_id = user_profile.plano_atual;
          
          IF NOT FOUND THEN
            RETURN jsonb_build_object(
              'can_add', false,
              'reason', 'Configuração do plano não encontrada',
              'current_count', 0,
              'max_allowed', 0
            );
          END IF;
          
          -- Se max_vehicles = 0, é ilimitado
          IF plan_config.max_vehicles = 0 THEN
            RETURN jsonb_build_object(
              'can_add', true,
              'reason', 'Plano com veículos ilimitados',
              'current_count', 0,
              'max_allowed', 0
            );
          END IF;
          
          -- Buscar uso atual
          SELECT * INTO usage_data FROM user_plan_usage WHERE user_id = p_user_id;
          
          IF NOT FOUND THEN
            -- Criar registro de uso se não existir
            INSERT INTO user_plan_usage (user_id) VALUES (p_user_id);
            usage_data.current_vehicles := 0;
          END IF;
          
          -- Verificar se pode adicionar
          IF usage_data.current_vehicles < plan_config.max_vehicles THEN
            RETURN jsonb_build_object(
              'can_add', true,
              'reason', 'Dentro do limite do plano',
              'current_count', usage_data.current_vehicles,
              'max_allowed', plan_config.max_vehicles
            );
          ELSE
            RETURN jsonb_build_object(
              'can_add', false,
              'reason', 'Limite de veículos atingido',
              'current_count', usage_data.current_vehicles,
              'max_allowed', plan_config.max_vehicles
            );
          END IF;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    })
    
    if (canAddVehicleError) {
      console.error('❌ Erro ao criar função can_add_vehicle:', canAddVehicleError)
      throw canAddVehicleError
    }
    
    // Função para verificar se pode destacar veículo
    const { error: canFeatureVehicleError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION can_feature_vehicle(p_user_id UUID)
        RETURNS JSONB AS $$
        DECLARE
          user_profile RECORD;
          plan_config RECORD;
          usage_data RECORD;
        BEGIN
          -- Buscar perfil do usuário
          SELECT plano_atual INTO user_profile FROM profiles WHERE id = p_user_id;
          
          IF user_profile.plano_atual IS NULL THEN
            RETURN jsonb_build_object(
              'can_add', false,
              'reason', 'Usuário não possui plano ativo',
              'current_count', 0,
              'max_allowed', 0
            );
          END IF;
          
          -- Buscar configuração do plano
          SELECT * INTO plan_config FROM plan_configurations WHERE plan_id = user_profile.plano_atual;
          
          IF NOT FOUND THEN
            RETURN jsonb_build_object(
              'can_add', false,
              'reason', 'Configuração do plano não encontrada',
              'current_count', 0,
              'max_allowed', 0
            );
          END IF;
          
          -- Buscar uso atual
          SELECT * INTO usage_data FROM user_plan_usage WHERE user_id = p_user_id;
          
          IF NOT FOUND THEN
            INSERT INTO user_plan_usage (user_id) VALUES (p_user_id);
            usage_data.current_featured_vehicles := 0;
          END IF;
          
          -- Verificar se pode destacar
          IF usage_data.current_featured_vehicles < plan_config.max_featured_vehicles THEN
            RETURN jsonb_build_object(
              'can_add', true,
              'reason', 'Dentro do limite do plano',
              'current_count', usage_data.current_featured_vehicles,
              'max_allowed', plan_config.max_featured_vehicles
            );
          ELSE
            RETURN jsonb_build_object(
              'can_add', false,
              'reason', 'Limite de destaques atingido',
              'current_count', usage_data.current_featured_vehicles,
              'max_allowed', plan_config.max_featured_vehicles
            );
          END IF;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    })
    
    if (canFeatureVehicleError) {
      console.error('❌ Erro ao criar função can_feature_vehicle:', canFeatureVehicleError)
      throw canFeatureVehicleError
    }
    
    console.log('✅ Funções criadas com sucesso!')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Erro ao criar funções:', error)
    return { success: false, error }
  }
}

export async function setupPlanControlSystem() {
  console.log('🎯 Configurando sistema completo de controle de planos...')
  
  try {
    // 1. Criar tabelas
    const tablesResult = await createPlanControlTables()
    if (!tablesResult.success) {
      throw new Error('Falha ao criar tabelas')
    }
    
    // 2. Inserir configurações
    const configResult = await insertPlanConfigurations()
    if (!configResult.success) {
      throw new Error('Falha ao inserir configurações')
    }
    
    // 3. Criar funções
    const functionsResult = await createPlanFunctions()
    if (!functionsResult.success) {
      throw new Error('Falha ao criar funções')
    }
    
    console.log('🎉 Sistema de controle de planos configurado com sucesso!')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Erro na configuração do sistema:', error)
    return { success: false, error }
  }
}

// Função para testar o sistema
export async function testPlanSystem(userId: string) {
  const supabase = createClient()
  
  try {
    console.log('🧪 Testando sistema de controle de planos...')
    
    // Testar função can_add_vehicle
    const { data: canAddResult, error: canAddError } = await supabase
      .rpc('can_add_vehicle', { p_user_id: userId })
    
    if (canAddError) {
      console.error('❌ Erro ao testar can_add_vehicle:', canAddError)
    } else {
      console.log('✅ Teste can_add_vehicle:', canAddResult)
    }
    
    // Testar função can_feature_vehicle
    const { data: canFeatureResult, error: canFeatureError } = await supabase
      .rpc('can_feature_vehicle', { p_user_id: userId })
    
    if (canFeatureError) {
      console.error('❌ Erro ao testar can_feature_vehicle:', canFeatureError)
    } else {
      console.log('✅ Teste can_feature_vehicle:', canFeatureResult)
    }
    
    // Buscar configurações dos planos
    const { data: planConfigs, error: planConfigsError } = await supabase
      .from('plan_configurations')
      .select('*')
    
    if (planConfigsError) {
      console.error('❌ Erro ao buscar configurações:', planConfigsError)
    } else {
      console.log('✅ Configurações dos planos:', planConfigs)
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    return { success: false, error }
  }
}