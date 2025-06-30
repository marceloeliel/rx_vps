"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugCustomersPage() {
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testarGET = async () => {
    setLoading(true)
    setResultado(null)
    
    try {
      console.log("🔍 Testando GET /api/asaas/customers")
      const response = await fetch("/api/asaas/customers?limit=1")
      
      console.log("📊 Status:", response.status)
      console.log("📊 OK:", response.ok)
      
      const data = await response.json()
      console.log("📊 Dados:", data)
      
      setResultado({
        method: "GET",
        status: response.status,
        ok: response.ok,
        data: data
      })
    } catch (error: any) {
      console.error("❌ Erro:", error)
      setResultado({
        method: "GET",
        error: error.message,
        type: error.constructor.name
      })
    } finally {
      setLoading(false)
    }
  }

  const testarPOST = async () => {
    setLoading(true)
    setResultado(null)
    
    try {
      console.log("🔍 Testando POST /api/asaas/customers")
      
      const customerData = {
        name: "Cliente Teste Debug",
        email: "debug@teste.com",
        cpfCnpj: "24971563792",
        phone: "11999999999",
        mobilePhone: "11999999999",
      }
      
      console.log("📝 Enviando dados:", customerData)
      
      const response = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })
      
      console.log("📊 Status:", response.status)
      console.log("📊 OK:", response.ok)
      
      const data = await response.json()
      console.log("📊 Dados:", data)
      
      setResultado({
        method: "POST",
        status: response.status,
        ok: response.ok,
        data: data,
        sentData: customerData
      })
    } catch (error: any) {
      console.error("❌ Erro:", error)
      setResultado({
        method: "POST",
        error: error.message,
        type: error.constructor.name
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge className="bg-green-500 text-white">{status} - Sucesso</Badge>
    } else if (status >= 400 && status < 500) {
      return <Badge className="bg-yellow-500 text-white">{status} - Erro Cliente</Badge>
    } else if (status >= 500) {
      return <Badge className="bg-red-500 text-white">{status} - Erro Servidor</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Debug - API Customers</h1>
        <p className="text-gray-600">Teste detalhado da API de clientes do Asaas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Testes */}
        <Card>
          <CardHeader>
            <CardTitle>Testes Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                onClick={testarGET} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? "Testando..." : "Testar GET (Listar Clientes)"}
              </Button>
              
              <Button 
                onClick={testarPOST} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Testando..." : "Testar POST (Criar Cliente)"}
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• GET: Lista clientes existentes</p>
              <p>• POST: Cria um novo cliente de teste</p>
              <p>• Verifique o console do navegador para logs detalhados</p>
              <p>• Verifique o terminal do servidor para logs da API</p>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Teste</CardTitle>
          </CardHeader>
          <CardContent>
            {!resultado && (
              <p className="text-gray-500 text-center py-8">
                Clique em um dos botões para testar
              </p>
            )}

            {resultado && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Método:</span>
                  <Badge variant="outline">{resultado.method}</Badge>
                </div>

                {resultado.status && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Status:</span>
                    {getStatusBadge(resultado.status)}
                  </div>
                )}

                {resultado.error && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Erro:</span>
                      <Badge className="bg-red-500 text-white">{resultado.type}</Badge>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800">{resultado.error}</p>
                    </div>
                  </div>
                )}

                {resultado.data && (
                  <div className="space-y-2">
                    <span className="font-semibold">Resposta:</span>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <pre className="text-xs overflow-auto max-h-40">
                        {JSON.stringify(resultado.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {resultado.sentData && (
                  <div className="space-y-2">
                    <span className="font-semibold">Dados Enviados:</span>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(resultado.sentData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instruções */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Como Debugar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>1. Console do Navegador:</strong> Abra as ferramentas de desenvolvedor (F12) e vá na aba Console</p>
            <p><strong>2. Terminal do Servidor:</strong> Verifique o terminal onde está rodando `pnpm dev`</p>
            <p><strong>3. Teste GET primeiro:</strong> Mais simples, apenas lista clientes</p>
            <p><strong>4. Depois teste POST:</strong> Cria um cliente e mostra se há problemas nos dados</p>
            <p><strong>5. Compare os logs:</strong> Veja onde exatamente para o processo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 