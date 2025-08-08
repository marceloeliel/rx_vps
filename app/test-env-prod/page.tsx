"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TestEnvProdPage() {
  const [envData, setEnvData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testEnvVars = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-env')
      const data = await response.json()
      setEnvData(data)
    } catch (error) {
      console.error('Erro ao testar env vars:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testEnvVars()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Variáveis de Ambiente - Produção Asaas</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testEnvVars} disabled={loading}>
            {loading ? 'Testando...' : 'Recarregar Teste'}
          </Button>
          
          {envData && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Variáveis de Ambiente:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(envData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}