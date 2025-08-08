const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env' });

// Usar DATABASE_URL diretamente
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ Variável de ambiente DATABASE_URL é necessária')
  process.exit(1)
}

async function createVehicleSalesTable() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('🚀 Conectando ao PostgreSQL...')
    await client.connect()
    console.log('✅ Conectado com sucesso!')
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync(path.join(__dirname, 'create-vehicle-sales-table.sql'), 'utf8')
    
    console.log('📝 Executando script SQL...')
    
    // Executar o SQL completo
    const result = await client.query(sqlContent)
    
    console.log('✅ Tabela vehicle_sales criada com sucesso!')
    console.log('📊 Resultado:', result.command || 'Comando executado')
    
    // Verificar se a tabela foi criada
    const checkTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'vehicle_sales'
    `)
    
    if (checkTable.rows.length > 0) {
      console.log('🎉 Tabela vehicle_sales confirmada no banco de dados!')
    } else {
      console.log('⚠️ Tabela não encontrada após criação')
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message)
    console.error('📋 Detalhes:', error)
  } finally {
    await client.end()
    console.log('🔌 Conexão fechada')
  }
}

createVehicleSalesTable()
  .then(() => {
    console.log('🎉 Script concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })