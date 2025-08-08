"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  id: string
  nome_completo?: string
  cpf?: string
  whatsapp?: string
  email?: string
  plano_atual?: string
  plano_data_inicio?: string
  plano_data_fim?: string
  // asaas_customer_id removido - sistema de pagamentos desabilitado
  [key: string]: any
}

interface UserContextData {
  user: any
  profile: UserProfile | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  refreshUserData: () => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextData | null>(null)

interface UserProviderProps {
  children: React.ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar usuário autenticado
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !authUser) {
        setUser(null)
        setProfile(null)
        return
      }

      setUser(authUser)

      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileData && !profileError) {
        setProfile(profileData)
      } else {
        setProfile(null)
      }

    } catch (error: any) {
      console.error("Erro ao carregar dados do usuário:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const refreshUserData = async () => {
    await loadUserData()
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  useEffect(() => {
    loadUserData()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await loadUserData()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const value: UserContextData = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    refreshUserData,
    logout
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser deve ser usado dentro de um UserProvider")
  }
  return context
}