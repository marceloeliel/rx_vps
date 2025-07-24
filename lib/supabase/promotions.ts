import { createClient } from './client'

export interface PromotionalCampaign {
  id: string
  name: string
  description: string | null
  is_active: boolean
  free_days: number
  start_date: string | null
  end_date: string | null
  applies_to_new_users: boolean
  requires_valid_document: boolean
  max_uses: number | null
  current_uses: number
  created_at: string
  updated_at: string
}

export interface PromotionalAccess {
  has_access: boolean
  is_promotional: boolean
  days_remaining: number
  end_date: string | null
  campaign_name: string | null
}

export interface ApplyPromotionResult {
  success: boolean
  message: string
  promotional_end_date: string | null
}

export interface CampaignStatistics {
  id: string
  name: string
  description: string | null
  is_active: boolean
  free_days: number
  start_date: string | null
  end_date: string | null
  current_uses: number
  max_uses: number | null
  total_users_enrolled: number
  active_promotional_users: number
  expired_promotional_users: number
  converted_to_paid: number
  created_at: string
  updated_at: string
}

/**
 * Busca campanha promocional ativa
 */
export async function getActiveCampaign(): Promise<PromotionalCampaign | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('promotional_campaigns')
      .select('*')
      .eq('is_active', true)
      .eq('applies_to_new_users', true)
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.log('ℹ️ Nenhuma campanha promocional ativa encontrada')
      return null
    }

    return data
  } catch (error) {
    console.error('❌ Erro ao buscar campanha ativa:', error)
    return null
  }
}

/**
 * Aplica promoção a um usuário
 */
export async function applyPromotionToUser(
  userId: string, 
  document: string
): Promise<ApplyPromotionResult> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.rpc(
      'apply_promotional_campaign',
      { 
        user_id: userId,
        document: document 
      }
    )

    if (error) {
      console.error('❌ Erro ao aplicar promoção:', error)
      return {
        success: false,
        message: 'Erro interno. Tente novamente.',
        promotional_end_date: null
      }
    }

    return data[0] || {
      success: false,
      message: 'Resposta inesperada do servidor',
      promotional_end_date: null
    }
  } catch (error) {
    console.error('❌ Erro ao aplicar promoção:', error)
    return {
      success: false,
      message: 'Erro de conexão. Tente novamente.',
      promotional_end_date: null
    }
  }
}

/**
 * Verifica acesso promocional do usuário
 */
export async function checkUserPromotionalAccess(userId: string): Promise<PromotionalAccess | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.rpc(
      'check_promotional_access',
      { user_id: userId }
    )

    if (error) {
      console.error('❌ Erro ao verificar acesso promocional:', error)
      return null
    }

    return data[0] || null
  } catch (error) {
    console.error('❌ Erro ao verificar acesso promocional:', error)
    return null
  }
}

/**
 * Valida documento (CPF ou CNPJ)
 */
export function validateDocument(document: string): { isValid: boolean; type: 'cpf' | 'cnpj' | null } {
  if (!document) {
    return { isValid: false, type: null }
  }

  // Remove caracteres não numéricos
  const cleanDoc = document.replace(/[^0-9]/g, '')

  // Verifica CPF (11 dígitos)
  if (cleanDoc.length === 11) {
    return { isValid: validateCPF(cleanDoc), type: 'cpf' }
  }

  // Verifica CNPJ (14 dígitos)
  if (cleanDoc.length === 14) {
    return { isValid: validateCNPJ(cleanDoc), type: 'cnpj' }
  }

  return { isValid: false, type: null }
}

/**
 * Valida CPF
 */
function validateCPF(cpf: string): boolean {
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let remainder = 11 - (sum % 11)
  let digit1 = remainder >= 10 ? 0 : remainder

  if (digit1 !== parseInt(cpf.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  remainder = 11 - (sum % 11)
  let digit2 = remainder >= 10 ? 0 : remainder

  return digit2 === parseInt(cpf.charAt(10))
}

/**
 * Valida CNPJ
 */
function validateCNPJ(cnpj: string): boolean {
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights1[i]
  }
  let remainder = sum % 11
  let digit1 = remainder < 2 ? 0 : 11 - remainder

  if (digit1 !== parseInt(cnpj.charAt(12))) return false

  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights2[i]
  }
  remainder = sum % 11
  let digit2 = remainder < 2 ? 0 : 11 - remainder

  return digit2 === parseInt(cnpj.charAt(13))
}

/**
 * Formata CPF ou CNPJ
 */
export function formatDocument(document: string): string {
  const cleanDoc = document.replace(/[^0-9]/g, '')

  if (cleanDoc.length === 11) {
    // CPF
    return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else if (cleanDoc.length === 14) {
    // CNPJ
    return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  return document
}

/**
 * Busca estatísticas de campanhas (admin only)
 */
export async function getCampaignStatistics(): Promise<CampaignStatistics[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('campaign_statistics')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar estatísticas:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error)
    return []
  }
}

/**
 * Ativa/desativa campanha promocional (admin only)
 */
export async function toggleCampaignStatus(
  campaignId: string, 
  isActive: boolean
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('promotional_campaigns')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    if (error) {
      console.error('❌ Erro ao atualizar campanha:', error)
      return {
        success: false,
        message: 'Erro ao atualizar campanha'
      }
    }

    return {
      success: true,
      message: `Campanha ${isActive ? 'ativada' : 'desativada'} com sucesso`
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar campanha:', error)
    return {
      success: false,
      message: 'Erro de conexão'
    }
  }
}

/**
 * Cria nova campanha promocional (admin only)
 */
export async function createPromotionalCampaign(
  campaign: Omit<PromotionalCampaign, 'id' | 'current_uses' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; message: string; campaign?: PromotionalCampaign }> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('promotional_campaigns')
      .insert([campaign])
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar campanha:', error)
      return {
        success: false,
        message: 'Erro ao criar campanha'
      }
    }

    return {
      success: true,
      message: 'Campanha criada com sucesso',
      campaign: data
    }
  } catch (error) {
    console.error('❌ Erro ao criar campanha:', error)
    return {
      success: false,
      message: 'Erro de conexão'
    }
  }
}

/**
 * Expira promoções vencidas (para cron job)
 */
export async function expirePromotionalUsers(): Promise<{ success: boolean; expiredCount: number }> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.rpc('expire_promotional_users')

    if (error) {
      console.error('❌ Erro ao expirar promoções:', error)
      return { success: false, expiredCount: 0 }
    }

    return { success: true, expiredCount: data || 0 }
  } catch (error) {
    console.error('❌ Erro ao expirar promoções:', error)
    return { success: false, expiredCount: 0 }
  }
} 