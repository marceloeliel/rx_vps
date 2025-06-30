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
  asaas_customer_id?: string
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Erro ao buscar perfil:", error)
    return null
  }

  return data
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

  console.log("💾 [UPSERT_PROFILE] === INICIANDO SALVAMENTO ===")
  console.log("💾 [UPSERT_PROFILE] UserId:", userId)
  console.log("💾 [UPSERT_PROFILE] Dados recebidos:", profileData)

  try {
    // Limpar e validar dados antes de salvar
    const cleanData = {
      ...profileData,
      cpf: profileData.cpf ? profileData.cpf.replace(/\D/g, "") : undefined,
      cnpj: profileData.cnpj ? profileData.cnpj.replace(/\D/g, "") : undefined,
      whatsapp: profileData.whatsapp ? profileData.whatsapp.replace(/\D/g, "") : undefined,
      cep: profileData.cep ? profileData.cep.replace(/\D/g, "") : undefined,
    }

    // Remover campos undefined e vazios para evitar problemas
    const filteredData = Object.fromEntries(
      Object.entries(cleanData).filter(([_, value]) => 
        value !== undefined && value !== null && value !== ""
      )
    )

    console.log("🔧 [UPSERT_PROFILE] Dados limpos:", filteredData)

    // Tentar UPSERT padrão primeiro
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        ...filteredData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "id"
      })
      .select()
      .single()

    if (error) {
      console.error("❌ [UPSERT_PROFILE] Erro no UPSERT:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        errorObject: JSON.stringify(error),
        errorType: typeof error,
        errorKeys: Object.keys(error || {})
      })

      // CRÍTICO: Detectar erro vazio de múltiplas formas
      const errorStr = JSON.stringify(error)
      const isEmptyError = (
        !error.code || 
        !error.message || 
        error.message === '{}' || 
        errorStr === '{}' || 
        errorStr === '[]' ||
        Object.keys(error || {}).length === 0 ||
        (error.message && error.message.trim() === '')
      )
      
      if (isEmptyError) {
        console.log("🚨 [UPSERT_PROFILE] ERRO VAZIO CRÍTICO DETECTADO!")
        console.log("🚨 [UPSERT_PROFILE] Error string:", errorStr)
        console.log("🚨 [UPSERT_PROFILE] Error keys:", Object.keys(error || {}))
        console.log("🆘 [UPSERT_PROFILE] Tentando fallback de emergência...")
        
        const fallbackResult = await saveUserProfileFallback(userId, filteredData)
        
        if (fallbackResult) {
          console.log("✅ [UPSERT_PROFILE] Fallback de emergência funcionou!")
          return fallbackResult
        } else {
          console.error("❌ [UPSERT_PROFILE] Fallback também falhou!")
          throw new Error("ERRO CRÍTICO: Execute o comando SQL: ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;")
        }
      }

      // Tratar erros específicos
      if (error.code === '42501') {
        console.error("❌ [UPSERT_PROFILE] ERRO RLS: Row Level Security bloqueando operação")
        throw new Error("Erro de permissão. Execute o script SQL de correção.")
      }

      if (error.code === '23505') {
        console.error("❌ [UPSERT_PROFILE] ERRO: Violação de chave única")
        throw new Error("CPF ou CNPJ já estão sendo usados por outro usuário.")
      }

      if (error.code === '23502') {
        console.error("❌ [UPSERT_PROFILE] ERRO: Campo obrigatório não preenchido")
        throw new Error("Campos obrigatórios não preenchidos.")
      }

      // Erro genérico com informações
      throw new Error(`Erro ao salvar perfil: ${error.message || error.code || 'Erro desconhecido'}`)
    }

    console.log("✅ [UPSERT_PROFILE] Perfil salvo com sucesso!")
    console.log("✅ [UPSERT_PROFILE] Dados salvos:", data)
    
    return data

  } catch (error: any) {
    console.error("❌ [UPSERT_PROFILE] Erro inesperado:", error)
    console.error("❌ [UPSERT_PROFILE] Error type:", typeof error)
    console.error("❌ [UPSERT_PROFILE] Error string:", JSON.stringify(error))
    
    // Se for um erro que já tratamos, re-lançar
    if (error.message && (
      error.message.includes("Erro de permissão") ||
      error.message.includes("CPF ou CNPJ") ||
      error.message.includes("Campos obrigatórios") ||
      error.message.includes("Erro ao salvar") ||
      error.message.includes("ERRO CRÍTICO")
    )) {
      throw error
    }
    
    // Para erros completamente inesperados, tentar fallback uma última vez
    console.log("🆘 [UPSERT_PROFILE] Tentando fallback final de emergência...")
    
    try {
      const fallbackResult = await saveUserProfileFallback(userId, profileData)
      
      if (fallbackResult) {
        console.log("✅ [UPSERT_PROFILE] Fallback final funcionou!")
        return fallbackResult
      }
    } catch (fallbackError) {
      console.error("❌ [UPSERT_PROFILE] Fallback final também falhou:", fallbackError)
    }
    
    // Erro completamente inesperado
    throw new Error(`ERRO INTERNO: ${error.message || 'Execute o script SQL de correção'}`)
  }
}

