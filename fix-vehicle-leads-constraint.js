const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixVehicleLeadsConstraint() {
  console.log('🔧 Corrigindo constraint UNIQUE na tabela vehicle_leads...')
  
  try {
    // 1. Verificar se a tabela existe
    console.log('1️⃣ Verificando se a tabela existe...')
    const { data: tableExists, error: checkError } = await supabase
      .from('vehicle_leads')
      .select('id')
      .limit(1)
    
    if (checkError && checkError.code === '42P01') {
      console.error('❌ Tabela vehicle_leads não existe!')
      return false
    }
    
    console.log('✅ Tabela vehicle_leads existe')
    
    // 2. Verificar se já existe a constraint
    console.log('2️⃣ Verificando constraint existente...')
    
    // 3. Testar inserção com UPSERT
    console.log('3️⃣ Testando UPSERT...')
    await testUpsert()
    
    return true
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

async function testUpsert() {
  try {
    // Buscar dados reais para teste
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
    
    const testData = {
      user_id: users[0].id,
      vehicle_id: vehicles[0].id,
      agency_id: vehicles[0].user_id,
      lead_type: 'view_details'
    }
    
    console.log('🧪 Testando inserção simples...')
    
    // Primeira inserção (deve funcionar)
    const { data: firstInsert, error: firstError } = await supabase
      .from('vehicle_leads')
      .insert(testData)
      .select()
    
    if (firstError) {
      if (firstError.code === '23505') {
        console.log('✅ Constraint UNIQUE já existe e está funcionando')
        
        // Tentar buscar o registro existente
        const { data: existing } = await supabase
          .from('vehicle_leads')
          .select('*')
          .eq('user_id', testData.user_id)
          .eq('vehicle_id', testData.vehicle_id)
          .single()
        
        if (existing) {
          console.log('✅ Registro existente encontrado:', existing.id)
          return true
        }
      } else {
        console.error('❌ Erro na inserção:', firstError)
        return false
      }
    } else {
      console.log('✅ Primeira inserção bem-sucedida:', firstInsert[0]?.id)
      
      // Segunda inserção (deve falhar com constraint violation)
      console.log('🧪 Testando inserção duplicada...')
      const { data: secondInsert, error: secondError } = await supabase
        .from('vehicle_leads')
        .insert(testData)
        .select()
      
      if (secondError && secondError.code === '23505') {
        console.log('✅ Constraint UNIQUE está funcionando (duplicata rejeitada)')
      } else if (secondError) {
        console.error('❌ Erro inesperado na segunda inserção:', secondError)
      } else {
        console.warn('⚠️ Segunda inserção não deveria ter funcionado!')
      }
      
      // Limpar dados de teste
      await supabase
        .from('vehicle_leads')
        .delete()
        .eq('user_id', testData.user_id)
        .eq('vehicle_id', testData.vehicle_id)
      
      console.log('🧹 Dados de teste removidos')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    return false
  }
}

async function showSQLInstructions() {
  console.log('\n📋 Execute este SQL manualmente no Supabase Dashboard > SQL Editor:')
  console.log('=' .repeat(80))
  console.log(`
-- 1. Remover registros duplicados (se existirem)
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, vehicle_id
           ORDER BY created_at DESC
         ) as rn
  FROM vehicle_leads
)
DELETE FROM vehicle_leads
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 2. Adicionar constraint UNIQUE
ALTER TABLE vehicle_leads
DROP CONSTRAINT IF EXISTS vehicle_leads_user_vehicle_unique;

ALTER TABLE vehicle_leads
ADD CONSTRAINT vehicle_leads_user_vehicle_unique
UNIQUE (user_id, vehicle_id);

-- 3. Verificar se a constraint foi criada
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'vehicle_leads'
  AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.constraint_name, kcu.ordinal_position;
`)
  console.log('=' .repeat(80))
}

async function main() {
  console.log('🚀 Iniciando verificação da constraint vehicle_leads...')
  
  const success = await fixVehicleLeadsConstraint()
  
  if (success) {
    console.log('\n✨ Verificação concluída!')
  } else {
    console.log('\n❌ Problemas detectados.')
    await showSQLInstructions()
  }
}

main().catch(console.error)