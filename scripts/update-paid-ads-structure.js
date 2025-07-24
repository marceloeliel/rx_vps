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

async function updatePaidAdsStructure() {
  console.log('🚀 Conectando ao PostgreSQL...')
  
  try {
    await client.connect()
    console.log('✅ Conectado ao PostgreSQL!')

    // Ler o arquivo SQL de atualização
    const sqlPath = path.join(__dirname, 'update-paid-ads-structure.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    console.log('📝 Executando atualização da estrutura da tabela paid_ads...')
    
    // Executar o SQL de atualização
    await client.query(sqlContent)
    
    console.log('✅ Estrutura da tabela paid_ads atualizada com sucesso!')
    
    // Verificar se a coluna foi adicionada
    const { rows } = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'paid_ads' AND column_name = 'agencia_id'
    `)
    
    if (rows.length > 0) {
      console.log('✅ Coluna agencia_id encontrada na tabela paid_ads')
      console.log('📊 Detalhes da coluna:', rows[0])
    } else {
      console.log('❌ Coluna agencia_id não foi encontrada')
    }
    
    // Verificar dados existentes
    const { rows: adsCount } = await client.query('SELECT COUNT(*) as count FROM paid_ads')
    console.log(`📊 Total de anúncios na tabela: ${adsCount[0].count}`)
    
    // Verificar quantos têm agencia_id
    const { rows: withAgencia } = await client.query(`
      SELECT COUNT(*) as count 
      FROM paid_ads 
      WHERE agencia_id IS NOT NULL
    `)
    console.log(`📊 Anúncios com agencia_id: ${withAgencia[0].count}`)
    
  } catch (error) {
    console.error('❌ Erro ao atualizar estrutura:', error)
    
    if (error.code === '42703') {
      console.log('ℹ️  Coluna agencia_id não existe. Tentando adicionar...')
      
      try {
        // Tentar adicionar apenas a coluna
        await client.query(`
          ALTER TABLE paid_ads 
          ADD COLUMN IF NOT EXISTS agencia_id TEXT;
        `)
        console.log('✅ Coluna agencia_id adicionada com sucesso!')
      } catch (addError) {
        console.error('❌ Erro ao adicionar coluna:', addError)
      }
    }
  } finally {
    await client.end()
    console.log('🔌 Conexão PostgreSQL encerrada')
  }
}

updatePaidAdsStructure().catch(console.error) 