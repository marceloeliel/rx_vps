import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    
    console.log("🔍 [PROFILES-API] Buscando perfil para userId:", userId)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      console.error("❌ [PROFILES-API] Erro:", error)
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 })
    }

    if (!data) {
      console.log("⚠️ [PROFILES-API] Perfil não encontrado")
      return NextResponse.json({ 
        error: "Perfil não encontrado" 
      }, { status: 404 })
    }

    console.log("✅ [PROFILES-API] Perfil encontrado:", data.nome_completo)
    
    return NextResponse.json({ 
      data,
      success: true 
    })

  } catch (error: any) {
    console.error("❌ [PROFILES-API] Erro inesperado:", error)
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
} 