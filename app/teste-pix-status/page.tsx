"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, Loader2, QrCode, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function TestePixStatusPage() {
  const router = useRouter()
  const [paymentId, setPaymentId] = useState("")
  const [paymentData, setPaymentData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)

  // Simular diferentes status para teste
  const mockStatuses = [
    { status: "PENDING", label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
    { status: "AWAITING_PAYMENT", label: "Aguardando", color: "bg-blue-100 text-blue-800" },
    { status: "RECEIVED", label: "Recebido", color: "bg-green-100 text-green-800" },
    { status: "CONFIRMED", label: "Confirmado", color: "bg-green-100 text-green-800" },
    { status: "RECEIVED_IN_CASH", label: "Pago em Dinheiro", color: "bg-green-100 text-green-800" },
    { status: "OVERDUE", label: "Vencido", color: "bg-red-100 text-red-800" },
  ]

  const checkPaymentStatus = async (id?: string) => {
    const targetId = id || paymentId
    if (!targetId) {
      toast.error("Digite um ID de pagamento")
      return
    }

    setChecking(true)
    try {
      console.log("🔍 Verificando status do pagamento:", targetId)
      
      const response = await fetch(`/api/asaas/payments/${targetId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log("📋 Dados do pagamento:", data)
        setPaymentData(data)
        
        // Verificar se está confirmado
        if (data.status === 'RECEIVED' || data.status === 'CONFIRMED' || data.status === 'RECEIVED_IN_CASH') {
          toast.success("🎉 Pagamento Confirmado!")
        } else {
          toast.info(`Status atual: ${data.status}`)
        }
      } else {
        const error = await response.json()
        toast.error(`Erro: ${error.error}`)
        console.error("❌ Erro na consulta:", error)
      }
    } catch (error) {
      console.error("❌ Erro inesperado:", error)
      toast.error("Erro ao consultar pagamento")
    } finally {
      setChecking(false)
    }
  }

  const createTestPayment = async () => {
    setLoading(true)
    try {
      // Criar um pagamento PIX de teste
      const paymentData = {
        customer: "cus_000005928432", // ID de cliente de teste
        billingType: "PIX",
        value: 10.00,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "Teste PIX - Verificação de Status",
        externalReference: "teste-pix-" + Date.now(),
      }

      const response = await fetch("/api/asaas/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      })

      if (response.ok) {
        const result = await response.json()
        setPaymentId(result.id)
        setPaymentData(result)
        toast.success("Pagamento PIX criado!")
        console.log("✅ Pagamento criado:", result)
      } else {
        const error = await response.json()
        toast.error(`Erro: ${error.error}`)
        console.error("❌ Erro ao criar pagamento:", error)
      }
    } catch (error) {
      console.error("❌ Erro inesperado:", error)
      toast.error("Erro ao criar pagamento")
    } finally {
      setLoading(false)
    }
  }

  const simulateStatusChange = (newStatus: string) => {
    if (paymentData) {
      const updatedData = { ...paymentData, status: newStatus }
      setPaymentData(updatedData)
      
              if (newStatus === 'RECEIVED' || newStatus === 'CONFIRMED' || newStatus === 'RECEIVED_IN_CASH') {
        toast.success("🎉 Status simulado: Pagamento Confirmado!")
      } else {
        toast.info(`Status simulado: ${newStatus}`)
      }
    }
  }

  const getStatusInfo = (status: string) => {
    const statusInfo = mockStatuses.find(s => s.status === status)
    return statusInfo || { status, label: status, color: "bg-gray-100 text-gray-800" }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Teste Status PIX</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Criar Pagamento de Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Criar Pagamento PIX de Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Crie um pagamento PIX de teste para verificar a funcionalidade de status.
              </p>
              <Button 
                onClick={createTestPayment}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Pagamento PIX de Teste"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Consultar Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Consultar Status do Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentId">ID do Pagamento</Label>
                <Input
                  id="paymentId"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder="pay_xxxxxxxxxx"
                />
              </div>
              <Button 
                onClick={() => checkPaymentStatus()}
                disabled={checking}
                className="w-full"
              >
                {checking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  "Consultar Status"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Pagamento */}
        {paymentData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Dados do Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">ID</Label>
                    <p className="text-sm font-mono">{paymentData.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Valor</Label>
                    <p className="text-sm">R$ {paymentData.value?.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status Atual</Label>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusInfo(paymentData.status).color}>
                        {getStatusInfo(paymentData.status).label}
                      </Badge>
                      <code className="text-xs">{paymentData.status}</code>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo</Label>
                    <p className="text-sm">{paymentData.billingType}</p>
                  </div>
                </div>

                {paymentData.dueDate && (
                  <div>
                    <Label className="text-sm font-medium">Data de Vencimento</Label>
                    <p className="text-sm">{new Date(paymentData.dueDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}

                {paymentData.description && (
                  <div>
                    <Label className="text-sm font-medium">Descrição</Label>
                    <p className="text-sm">{paymentData.description}</p>
                  </div>
                )}

                {/* PIX QR Code */}
                {paymentData.pixTransaction && (
                  <div>
                    <Label className="text-sm font-medium">Código PIX</Label>
                    <div className="bg-gray-50 p-2 rounded border">
                      <code className="text-xs break-all">{paymentData.pixTransaction.qrCode?.payload}</code>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
        </Card>
        )}

        {/* Simular Mudanças de Status */}
        {paymentData && (
          <Card>
            <CardHeader>
              <CardTitle>Simular Status (Apenas para Teste)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Simule diferentes status para testar a lógica de detecção:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {mockStatuses.map((statusInfo) => (
                    <Button
                      key={statusInfo.status}
                      variant="outline"
                      size="sm"
                      onClick={() => simulateStatusChange(statusInfo.status)}
                      className={paymentData.status === statusInfo.status ? "border-orange-500 bg-orange-50" : ""}
                    >
                      {statusInfo.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logs de Debug */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <p><strong>Status que indicam pagamento confirmado:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li><code>RECEIVED</code> - Pagamento recebido</li>
                <li><code>CONFIRMED</code> - Pagamento confirmado</li>
                <li><code>RECEIVED_IN_CASH</code> - Pagamento recebido em dinheiro</li>
              </ul>
              <p className="mt-3"><strong>Verificação no código:</strong></p>
              <code className="block bg-gray-100 p-2 rounded">
                {`if (paymentData.status === 'RECEIVED' || paymentData.status === 'CONFIRMED' || paymentData.status === 'RECEIVED_IN_CASH') {
  setPaymentConfirmed(true)
  // Mostrar sucesso
}`}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
