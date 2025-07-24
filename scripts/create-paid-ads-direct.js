const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Configuração direta do PostgreSQL
const client = new Client({
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ecdmpndeunbzhaihabvi',
  password: 'T0nFRFXDZRaETRLV',
  ssl: {
    rejectUnauthorized: false
  }
})

async function createPaidAdsTable() {
  console.log('🚀 Conectando ao PostgreSQL...')
  
  try {
    await client.connect()
    console.log('✅ Conectado ao PostgreSQL!')

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '..', 'supabase-paid-ads-table.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    console.log('📝 Executando SQL para criar tabela paid_ads...')
    
    // Executar o SQL completo
    await client.query(sqlContent)
    
    console.log('✅ Tabela paid_ads criada com sucesso!')
    
    // Verificar se os dados foram inseridos
    const { rows } = await client.query('SELECT COUNT(*) as count FROM paid_ads')
    console.log(`📊 Total de anúncios inseridos: ${rows[0].count}`)
    
    // Mostrar os anúncios criados
    const { rows: ads } = await client.query('SELECT company_name, title, is_featured FROM paid_ads ORDER BY position_order')
    console.log('🎯 Anúncios criados:')
    ads.forEach((ad, index) => {
      const featured = ad.is_featured ? '⭐ DESTAQUE' : ''
      console.log(`   ${index + 1}. ${ad.company_name} - ${ad.title} ${featured}`)
    })
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error)
    
    if (error.code === '42P07') {
      console.log('ℹ️  Tabela já existe. Verificando dados...')
      
      try {
        const { rows } = await client.query('SELECT COUNT(*) as count FROM paid_ads')
        console.log(`📊 Total de anúncios existentes: ${rows[0].count}`)
        
        if (rows[0].count === '0') {
          console.log('📝 Inserindo dados de exemplo...')
          
          const insertSQL = `
            INSERT INTO paid_ads (
              title, description, image_url, company_name, location, rating, review_count, 
              vehicle_count, satisfaction_rate, response_time, primary_color, secondary_color, 
              contact_url, inventory_url, is_featured, position_order
            ) VALUES 
            (
              'Premium Motors',
              'Agência especializada em carros de luxo e elétricos',
              'https://s2-autoesporte.glbimg.com/AF9s1Xm_Y85ejgJ3l6Ssz_vQlxY=/0x0:1920x1280/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_cf9d035bf26b4646b105bd958f32089d/internal_photos/bs/2023/i/u/Y6RhJBSZu5wBqzisBngw/link-1-.jpg',
              'Premium Motors',
              'São Paulo, SP',
              4.9, 89, 150, 98, '24h', '#f97316', '#ea580c', '#contato', '#estoque', true, 1
            ),
            (
              'AutoMax',
              'Especialista em picapes e utilitários',
              'https://cdn.autopapo.com.br/box/uploads/2020/02/17174829/nova-ram-2500-2020-dianteira-732x488.jpeg',
              'AutoMax',
              'Rio de Janeiro, RJ',
              4.5, 67, 85, 95, '12h', '#3b82f6', '#1d4ed8', '#contato', '#estoque', false, 2
            ),
            (
              'EliteAutos',
              'Carros premium e importados',
              'https://i.bstr.es/drivingeco/2020/07/toyota-corolla-sedan-GR-7.jpg',
              'Elite Autos',
              'Belo Horizonte, MG',
              4.7, 124, 200, 97, '6h', '#10b981', '#059669', '#contato', '#estoque', false, 3
            );
          `
          
          await client.query(insertSQL)
          console.log('✅ Dados de exemplo inseridos!')
        }
        
      } catch (dataError) {
        console.error('❌ Erro ao verificar/inserir dados:', dataError)
      }
    }
    
  } finally {
    await client.end()
    console.log('🔌 Conexão PostgreSQL encerrada')
  }
}

// Executar script
createPaidAdsTable()
  .then(() => {
    console.log('\n🎉 Sistema de Anúncios Pagos configurado com sucesso!')
    console.log('✅ Acesse http://localhost:3000 para ver os anúncios funcionando')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro no script:', error)
    process.exit(1)
  }) 