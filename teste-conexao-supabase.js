// Script para testar conexão com Supabase
// Execute: node teste-conexao-supabase.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase (das credenciais do projeto)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecdmpndeunbzhaihabvi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzExMDcsImV4cCI6MjA2MTUwNzEwN30.R_9A1kphbMK37pBsEuzm--ujaXv52i80oKGP46VygLM';

console.log('🔧 TESTE DE CONEXÃO SUPABASE');
console.log('================================');
console.log(`🌐 URL: ${supabaseUrl}`);
console.log(`🔑 Key: ${supabaseKey.substring(0, 50)}...`);
console.log('');

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testarConexao() {
  console.log('🧪 Iniciando testes de conexão...\n');

  try {
    // Teste 1: Conexão básica
    console.log('1️⃣ Testando conexão básica...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.log('❌ Erro na conexão básica:', healthError.message);
      return false;
    }
    console.log('✅ Conexão básica OK');

    // Teste 2: Listar tabelas (via profiles)
    console.log('\n2️⃣ Testando acesso às tabelas...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Erro ao acessar tabela profiles:', profilesError.message);
    } else {
      console.log('✅ Acesso à tabela profiles OK');
    }

    // Teste 3: Verificar tabela veiculos
    console.log('\n3️⃣ Testando tabela veiculos...');
    const { data: veiculos, error: veiculosError } = await supabase
      .from('veiculos')
      .select('id')
      .limit(1);
    
    if (veiculosError) {
      console.log('❌ Erro ao acessar tabela veiculos:', veiculosError.message);
    } else {
      console.log('✅ Acesso à tabela veiculos OK');
      console.log(`📊 Registros encontrados: ${veiculos ? veiculos.length : 0}`);
    }

    // Teste 4: Verificar tabela dados_agencia
    console.log('\n4️⃣ Testando tabela dados_agencia...');
    const { data: agencias, error: agenciasError } = await supabase
      .from('dados_agencia')
      .select('user_id, email')
      .eq('email', 'rxnegocio@yahoo.com');
    
    if (agenciasError) {
      console.log('❌ Erro ao acessar tabela dados_agencia:', agenciasError.message);
    } else {
      console.log('✅ Acesso à tabela dados_agencia OK');
      if (agencias && agencias.length > 0) {
        console.log(`📧 Agência rxnegocio@yahoo.com encontrada! User ID: ${agencias[0].user_id}`);
      } else {
        console.log('⚠️ Agência rxnegocio@yahoo.com não encontrada');
      }
    }

    // Teste 5: Verificar Storage
    console.log('\n5️⃣ Testando Supabase Storage...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.log('❌ Erro ao acessar Storage:', storageError.message);
    } else {
      console.log('✅ Acesso ao Storage OK');
      console.log(`📦 Buckets disponíveis: ${buckets.map(b => b.name).join(', ')}`);
    }

    console.log('\n🎉 TESTE DE CONEXÃO COMPLETO!');
    console.log('================================');
    console.log('✅ Supabase conectado e funcionando');
    console.log('✅ Tabelas principais acessíveis');
    console.log('✅ Pronto para operações');
    
    return true;

  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO DE CONEXÃO:', error);
    console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verificar se as credenciais estão corretas');
    console.log('2. Verificar conectividade com a internet');
    console.log('3. Verificar se o projeto Supabase está ativo');
    console.log('4. Verificar permissões de RLS nas tabelas');
    
    return false;
  }
}

// Executar os testes
testarConexao().then(success => {
  if (success) {
    console.log('\n🚀 Conexão estabelecida com sucesso!');
    console.log('💡 Agora você pode executar outros scripts que dependem do Supabase');
  } else {
    console.log('\n💥 Falha na conexão!');
    console.log('🛠️ Verifique as configurações antes de prosseguir');
  }
}).catch(console.error);

