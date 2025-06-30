"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TesteHardcodedPage() {
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testarCompleto = async () => {
    setLoading(true)
    setResultado(null)
    
    try {
      console.log("🚀 Iniciando teste completo...")
      
      // Teste 1: Criar cliente
      console.log("👤 Criando cliente...")
      const customerData = {
        name: "Cliente Hardcoded",
        email: "hardcoded@teste.com",
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
      console.log("👤 Resultado cliente:", customerResult)
      
      setResultado({
        customer: {
          status: customerResponse.status,
          success: customerResponse.ok,
          data: customerResult
        }
      })
      
    } catch (error: any) {
      console.error("❌ Erro:", error)
      setResultado({
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: number, success: boolean) => {
    if (success) {
      return <Badge className="bg-green-500 text-white">✅ {status} - Sucesso</Badge>
    } else {
      return <Badge className="bg-red-500 text-white">❌ {status} - Erro</Badge>
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔧 Teste com Token Hardcoded</h1>
        <p className="text-gray-600">Teste das APIs com token fixo no código</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Teste Criação de Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testarCompleto} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Testando..." : "🚀 Criar Cliente"}
          </Button>
        </CardContent>
      </Card>

      {resultado && (
        <div className="space-y-6">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  {getStatusBadge(resultado.customer.status, resultado.customer.success)}
                </div>
                
                {resultado.customer.success && resultado.customer.data.id && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>ID:</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{resultado.customer.data.id}</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Nome:</span>
                      <span>{resultado.customer.data.name}</span>
                    </div>
                  </div>
                )}
                
                {!resultado.customer.success && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">
                      {JSON.stringify(resultado.customer.data, null, 2)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Erro Geral */}
          {resultado.error && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800">❌ Erro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">{resultado.error}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">⚠️ Importante:</h3>
        <p className="text-sm text-yellow-800">
          Este teste usa o token hardcoded diretamente no código da API. 
          Em produção, o token deve vir do arquivo .env.local.
        </p>
      </div>
    </div>
  )
} 