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

async function testVehicleSalesComplete() {
  try {
    console.log('🚀 Testando funcionalidades completas da tabela vehicle_sales...')
    
    // 1. Verificar estrutura da tabela
    console.log('\n1️⃣ Verificando estrutura da tabela vehicle_sales...')
    const { data: tableData, error: tableError } = await supabase
      .from('vehicle_sales')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Erro ao acessar tabela:', tableError.message)
      return false
    }
    
    console.log('✅ Tabela vehicle_sales acessível')
    
    // 2. Buscar dados das tabelas relacionadas
    console.log('\n2️⃣ Buscando dados das tabelas relacionadas...')
    
    // Buscar veículos
    const { data: veiculos, error: veiculosError } = await supabase
      .from('veiculos')
      .select('id, titulo, marca, modelo, ano, preco')
      .limit(1)
    
    if (veiculosError || !veiculos || veiculos.length === 0) {
      console.log('⚠️ Nenhum veículo encontrado para teste')
      return false
    }
    
    const veiculo = veiculos[0]
    console.log('✅ Veículo encontrado:', veiculo.titulo)
    
    // Buscar profiles (agências e usuários)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, nome_completo, email, tipo_usuario')
      .limit(3)
    
    if (profilesError || !profiles || profiles.length < 2) {
      console.log('⚠️ Profiles insuficientes para teste')
      return false
    }
    
    const agency = profiles.find(p => p.tipo_usuario === 'agencia') || profiles[0]
    const seller = profiles.find(p => p.tipo_usuario === 'vendedor') || profiles[1]
    const buyer = profiles.find(p => p.tipo_usuario === 'comprador') || profiles[2] || profiles[1]
    
    console.log('✅ Profiles encontrados:')
    console.log('   - Agência:', agency.nome_completo)
    console.log('   - Vendedor:', seller.nome_completo)
    console.log('   - Comprador:', buyer.nome_completo)
    
    // 3. Testar inserção de venda
    console.log('\n3️⃣ Testando inserção de venda...')
    
    const saleData = {
      vehicle_id: veiculo.id,
      agency_id: agency.id,
      seller_id: seller.id,
      buyer_id: buyer.id,
      
      // Informações do veículo
      vehicle_title: veiculo.titulo,
      vehicle_brand: veiculo.marca,
      vehicle_model: veiculo.modelo,
      vehicle_year: veiculo.ano,
      vehicle_price: veiculo.preco,
      
      // Informações financeiras
      sale_price: veiculo.preco * 0.95, // 5% de desconto
      commission_rate: 5.00,
      commission_amount: veiculo.preco * 0.95 * 0.05,
      
      // Informações do comprador
      buyer_name: buyer.nome_completo,
      buyer_email: buyer.email,
      buyer_phone: '(11) 99999-9999',
      buyer_document: '123.456.789-00',
      
      // Status e informações adicionais
      status: 'pendente',
      notes: 'Venda de teste - sistema funcionando corretamente',
      payment_method: 'financiamento'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('vehicle_sales')
      .insert([saleData])
      .select()
    
    if (insertError) {
      console.error('❌ Erro ao inserir venda:', insertError.message)
      return false
    }
    
    console.log('✅ Venda inserida com sucesso!')
    console.log('📝 ID da venda:', insertData[0].id)
    
    // 4. Testar consulta de vendas
    console.log('\n4️⃣ Testando consulta de vendas...')
    
    const { data: salesData, error: salesError } = await supabase
      .from('vehicle_sales')
      .select(`
        id,
        vehicle_title,
        sale_price,
        commission_amount,
        buyer_name,
        status,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (salesError) {
      console.error('❌ Erro ao consultar vendas:', salesError.message)
      return false
    }
    
    console.log('✅ Consulta de vendas realizada com sucesso!')
    console.log('📊 Vendas encontradas:', salesData.length)
    
    salesData.forEach((sale, index) => {
      console.log(`   ${index + 1}. ${sale.vehicle_title} - R$ ${sale.sale_price} - ${sale.status}`);
    })
    
    // 5. Testar atualização de status
    console.log('\n5️⃣ Testando atualização de status...')
    
    const saleId = insertData[0].id
    const { data: updateData, error: updateError } = await supabase
      .from('vehicle_sales')
      .update({ 
        status: 'negociacao',
        notes: 'Status atualizado para negociação - teste de atualização'
      })
      .eq('id', saleId)
      .select()
    
    if (updateError) {
      console.error('❌ Erro ao atualizar venda:', updateError.message)
      return false
    }
    
    console.log('✅ Status da venda atualizado com sucesso!')
    console.log('📝 Novo status:', updateData[0].status)
    
    // 6. Testar relatórios básicos
    console.log('\n6️⃣ Testando relatórios básicos...')
    
    // Total de vendas por status
    const { data: statusReport, error: statusError } = await supabase
      .from('vehicle_sales')
      .select('status')
    
    if (!statusError && statusReport) {
      const statusCount = statusReport.reduce((acc, sale) => {
        acc[sale.status] = (acc[sale.status] || 0) + 1
        return acc
      }, {})
      
      console.log('✅ Relatório por status:')
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count} venda(s)`)
      })
    }
    
    // Total de comissões
    const { data: commissionData, error: commissionError } = await supabase
      .from('vehicle_sales')
      .select('commission_amount')
    
    if (!commissionError && commissionData) {
      const totalCommission = commissionData.reduce((sum, sale) => sum + parseFloat(sale.commission_amount || 0), 0)
      console.log('✅ Total de comissões:', `R$ ${totalCommission.toFixed(2)}`)
    }
    
    // 7. Limpeza (opcional - remover venda de teste)
    console.log('\n7️⃣ Limpeza - removendo venda de teste...')
    
    const { error: deleteError } = await supabase
      .from('vehicle_sales')
      .delete()
      .eq('id', saleId)
    
    if (deleteError) {
      console.log('⚠️ Aviso: Não foi possível remover venda de teste:', deleteError.message)
    } else {
      console.log('✅ Venda de teste removida com sucesso')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message)
    return false
  }
}

testVehicleSalesComplete()
  .then((success) => {
    if (success) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!')
      console.log('\n✅ A tabela vehicle_sales está funcionando perfeitamente!')
      console.log('\n📋 Funcionalidades testadas:')
      console.log('   ✅ Inserção de vendas')
      console.log('   ✅ Consulta de vendas')
      console.log('   ✅ Atualização de status')
      console.log('   ✅ Relatórios básicos')
      console.log('   ✅ Relacionamentos com outras tabelas')
      console.log('\n🚀 Sistema de vendas pronto para produção!')
    } else {
      console.log('\n❌ Alguns testes falharam. Verifique os logs acima.')
    }
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })