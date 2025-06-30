"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function TestePagamentoCartaoPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testPayment = async () => {
    setLoading(true)
    setResult(null)

    try {
      // 1. Criar customer primeiro
      const customerData = {
        name: "TESTE CARTAO",
        email: "teste.cartao@email.com",
        cpfCnpj: "11144477735",
        phone: "61999855068",
        mobilePhone: "61999855068"
      }

      console.log("🔄 Criando customer...")
      const customerResponse = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData)
      })

      if (!customerResponse.ok) {
        const error = await customerResponse.json()
        throw new Error(`Erro ao criar customer: ${error.error}`)
      }

      const customer = await customerResponse.json()
      console.log("✅ Customer criado:", customer.id)

      // 2. Criar pagamento com cartão
      const paymentData = {
        customer: customer.id,
        billingType: "CREDIT_CARD",
        value: 99.90,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "Teste Pagamento Cartão",
        creditCard: {
          holderName: "TESTE CARTAO",
          number: "5155901222280001", // Cartão de teste do ASAAS
          expiryMonth: "12",
          expiryYear: "2026",
          ccv: "123"
        },
        creditCardHolderInfo: {
          name: "TESTE CARTAO",
          email: "teste.cartao@email.com",
          cpfCnpj: "11144477735",
          phone: "61999855068",
          postalCode: "01310-100", // CEP obrigatório para cartão
          address: "Av. Paulista",
          addressNumber: "1000",
          complement: "Conjunto 101",
          province: "Bela Vista", // Bairro
          city: "São Paulo",
          state: "SP"
        }
      }

      console.log("🔄 Criando pagamento...")
      const paymentResponse = await fetch("/api/asaas/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData)
      })

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json()
        throw new Error(`Erro ao criar pagamento: ${error.error || error.message}`)
      }

      const payment = await paymentResponse.json()
      console.log("✅ Pagamento criado:", payment)

      setResult({
        success: true,
        customer,
        payment
      })

      toast.success("Pagamento criado com sucesso!")

    } catch (error: any) {
      console.error("❌ Erro:", error)
      setResult({
        success: false,
        error: error.message
      })
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Teste de Pagamento com Cartão</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Teste API ASAAS - Cartão de Crédito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Este teste vai criar um customer e um pagamento com cartão de crédito usando a API do ASAAS.
            </p>
            
            <Button 
              onClick={testPayment} 
              disabled={loading}
              className="mb-4"
            >
              {loading ? "Testando..." : "Testar Pagamento"}
            </Button>

            {result && (
              <div className="mt-6">
                {result.success ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-green-800 font-semibold mb-2">✅ Sucesso!</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Customer:</h4>
                        <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                          {JSON.stringify(result.customer, null, 2)}
                        </pre>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Payment:</h4>
                        <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                          {JSON.stringify(result.payment, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold mb-2">❌ Erro</h3>
                    <p className="text-red-700">{result.error}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 