import { createClient } from "./client"
import { createClient as createServerClient } from "./server"

export interface UserProfile {
  id: string
  nome_completo: string
  email?: string
  whatsapp?: string
  tipo_usuario?: string
  documento?: string
  cep?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  perfil_configurado?: boolean
  created_at: string
  updated_at: string
  cpf?: string
  cnpj?: string
  foto_perfil?: string
  plano_atual?: string
  plano_data_fim?: string
  plano_data_inicio?: string
  plano_payment_id?: string
  // asaas_customer_id removido - sistema de pagamentos desabilitado
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()

  console.log('🔍 [PROFILES] Buscando perfil para usuário:', userId)
  
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      // Se o erro for "não encontrado", não é realmente um erro
      if (error.code === 'PGRST116') {
        console.log('ℹ️ [PROFILES] Perfil não encontrado para usuário:', userId)
        return null
      }

      console.error("❌ [PROFILES] Erro ao buscar perfil:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: userId
      })
      return null
    }

    console.log('✅ [PROFILES] Perfil encontrado:', data ? 'Sim' : 'Não')
    return data
  } catch (error) {
    console.error("❌ [PROFILES] Erro inesperado ao buscar perfil:", error)
    return null
  }
}

export async function createUserProfile(
  userId: string,
  profileData: Partial<UserProfile>,
): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar perfil:", error)
    return null
  }

  return data
}

export async function updateUserProfile(
  userId: string,
  profileData: Partial<UserProfile>,
): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar perfil:", error)
    return null
  }

  return data
}

export async function checkCpfExists(cpf: string, excludeUserId?: string): Promise<boolean> {
  const supabase = createClient()

  // Remove formatação do CPF
  const cleanCpf = cpf.replace(/\D/g, "")

  if (!cleanCpf) return false

  let query = supabase.from("profiles").select("id").eq("cpf", cleanCpf)

  // Se estiver editando um perfil existente, excluir o próprio usuário da verificação
  if (excludeUserId) {
    query = query.neq("id", excludeUserId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao verificar CPF:", error)
    return false
  }

  return data && data.length > 0
}

export async function checkCnpjExists(cnpj: string, excludeUserId?: string): Promise<boolean> {
  const supabase = createClient()

  // Remove formatação do CNPJ
  const cleanCnpj = cnpj.replace(/\D/g, "")

  if (!cleanCnpj) return false

  let query = supabase.from("profiles").select("id").eq("cnpj", cleanCnpj)

  // Se estiver editando um perfil existente, excluir o próprio usuário da verificação
  if (excludeUserId) {
    query = query.neq("id", excludeUserId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Erro ao verificar CNPJ:", error)
    return false
  }

  return data && data.length > 0
}

// Função de fallback para casos extremos
export async function saveUserProfileFallback(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> {
  const supabase = createClient()

  console.log("🆘 [FALLBACK] === SALVAMENTO DE EMERGÊNCIA ===")
  console.log("🆘 [FALLBACK] UserId:", userId)
  console.log("🆘 [FALLBACK] Dados:", profileData)

  try {
    // Dados mínimos e limpos
    const minimalData = {
      id: userId,
      nome_completo: profileData.nome_completo || "Usuário",
      email: profileData.email || "",
      tipo_usuario: profileData.tipo_usuario || "comprador",
      updated_at: new Date().toISOString(),
    }

    // Tentar apenas um UPDATE simples primeiro
    const { data: updateData, error: updateError } = await supabase
      .from("profiles")
      .update(minimalData)
      .eq("id", userId)
      .select()

    if (!updateError && updateData && updateData.length > 0) {
      console.log("✅ [FALLBACK] UPDATE simples funcionou!")
      return updateData[0]
    }

    console.log("⚠️ [FALLBACK] UPDATE falhou, tentando INSERT...")

    // Se UPDATE falhou, tentar INSERT
    const { data: insertData, error: insertError } = await supabase
      .from("profiles")
      .insert({
        ...minimalData,
        created_at: new Date().toISOString(),
        perfil_configurado: false
      })
      .select()

    if (!insertError && insertData && insertData.length > 0) {
      console.log("✅ [FALLBACK] INSERT funcionou!")
      return insertData[0]
    }

    console.error("❌ [FALLBACK] Ambos falharam:", { updateError, insertError })
    return null

  } catch (error) {
    console.error("❌ [FALLBACK] Erro inesperado:", error)
    return null
  }
}

export async function upsertUserProfile(
  userId: string,
  profileData: Partial<UserProfile>,
): Promise<UserProfile | null> {
  const supabase = createClient()

  console.log("🔄 [PROFILES] Iniciando upsert do perfil:", {
    userId,
    ...profileData
  })

  try {
    // Primeiro, verificar se o perfil existe
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    // Preparar dados para inserção/atualização
    const updatedData = {
      ...profileData,
      updated_at: new Date().toISOString(),
    }

    if (!existingProfile) {
      console.log("➕ [PROFILES] Perfil não existe, criando novo...")
      // Se não existe, criar novo perfil
      const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          ...updatedData,
          created_at: new Date().toISOString(),
          perfil_configurado: true
        })
        .select()
        .single()

      if (insertError) {
        console.error("❌ [PROFILES] Erro ao criar perfil:", insertError)
        return null
      }

      console.log("✅ [PROFILES] Perfil criado com sucesso!")
      return insertedProfile
    }

    // Se existe, atualizar
    console.log("🔄 [PROFILES] Perfil existe, atualizando...")
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updatedData)
      .eq("id", userId)
      .select()
      .single()

    if (updateError) {
      console.error("❌ [PROFILES] Erro ao atualizar perfil:", updateError)
      return null
    }

    console.log("✅ [PROFILES] Perfil atualizado com sucesso!")
    return updatedProfile

  } catch (error) {
    console.error("❌ [PROFILES] Erro inesperado no upsert:", error)
    
    // Tentar fallback em caso de erro
    console.log("🔄 [PROFILES] Tentando fallback...")
    return saveUserProfileFallback(userId, profileData)
  }
}

// Funções Asaas removidas - sistema de pagamentos desabilitado
// saveAsaasCustomerId e getAsaasCustomerId foram removidas