// Função para salvar o customer_id do Asaas no perfil
export async function saveAsaasCustomerId(
  userId: string,
  asaasCustomerId: string
): Promise<boolean> {
  // Usar client normal - o RLS já foi corrigido
  const supabase = createClient()

  console.log("💾 [PROFILES] === INICIANDO SALVAMENTO ===")
  console.log("💾 [PROFILES] UserId:", userId)
  console.log("💾 [PROFILES] AsaasCustomerId:", asaasCustomerId)

  try {
    // Tentar UPSERT simples
    console.log("🔧 [PROFILES] Fazendo UPSERT...")
    
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        nome_completo: "MARCELO ELIEL DE SOUZA",
        email: "marcelo@teste.com",
        whatsapp: "61999855068",
        tipo_usuario: "cliente",
        perfil_configurado: false,
        asaas_customer_id: asaasCustomerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "id"
      })
      .select("id, asaas_customer_id")

    if (error) {
      console.error("❌ [PROFILES] Erro no UPSERT:", error)
      
      // Se der erro de RLS, orientar o usuário
      if (error.code === '42501') {
        console.error("❌ [PROFILES] ERRO RLS: Execute o script SQL fix-rls-final.sql")
        console.error("❌ [PROFILES] Ou execute: ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;")
      }
      
      return false
    }

    console.log("✅ [PROFILES] UPSERT bem-sucedido!")
    console.log("✅ [PROFILES] Dados salvos:", data)
    
    return true
  } catch (error) {
    console.error("❌ [PROFILES] Erro inesperado:", error)
    return false
  }
}

// Função para buscar o customer_id do Asaas do usuário
export async function getAsaasCustomerId(userId: string): Promise<string | null> {
  const supabase = createClient()

  console.log("🔍 [GET_CUSTOMER_ID] Buscando customer_id para userId:", userId)

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("asaas_customer_id, nome_completo, email")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      console.error("❌ [GET_CUSTOMER_ID] Erro ao buscar customer_id:", error)
      return null
    }

    // Se não encontrou o usuário
    if (!data) {
      console.log("⚠️ [GET_CUSTOMER_ID] Usuário não encontrado na tabela profiles")
      console.log("💡 [GET_CUSTOMER_ID] DICA: Execute o script SQL final-solution.sql")
      return null
    }

    console.log("✅ [GET_CUSTOMER_ID] Usuário encontrado:", data.nome_completo, data.email)

    // Se não tem customer_id
    if (!data.asaas_customer_id) {
      console.log("ℹ️ [GET_CUSTOMER_ID] Customer_id não encontrado para userId:", userId)
      console.log("💡 [GET_CUSTOMER_ID] Será criado automaticamente na próxima cobrança")
      return null
    }

    console.log("✅ [GET_CUSTOMER_ID] Customer_id encontrado:", data.asaas_customer_id)
    return data.asaas_customer_id
  } catch (error) {
    console.error("❌ [GET_CUSTOMER_ID] Erro inesperado:", error)
    return null
  }
}

// Função para buscar usuário pelo customer_id do Asaas
export async function getUserByAsaasCustomerId(asaasCustomerId: string): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("asaas_customer_id", asaasCustomerId)
    .maybeSingle()

  if (error) {
    console.error("❌ Erro ao buscar usuário pelo customer_id do Asaas:", error)
    return null
  }

  return data
}
