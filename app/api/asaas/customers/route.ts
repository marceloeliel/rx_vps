import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAsaasApiUrl, getAsaasHeaders } from "@/lib/asaas/config"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const cpfCnpj = searchParams.get("cpfCnpj")
    const limit = searchParams.get("limit") || "10"
    const offset = searchParams.get("offset") || "0"

    console.log("🔍 [CUSTOMERS-GET] Parâmetros:", { userId, cpfCnpj, limit, offset })

    // Se userId for fornecido, buscar customer_id no Supabase primeiro
    if (userId) {
      const supabase = await createClient()
      const { data: profile } = await supabase
        .from("profiles")
        .select("asaas_customer_id")
        .eq("id", userId)
        .single()

      if (profile?.asaas_customer_id) {
        console.log("✅ [CUSTOMERS-GET] Customer_id encontrado no Supabase:", profile.asaas_customer_id)
        return NextResponse.json({ 
          customerId: profile.asaas_customer_id,
          source: "supabase"
        })
      } else {
        console.log("❌ [CUSTOMERS-GET] Customer_id não encontrado no Supabase")
        return NextResponse.json({ 
          error: "Customer não encontrado para este usuário",
          customerId: null 
        }, { status: 404 })
      }
    }

    // Se cpfCnpj for fornecido, buscar diretamente no Asaas
    if (cpfCnpj) {
      console.log("🔍 [CUSTOMERS-GET] Buscando customer por CPF/CNPJ no Asaas:", cpfCnpj)
      
      const url = `${getAsaasApiUrl()}/customers?cpfCnpj=${cpfCnpj}`
      const response = await fetch(url, {
        method: "GET",
        headers: getAsaasHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ [CUSTOMERS-GET] Erro do Asaas:", errorData)
        return NextResponse.json(
          { error: "Erro ao buscar customer no Asaas", details: errorData },
          { status: response.status }
        )
      }

      const data = await response.json()
      console.log("✅ [CUSTOMERS-GET] Resultado da busca por CPF:", data.totalCount || 0)
      return NextResponse.json(data)
    }

    // Se não for busca por userId, listar customers do Asaas
    const url = `${getAsaasApiUrl()}/customers?limit=${limit}&offset=${offset}`
    
    console.log("🌐 [CUSTOMERS-GET] Fazendo requisição para Asaas:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: getAsaasHeaders(),
    })

    console.log("📊 [CUSTOMERS-GET] Status da resposta:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("❌ [CUSTOMERS-GET] Erro do Asaas:", errorData)
      return NextResponse.json(
        { error: "Erro ao buscar customers no Asaas", details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ [CUSTOMERS-GET] Customers encontrados:", data.totalCount)

    return NextResponse.json(data)

  } catch (error: any) {
    console.error("❌ [CUSTOMERS-GET] Erro inesperado:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, name, email, cpfCnpj, phone, mobilePhone, ...otherData } = body

    console.log("🚀 [CUSTOMERS-POST] Criando customer:", { userId, name, email, cpfCnpj })

    // Validar e formatar números de telefone
    const formattedPhone = phone?.replace(/\D/g, "")
    const formattedMobilePhone = mobilePhone?.replace(/\D/g, "")

    // Validar formato do telefone (DDD + 8 ou 9 dígitos)
    const phoneRegex = /^[1-9][0-9](?:[2-8]|9[0-9])[0-9]{7}$/
    const isPhoneValid = !formattedPhone || phoneRegex.test(formattedPhone)
    const isMobilePhoneValid = !formattedMobilePhone || phoneRegex.test(formattedMobilePhone)

    if (!isPhoneValid || !isMobilePhoneValid) {
      console.error("❌ [CUSTOMERS-POST] Número de telefone inválido:", {
        phone: formattedPhone,
        mobilePhone: formattedMobilePhone
      })
      return NextResponse.json({
        error: "Número de telefone inválido",
        details: {
          message: "O número de telefone deve conter DDD + 8 ou 9 dígitos, sem caracteres especiais.",
          example: "Ex: 61912345678",
          phone: !isPhoneValid ? "inválido" : "válido",
          mobilePhone: !isMobilePhoneValid ? "inválido" : "válido"
        }
      }, { status: 400 })
    }

    // Se não tiver nenhum telefone, usar um número padrão para desenvolvimento
    const finalPhone = formattedPhone || "11999999999"
    const finalMobilePhone = formattedMobilePhone || "11999999999"

    // 1. Verificar se já existe customer para este usuário no Supabase
    if (userId) {
      const supabase = await createClient()
      const { data: profile } = await supabase
        .from("profiles")
        .select("asaas_customer_id")
        .eq("id", userId)
        .single()

      if (profile?.asaas_customer_id) {
        console.log("ℹ️ [CUSTOMERS-POST] Customer já existe:", profile.asaas_customer_id)
        
        // Atualizar dados do customer existente
        const updateResponse = await fetch(`${getAsaasApiUrl()}/customers/${profile.asaas_customer_id}`, {
          method: "POST",
          headers: getAsaasHeaders(),
          body: JSON.stringify({
            name,
            email,
            phone: finalPhone,
            mobilePhone: finalMobilePhone,
            ...otherData
          }),
        })

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json()
          console.error("❌ [CUSTOMERS-POST] Erro ao atualizar customer:", errorData)
          return NextResponse.json(
            { error: "Erro ao atualizar customer no Asaas", details: errorData },
            { status: updateResponse.status }
          )
        }

        const updatedCustomer = await updateResponse.json()
        console.log("✅ [CUSTOMERS-POST] Customer atualizado:", updatedCustomer)

        return NextResponse.json({ 
          ...updatedCustomer,
          message: "Customer atualizado com sucesso",
          existing: true
        })
      }
    }

    // 2. Verificar se customer já existe no Asaas por CPF/CNPJ
    if (cpfCnpj) {
      console.log("🔍 [CUSTOMERS-POST] Verificando customer existente por CPF/CNPJ...")
      
      const searchResponse = await fetch(`${getAsaasApiUrl()}/customers?cpfCnpj=${cpfCnpj}`, {
        method: "GET",
        headers: getAsaasHeaders(),
      })

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.data && searchData.data.length > 0) {
          const existingCustomer = searchData.data[0]
          console.log("✅ [CUSTOMERS-POST] Customer encontrado no Asaas:", existingCustomer.id)
          
          // Atualizar dados do customer existente
          const updateResponse = await fetch(`${getAsaasApiUrl()}/customers/${existingCustomer.id}`, {
            method: "POST",
            headers: getAsaasHeaders(),
            body: JSON.stringify({
              name,
              email,
              phone: finalPhone,
              mobilePhone: finalMobilePhone,
              ...otherData
            }),
          })

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json()
            console.error("❌ [CUSTOMERS-POST] Erro ao atualizar customer:", errorData)
            return NextResponse.json(
              { error: "Erro ao atualizar customer no Asaas", details: errorData },
              { status: updateResponse.status }
            )
          }

          const updatedCustomer = await updateResponse.json()
          console.log("✅ [CUSTOMERS-POST] Customer atualizado:", updatedCustomer)
          
          // Salvar customer_id no Supabase se userId for fornecido
          if (userId) {
            const supabase = await createClient()
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ 
                asaas_customer_id: existingCustomer.id,
                updated_at: new Date().toISOString()
              })
              .eq("id", userId)

            if (updateError) {
              console.error("❌ [CUSTOMERS-POST] Erro ao salvar customer_id:", updateError)
            } else {
              console.log("✅ [CUSTOMERS-POST] Customer_id salvo no Supabase")
            }
          }
          
          return NextResponse.json({ 
            ...updatedCustomer,
            message: "Customer encontrado, atualizado e vinculado",
            existing: true
          })
        }
      }
    }

    // 3. Criar novo customer no Asaas
    console.log("🌐 [CUSTOMERS-POST] Criando novo customer no Asaas...")
    
    const customerData = {
      name,
      email,
      cpfCnpj,
      phone: finalPhone,
      mobilePhone: finalMobilePhone,
      ...otherData
    }

    console.log("📝 [CUSTOMERS-POST] Dados do customer:", customerData)

    const response = await fetch(`${getAsaasApiUrl()}/customers`, {
      method: "POST",
      headers: getAsaasHeaders(),
      body: JSON.stringify(customerData),
    })

    console.log("📊 [CUSTOMERS-POST] Status da criação:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("❌ [CUSTOMERS-POST] Erro do Asaas:", errorData)
      return NextResponse.json(
        { error: "Erro ao criar customer no Asaas", details: errorData },
        { status: response.status }
      )
    }

    const newCustomer = await response.json()
    console.log("✅ [CUSTOMERS-POST] Customer criado no Asaas:", newCustomer.id)

    // 4. Salvar customer_id no Supabase se userId for fornecido
    if (userId && newCustomer.id) {
      console.log("💾 [CUSTOMERS-POST] Salvando customer_id no Supabase...")
      
      const supabase = await createClient()
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          asaas_customer_id: newCustomer.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)

      if (updateError) {
        console.error("❌ [CUSTOMERS-POST] Erro ao salvar customer_id:", updateError)
        // Não falhar a requisição, apenas logar o erro
        console.warn("⚠️ [CUSTOMERS-POST] Customer criado no Asaas mas não salvo no Supabase")
      } else {
        console.log("✅ [CUSTOMERS-POST] Customer_id salvo no Supabase com sucesso!")
      }
    }

    return NextResponse.json({
      ...newCustomer,
      message: "Customer criado e vinculado com sucesso",
      existing: false
    })

  } catch (error: any) {
    console.error("❌ [CUSTOMERS-POST] Erro inesperado:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    )
  }
} 