const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Função para ler variáveis de ambiente do arquivo .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          process.env[key] = valueParts.join('=')
        }
      }
    }
  }
}

// Carregar variáveis de ambiente
loadEnvFile()

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas')
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão definidas no .env.local')
  console.error('supabaseUrl:', supabaseUrl ? 'Definido' : 'Undefined')
  console.error('supabaseKey:', supabaseKey ? 'Definido' : 'Undefined')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createPaidAdsTable() {
  console.log('🚀 Iniciando criação da tabela paid_ads...')
  
  try {
    // Inserir dados de exemplo diretamente (a tabela pode já existir)
    console.log('📝 Inserindo dados de exemplo...')
    
    const sampleData = [
      {
        title: 'Premium Motors',
        description: 'Agência especializada em carros de luxo e elétricos',
        image_url: 'https://s2-autoesporte.glbimg.com/AF9s1Xm_Y85ejgJ3l6Ssz_vQlxY=/0x0:1920x1280/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_cf9d035bf26b4646b105bd958f32089d/internal_photos/bs/2023/i/u/Y6RhJBSZu5wBqzisBngw/link-1-.jpg',
        company_name: 'Premium Motors',
        location: 'São Paulo, SP',
        rating: 4.9,
        review_count: 89,
        vehicle_count: 150,
        satisfaction_rate: 98,
        response_time: '24h',
        primary_color: '#f97316',
        secondary_color: '#ea580c',
        contact_url: '#contato',
        inventory_url: '#estoque',
        is_featured: true,
        position_order: 1
      },
      {
        title: 'AutoMax',
        description: 'Especialista em picapes e utilitários',
        image_url: 'https://cdn.autopapo.com.br/box/uploads/2020/02/17174829/nova-ram-2500-2020-dianteira-732x488.jpeg',
        company_name: 'AutoMax',
        location: 'Rio de Janeiro, RJ',
        rating: 4.5,
        review_count: 67,
        vehicle_count: 85,
        satisfaction_rate: 95,
        response_time: '12h',
        primary_color: '#3b82f6',
        secondary_color: '#1d4ed8',
        contact_url: '#contato',
        inventory_url: '#estoque',
        is_featured: false,
        position_order: 2
      },
      {
        title: 'EliteAutos',
        description: 'Carros premium e importados',
        image_url: 'https://i.bstr.es/drivingeco/2020/07/toyota-corolla-sedan-GR-7.jpg',
        company_name: 'Elite Autos',
        location: 'Belo Horizonte, MG',
        rating: 4.7,
        review_count: 124,
        vehicle_count: 200,
        satisfaction_rate: 97,
        response_time: '6h',
        primary_color: '#10b981',
        secondary_color: '#059669',
        contact_url: '#contato',
        inventory_url: '#estoque',
        is_featured: false,
        position_order: 3
      }
    ]

    // Primeiro, verificar se a tabela já existe e tem dados
    const { data: existingData, error: checkDataError } = await supabase
      .from('paid_ads')
      .select('id')
      .limit(1)

    if (checkDataError) {
      console.error('❌ Erro ao verificar tabela paid_ads:', checkDataError)
      console.log('ℹ️  A tabela paid_ads precisa ser criada manualmente no Supabase SQL Editor')
      console.log('ℹ️  Copie o conteúdo do arquivo supabase-paid-ads-table.sql')
      process.exit(1)
    } else if (existingData && existingData.length > 0) {
      console.log('✅ Tabela paid_ads já existe com dados')
    } else {
      // Inserir dados de exemplo
      const { data: insertData, error: insertError } = await supabase
        .from('paid_ads')
        .insert(sampleData)

      if (insertError) {
        console.error('❌ Erro ao inserir dados de exemplo:', insertError)
        console.log('ℹ️  Você pode inserir os dados manualmente no Supabase Dashboard')
        console.log('ℹ️  Ou execute o SQL completo do arquivo supabase-paid-ads-table.sql')
        process.exit(1)
      } else {
        console.log('✅ Dados de exemplo inseridos com sucesso')
      }
    }

    // Testar se podemos buscar dados
    console.log('🔍 Testando busca de anúncios ativos...')
    const { data: activeAds, error: fetchError } = await supabase
      .from('paid_ads')
      .select('*')
      .eq('is_active', true)
      .limit(3)

    if (fetchError) {
      console.error('❌ Erro ao buscar anúncios:', fetchError)
    } else {
      console.log(`✅ Encontrados ${activeAds.length} anúncios ativos`)
      activeAds.forEach((ad, index) => {
        console.log(`   ${index + 1}. ${ad.company_name} - ${ad.title}`)
      })
    }

    console.log('\n🎉 Configuração da tabela paid_ads concluída!')
    console.log('✅ Você pode agora usar o sistema de anúncios pagos dinâmico')
    console.log('📊 Acesse o Supabase Dashboard para gerenciar os anúncios')
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    console.log('\n📋 Instruções manuais:')
    console.log('1. Acesse o Supabase Dashboard')
    console.log('2. Vá para SQL Editor')
    console.log('3. Copie e execute o conteúdo do arquivo supabase-paid-ads-table.sql')
    process.exit(1)
  }
}

// Executar script
createPaidAdsTable()
  .then(() => {
    console.log('\n✅ Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro no script:', error)
    process.exit(1)
  }) 