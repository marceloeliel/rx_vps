"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TesteTokenFinalPage() {
  const [resultado, setResultado] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testarToken = async () => {
    setLoading(true)
    setResultado("Testando...")
    
    try {
      console.log("🔍 Testando API de teste de ambiente...")
      const response = await fetch("/api/test-env")
      const data = await response.json()
      
      console.log("📊 Resposta:", data)
      
      if (data.hasToken) {
        setResultado(`✅ SUCESSO! Token encontrado!
Tamanho: ${data.tokenLength} caracteres
Primeiros 20 chars: ${data.tokenPreview}`)
      } else {
        setResultado(`❌ ERRO: Token não encontrado!
Detalhes: ${JSON.stringify(data, null, 2)}`)
      }
      
    } catch (error: any) {
      console.error("❌ Erro:", error)
      setResultado(`❌ ERRO: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testarCustomer = async () => {
    setLoading(true)
    setResultado("Criando cliente...")
    
    try {
      const customerData = {
        name: "Teste Token Final",
        email: "teste.token@email.com",
        cpfCnpj: "24971563792",
        phone: "11999999999",
        mobilePhone: "11999999999",
      }
      
      console.log("🔍 Enviando dados para API customers...")
      const response = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })
      
      const data = await response.json()
      console.log("📊 Resposta:", data)
      
      if (response.ok && data.id) {
        setResultado(`✅ CLIENTE CRIADO COM SUCESSO!
ID: ${data.id}
Nome: ${data.name}
Email: ${data.email}
Status: ${response.status}`)
      } else {
        setResultado(`❌ ERRO ao criar cliente:
Status: ${response.status}
Erro: ${JSON.stringify(data, null, 2)}`)
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎯 Teste Token Final</h1>
        <p className="text-gray-600">Verificação definitiva do token Asaas</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>1. Testar Token</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testarToken} 
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? "Testando..." : "🔑 Verificar Token"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Testar Criação de Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testarCustomer} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Testando..." : "👤 Criar Cliente"}
            </Button>
          </CardContent>
        </Card>

        {resultado && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-100 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap overflow-auto">
                  {resultado}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Como usar:</h3>
        <ol className="text-sm space-y-1">
          <li>1. Primeiro clique em "🔑 Verificar Token" para ver se está sendo lido</li>
          <li>2. Se o token estiver OK, clique em "👤 Criar Cliente" para testar a API</li>
          <li>3. Verifique o console do navegador (F12) para logs detalhados</li>
          <li>4. Verifique o terminal do servidor para logs da API</li>
        </ol>
      </div>
    </div>
  )
} 