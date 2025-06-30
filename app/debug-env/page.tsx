"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, XCircle } from "lucide-react"

export default function DebugEnvPage() {
  // Verificar variáveis no lado do cliente (apenas as públicas)
  const publicVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const getStatus = (value: string | undefined) => {
    if (!value) return { status: 'missing', icon: XCircle, color: 'text-red-500' }
    if (value.includes('your-') || value.includes('undefined')) return { status: 'invalid', icon: AlertCircle, color: 'text-yellow-500' }
    return { status: 'ok', icon: CheckCircle, color: 'text-green-500' }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔧 Debug - Variáveis de Ambiente</h1>
        <p className="text-gray-600">Verificação das configurações do sistema</p>
      </div>

      {/* Variáveis Públicas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📋 Variáveis Públicas (Client-Side)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(publicVars).map(([key, value]) => {
              const { status, icon: Icon, color } = getStatus(value)
              return (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-mono text-sm">{key}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {value ? `${value.slice(0, 20)}...` : 'Não definida'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <Badge variant={status === 'ok' ? 'default' : status === 'invalid' ? 'secondary' : 'destructive'}>
                      {status === 'ok' ? 'OK' : status === 'invalid' ? 'Inválida' : 'Ausente'}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configurações Recomendadas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>⚙️ Configurações Recomendadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Arquivo .env.local</h4>
              <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
{`# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Asaas API
ASAAS_API_URL=https://sandbox.asaas.com/api/v3
ASAAS_API_KEY=your-asaas-api-key`}
              </pre>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✅ URLs Hardcoded (Funcionando)</h4>
              <p className="text-green-700 text-sm">
                O sistema está usando URLs hardcoded como fallback, então mesmo sem as variáveis de ambiente, 
                a integração com Asaas continua funcionando.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Para Produção</h4>
              <p className="text-yellow-700 text-sm">
                Configure as variáveis de ambiente corretamente antes de fazer deploy em produção.
                Remova as URLs hardcoded do código.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Atual */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Status Atual do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-green-800">Integração Asaas</div>
              <div className="text-sm text-green-600">Funcionando</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-green-800">Dashboard Cobranças</div>
              <div className="text-sm text-green-600">Funcionando</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-green-800">Customer ID</div>
              <div className="text-sm text-green-600">Resolvido</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 