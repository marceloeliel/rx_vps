const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ecdmpndeunbzhaihabvi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzExMDcsImV4cCI6MjA2MTUwNzEwN30.R_9A1kphbMK37pBsEuzm--ujaXv52i80oKGP46VygLM'
);

async function createTestData() {
  try {
    // Primeiro, vamos verificar se existem usuários e veículos
    const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
    const { data: vehicles } = await supabase.from('veiculos').select('id, profile_id').limit(1);
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ Nenhum perfil encontrado');
      return;
    }
    
    if (!vehicles || vehicles.length === 0) {
      console.log('❌ Nenhum veículo encontrado');
      return;
    }
    
    const userId = profiles[0].id;
    const vehicleId = vehicles[0].id;
    const agencyId = vehicles[0].profile_id;
    
    console.log('📊 Criando leads de teste...');
    console.log('User ID:', userId);
    console.log('Vehicle ID:', vehicleId);
    console.log('Agency ID:', agencyId);
    
    // Criar alguns leads de teste
    const testLeads = [
      {
        user_id: userId,
        vehicle_id: vehicleId,
        agency_id: agencyId,
        lead_type: 'favorite',
        contact_info: null
      },
      {
        user_id: userId,
        vehicle_id: vehicleId,
        agency_id: agencyId,
        lead_type: 'contact_whatsapp',
        contact_info: { message: 'Tenho interesse no veículo' }
      },
      {
        user_id: userId,
        vehicle_id: vehicleId,
        agency_id: agencyId,
        lead_type: 'view_details',
        contact_info: null
      }
    ];
    
    for (const lead of testLeads) {
      const { data, error } = await supabase
        .from('vehicle_leads')
        .insert(lead)
        .select();
        
      if (error) {
        console.error('❌ Erro ao criar lead:', error);
      } else {
        console.log('✅ Lead criado:', data[0].lead_type);
      }
    }
    
    // Verificar se os leads foram criados
    const { data: createdLeads, error: fetchError } = await supabase
      .from('vehicle_leads')
      .select('*')
      .eq('agency_id', agencyId);
      
    if (fetchError) {
      console.error('❌ Erro ao buscar leads:', fetchError);
    } else {
      console.log('✅ Total de leads criados:', createdLeads.length);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createTestData();