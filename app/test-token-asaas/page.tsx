"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CheckCircle, AlertCircle, Loader2, Key, User, CreditCard } from "lucide-react"

export default function TestTokenAsaasPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>({})

  const testAsaasToken = async () => {
    setLoading(true)
    const testResults: any = {}

    try {
      // Teste 1: Verificar se consegue listar customers
      console.log("🧪 Teste 1: Listando customers...")
      const customersResponse = await fetch("/api/asaas/customers?limit=1")
      const customersResult = await customersResponse.json()
      
      testResults.listCustomers = {
        status: customersResponse.ok,
        code: customersResponse.status,
        message: customersResponse.ok ? 
          `✅ Token válido - ${customersResult.totalCount || 0} customers encontrados` : 
          `❌ Erro ${customersResponse.status}: ${customersResult.error || 'Token inválido'}`
      }

      // Teste 2: Verificar endpoint de pagamentos (sem customer específico)
      console.log("🧪 Teste 2: Testando endpoint de pagamentos...")
      const paymentsResponse = await fetch("/api/asaas/payments?limit=1")
      const paymentsResult = await paymentsResponse.json()
      
      testResults.listPayments = {
        status: paymentsResponse.ok,
        code: paymentsResponse.status,
        message: paymentsResponse.ok ? 
          `✅ Endpoint funcionando - ${paymentsResult.totalCount || 0} pagamentos encontrados` : 
          `❌ Erro ${paymentsResponse.status}: ${paymentsResult.error || 'Falha na API'}`
      }

      // Teste 3: Testar criação de customer (dados de teste)
      console.log("🧪 Teste 3: Criando customer de teste...")
      const createCustomerResponse = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Teste Token",
          email: "teste.token@example.com",
          cpfCnpj: "11144477735", // CPF válido para teste
          phone: "11999999999",
          mobilePhone: "11999999999"
        })
      })
      const createCustomerResult = await createCustomerResponse.json()
      
      testResults.createCustomer = {
        status: createCustomerResponse.ok,
        code: createCustomerResponse.status,
        message: createCustomerResponse.ok ? 
          `✅ Customer criado: ${createCustomerResult.data?.id}` : 
          `❌ Erro ${createCustomerResponse.status}: ${createCustomerResult.error || 'Falha ao criar'}`
      }

      setResults(testResults)

      // Toast com resultado geral
      const allPassed = Object.values(testResults).every((test: any) => test.status)
      if (allPassed) {
        toast.success("🎉 Token do Asaas está funcionando perfeitamente!")
      } else {
        const failedTests = Object.values(testResults).filter((test: any) => !test.status)
        if (failedTests.some((test: any) => test.code === 401)) {
          toast.error("❌ Token inválido ou expirado! Verifique suas credenciais.")
        } else {
          toast.error("❌ Alguns testes falharam. Verifique os detalhes.")
        }
      }

    } catch (error: any) {
      toast.error(`Erro nos testes: ${error.message}`)
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: boolean, code?: number) => {
    if (code === 401) return <AlertCircle className="h-5 w-5 text-orange-500" />
    return status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (status: boolean, code?: number) => {
    if (code === 401) return <Badge variant="secondary" className="bg-orange-100 text-orange-800">TOKEN INVÁLIDO</Badge>
    return <Badge variant={status ? "default" : "destructive"}>{status ? "OK" : "ERRO"}</Badge>
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔑 Teste do Token Asaas</h1>
        <p className="text-gray-600">Verificar se o token da API está funcionando corretamente</p>
      </div>

      {/* Informações do Token */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Informações do Token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Ambiente:</strong> Sandbox (Teste)</div>
            <div><strong>URL:</strong> https://sandbox.asaas.com/api/v3</div>
            <div><strong>Status:</strong> {Object.keys(results).length > 0 ? (
              Object.values(results).every((test: any) => test.status) ? (
                <Badge variant="default">✅ Funcionando</Badge>
              ) : (
                <Badge variant="destructive">❌ Com problemas</Badge>
              )
            ) : (
              <Badge variant="secondary">Não testado</Badge>
            )}</div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Teste */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🧪 Executar Testes</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testAsaasToken} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testando Token...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                Testar Token do Asaas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {Object.keys(results).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📊 Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(results).map(([testName, result]: [string, any]) => (
                <div key={testName} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status, result.code)}
                    <div>
                      <h4 className="font-semibold">
                        {testName === 'listCustomers' ? '👥 Listar Customers' :
                         testName === 'listPayments' ? '💳 Listar Pagamentos' :
                         testName === 'createCustomer' ? '🆕 Criar Customer' : testName}
                      </h4>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  {getStatusBadge(result.status, result.code)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Soluções para Problemas */}
      {Object.keys(results).length > 0 && Object.values(results).some((test: any) => !test.status) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">🔧 Soluções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-orange-700">
              {Object.values(results).some((test: any) => test.code === 401) && (
                <div className="p-3 bg-orange-100 rounded">
                  <h4 className="font-semibold mb-1">❌ Erro 401 - Token Inválido</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Verifique se o token no código está correto</li>
                    <li>Confirme se está usando o ambiente correto (sandbox/production)</li>
                    <li>Gere um novo token no painel do Asaas se necessário</li>
                    <li>Verifique se o token não expirou</li>
                  </ul>
                </div>
              )}
              <div className="p-3 bg-blue-100 rounded">
                <h4 className="font-semibold mb-1 text-blue-800">💡 Dica</h4>
                <p className="text-blue-700">
                  O sistema está usando um token hardcoded para testes. 
                  Para produção, configure a variável ASAAS_API_KEY no arquivo .env.local
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 