const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ecdmpndeunbzhaihabvi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzExMDcsImV4cCI6MjA2MTUwNzEwN30.R_9A1kphbMK37pBsEuzm--ujaXv52i80oKGP46VygLM'
);

async function disableRLS() {
  try {
    console.log('🔧 Desabilitando RLS temporariamente...');
    
    // Desabilitar RLS na tabela vehicle_leads
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE vehicle_leads DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error) {
      console.error('❌ Erro ao desabilitar RLS:', error);
    } else {
      console.log('✅ RLS desabilitado com sucesso!');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

disableRLS();