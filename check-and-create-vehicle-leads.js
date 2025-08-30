const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAndCreateVehicleLeads() {
  console.log('🔍 Verificando se a tabela vehicle_leads existe...')
  
  try {
    // Tentar fazer uma query simples na tabela
    const { data, error } = await supabase
      .from('vehicle_leads')
      .select('id')
      .limit(1)
    
    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log('❌ Tabela vehicle_leads não existe. Criando...')
        await createVehicleLeadsTable()
      } else {
        console.error('❌ Erro ao verificar tabela:', error)
        return false
      }
    } else {
      console.log('✅ Tabela vehicle_leads já existe')
      return true
    }
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

async function createVehicleLeadsTable() {
  console.log('🔨 Criando tabela vehicle_leads...')
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS vehicle_leads (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      vehicle_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
      agency_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      lead_type TEXT NOT NULL CHECK (lead_type IN ('favorite', 'contact_whatsapp', 'contact_email', 'view_details', 'simulation')),
      contact_info JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
      UNIQUE(user_id, vehicle_id)
    );
    
    -- Habilitar RLS
    ALTER TABLE vehicle_leads ENABLE ROW LEVEL SECURITY;
    
    -- Política para permitir que usuários autenticados criem leads
    CREATE POLICY IF NOT EXISTS "Allow authenticated users to create leads" ON vehicle_leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Política para permitir que agências vejam seus leads
    CREATE POLICY IF NOT EXISTS "Agencies can view all leads for their agency" ON vehicle_leads
    FOR SELECT USING (agency_id = auth.uid());
    
    -- Política para permitir que usuários vejam seus próprios leads
    CREATE POLICY IF NOT EXISTS "Users can view their own leads" ON vehicle_leads
    FOR SELECT USING (user_id = auth.uid());
  `
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (error) {
      console.error('❌ Erro ao criar tabela:', error)
      
      // Tentar método alternativo usando SQL direto
      console.log('🔄 Tentando método alternativo...')
      const { error: directError } = await supabase
        .from('_sql')
        .insert({ query: createTableSQL })
      
      if (directError) {
        console.error('❌ Erro no método alternativo:', directError)
        console.log('\n📋 Execute este SQL manualmente no Supabase Dashboard:')
        console.log('=' .repeat(60))
        console.log(createTableSQL)
        console.log('=' .repeat(60))
        return false
      }
    }
    
    console.log('✅ Tabela vehicle_leads criada com sucesso!')
    return true
  } catch (error) {
    console.error('❌ Erro inesperado ao criar tabela:', error)
    console.log('\n📋 Execute este SQL manualmente no Supabase Dashboard:')
    console.log('=' .repeat(60))
    console.log(createTableSQL)
    console.log('=' .repeat(60))
    return false
  }
}

async function testLeadCreation() {
  console.log('🧪 Testando criação de lead...')
  
  try {
    // Buscar um usuário e veículo para teste
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    const { data: vehicles } = await supabase
      .from('veiculos')
      .select('id, user_id')
      .limit(1)
    
    if (!users?.length || !vehicles?.length) {
      console.log('⚠️ Não há dados suficientes para teste')
      return
    }
    
    const testLead = {
      user_id: users[0].id,
      vehicle_id: vehicles[0].id,
      agency_id: vehicles[0].user_id,
      lead_type: 'view_details'
    }
    
    const { data, error } = await supabase
      .from('vehicle_leads')
      .insert(testLead)
      .select()
    
    if (error) {
      console.error('❌ Erro no teste:', error)
    } else {
      console.log('✅ Teste de criação de lead bem-sucedido!')
      
      // Limpar o lead de teste
      await supabase
        .from('vehicle_leads')
        .delete()
        .eq('id', data[0].id)
      
      console.log('🧹 Lead de teste removido')
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

async function main() {
  console.log('🚀 Iniciando verificação da tabela vehicle_leads...')
  
  const exists = await checkAndCreateVehicleLeads()
  
  if (exists) {
    await testLeadCreation()
  }
  
  console.log('\n✨ Processo concluído!')
}

main().catch(console.error)