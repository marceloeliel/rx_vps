const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecdmpndeunbzhaihabvi.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkzMTEwNywiZXhwIjoyMDYxNTA3MTA3fQ.2CdNPp5I8RVsIqU1IJH3T_OHZDnveO7ZOZt4bn9QVn0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTablesManually() {
  try {
    console.log('🚀 Criando tabelas de relatórios manualmente...')
    
    // Criar tabela lead_sources
    console.log('📝 Criando tabela lead_sources...')
    const { error: leadSourcesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS lead_sources (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          source_name VARCHAR(100) NOT NULL,
          lead_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(agency_id, source_name)
        );
      `
    })
    
    if (leadSourcesError) {
      console.log('⚠️  Tentando criar lead_sources com SQL direto...')
      // Tentar inserir dados de exemplo diretamente
      const { error: insertError } = await supabase
        .from('lead_sources')
        .insert([])
        .select()
      
      if (insertError && !insertError.message.includes('relation "lead_sources" does not exist')) {
        console.log('✅ Tabela lead_sources já existe')
      }
    } else {
      console.log('✅ Tabela lead_sources criada')
    }
    
    // Criar dados de exemplo para lead_sources
    console.log('📊 Inserindo dados de exemplo...')
    
    // Primeiro, vamos tentar obter o ID de uma agência existente
    const { data: agencies } = await supabase
      .from('agencias')
      .select('id')
      .limit(1)
    
    if (agencies && agencies.length > 0) {
      const agencyId = agencies[0].id
      
      const sampleLeadSources = [
        { agency_id: agencyId, source_name: 'Site', lead_count: 45 },
        { agency_id: agencyId, source_name: 'WhatsApp', lead_count: 32 },
        { agency_id: agencyId, source_name: 'Indicação', lead_count: 28 },
        { agency_id: agencyId, source_name: 'Redes Sociais', lead_count: 15 },
        { agency_id: agencyId, source_name: 'Google Ads', lead_count: 25 },
        { agency_id: agencyId, source_name: 'Facebook', lead_count: 18 }
      ]
      
      // Tentar inserir dados de exemplo
      for (const source of sampleLeadSources) {
        try {
          const { error } = await supabase
            .from('lead_sources')
            .upsert(source, { onConflict: 'agency_id,source_name' })
          
          if (!error) {
            console.log(`✅ Dados inseridos para ${source.source_name}`)
          }
        } catch (err) {
          console.log(`⚠️  Erro ao inserir ${source.source_name}: ${err.message}`)
        }
      }
      
      // Inserir dados de satisfação de exemplo
      const sampleSatisfaction = {
        agency_id: agencyId,
        rating: 4.2,
        feedback: 'Ótimo atendimento e processo de venda'
      }
      
      try {
        const { error } = await supabase
          .from('customer_satisfaction')
          .insert([sampleSatisfaction])
        
        if (!error) {
          console.log('✅ Dados de satisfação inseridos')
        }
      } catch (err) {
        console.log(`⚠️  Erro ao inserir satisfação: ${err.message}`)
      }
    }
    
    console.log('🎉 Processo concluído!')
    
    // Verificar se conseguimos acessar os dados
    console.log('🔍 Testando acesso aos dados...')
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('lead_sources')
        .select('*')
        .limit(5)
      
      if (testError) {
        console.log(`❌ Erro ao acessar lead_sources: ${testError.message}`)
      } else {
        console.log(`✅ Encontrados ${testData?.length || 0} registros em lead_sources`)
        if (testData && testData.length > 0) {
          console.log('📊 Exemplo de dados:', testData[0])
        }
      }
    } catch (err) {
      console.log(`❌ Erro no teste: ${err.message}`)
    }
    
  } catch (error) {
    console.error('❌ Erro durante a criação:', error)
  }
}

// Executar criação
createTablesManually()
  .then(() => {
    console.log('✨ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Falha:', error)
    process.exit(1)
  })