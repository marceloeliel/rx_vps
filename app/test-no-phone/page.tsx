"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function TestNoPhonePage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const createProfile = async () => {
    if (!currentUser) return

    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: currentUser.id,
          nome_completo: "Usuario Teste",
          email: currentUser.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      toast.success("Perfil criado!")
      return data
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`)
    }
  }

  const testCustomerNoPhone = async () => {
    setLoading(true)
    try {
      // 1. Garantir que perfil existe
      await createProfile()

      // 2. Criar customer SEM telefone
      const customerData = {
        userId: currentUser.id,
        name: "Teste Sem Telefone",
        email: currentUser.email,
        cpfCnpj: "11144477735",
        // SEM phone e mobilePhone para evitar erro
      }

      console.log("🚀 Testando customer sem telefone:", customerData)

      const response = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, data })
        toast.success("Customer criado sem telefone!")
      } else {
        setResult({ success: false, error: data.error })
        toast.error(`Erro: ${data.error}`)
      }

    } catch (error: any) {
      setResult({ success: false, error: error.message })
      toast.error(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Teste: Customer sem Telefone</h1>
      
      <Card className="mb-4">
        <CardContent className="p-4">
          <Button 
            onClick={testCustomerNoPhone}
            disabled={loading || !currentUser}
            className="w-full"
          >
            {loading ? "Testando..." : "Criar Customer SEM Telefone"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 