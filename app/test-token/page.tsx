"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestTokenPage() {
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testarToken = async () => {
    setLoading(true)
    setResultado(null)
    
    try {
      console.log("🔍 Testando token...")
      
      const response = await fetch("/api/test-env")
      const data = await response.json()
      
      console.log("📊 Resposta:", data)
      
      setResultado({
        status: response.status,
        data: data
      })
    } catch (error: any) {
      console.error("❌ Erro:", error)
      setResultado({
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Teste do Token Asaas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testarToken} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Testando..." : "Testar Token"}
          </Button>

          {resultado && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(resultado, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 