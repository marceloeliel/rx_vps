import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { userId, name, email, phone } = await request.json()

    console.log("🚀 [FORCE-CREATE] Iniciando criação forçada do perfil")
    console.log("🚀 [FORCE-CREATE] UserId:", userId)

    // Usar server client com service role (contorna RLS)
    const supabase = createClient()

    // 1. Primeiro, criar/atualizar o perfil
    console.log("💾 [FORCE-CREATE] Inserindo perfil na tabela...")
    
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        nome_completo: name,
        email: email,
        whatsapp: phone,
        tipo_usuario: "cliente",
        perfil_configurado: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" })
      .select("*")

    if (profileError) {
      console.error("❌ [FORCE-CREATE] Erro ao criar perfil:", profileError)
      return NextResponse.json({ 
        error: `Erro ao criar perfil: ${profileError.message}` 
      }, { status: 500 })
    }

    console.log("✅ [FORCE-CREATE] Perfil criado:", profileData)

    // 2. Criação de customer no Asaas removida - sistema de pagamentos desabilitado
    console.log("⚠️ [FORCE-CREATE] Sistema Asaas desabilitado - pulando criação de customer")
    
    // Simular dados do Asaas para manter compatibilidade
    const asaasData = {
      id: `disabled_customer_${Date.now()}`,
      name,
      email
    }

    // 3. Atualização do customer_id removida - sistema Asaas desabilitado
    console.log("⚠️ [FORCE-CREATE] Sistema Asaas desabilitado - pulando atualização de customer_id")
    
    // Buscar perfil existente para retornar
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)

    if (updateError) {
      console.error("❌ [FORCE-CREATE] Erro ao buscar perfil:", updateError)
      return NextResponse.json({ 
        error: `Erro ao buscar perfil: ${updateError.message}` 
      }, { status: 500 })
    }

    console.log("✅ [FORCE-CREATE] Perfil encontrado:", updatedProfile)

    return NextResponse.json({
      success: true,
      profile: updatedProfile[0],
      asaasCustomer: asaasData,
      message: "Perfil criado com sucesso!"
    })

  } catch (error: any) {
    console.error("❌ [FORCE-CREATE] Erro inesperado:", error)
    return NextResponse.json({ 
      error: `Erro inesperado: ${error.message}` 
    }, { status: 500 })
  }
}