import { createClient } from './client'

const supabase = createClient()

export interface TrialPeriod {
  id: string
  user_id: string
  plan_type: 'basico' | 'premium' | 'premium_plus'
  start_date: string
  end_date: string
  converted_to_paid: boolean
  created_at: string
  updated_at: string
}

// Criar período de teste para novo usuário
export async function createTrialPeriod(
  userId: string,
  planType: 'basico' | 'premium' | 'premium_plus'
): Promise<TrialPeriod | null> {
  try {
    // Verificar se usuário já teve período de teste
    const { data: existingTrial } = await supabase
      .from('trial_periods')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingTrial) {
      console.log('Usuário já teve período de teste:', existingTrial)
      return null
    }

    // Calcular data de término (30 dias)
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000))

    // Criar novo período de teste
    const { data: trialPeriod, error } = await supabase
      .from('trial_periods')
      .insert({
        user_id: userId,
        plan_type: planType,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        converted_to_paid: false
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar período de teste:', error)
      return null
    }

    return trialPeriod
  } catch (error) {
    console.error('Erro ao criar período de teste:', error)
    return null
  }
}

// Verificar se usuário está em período de teste
export async function checkTrialPeriod(userId: string): Promise<{
  isInTrial: boolean
  trialPeriod: TrialPeriod | null
  daysRemaining: number | null
}> {
  try {
    const { data: trialPeriod } = await supabase
      .from('trial_periods')
      .select('*')
      .eq('user_id', userId)
      .eq('converted_to_paid', false)
      .single()

    if (!trialPeriod) {
      return {
        isInTrial: false,
        trialPeriod: null,
        daysRemaining: null
      }
    }

    const now = new Date()
    const endDate = new Date(trialPeriod.end_date)
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return {
      isInTrial: now < endDate && !trialPeriod.converted_to_paid,
      trialPeriod,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0
    }
  } catch (error) {
    console.error('Erro ao verificar período de teste:', error)
    return {
      isInTrial: false,
      trialPeriod: null,
      daysRemaining: null
    }
  }
}

// Marcar período de teste como convertido
export async function convertTrialToPaid(trialPeriodId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('trial_periods')
      .update({ converted_to_paid: true })
      .eq('id', trialPeriodId)

    if (error) {
      console.error('Erro ao converter período de teste:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao converter período de teste:', error)
    return false
  }
} 