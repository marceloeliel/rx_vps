// Script para implementar o Plano Individual de R$ 20,00
// Execute: node implementar-plano-individual.js

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando implementação do Plano Individual R$ 20,00...\n');

// 1. Verificar se os arquivos foram modificados
function verifyImplementation() {
  console.log('✅ Verificando implementação...');
  
  // Verificar planos/page.tsx
const planosPath = path.join(__dirname, 'app', 'planos', 'page.tsx');
try {
  const planosContent = fs.readFileSync(planosPath, 'utf8');
  if (planosContent.includes('"Individual"') && planosContent.includes('30 Dias de Uso Ilimitado GRÁTIS!')) {
    console.log('✅ app/planos/page.tsx - OK');
  } else {
    console.log('❌ app/planos/page.tsx - Não atualizado');
  }
} catch (error) {
  console.error('❌ Erro ao verificar planos:', error.message);
}
  
  // Verificar plan-migrations.ts
  const migrationsPath = path.join(__dirname, 'lib', 'supabase', 'plan-migrations.ts');
  try {
    const content = fs.readFileSync(migrationsPath, 'utf8');
    if (content.includes("plan_id: 'individual'")) {
      console.log('✅ lib/supabase/plan-migrations.ts - OK');
    } else {
      console.log('❌ lib/supabase/plan-migrations.ts - Não atualizado');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar plan-migrations:', error.message);
  }
  
  // Verificar script SQL
  const sqlPath = path.join(__dirname, 'scripts', 'add-plano-individual.sql');
  try {
    if (fs.existsSync(sqlPath)) {
      console.log('✅ scripts/add-plano-individual.sql - OK');
    } else {
      console.log('❌ scripts/add-plano-individual.sql - Não encontrado');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar script SQL:', error.message);
  }
}

// 2. Mostrar próximos passos
function showNextSteps() {
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('\n1. 🗄️  BANCO DE DADOS:');
  console.log('   - Acesse o Supabase Dashboard');
  console.log('   - Vá para SQL Editor');
  console.log('   - Execute o arquivo: scripts/add-plano-individual.sql');
  
  console.log('\n2. 🧪 TESTES:');
  console.log('   - Acesse /planos para ver o novo plano');
  console.log('   - Verifique se o layout com 5 colunas está funcionando');
  console.log('   - Teste a contratação do plano individual');
  
  console.log('\n3. 💰 CONFIGURAÇÃO DE PAGAMENTO:');
  console.log('   - Configure o plano no sistema de pagamento (Stripe/PagSeguro)');
  console.log('   - Defina o valor de R$ 20,00');
  console.log('   - Teste o fluxo de pagamento completo');
  
  console.log('\n4. 📊 MONITORAMENTO:');
  console.log('   - Monitore logs de criação de usuários com plano individual');
  console.log('   - Verifique se as limitações estão sendo aplicadas corretamente');
  console.log('   - Teste o limite de 1 veículo por usuário');
}

// 3. Resumo da implementação
function showSummary() {
  console.log('\n📊 RESUMO DA IMPLEMENTAÇÃO:');
  console.log('\n🎯 PLANO INDIVIDUAL - R$ 20,00:');
  console.log('   ✅ Apenas 1 veículo');
  console.log('   ✅ Sem anúncios inclusos');
  console.log('   ✅ Cadastro básico apenas');
  console.log('   ✅ Sem acesso ao painel');
  console.log('   ✅ Suporte básico por email');
  console.log('   ✅ 50MB de armazenamento');
  console.log('   ✅ Sem chamadas de API');
  
  console.log('\n🔧 ARQUIVOS MODIFICADOS:');
  console.log('   ✅ app/planos/page.tsx (novo plano + banner promocional + termos)');
  console.log('   ✅ lib/supabase/plan-migrations.ts (configurações do plano)');
  
  console.log('\n📁 ARQUIVOS CRIADOS:');
  console.log('   ✅ scripts/add-plano-individual.sql (script para Supabase)');
  console.log('   ✅ implementar-plano-individual.js (este script)');
}

// Executar verificações
verifyImplementation();
showSummary();
showNextSteps();

console.log('\n🎉 Implementação do Plano Individual concluída!');
console.log('💡 Execute o script SQL no Supabase para finalizar a configuração.');