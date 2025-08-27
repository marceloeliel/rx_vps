"use client"
import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"

interface AuthGuardOptions {
  redirectTo?: string
  checkInterval?: number // em milissegundos
  enableAutoCheck?: boolean
  showToastOnLogout?: boolean
}

interface AuthGuardState {
  user: User | null
  profile: any | null
  isValid: boolean
  isLoading: boolean
  lastCheck: Date | null
}

const DEFAULT_OPTIONS: AuthGuardOptions = {
  redirectTo: "/login",
  checkInterval: 30000, // 30 segundos
  enableAutoCheck: true,
  showToastOnLogout: true
}

/**
 * Hook para verificação automática do status do usuário no Supabase
 * Garante que usuários excluídos ou inativos sejam deslogados automaticamente
 */
export function useAuthGuard(options: AuthGuardOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  
  const [state, setState] = useState<AuthGuardState>({
    user: null,
    profile: null,
    isValid: false,
    isLoading: true,
    lastCheck: null
  })

  // Função para fazer logout automático
  const performAutoLogout = useCallback(async (reason: string) => {
    console.warn(`🚨 [AUTH-GUARD] Logout automático: ${reason}`)
    
    try {
      await supabase.auth.signOut()
      
      if (opts.showToastOnLogout) {
        toast({
          variant: "destructive",
          title: "Sessão encerrada",
          description: "Sua sessão foi encerrada por motivos de segurança.",
          duration: 5000
        })
      }
      
      // Limpar estado local
      setState({
        user: null,
        profile: null,
        isValid: false,
        isLoading: false,
        lastCheck: new Date()
      })
      
      // Redirecionar após um pequeno delay
      setTimeout(() => {
        router.push(opts.redirectTo!)
      }, 1000)
      
    } catch (error) {
      console.error("❌ [AUTH-GUARD] Erro ao fazer logout:", error)
    }
  }, [supabase, router, toast, opts])

  // Função para verificar se o usuário ainda é válido
  const checkUserValidity = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🔍 [AUTH-GUARD] Verificando validade do usuário...")
      
      // 1. Verificar se ainda está autenticado no Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error("❌ [AUTH-GUARD] Erro de autenticação:", authError)
        await performAutoLogout("Erro de autenticação")
        return false
      }
      
      if (!user) {
        console.log("⚠️ [AUTH-GUARD] Usuário não autenticado")
        setState(prev => ({ ...prev, isValid: false, isLoading: false, lastCheck: new Date() }))
        return false
      }
      
      // 2. Verificar se o perfil ainda existe na tabela profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Perfil não encontrado - usuário foi excluído
          console.warn("⚠️ [AUTH-GUARD] Perfil não encontrado - usuário excluído")
          await performAutoLogout("Perfil de usuário não encontrado")
          return false
        } else {
          console.error("❌ [AUTH-GUARD] Erro ao buscar perfil:", profileError)
          // Em caso de erro de rede, não fazer logout imediatamente
          return true
        }
      }
      
      // 3. Verificar se o perfil está ativo (campo status removido - não existe na tabela)
      // if (profile && profile.status && profile.status === 'inactive') {
      //   console.warn("⚠️ [AUTH-GUARD] Perfil inativo")
      //   await performAutoLogout("Conta desativada")
      //   return false
      // }
      
      // 4. Verificar se o email ainda é válido (não foi alterado externamente)
      if (profile && profile.email && profile.email !== user.email) {
        console.warn("⚠️ [AUTH-GUARD] Email do perfil não confere")
        await performAutoLogout("Inconsistência nos dados da conta")
        return false
      }
      
      // Tudo OK - atualizar estado
      setState({
        user,
        profile,
        isValid: true,
        isLoading: false,
        lastCheck: new Date()
      })
      
      console.log("✅ [AUTH-GUARD] Usuário válido")
      return true
      
    } catch (error) {
      console.error("❌ [AUTH-GUARD] Erro inesperado na verificação:", error)
      // Em caso de erro inesperado, não fazer logout imediatamente
      return true
    }
  }, [supabase, performAutoLogout])

  // Verificação inicial (apenas se enableAutoCheck estiver ativo)
  useEffect(() => {
    if (opts.enableAutoCheck) {
      checkUserValidity()
    } else {
      // Para páginas públicas, apenas verificar se há usuário logado sem validação completa
      const checkBasicAuth = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          setState({
            user,
            profile: null,
            isValid: !!user,
            isLoading: false,
            lastCheck: new Date()
          })
        } catch (error) {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      }
      checkBasicAuth()
    }
  }, [opts.enableAutoCheck])

  // Verificação periódica automática
  useEffect(() => {
    if (!opts.enableAutoCheck) return
    
    const interval = setInterval(() => {
      // Só verificar se o usuário está logado
      if (state.user && state.isValid) {
        checkUserValidity()
      }
    }, opts.checkInterval)
    
    return () => clearInterval(interval)
  }, [opts.enableAutoCheck, opts.checkInterval, state.user, state.isValid, checkUserValidity])

  // Listener para mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 [AUTH-GUARD] Auth state changed: ${event}`)
        
        if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            isValid: false,
            isLoading: false,
            lastCheck: new Date()
          })
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Verificar validade do usuário recém logado
          await checkUserValidity()
        } else if (event === 'TOKEN_REFRESHED') {
          // Verificar validade após refresh do token
          await checkUserValidity()
        }
      }
    )
    
    return () => subscription.unsubscribe()
  }, [supabase, checkUserValidity])

  // Função manual para forçar verificação
  const forceCheck = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    await checkUserValidity()
  }, [checkUserValidity])

  return {
    // Estado atual
    user: state.user,
    profile: state.profile,
    isAuthenticated: !!state.user && state.isValid,
    isValid: state.isValid,
    isLoading: state.isLoading,
    lastCheck: state.lastCheck,
    
    // Funções
    forceCheck,
    performLogout: () => performAutoLogout("Logout manual")
  }
}

/**
 * Hook simplificado para verificação rápida de autenticação
 * Usa o useAuthGuard internamente mas retorna apenas o essencial
 */
export function useQuickAuthGuard() {
  const { isAuthenticated, isLoading, user } = useAuthGuard({
    enableAutoCheck: true,
    checkInterval: 60000, // 1 minuto
    showToastOnLogout: false
  })
  
  return {
    isAuthenticated,
    isLoading,
    userId: user?.id,
    userEmail: user?.email
  }
}

/**
 * Hook para páginas que requerem autenticação
 * Redireciona automaticamente se não autenticado
 */
export function useRequireAuth(redirectTo: string = "/login") {
  const authGuard = useAuthGuard({ 
    redirectTo,
    enableAutoCheck: true,
    showToastOnLogout: true
  })
  
  const router = useRouter()
  
  useEffect(() => {
    if (!authGuard.isLoading && !authGuard.isAuthenticated) {
      router.push(redirectTo)
    }
  }, [authGuard.isLoading, authGuard.isAuthenticated, router, redirectTo])
  
  return authGuard
}