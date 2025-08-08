require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function insertSimpleSales() {
  try {
    console.log('🚀 Inserindo vendas simples...')
    
    // Buscar uma agência existente
    const { data: agency } = await supabase
      .from('dados_agencia')
      .select('id')
      .limit(1)
      .single()
    
    if (!agency) {
      console.log('❌ Nenhuma agência encontrada')
      return
    }
    
    const agencyId = agency.id
    console.log('✅ Usando agência ID:', agencyId)
    
    // Buscar um veículo existente
    const { data: vehicle } = await supabase
      .from('veiculos')
      .select('id, titulo, marca, modelo, ano')
      .limit(1)
      .single()
    
    const vehicleId = vehicle?.id || '00000000-0000-0000-0000-000000000000'
    const vehicleTitle = vehicle?.titulo || 'Veículo Teste'
    
    // Dados de venda mínimos - apenas campos essenciais
    const saleData = {
      agency_id: agencyId,
      vehicle_title: vehicleTitle,
      vehicle_brand: 'Toyota',
      vehicle_model: 'Corolla',
      vehicle_year: 2022,
      sale_price: 85000,
      buyer_name: 'João Silva',
      status: 'concluida'
    }
    
    console.log('📝 Dados da venda:', saleData)
    
    const { data, error } = await supabase
      .from('vehicle_sales')
      .insert([saleData])
      .select()
    
    if (error) {
      console.log('❌ Erro ao inserir venda:', error)
    } else {
      console.log('✅ Venda inserida com sucesso:', data)
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message)
  }
}

insertSimpleSales()