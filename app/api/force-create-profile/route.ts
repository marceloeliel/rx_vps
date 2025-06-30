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

    // 2. Criar customer no Asaas
    console.log("🌐 [FORCE-CREATE] Criando customer no Asaas...")
    
    const asaasResponse = await fetch(`${process.env.ASAAS_API_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": process.env.ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        mobilePhone: phone,
        cpfCnpj: "11144477735", // CPF válido para teste
      }),
    })

    if (!asaasResponse.ok) {
      const errorData = await asaasResponse.json()
      console.error("❌ [FORCE-CREATE] Erro no Asaas:", errorData)
      return NextResponse.json({ 
        error: `Erro no Asaas: ${errorData.errors?.[0]?.description || "Erro desconhecido"}` 
      }, { status: 500 })
    }

    const asaasData = await asaasResponse.json()
    console.log("✅ [FORCE-CREATE] Customer criado no Asaas:", asaasData.id)

    // 3. Atualizar perfil com customer_id
    console.log("💾 [FORCE-CREATE] Atualizando perfil com customer_id...")
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        asaas_customer_id: asaasData.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("*")

    if (updateError) {
      console.error("❌ [FORCE-CREATE] Erro ao atualizar customer_id:", updateError)
      return NextResponse.json({ 
        error: `Erro ao atualizar customer_id: ${updateError.message}` 
      }, { status: 500 })
    }

    console.log("✅ [FORCE-CREATE] Perfil atualizado com customer_id:", updatedProfile)

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