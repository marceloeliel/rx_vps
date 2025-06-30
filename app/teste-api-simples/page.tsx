"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TesteApiSimplesPage() {
  const [resultado, setResultado] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testarAPI = async () => {
    setLoading(true)
    setResultado("Testando...")

    try {
      // Teste simples da API de customers
      const response = await fetch("/api/asaas/customers", {
        method: "GET",
      })

      if (response.ok) {
        const data = await response.json()
        setResultado(`✅ API funcionando! Total de clientes: ${data.totalCount || 0}`)
      } else {
        const error = await response.json()
        setResultado(`❌ Erro: ${error.error}`)
      }
    } catch (error) {
      setResultado(`❌ Erro de conexão: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testarCriarCliente = async () => {
    setLoading(true)
    setResultado("Criando cliente...")

    try {
      const clienteData = {
        name: "Teste Cliente",
        email: "teste@email.com",
        cpfCnpj: "24971563792",
      }

      const response = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteData),
      })

      if (response.ok) {
        const data = await response.json()
        setResultado(`✅ Cliente criado! ID: ${data.id}`)
      } else {
        const error = await response.json()
        setResultado(`❌ Erro: ${error.error}`)
      }
    } catch (error) {
      setResultado(`❌ Erro de conexão: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Teste API Asaas - Simples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              onClick={testarAPI} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Testando..." : "Testar GET /api/asaas/customers"}
            </Button>
            
            <Button 
              onClick={testarCriarCliente} 
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? "Testando..." : "Testar POST /api/asaas/customers"}
            </Button>
          </div>

          {resultado && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Resultado:</h3>
              <p className="text-sm">{resultado}</p>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p>Token configurado: {process.env.NEXT_PUBLIC_ASAAS_API_KEY ? "✅" : "❌"}</p>
            <p>Ambiente: Sandbox</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 