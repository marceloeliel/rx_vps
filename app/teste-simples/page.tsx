"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TesteSimples() {
  const [resultado, setResultado] = useState<any>(null)
  const [carregando, setCarregando] = useState(false)

  const testarAPI = async () => {
    setCarregando(true)
    try {
      // Usar nossa API route
      const response = await fetch('/api/teste-asaas', {
        method: 'GET',
      })

      const data = await response.json()
      setResultado({
        sucesso: data.success,
        status: data.status,
        dados: data.data,
        timestamp: new Date().toLocaleString('pt-BR')
      })
    } catch (error: any) {
      setResultado({
        sucesso: false,
        erro: error.message,
        timestamp: new Date().toLocaleString('pt-BR')
      })
    } finally {
      setCarregando(false)
    }
  }

  const criarPagamentoPIX = async () => {
    setCarregando(true)
    try {
      // Usar nossa API route
      const response = await fetch('/api/teste-asaas', {
        method: 'POST',
      })

      const data = await response.json()
      
      setResultado({
        sucesso: data.success,
        status: data.status,
        dados: data.data,
        timestamp: new Date().toLocaleString('pt-BR')
      })
    } catch (error: any) {
      setResultado({
        sucesso: false,
        erro: error.message,
        timestamp: new Date().toLocaleString('pt-BR')
      })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Teste Simples Asaas</h1>
        <p className="text-gray-600">Teste direto com a API do Asaas</p>
      </div>

      <div className="space-y-4 mb-6">
        <Button onClick={testarAPI} disabled={carregando} className="mr-4">
          {carregando ? "Testando..." : "1️⃣ Testar Conexão"}
        </Button>
        
        <Button onClick={criarPagamentoPIX} disabled={carregando} variant="outline">
          {carregando ? "Criando..." : "2️⃣ Criar Pagamento PIX"}
        </Button>
      </div>

      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className={resultado.sucesso ? "text-green-600" : "text-red-600"}>
              {resultado.sucesso ? "✅ SUCESSO!" : "❌ ERRO"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div><strong>Status:</strong> {resultado.status}</div>
              <div><strong>Horário:</strong> {resultado.timestamp}</div>
              
              {resultado.erro && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <strong>Erro:</strong> {resultado.erro}
                </div>
              )}
              
              {resultado.dados && (
                <div>
                  <strong>Resposta da API:</strong>
                  <pre className="mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                    {JSON.stringify(resultado.dados, null, 2)}
                  </pre>
                </div>
              )}

              {resultado.sucesso && resultado.dados?.pagamento && (
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <h3 className="font-bold text-green-800 mb-2">🎉 Pagamento Criado!</h3>
                  <div><strong>ID:</strong> {resultado.dados.pagamento.id}</div>
                  <div><strong>Valor:</strong> R$ {resultado.dados.pagamento.value}</div>
                  <div><strong>Status:</strong> {resultado.dados.pagamento.status}</div>
                  {resultado.dados.pagamento.invoiceUrl && (
                    <div>
                      <strong>Link:</strong>{" "}
                      <a 
                        href={resultado.dados.pagamento.invoiceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver no Asaas
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">📋 Instruções</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ol className="list-decimal list-inside space-y-2">
            <li>Clique em "Testar Conexão" primeiro</li>
            <li>Se der sucesso, clique em "Criar Pagamento PIX"</li>
            <li>Verifique no painel do Asaas se o pagamento apareceu</li>
            <li>O pagamento deve aparecer na seção "Cobranças"</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
} 