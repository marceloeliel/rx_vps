const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' });

// Usar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente necessárias não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkVehicleSalesStructure() {
  try {
    console.log('🔍 Verificando estrutura real da tabela vehicle_sales...')
    
    // 1. Tentar acessar a tabela
    console.log('\n1️⃣ Testando acesso básico...')
    const { data: basicData, error: basicError } = await supabase
      .from('vehicle_sales')
      .select('*')
      .limit(1)
    
    if (basicError) {
      console.error('❌ Erro no acesso básico:', basicError.message)
      return
    }
    
    console.log('✅ Acesso básico funcionando')
    console.log('📊 Registros encontrados:', basicData.length)
    
    if (basicData.length > 0) {
      console.log('📝 Estrutura baseada em dados existentes:')
      const sample = basicData[0]
      Object.keys(sample).forEach(key => {
        console.log(`   - ${key}: ${typeof sample[key]} (${sample[key] !== null ? 'com valor' : 'null'})`)
      })
    } else {
      console.log('📝 Tabela vazia, tentando descobrir estrutura...')
    }
    
    // 2. Tentar diferentes campos para descobrir a estrutura
    console.log('\n2️⃣ Testando campos comuns...')
    
    const commonFields = [
      'id', 'created_at', 'updated_at',
      'vehicle_id', 'user_id', 'profile_id',
      'title', 'vehicle_title', 'name',
      'price', 'sale_price', 'amount',
      'status', 'state', 'condition',
      'notes', 'description', 'comments',
      'buyer_name', 'customer_name', 'client_name',
      'seller_id', 'agency_id', 'dealer_id'
    ]
    
    const existingFields = []
    
    for (const field of commonFields) {
      try {
        const { data, error } = await supabase
          .from('vehicle_sales')
          .select(field)
          .limit(1)
        
        if (!error) {
          existingFields.push(field)
          console.log(`   ✅ ${field}: existe`)
        }
      } catch (err) {
        // Campo não existe
      }
    }
    
    console.log('\n📋 Campos confirmados na tabela:')
    existingFields.forEach(field => {
      console.log(`   - ${field}`)
    })
    
    // 3. Tentar inserção mínima para descobrir campos obrigatórios
    console.log('\n3️⃣ Testando inserção mínima...')
    
    // Começar com apenas ID (se existir)
    if (existingFields.includes('id')) {
      try {
        const { data: insertData, error: insertError } = await supabase
          .from('vehicle_sales')
          .insert([{}])
          .select()
        
        if (insertError) {
          console.log('⚠️ Inserção vazia falhou:', insertError.message)
          
          // Analisar a mensagem de erro para descobrir campos obrigatórios
          if (insertError.message.includes('null value')) {
            console.log('📝 Campos obrigatórios identificados na mensagem de erro')
          }
        } else {
          console.log('✅ Inserção vazia bem-sucedida!')
          console.log('📝 Registro criado:', insertData[0])
          
          // Limpar
          await supabase
            .from('vehicle_sales')
            .delete()
            .eq('id', insertData[0].id)
          console.log('🧹 Registro de teste removido')
        }
      } catch (insertErr) {
        console.log('❌ Erro na inserção:', insertErr.message)
      }
    }
    
    // 4. Verificar se é uma view ou tabela real
    console.log('\n4️⃣ Verificando tipo de objeto...')
    
    // Tentar operações que só funcionam em tabelas
    const { error: updateError } = await supabase
      .from('vehicle_sales')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', '00000000-0000-0000-0000-000000000000')
    
    if (updateError) {
      if (updateError.message.includes('view')) {
        console.log('📊 vehicle_sales parece ser uma VIEW, não uma tabela')
      } else {
        console.log('📋 vehicle_sales é uma tabela (erro esperado para ID inexistente)')
      }
    } else {
      console.log('✅ vehicle_sales é uma tabela editável')
    }
    
    // 5. Tentar descobrir relacionamentos
    console.log('\n5️⃣ Verificando relacionamentos...')
    
    const relationshipFields = existingFields.filter(field => 
      field.includes('_id') || field === 'id'
    )
    
    console.log('📝 Possíveis campos de relacionamento:')
    relationshipFields.forEach(field => {
      console.log(`   - ${field}`)
    })
    
    console.log('\n🎉 Análise da estrutura concluída!')
    
  } catch (error) {
    console.error('❌ Erro durante análise:', error.message)
  }
}

checkVehicleSalesStructure()
  .then(() => {
    console.log('\n📋 CONCLUSÃO:')
    console.log('A tabela vehicle_sales existe mas pode ter uma estrutura diferente do esperado.')
    console.log('Use as informações acima para ajustar os scripts de teste e uso.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })