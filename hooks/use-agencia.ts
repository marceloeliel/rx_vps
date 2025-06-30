"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  getAgenciaData,
  upsertAgencia,
  deleteAgencia,
  userHasAgencia,
  type DadosAgencia,
  type DadosAgenciaInput,
} from "@/lib/supabase/agencias"

export function useAgencia(userId?: string) {
  const [agencia, setAgencia] = useState<DadosAgencia | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasAgencia, setHasAgencia] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Carregar dados da agência
  const loadAgencia = async (id?: string) => {
    if (!id) return

    setLoading(true)
    try {
      const data = await getAgenciaData(id)
      setAgencia(data)
      setHasAgencia(data !== null)
    } catch (error) {
      console.error("Erro ao carregar agência:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados da agência.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Salvar dados da agência
  const saveAgencia = async (data: DadosAgenciaInput) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não identificado.",
      })
      return false
    }

    setSaving(true)
    try {
      const result = await upsertAgencia(userId, data)
      if (result) {
        setAgencia(result)
        setHasAgencia(true)
        toast({
          title: "Sucesso!",
          description: "Dados da agência salvos com sucesso.",
        })
        return true
      } else {
        throw new Error("Erro ao salvar dados")
      }
    } catch (error) {
      console.error("Erro ao salvar agência:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar os dados da agência.",
      })
      return false
    } finally {
      setSaving(false)
    }
  }

  // Deletar agência
  const removeAgencia = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não identificado.",
      })
      return false
    }

    setSaving(true)
    try {
      const success = await deleteAgencia(userId)
      if (success) {
        setAgencia(null)
        setHasAgencia(false)
        toast({
          title: "Sucesso!",
          description: "Agência removida com sucesso.",
        })
        return true
      } else {
        throw new Error("Erro ao deletar agência")
      }
    } catch (error) {
      console.error("Erro ao deletar agência:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover a agência.",
      })
      return false
    } finally {
      setSaving(false)
    }
  }

  // Verificar se usuário tem agência
  const checkHasAgencia = async (id?: string) => {
    if (!id) return

    try {
      const has = await userHasAgencia(id)
      setHasAgencia(has)
    } catch (error) {
      console.error("Erro ao verificar agência:", error)
    }
  }

  // Recarregar dados
  const refresh = () => {
    if (userId) {
      loadAgencia(userId)
    }
  }

  // Carregar dados quando userId mudar
  useEffect(() => {
    if (userId) {
      loadAgencia(userId)
    }
  }, [userId])

  // Escutar mudanças em tempo real
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel("agencia-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dados_agencia",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Mudança detectada na agência:", payload)
          if (payload.eventType === "DELETE") {
            setAgencia(null)
            setHasAgencia(false)
          } else {
            setAgencia(payload.new as DadosAgencia)
            setHasAgencia(true)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return {
    agencia,
    loading,
    saving,
    hasAgencia,
    saveAgencia,
    removeAgencia,
    checkHasAgencia,
    refresh,
  }
}
