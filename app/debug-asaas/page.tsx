"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react"

export default function DebugAsaasPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Verificar variáveis de ambiente
  const envVars = {
    ASAAS_API_KEY: process.env.NEXT_PUBLIC_ASAAS_API_KEY || process.env.ASAAS_API_KEY,
    ASAAS_BASE_URL: process.env.NEXT_PUBLIC_ASAAS_BASE_URL || process.env.ASAAS_BASE_URL,
    ASAAS_WEBHOOK_TOKEN: process.env.NEXT_PUBLIC_ASAAS_WEBHOOK_TOKEN || process.env.ASAAS_WEBHOOK_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  }

  const testApiConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/asaas/customers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setTestResult({
        success: response.ok,
        status: response.status,
        data: data,
        timestamp: new Date().toLocaleString('pt-BR')
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toLocaleString('pt-BR')
      })
    } finally {
      setLoading(false)
    }
  }

  const maskApiKey = (key?: string) => {
    if (!key) return 'NÃO CONFIGURADA'
    if (key.length < 10) return key
    return key.substring(0, 10) + '...' + key.substring(key.length - 4)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Debug Asaas - Diagnóstico</h1>
        <p className="text-gray-600">Verificação das configurações e conectividade</p>
      </div>

      {/* Status das Variáveis de Ambiente */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Variáveis de Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded">
              <div className="font-mono text-sm">{key}</div>
              <div className="flex items-center gap-2">
                {value ? (
                  <>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Configurada
                    </Badge>
                    {key === 'ASAAS_API_KEY' && (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {showApiKey ? value : maskApiKey(value)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="h-6 w-6 p-0"
                        >
                          {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    )}
                    {key !== 'ASAAS_API_KEY' && (
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{value}</code>
                    )}
                  </>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Não configurada
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Instruções para Configuração */}
      {!envVars.ASAAS_API_KEY && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Configuração Necessária
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-700">
            <div className="space-y-4">
              <p><strong>Você precisa criar o arquivo .env.local na raiz do projeto com:</strong></p>
              <pre className="bg-white p-4 rounded border text-sm overflow-x-auto">
{`# Configurações do Asaas (Sandbox)
ASAAS_API_KEY=$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjBhZmIzYWM0LWUwODgtNDU5ZC1iMGRlLTFhODdjMmQ1ZDhhMTo6JGFhY2hfYjg1NDM2ZTQtNzFlNi00MDhkLTllNDItYjAxMjc0ZTc2ZWJh
ASAAS_BASE_URL=https://sandbox.asaas.com/api/v3
ASAAS_WEBHOOK_TOKEN=webhook_token_secreto_123

# URL da aplicação para webhooks
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Suas configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key`}
              </pre>
              <p className="text-sm">
                <strong>Importante:</strong> Após criar o arquivo, reinicie o servidor com <code>pnpm dev</code>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teste de Conexão */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Teste de Conexão API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testApiConnection} disabled={loading || !envVars.ASAAS_API_KEY}>
            {loading ? "Testando..." : "Testar Conexão com Asaas"}
          </Button>

          {testResult && (
            <div className={`p-4 rounded border ${
              testResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <strong>
                  {testResult.success ? 'Conexão OK' : 'Erro na Conexão'}
                </strong>
                <Badge variant="outline">
                  Status: {testResult.status || 'N/A'}
                </Badge>
              </div>
              
              <div className="text-sm space-y-2">
                <div><strong>Timestamp:</strong> {testResult.timestamp}</div>
                
                {testResult.error && (
                  <div><strong>Erro:</strong> {testResult.error}</div>
                )}
                
                {testResult.data && (
                  <div>
                    <strong>Resposta:</strong>
                    <pre className="mt-2 bg-white p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist de Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {envVars.ASAAS_API_KEY ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>Arquivo .env.local criado com ASAAS_API_KEY</span>
            </div>
            <div className="flex items-center gap-2">
              {envVars.ASAAS_BASE_URL ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>ASAAS_BASE_URL configurada</span>
            </div>
            <div className="flex items-center gap-2">
              {testResult?.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>Conexão com API testada</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span>Tabelas do Supabase criadas (execute os scripts SQL)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}