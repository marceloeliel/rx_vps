"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TesteRapidoPage() {
  const [resultado, setResultado] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testarAPI = async () => {
    setLoading(true)
    setResultado("Testando...")
    
    try {
      // Teste 1: Verificar variáveis de ambiente
      console.log("🔍 Testando variáveis de ambiente...")
      const envResponse = await fetch("/api/test-env")
      const envData = await envResponse.json()
      console.log("📊 Env:", envData)
      
      // Teste 2: Criar cliente
      console.log("🔍 Testando criação de cliente...")
      const customerData = {
        name: "Teste Cliente",
        email: "teste@email.com",
        cpfCnpj: "24971563792",
        phone: "11999999999",
        mobilePhone: "11999999999",
      }
      
      const customerResponse = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })
      
      const customerResult = await customerResponse.json()
      console.log("📊 Customer:", customerResult)
      
      if (customerResponse.ok) {
        setResultado(`✅ SUCESSO!
Variáveis: ${JSON.stringify(envData, null, 2)}
Cliente criado: ${customerResult.id}
Nome: ${customerResult.name}`)
      } else {
        setResultado(`❌ ERRO na criação do cliente:
Status: ${customerResponse.status}
Erro: ${JSON.stringify(customerResult, null, 2)}`)
      }
      
    } catch (error: any) {
      console.error("❌ Erro:", error)
      setResultado(`❌ ERRO: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Teste Rápido - APIs Asaas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testarAPI} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Testando..." : "Testar APIs"}
          </Button>

          {resultado && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap overflow-auto">
                {resultado}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 