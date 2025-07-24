"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
// import { useAsaas } from "@/hooks/use-asaas" // REMOVIDO - Sistema de pagamentos desabilitado
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  CreditCard,
  QrCode,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react"

export default function TestePagamentosPage() {
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState<any>(null)
  const [payment, setPayment] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const supabase = createClient()

  // Estados dos formulários
  const [customerData, setCustomerData] = useState({
    name: "João da Silva",
    email: "joao.teste@email.com",
    phone: "11999999999",
    mobilePhone: "11999999999",
    cpfCnpj: "11144477735", // CPF válido para teste (algoritmo correto)
    postalCode: "01310-100",
    address: "Av. Paulista",
    addressNumber: "1000",
    complement: "Sala 1",
    province: "Bela Vista",
    city: "São Paulo",
    state: "SP",
  })

  const [paymentData, setPaymentData] = useState({
    billingType: "CREDIT_CARD" as "CREDIT_CARD" | "PIX" | "BOLETO",
    value: 50.00,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
    description: "Teste de pagamento",
    externalReference: "teste-" + Date.now(),
  })

  const [cardData, setCardData] = useState({
    holderName: "joão da silva",
    number: "5162306219378829", // Cartão de teste
    expiryMonth: "05",
    expiryYear: "2030",
    ccv: "318",
  })

  const [subscriptionData, setSubscriptionData] = useState({
    cycle: "MONTHLY",
    value: 29.90,
    description: "Assinatura Plano Básico",
  })

  // const { createCustomer, createPayment, createSubscription } = useAsaas() // REMOVIDO - Sistema de pagamentos desabilitado

  // Carregar usuário atual
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    loadUser()
  }, [supabase])

  // Função para criar cliente
  const handleCreateCustomer = async () => {
    setLoading(true)
    try {
      // Incluir userId se disponível
      const customerDataWithUserId = {
        ...customerData,
        userId: currentUser?.id
      }
      
      const result = await createCustomer(customerDataWithUserId)
      if (result.data) {
        setCustomer(result.data)
        toast.success("Cliente criado com sucesso!")
      } else {
        throw new Error(result.error || "Erro ao criar cliente")
      }
    } catch (error: any) {
      toast.error(`Erro ao criar cliente: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Função para criar pagamento
  const handleCreatePayment = async () => {
    if (!customer) {
      toast.error("Crie um cliente primeiro!")
      return
    }

    setLoading(true)
    try {
      const paymentPayload = {
        customer: customer.id,
        ...paymentData,
        ...(paymentData.billingType === "CREDIT_CARD" && {
          creditCard: {
            holderName: cardData.holderName,
            number: cardData.number,
            expiryMonth: cardData.expiryMonth,
            expiryYear: cardData.expiryYear,
            ccv: cardData.ccv,
          },
          creditCardHolderInfo: {
            name: customerData.name,
            email: customerData.email,
            cpfCnpj: customerData.cpfCnpj,
            postalCode: customerData.postalCode,
            addressNumber: customerData.addressNumber,
            addressComplement: customerData.complement,
            phone: customerData.mobilePhone,
          },
        }),
      }

      const result = await createPayment(paymentPayload)
      if (result.data) {
        setPayment(result.data)
        toast.success("Pagamento criado com sucesso!")
      } else {
        throw new Error(result.error || "Erro ao criar pagamento")
      }
    } catch (error: any) {
      toast.error(`Erro ao criar pagamento: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Função para criar assinatura
  const handleCreateSubscription = async () => {
    if (!customer) {
      toast.error("Crie um cliente primeiro!")
      return
    }

    setLoading(true)
    try {
      const subscriptionPayload = {
        customer: customer.id,
        ...subscriptionData,
        billingType: "CREDIT_CARD" as "CREDIT_CARD" | "PIX" | "BOLETO",
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
        cycle: subscriptionData.cycle as "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY",
      }

      const result = await createSubscription(subscriptionPayload)
      if (result.data) {
        setSubscription(result.data)
        toast.success("Assinatura criada com sucesso!")
      } else {
        throw new Error(result.error || "Erro ao criar assinatura")
      }
    } catch (error: any) {
      toast.error(`Erro ao criar assinatura: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Teste de Pagamentos Asaas</h1>
        <p className="text-gray-600">Ambiente de testes (Sandbox)</p>
      </div>

      {/* Dados de Teste */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Dados de Teste (Sandbox)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Cartões de Teste:</h4>
              <ul className="space-y-1">
                <li><strong>Aprovado:</strong> 5162306219378829</li>
                <li><strong>Recusado:</strong> 5162306219378837</li>
                <li><strong>CVV:</strong> 318</li>
                <li><strong>Validade:</strong> 05/2030</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">CPFs de Teste Válidos:</h4>
              <ul className="space-y-1">
                <li><strong>Válido:</strong> 11144477735</li>
                <li><strong>Válido:</strong> 22233344456</li>
                <li><strong>PIX aprovado:</strong> 11144477735</li>
                <li><strong>CNPJ teste:</strong> 34028316000103</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Formulários */}
        <div className="space-y-6">
          {/* Criar Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                1. Criar Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={customerData.cpfCnpj}
                    onChange={(e) => setCustomerData({ ...customerData, cpfCnpj: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleCreateCustomer} disabled={loading || !!customer} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {customer ? <Check className="h-4 w-4 mr-2" /> : null}
                {customer ? "Cliente Criado" : "Criar Cliente"}
              </Button>
            </CardContent>
          </Card>

          {/* Criar Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                2. Criar Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billingType">Tipo de Pagamento</Label>
                  <Select
                    value={paymentData.billingType}
                    onValueChange={(value) => setPaymentData({ ...paymentData, billingType: value as "CREDIT_CARD" | "PIX" | "BOLETO" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="BOLETO">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">Valor</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={paymentData.value}
                    onChange={(e) => setPaymentData({ ...paymentData, value: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={paymentData.description}
                  onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                />
              </div>

              {/* Dados do Cartão (se cartão de crédito) */}
              {paymentData.billingType === "CREDIT_CARD" && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-semibold">Dados do Cartão</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="holderName">Nome no Cartão</Label>
                      <Input
                        id="holderName"
                        value={cardData.holderName}
                        onChange={(e) => setCardData({ ...cardData, holderName: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryMonth">Mês</Label>
                      <Input
                        id="expiryMonth"
                        value={cardData.expiryMonth}
                        onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryYear">Ano</Label>
                      <Input
                        id="expiryYear"
                        value={cardData.expiryYear}
                        onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ccv">CCV</Label>
                      <Input
                        id="ccv"
                        value={cardData.ccv}
                        onChange={(e) => setCardData({ ...cardData, ccv: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleCreatePayment} disabled={loading || !customer} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Pagamento
              </Button>
            </CardContent>
          </Card>

          {/* Criar Assinatura */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                3. Criar Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cycle">Ciclo</Label>
                  <Select
                    value={subscriptionData.cycle}
                    onValueChange={(value) => setSubscriptionData({ ...subscriptionData, cycle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKLY">Semanal</SelectItem>
                      <SelectItem value="BIWEEKLY">Quinzenal</SelectItem>
                      <SelectItem value="MONTHLY">Mensal</SelectItem>
                      <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                      <SelectItem value="SEMIANNUALLY">Semestral</SelectItem>
                      <SelectItem value="YEARLY">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subscriptionValue">Valor</Label>
                  <Input
                    id="subscriptionValue"
                    type="number"
                    step="0.01"
                    value={subscriptionData.value}
                    onChange={(e) => setSubscriptionData({ ...subscriptionData, value: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="subscriptionDescription">Descrição</Label>
                <Input
                  id="subscriptionDescription"
                  value={subscriptionData.description}
                  onChange={(e) => setSubscriptionData({ ...subscriptionData, description: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateSubscription} disabled={loading || !customer} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Assinatura
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Resultados */}
        <div className="space-y-6">
          {/* Cliente Criado */}
          {customer && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Cliente Criado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {customer.id}</div>
                  <div><strong>Nome:</strong> {customer.name}</div>
                  <div><strong>Email:</strong> {customer.email}</div>
                  <div><strong>CPF:</strong> {customer.cpfCnpj}</div>
                  <div><strong>Status:</strong> <Badge variant="outline" className="text-green-600 border-green-600">Ativo</Badge></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagamento Criado */}
          {payment && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pagamento Criado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {payment.id}</div>
                  <div><strong>Valor:</strong> R$ {payment.value?.toFixed(2)}</div>
                  <div><strong>Status:</strong> 
                    <Badge 
                      variant="outline" 
                      className={
                        payment.status === "CONFIRMED" ? "text-green-600 border-green-600" :
                        payment.status === "PENDING" ? "text-yellow-600 border-yellow-600" :
                        "text-red-600 border-red-600"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                  <div><strong>Tipo:</strong> {payment.billingType}</div>
                  {payment.invoiceUrl && (
                    <div>
                      <strong>Link:</strong>{" "}
                      <a href={payment.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Ver Pagamento
                      </a>
                    </div>
                  )}
                  {payment.pixTransaction && (
                    <div>
                      <strong>QR Code PIX:</strong>
                      <div className="mt-2 p-2 bg-white rounded border">
                        <code className="text-xs break-all">{payment.pixTransaction.qrCode.payload}</code>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assinatura Criada */}
          {subscription && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Assinatura Criada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {subscription.id}</div>
                  <div><strong>Valor:</strong> R$ {subscription.value?.toFixed(2)}</div>
                  <div><strong>Ciclo:</strong> {subscription.cycle}</div>
                  <div><strong>Status:</strong> 
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      {subscription.status}
                    </Badge>
                  </div>
                  <div><strong>Próxima Cobrança:</strong> {subscription.nextDueDate}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Próximos Passos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>1. Configure as tabelas no Supabase executando os scripts SQL</div>
              <div>2. Configure o webhook no painel do Asaas</div>
              <div>3. Teste diferentes tipos de pagamento</div>
              <div>4. Monitore os webhooks recebidos</div>
              <div>5. Implemente a lógica de negócio baseada nos status</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}