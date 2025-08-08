const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ecdmpndeunbzhaihabvi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzExMDcsImV4cCI6MjA2MTUwNzEwN30.R_9A1kphbMK37pBsEuzm--ujaXv52i80oKGP46VygLM'
);

async function updatePolicies() {
  try {
    console.log('🔧 Atualizando políticas de RLS...');
    
    // Remover políticas existentes que podem estar conflitando
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can insert their own leads" ON vehicle_leads;
        DROP POLICY IF EXISTS "Allow authenticated users to create leads" ON vehicle_leads;
        DROP POLICY IF EXISTS "Agencies can view all leads for their agency" ON vehicle_leads;
      `
    });
    
    // Criar novas políticas
    await supabase.rpc('exec_sql', {
      sql: `
        -- Política para permitir inserção de leads por qualquer usuário autenticado
        CREATE POLICY "Allow authenticated users to create leads" ON vehicle_leads
          FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
        
        -- Política para agências visualizarem leads de seus veículos
        CREATE POLICY "Agencies can view all leads for their agency" ON vehicle_leads
          FOR SELECT USING (auth.uid() = agency_id OR auth.uid() = user_id);
      `
    });
    
    console.log('✅ Políticas atualizadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar políticas:', error);
  }
}

updatePolicies();