const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' });

// Usar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são necessárias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkRealStructure() {
  try {
    console.log('🔍 Verificando estrutura real das tabelas...')
    
    // Verificar que tabelas existem
    console.log('\n📋 Tentando descobrir tabelas existentes...')
    
    const commonTables = ['veiculos', 'profiles', 'vehicle_sales', 'users', 'agencias']
    
    for (const tableName of commonTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (!error) {
          console.log(`✅ Tabela '${tableName}' existe`)
          if (data && data.length > 0) {
            console.log(`   📊 Colunas encontradas:`, Object.keys(data[0]).join(', '))
          } else {
            console.log(`   📊 Tabela vazia, mas existe`)
          }
        } else {
          console.log(`❌ Tabela '${tableName}' não existe ou erro:`, error.message)
        }
      } catch (err) {
        console.log(`❌ Erro ao verificar '${tableName}':`, err.message)
      }
    }
    
    // Verificar especificamente a tabela veiculos com diferentes nomes de colunas
    console.log('\n🚗 Verificando estrutura da tabela veiculos...')
    try {
      const { data: veiculosData, error: veiculosError } = await supabase
        .from('veiculos')
        .select('*')
        .limit(1)
      
      if (!veiculosError && veiculosData && veiculosData.length > 0) {
        console.log('✅ Estrutura da tabela veiculos:')
        console.log('   📊 Colunas:', Object.keys(veiculosData[0]).join(', '))
        console.log('   📝 Exemplo de registro:', veiculosData[0])
      } else if (!veiculosError) {
        console.log('✅ Tabela veiculos existe mas está vazia')
      }
    } catch (err) {
      console.log('❌ Erro ao verificar veiculos:', err.message)
    }
    
    // Verificar especificamente a tabela profiles
    console.log('\n👤 Verificando estrutura da tabela profiles...')
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (!profilesError && profilesData && profilesData.length > 0) {
        console.log('✅ Estrutura da tabela profiles:')
        console.log('   📊 Colunas:', Object.keys(profilesData[0]).join(', '))
        console.log('   📝 Exemplo de registro:', profilesData[0])
      } else if (!profilesError) {
        console.log('✅ Tabela profiles existe mas está vazia')
      }
    } catch (err) {
      console.log('❌ Erro ao verificar profiles:', err.message)
    }
    
    // Tentar outras variações de nomes
    console.log('\n🔄 Tentando variações de nomes de tabelas...')
    const variations = [
      'vehicle_sales',
      'vendas',
      'sales',
      'venda_veiculos',
      'vehicle_leads',
      'leads'
    ]
    
    for (const variation of variations) {
      try {
        const { data, error } = await supabase
          .from(variation)
          .select('*')
          .limit(1)
        
        if (!error) {
          console.log(`✅ Encontrada tabela '${variation}'`)
          if (data && data.length > 0) {
            console.log(`   📊 Colunas:`, Object.keys(data[0]).join(', '))
          }
        }
      } catch (err) {
        // Ignorar erros silenciosamente
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message)
  }
}

checkRealStructure()
  .then(() => {
    console.log('\n🎉 Verificação de estrutura concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })