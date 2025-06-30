"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function TestPhoneFormatsPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const phoneFormats = [
    { name: "Nacional 11 dígitos", phone: "11999999999", mobilePhone: "11999999999" },
    { name: "Nacional 10 dígitos", phone: "1133334444", mobilePhone: "1133334444" },
    { name: "Com código país 55", phone: "5511999999999", mobilePhone: "5511999999999" },
    { name: "Com + e código país", phone: "+5511999999999", mobilePhone: "+5511999999999" },
    { name: "Com espaços", phone: "11 99999-9999", mobilePhone: "11 99999-9999" },
    { name: "Com hífen", phone: "11-99999-9999", mobilePhone: "11-99999-9999" },
    { name: "Com parênteses", phone: "(11)99999-9999", mobilePhone: "(11)99999-9999" },
    { name: "Apenas números limpos", phone: "11999999999", mobilePhone: "11999999999" },
  ]

  const testPhoneFormat = async (format: any) => {
    setLoading(true)
    try {
      const customerData = {
        name: `Teste ${format.name}`,
        email: "teste.phone@email.com",
        cpfCnpj: "11144477735",
        phone: format.phone,
        mobilePhone: format.mobilePhone,
        postalCode: "01310100",
        address: "Av. Paulista",
        addressNumber: "1000",
        province: "Bela Vista", 
        city: "São Paulo",
        state: "SP",
      }

      console.log(`🧪 Testando formato: ${format.name}`, customerData)

      const response = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })

      const result = await response.json()

      const testResult = {
        format: format.name,
        phone: format.phone,
        mobilePhone: format.mobilePhone,
        success: response.ok,
        status: response.status,
        error: response.ok ? null : result.error,
        customerId: response.ok ? result.id : null,
      }

      setResults(prev => [...prev, testResult])

      if (response.ok) {
        console.log(`✅ Formato funcionou: ${format.name}`, result)
        toast.success(`Formato funcionou: ${format.name}`)
      } else {
        console.log(`❌ Formato falhou: ${format.name}`, result)
        toast.error(`Formato falhou: ${format.name}`)
      }

    } catch (error: any) {
      console.error(`❌ Erro ao testar ${format.name}:`, error)
      
      const testResult = {
        format: format.name,
        phone: format.phone,
        mobilePhone: format.mobilePhone,
        success: false,
        status: 0,
        error: error.message,
        customerId: null,
      }

      setResults(prev => [...prev, testResult])
    } finally {
      setLoading(false)
    }
  }

  const testAllFormats = async () => {
    setResults([])
    for (const format of phoneFormats) {
      await testPhoneFormat(format)
      // Aguardar 1 segundo entre testes
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Teste: Formatos de Telefone Asaas</h1>
        <p className="text-gray-600">Encontrar o formato correto de telefone para o Asaas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controles */}
        <Card>
          <CardHeader>
            <CardTitle>Controles de Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={testAllFormats}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Testando..." : "Testar Todos os Formatos"}
            </Button>

            <Button 
              onClick={clearResults}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Limpar Resultados
            </Button>

            <div className="text-sm text-gray-600">
              <p><strong>Formatos a testar:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {phoneFormats.map((format, index) => (
                  <li key={index}>
                    {format.name}: {format.phone}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-gray-500">Nenhum teste executado ainda</p>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{result.format}</div>
                        <div className="text-xs text-gray-600">
                          {result.phone} | {result.mobilePhone}
                        </div>
                      </div>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "✅ Sucesso" : "❌ Falhou"}
                      </Badge>
                    </div>
                    
                    {result.success ? (
                      <div className="text-sm text-green-600">
                        Customer ID: {result.customerId}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        Status: {result.status} - {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Análise */}
      {results.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Análise dos Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {results.filter(r => r.success).length}
                </div>
                <div className="text-sm text-gray-600">Formatos que funcionaram</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {results.filter(r => !r.success).length}
                </div>
                <div className="text-sm text-gray-600">Formatos que falharam</div>
              </div>
            </div>

            {results.some(r => r.success) && (
              <div className="bg-green-50 p-4 rounded">
                <h4 className="font-semibold text-green-800 mb-2">✅ Formatos que funcionaram:</h4>
                {results.filter(r => r.success).map((result, index) => (
                  <div key={index} className="text-sm text-green-700">
                    • {result.format}: {result.phone}
                  </div>
                ))}
              </div>
            )}

            <pre className="text-xs bg-gray-100 p-3 rounded mt-4 overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 