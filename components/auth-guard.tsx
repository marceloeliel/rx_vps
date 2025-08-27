"use client"
import { useEffect, ReactNode } from "react"
import { useAuthGuard, useRequireAuth } from "@/hooks/use-auth-guard"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AuthGuardProps {
  children: ReactNode
  redirectTo?: string
  requireAuth?: boolean
  showLoader?: boolean
  fallback?: ReactNode
}

/**
 * Componente para proteger páginas com verificação automática de autenticação
 * Verifica continuamente se o usuário ainda está ativo no Supabase
 */
export function AuthGuard({ 
  children, 
  redirectTo = "/login", 
  requireAuth = true,
  showLoader = true,
  fallback 
}: AuthGuardProps) {
  const authGuard = requireAuth 
    ? useRequireAuth(redirectTo)
    : useAuthGuard({ redirectTo, enableAutoCheck: false, showToastOnLogout: false })

  // Se está carregando, mostrar loader
  if (authGuard.isLoading) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    if (showLoader) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Verificando autenticação...</p>
          </div>
        </div>
      )
    }
    
    return null
  }

  // Se requer autenticação mas não está autenticado, não renderizar nada
  // (o hook já vai redirecionar)
  if (requireAuth && !authGuard.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertDescription>
            Redirecionando para o login...
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Se não requer autenticação ou está autenticado, renderizar children
  return <>{children}</>
}

/**
 * Componente simplificado para páginas que requerem autenticação
 */
export function RequireAuth({ children, redirectTo }: { children: ReactNode, redirectTo?: string }) {
  return (
    <AuthGuard requireAuth={true} redirectTo={redirectTo}>
      {children}
    </AuthGuard>
  )
}

/**
 * Componente para mostrar conteúdo diferente baseado no status de autenticação
 */
export function ConditionalAuth({ 
  authenticated, 
  unauthenticated, 
  loading 
}: { 
  authenticated: ReactNode
  unauthenticated: ReactNode
  loading?: ReactNode 
}) {
  const { isAuthenticated, isLoading } = useAuthGuard({ enableAutoCheck: true })

  if (isLoading) {
    return loading ? <>{loading}</> : (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return isAuthenticated ? <>{authenticated}</> : <>{unauthenticated}</>
}

/**
 * Hook para usar dentro de componentes que precisam saber o status de auth
 */
export { useAuthGuard, useQuickAuthGuard, useRequireAuth } from "@/hooks/use-auth-guard"