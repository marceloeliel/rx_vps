const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugVehicleSales() {
  console.log('🔍 Diagnosticando tabela vehicle_sales...')
  
  try {
    // 1. Verificar se a tabela existe
    console.log('\n1. Testando acesso à tabela vehicle_sales:')
    const { data: testData, error: testError } = await supabase
      .from('vehicle_sales')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erro ao acessar vehicle_sales:', {
        message: testError.message,
        details: testError.details,
        hint: testError.hint,
        code: testError.code
      })
      return
    }
    
    console.log('✅ Tabela vehicle_sales acessível')
    console.log('📊 Dados de teste:', testData)
    
    // 2. Verificar estrutura da tabela
    console.log('\n2. Verificando estrutura da tabela:')
    const { data: structureData, error: structureError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'vehicle_sales' 
          ORDER BY ordinal_position;
        `
      })
    
    if (structureError) {
      console.log('⚠️ Não foi possível usar RPC para verificar estrutura:', structureError.message)
      
      // Tentar método alternativo - inserção de teste
      console.log('\n3. Testando inserção para descobrir campos obrigatórios:')
      const { data: insertData, error: insertError } = await supabase
        .from('vehicle_sales')
        .insert({})
        .select()
      
      if (insertError) {
        console.log('📝 Erro de inserção (esperado):', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        })
      } else {
        console.log('✅ Inserção vazia bem-sucedida:', insertData)
      }
    } else {
      console.log('✅ Estrutura da tabela:')
      console.table(structureData)
    }
    
    // 3. Testar com dados mínimos
    console.log('\n4. Testando inserção com dados mínimos:')
    const testSale = {
      vehicle_id: 'test-vehicle-id',
      agency_id: 'test-agency-id',
      seller_id: 'test-seller-id',
      vehicle_title: 'Teste Veículo',
      vehicle_brand: 'Teste',
      vehicle_model: 'Modelo',
      vehicle_year: 2023,
      sale_price: 50000,
      commission_rate: 5,
      commission_amount: 2500,
      buyer_name: 'Comprador Teste',
      status: 'pendente'
    }
    
    const { data: insertTestData, error: insertTestError } = await supabase
      .from('vehicle_sales')
      .insert(testSale)
      .select()
    
    if (insertTestError) {
      console.log('❌ Erro na inserção de teste:', {
        message: insertTestError.message,
        details: insertTestError.details,
        hint: insertTestError.hint,
        code: insertTestError.code
      })
    } else {
      console.log('✅ Inserção de teste bem-sucedida:', insertTestData)
      
      // Limpar dados de teste
      if (insertTestData && insertTestData[0]) {
        await supabase
          .from('vehicle_sales')
          .delete()
          .eq('id', insertTestData[0].id)
        console.log('🧹 Dados de teste removidos')
      }
    }
    
    // 4. Verificar se há dados reais
    console.log('\n5. Verificando dados existentes:')
    const { data: existingData, error: existingError } = await supabase
      .from('vehicle_sales')
      .select('*')
      .limit(5)
    
    if (existingError) {
      console.error('❌ Erro ao buscar dados existentes:', existingError)
    } else {
      console.log(`📊 Encontrados ${existingData?.length || 0} registros na tabela`)
      if (existingData && existingData.length > 0) {
        console.log('📋 Primeiros registros:')
        console.table(existingData)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

debugVehicleSales()
  .then(() => {
    console.log('\n✅ Diagnóstico concluído')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Erro no diagnóstico:', error)
    process.exit(1)
  })