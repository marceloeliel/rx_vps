import { createClient } from './client'
import { 
  createLead, 
  updateLeadStatus, 
  addCustomerSatisfaction,
  calculatePerformanceMetrics,
  type LeadTracking 
} from './reports'

/**
 * Cria um novo lead a partir de um contato
 */
export async function createLeadFromContact(
  agencyId: string,
  contactData: {
    name: string
    email?: string
    phone?: string
    source: string
    vehicleId?: string
    notes?: string
  }
) {
  const leadData: Omit<LeadTracking, 'id' | 'created_at' | 'updated_at'> = {
    agency_id: agencyId,
    customer_name: contactData.name,
    customer_email: contactData.email,
    customer_phone: contactData.phone,
    source: contactData.source,
    status: 'novo',
    vehicle_interest_id: contactData.vehicleId,
    notes: contactData.notes
  }

  return createLead(leadData)
}

/**
 * Atualiza o status de um lead e registra conversão se for o caso
 */
export async function updateLeadStatusAndTrack(
  leadId: string,
  newStatus: LeadTracking['status'],
  saleId?: string
) {
  return updateLeadStatus(leadId, newStatus, saleId)
}

/**
 * Registra avaliação de satisfação após uma venda
 */
export async function recordSaleSatisfaction(
  agencyId: string,
  saleId: string,
  rating: number,
  feedback?: string
) {
  return addCustomerSatisfaction({
    agency_id: agencyId,
    sale_id: saleId,
    rating,
    feedback
  })
}

/**
 * Atualiza métricas de performance para o período atual
 */
export async function updatePerformanceMetrics(agencyId: string) {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return calculatePerformanceMetrics(
    agencyId,
    firstDayOfMonth.toISOString(),
    lastDayOfMonth.toISOString()
  )
}

/**
 * Atualiza contagem de leads por origem
 */
export async function updateLeadSourceCount(
  agencyId: string,
  sourceName: string
) {
  const supabase = createClient()
  
  try {
    // Verificar se a origem já existe
    const { data: existingSource } = await supabase
      .from('lead_sources')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('source_name', sourceName)
      .single()
    
    if (existingSource) {
      // Atualizar contagem
      await supabase
        .from('lead_sources')
        .update({ 
          lead_count: existingSource.lead_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSource.id)
    } else {
      // Criar nova origem
      await supabase
        .from('lead_sources')
        .insert([{
          agency_id: agencyId,
          source_name: sourceName,
          lead_count: 1
        }])
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar contagem de leads por origem:', error)
  }
}