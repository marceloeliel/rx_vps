"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDirectApi = async () => {
    setLoading(true)
    try {
      const apiKey = "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmRiNWMyZWEyLWQ0OGEtNDY5Yy05OTg4LTRhZDU2Mjg5MjYzMjo6JGFhY2hfZTI3NDc0MzctM2MxNy00Nzg1LWEyNjYtOWE0OTgyYTUxODY2"
      
      // Teste direto com a API do Asaas
      const response = await fetch('https://sandbox.asaas.com/api/v3/customers', {
        method: 'GET',
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setResult({
        success: response.ok,
        status: response.status,
        data: data,
        timestamp: new Date().toLocaleString('pt-BR')
      })
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString('pt-BR')
      })
    } finally {
      setLoading(false)
    }
  }

  const createTestCustomer = async () => {
    setLoading(true)
    try {
      const apiKey = "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmRiNWMyZWEyLWQ0OGEtNDY5Yy05OTg4LTRhZDU2Mjg5MjYzMjo6JGFhY2hfZTI3NDc0MzctM2MxNy00Nzg1LWEyNjYtOWE0OTgyYTUxODY2"
      
      const customerData = {
        name: "João Teste",
        email: "joao.teste@email.com",
        phone: "11999999999",
        mobilePhone: "11999999999",
        cpfCnpj: "24971563792",
        postalCode: "01310-100",
        address: "Av. Paulista",
        addressNumber: "1000",
        complement: "Sala 1",
        province: "Bela Vista",
        city: "São Paulo",
        state: "SP"
      }

      const response = await fetch('https://sandbox.asaas.com/api/v3/customers', {
        method: 'POST',
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      })

      const data = await response.json()
      setResult({
        success: response.ok,
        status: response.status,
        data: data,
        timestamp: new Date().toLocaleString('pt-BR')
      })
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString('pt-BR')
      })
    } finally {
      setLoading(false)
    }
  }

  const createTestPayment = async () => {
    setLoading(true)
    try {
      const apiKey = "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmRiNWMyZWEyLWQ0OGEtNDY5Yy05OTg4LTRhZDU2Mjg5MjYzMjo6JGFhY2hfZTI3NDc0MzctM2MxNy00Nzg1LWEyNjYtOWE0OTgyYTUxODY2"
      
      // Primeiro criar um cliente
      const customerData = {
        name: "Cliente Teste PIX",
        email: "teste.pix@email.com",
        cpfCnpj: "24971563792"
      }

      const customerResponse = await fetch('https://sandbox.asaas.com/api/v3/customers', {
        method: 'POST',
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      })

      const customer = await customerResponse.json()

      if (!customerResponse.ok) {
        setResult({
          success: false,
          error: 'Erro ao criar cliente: ' + JSON.stringify(customer),
          timestamp: new Date().toLocaleString('pt-BR')
        })
        return
      }

      // Agora criar o pagamento PIX
      const paymentData = {
        customer: customer.id,
        billingType: "PIX",
        value: 50.00,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "Teste de pagamento PIX direto"
      }

      const paymentResponse = await fetch('https://sandbox.asaas.com/api/v3/payments', {
        method: 'POST',
        headers: {
          'access_token': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      const payment = await paymentResponse.json()
      
      setResult({
        success: paymentResponse.ok,
        status: paymentResponse.status,
        data: { customer, payment },
        timestamp: new Date().toLocaleString('pt-BR')
      })
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString('pt-BR')
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Teste Direto API Asaas</h1>
        <p className="text-gray-600">Testando conexão direta com a API</p>
      </div>

      <div className="space-y-4 mb-6">
        <Button onClick={testDirectApi} disabled={loading}>
          {loading ? "Testando..." : "1. Testar Conexão (Listar Clientes)"}
        </Button>
        
        <Button onClick={createTestCustomer} disabled={loading}>
          {loading ? "Criando..." : "2. Criar Cliente Teste"}
        </Button>
        
        <Button onClick={createTestPayment} disabled={loading}>
          {loading ? "Criando..." : "3. Criar Pagamento PIX Teste"}
        </Button>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className={result.success ? "text-green-600" : "text-red-600"}>
              {result.success ? "✅ Sucesso" : "❌ Erro"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Status:</strong> {result.status}</div>
              <div><strong>Timestamp:</strong> {result.timestamp}</div>
              {result.error && (
                <div><strong>Erro:</strong> {result.error}</div>
              )}
              {result.data && (
                <div>
                  <strong>Resposta:</strong>
                  <pre className="mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}