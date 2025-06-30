"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function TesteCheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState<any>(null)
  const [payment, setPayment] = useState<any>(null)

  const testarCheckout = async () => {
    setLoading(true)
    try {
      // 1. Criar cliente
      toast.loading("Criando cliente...")
      const customerData = {
        name: "João Silva Teste",
        email: "joao.teste@email.com",
        cpfCnpj: "24971563792",
        phone: "11999999999",
        mobilePhone: "11999999999",
      }

      const customerResponse = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })

      if (!customerResponse.ok) {
        const error = await customerResponse.json()
        throw new Error(error.error || "Erro ao criar cliente")
      }

      const newCustomer = await customerResponse.json()
      setCustomer(newCustomer)
      toast.success("Cliente criado!")

      // 2. Criar pagamento PIX
      toast.loading("Criando pagamento PIX...")
      const paymentData = {
        customer: newCustomer.id,
        billingType: "PIX",
        value: 99.90,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "Teste Checkout - Plano Profissional",
        externalReference: `teste-checkout-${Date.now()}`,
      }

      const paymentResponse = await fetch("/api/asaas/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      })

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json()
        throw new Error(error.error || "Erro ao criar pagamento")
      }

      const newPayment = await paymentResponse.json()
      setPayment(newPayment)
      toast.success("Pagamento criado!")

    } catch (error: any) {
      console.error("Erro:", error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Teste Checkout Asaas</h1>
        <p className="text-gray-600">Teste rápido da integração do checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Teste */}
        <Card>
          <CardHeader>
            <CardTitle>Testar Integração</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testarCheckout} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Testando..." : "Testar Checkout"}
            </Button>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>Este teste irá:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Criar um cliente de teste</li>
                <li>Criar um pagamento PIX de R$ 99,90</li>
                <li>Mostrar os resultados abaixo</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Coluna Direita - Resultados */}
        <div className="space-y-4">
          {/* Cliente */}
          {customer && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">✅ Cliente Criado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {customer.id}</div>
                  <div><strong>Nome:</strong> {customer.name}</div>
                  <div><strong>Email:</strong> {customer.email}</div>
                  <div><strong>CPF:</strong> {customer.cpfCnpj}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagamento */}
          {payment && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">💰 Pagamento Criado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {payment.id}</div>
                  <div><strong>Valor:</strong> R$ {payment.value.toFixed(2)}</div>
                  <div><strong>Status:</strong> {payment.status}</div>
                  <div><strong>Tipo:</strong> {payment.billingType}</div>
                  {payment.invoiceUrl && (
                    <div>
                      <strong>Fatura:</strong>{" "}
                      <a 
                        href={payment.invoiceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver Online
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Link para Checkout Real */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="text-center">
            <h3 className="font-semibold mb-2">Testar Checkout Completo</h3>
            <p className="text-sm text-gray-600 mb-4">
              Teste a experiência completa do usuário
            </p>
            <Button 
              onClick={() => window.open("/checkout?plano=profissional", "_blank")}
              variant="outline"
            >
              Abrir Checkout Real
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 