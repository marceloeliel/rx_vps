const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertTestPerformanceData() {
  try {
    console.log('🚀 Inserindo dados de teste para métricas de performance...')
    
    // Buscar uma agência existente
    const { data: agencies, error: agenciesError } = await supabase
      .from('dados_agencia')
      .select('id')
      .limit(1)
    
    if (agenciesError || !agencies || agencies.length === 0) {
      console.error('❌ Nenhuma agência encontrada:', agenciesError)
      return
    }
    
    const agencyId = agencies[0].id
    console.log(`✅ Usando agência ID: ${agencyId}`)
    
    // Inserir dados de leads de teste
    const testLeads = [
      {
        agency_id: agencyId,
        customer_name: 'João Silva',
        customer_email: 'joao@email.com',
        customer_phone: '(11) 99999-1111',
        source: 'Site',
        status: 'convertido',
        notes: 'Interessado em SUV',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
        converted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 dias atrás
      },
      {
        agency_id: agencyId,
        customer_name: 'Maria Santos',
        customer_email: 'maria@email.com',
        customer_phone: '(11) 99999-2222',
        source: 'WhatsApp',
        status: 'convertido',
        notes: 'Interessada em sedan',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias atrás
        converted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias atrás
      },
      {
        agency_id: agencyId,
        customer_name: 'Pedro Costa',
        customer_email: 'pedro@email.com',
        customer_phone: '(11) 99999-3333',
        source: 'Indicação',
        status: 'negociacao',
        notes: 'Interessado em hatch',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias atrás
      },
      {
        agency_id: agencyId,
        customer_name: 'Ana Oliveira',
        customer_email: 'ana@email.com',
        customer_phone: '(11) 99999-4444',
        source: 'Redes Sociais',
        status: 'contatado',
        notes: 'Interessada em pickup',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 dia atrás
      },
      {
        agency_id: agencyId,
        customer_name: 'Carlos Ferreira',
        customer_email: 'carlos@email.com',
        customer_phone: '(11) 99999-5555',
        source: 'Site',
        status: 'perdido',
        notes: 'Desistiu da compra',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 dias atrás
      }
    ]
    
    const { data: leadsData, error: leadsError } = await supabase
      .from('lead_tracking')
      .insert(testLeads)
      .select()
    
    if (leadsError) {
      console.error('❌ Erro ao inserir leads:', leadsError)
    } else {
      console.log(`✅ ${testLeads.length} leads inseridos com sucesso`)
    }
    
    // Primeiro, vamos buscar um veículo existente para usar como referência
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('veiculos')
      .select('id, titulo, marca, modelo, ano')
      .limit(1)
    
    let vehicleId = null
    let vehicleTitle = 'Veículo de Teste'
    let vehicleBrand = 'Toyota'
    let vehicleModel = 'Corolla'
    let vehicleYear = 2022
    
    if (vehicles && vehicles.length > 0) {
      vehicleId = vehicles[0].id
      vehicleTitle = vehicles[0].titulo
      vehicleBrand = vehicles[0].marca
      vehicleModel = vehicles[0].modelo
      vehicleYear = vehicles[0].ano
      console.log(`✅ Usando veículo existente: ${vehicleTitle}`)
    } else {
      console.log('⚠️ Nenhum veículo encontrado, usando dados fictícios')
    }
    
    // Inserir dados de vendas de teste com campos corretos
    const testSales = [
      {
        vehicle_id: vehicleId,
        agency_id: agencyId,
        seller_id: agencyId,
        vehicle_title: vehicleTitle,
        vehicle_brand: 'Toyota',
        vehicle_model: 'Corolla',
        vehicle_year: 2022,
        sale_price: 85000,
        commission_rate: 5.00,
        commission_amount: 4250,
        buyer_name: 'João Silva',
        buyer_email: 'joao@email.com',
        buyer_phone: '(11) 99999-1111',
        buyer_document: '123.456.789-01',
        status: 'concluida',
        payment_method: 'financiado',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        vehicle_id: vehicleId,
        agency_id: agencyId,
        seller_id: agencyId,
        vehicle_title: vehicleTitle,
        vehicle_brand: 'Honda',
        vehicle_model: 'Civic',
        vehicle_year: 2021,
        sale_price: 92000,
        commission_rate: 5.00,
        commission_amount: 4600,
        buyer_name: 'Maria Santos',
        buyer_email: 'maria@email.com',
        buyer_phone: '(11) 99999-2222',
        buyer_document: '987.654.321-02',
        status: 'concluida',
        payment_method: 'à vista',
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        vehicle_id: vehicleId,
        agency_id: agencyId,
        seller_id: agencyId,
        vehicle_title: vehicleTitle,
        vehicle_brand: 'Volkswagen',
        vehicle_model: 'Jetta',
        vehicle_year: 2020,
        sale_price: 78000,
        commission_rate: 5.00,
        commission_amount: 3900,
        buyer_name: 'Roberto Lima',
        buyer_email: 'roberto@email.com',
        buyer_phone: '(11) 99999-6666',
        buyer_document: '456.789.123-03',
        status: 'concluida',
        payment_method: 'financiado',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    
    const { data: salesData, error: salesError } = await supabase
      .from('vehicle_sales')
      .insert(testSales)
      .select()
    
    if (salesError) {
      console.error('❌ Erro ao inserir vendas:', salesError)
    } else {
      console.log(`✅ ${testSales.length} vendas inseridas com sucesso`)
    }
    
    // Inserir dados de satisfação do cliente
    const testSatisfaction = [
      {
        agency_id: agencyId,
        rating: 5,
        feedback: 'Excelente atendimento, muito satisfeito!',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        agency_id: agencyId,
        rating: 4,
        feedback: 'Bom atendimento, processo rápido.',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        agency_id: agencyId,
        rating: 5,
        feedback: 'Recomendo! Profissionais competentes.',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        agency_id: agencyId,
        rating: 4,
        feedback: 'Muito bom, apenas algumas melhorias no processo.',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        agency_id: agencyId,
        rating: 5,
        feedback: 'Perfeito! Voltarei a fazer negócios.',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    
    const { data: satisfactionData, error: satisfactionError } = await supabase
      .from('customer_satisfaction')
      .insert(testSatisfaction)
      .select()
    
    if (satisfactionError) {
      console.error('❌ Erro ao inserir dados de satisfação:', satisfactionError)
    } else {
      console.log(`✅ ${testSatisfaction.length} avaliações de satisfação inseridas com sucesso`)
    }
    
    // Verificar se já existem fontes de leads para esta agência
    const { data: existingLeadSources } = await supabase
      .from('lead_sources')
      .select('source_name')
      .eq('agency_id', agencyId)
    
    if (!existingLeadSources || existingLeadSources.length === 0) {
      // Inserir dados de fontes de leads apenas se não existirem
      const testLeadSources = [
        {
          agency_id: agencyId,
          source_name: 'Site',
          lead_count: 45,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          agency_id: agencyId,
          source_name: 'WhatsApp',
          lead_count: 32,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          agency_id: agencyId,
          source_name: 'Indicação',
          lead_count: 28,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          agency_id: agencyId,
          source_name: 'Redes Sociais',
          lead_count: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      const { data: leadSourcesData, error: leadSourcesError } = await supabase
        .from('lead_sources')
        .insert(testLeadSources)
        .select()
      
      if (leadSourcesError) {
        console.error('❌ Erro ao inserir fontes de leads:', leadSourcesError)
      } else {
        console.log(`✅ ${testLeadSources.length} fontes de leads inseridas com sucesso`)
      }
    } else {
      console.log('ℹ️ Fontes de leads já existem para esta agência')
    }
    
    console.log('\n🎉 Dados de teste para métricas de performance inseridos com sucesso!')
    console.log('\n📊 Métricas esperadas:')
    console.log('- Taxa de Conversão: ~40% (2 convertidos de 5 leads)')
    console.log('- Tempo Médio de Venda: ~16.7 dias (média de 13, 22 e 15 dias)')
    console.log('- Satisfação do Cliente: 4.6/5 (média das avaliações)')
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

insertTestPerformanceData()