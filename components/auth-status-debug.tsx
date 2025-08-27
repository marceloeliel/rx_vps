"use client"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, RefreshCw, User, Shield } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Componente para debug e monitoramento do status de autenticação
 * Mostra informações em tempo real sobre a verificação automática
 */
export function AuthStatusDebug() {
  const {
    user,
    profile,
    isAuthenticated,
    isValid,
    isLoading,
    lastCheck,
    forceCheck
  } = useAuthGuard({
    enableAutoCheck: true,
    checkInterval: 10000, // 10 segundos para debug
    showToastOnLogout: false
  })

  const getStatusColor = () => {
    if (isLoading) return "bg-yellow-500"
    if (isAuthenticated && isValid) return "bg-green-500"
    if (!isAuthenticated) return "bg-gray-500"
    return "bg-red-500"
  }

  const getStatusText = () => {
    if (isLoading) return "Verificando..."
    if (isAuthenticated && isValid) return "Autenticado e Válido"
    if (!isAuthenticated) return "Não Autenticado"
    return "Inválido"
  }

  const getStatusIcon = () => {
    if (isLoading) return <Clock className="h-4 w-4" />
    if (isAuthenticated && isValid) return <CheckCircle className="h-4 w-4" />
    if (!isAuthenticated) return <User className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg border-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Status de Autenticação
          <Badge 
            variant="outline" 
            className={`ml-auto text-white ${getStatusColor()}`}
          >
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {/* Informações do Usuário */}
        <div className="space-y-1">
          <div className="font-medium text-gray-700">Usuário:</div>
          <div className="text-gray-600">
            {user ? (
              <>
                <div>ID: {user.id.slice(0, 8)}...</div>
                <div>Email: {user.email}</div>
              </>
            ) : (
              <div className="text-gray-400">Nenhum usuário logado</div>
            )}
          </div>
        </div>

        {/* Informações do Perfil */}
        <div className="space-y-1">
          <div className="font-medium text-gray-700">Perfil:</div>
          <div className="text-gray-600">
            {profile ? (
              <>
                <div>Tipo: {profile.tipo_usuario || 'N/A'}</div>
                <div>Status: Ativo</div>
              </>
            ) : (
              <div className="text-gray-400">Nenhum perfil encontrado</div>
            )}
          </div>
        </div>

        {/* Status de Verificação */}
        <div className="space-y-1">
          <div className="font-medium text-gray-700">Verificação:</div>
          <div className="text-gray-600">
            <div>Autenticado: {isAuthenticated ? '✅' : '❌'}</div>
            <div>Válido: {isValid ? '✅' : '❌'}</div>
            <div>Carregando: {isLoading ? '⏳' : '✅'}</div>
          </div>
        </div>

        {/* Última Verificação */}
        {lastCheck && (
          <div className="space-y-1">
            <div className="font-medium text-gray-700">Última Verificação:</div>
            <div className="text-gray-600">
              {formatDistanceToNow(lastCheck, { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </div>
          </div>
        )}

        {/* Botão de Verificação Manual */}
        <Button 
          onClick={forceCheck}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="w-full"
        >
          <RefreshCw className={`h-3 w-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Verificar Agora
        </Button>

        {/* Instruções */}
        <div className="text-xs text-gray-500 border-t pt-2">
          <div className="font-medium mb-1">Como testar:</div>
          <ul className="space-y-1 text-xs">
            <li>• Faça login normalmente</li>
            <li>• Exclua o perfil no Supabase</li>
            <li>• Aguarde a verificação automática</li>
            <li>• O sistema fará logout automático</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Versão compacta do debug de autenticação
 */
export function AuthStatusBadge() {
  const { isAuthenticated, isValid, isLoading } = useAuthGuard()

  const getColor = () => {
    if (isLoading) return "bg-yellow-500"
    if (isAuthenticated && isValid) return "bg-green-500"
    if (!isAuthenticated) return "bg-gray-500"
    return "bg-red-500"
  }

  const getText = () => {
    if (isLoading) return "Verificando"
    if (isAuthenticated && isValid) return "OK"
    if (!isAuthenticated) return "Deslogado"
    return "Inválido"
  }

  return (
    <Badge className={`fixed top-4 right-4 z-50 text-white ${getColor()}`}>
      <Shield className="h-3 w-3 mr-1" />
      {getText()}
    </Badge>
  )
}