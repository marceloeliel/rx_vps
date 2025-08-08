"use client"

import { useState, useEffect } from "react"
import { checkTrialPeriod, type TrialPeriod } from "@/lib/supabase/trial"
import { useUserData } from "@/hooks/use-user-data"

interface TrialData {
  isInTrial: boolean
  trialPeriod: TrialPeriod | null
  daysRemaining: number | null
  loading: boolean
  error: string | null
}

export function useTrial() {
  const { user, loading: userLoading } = useUserData()
  const [trialData, setTrialData] = useState<TrialData>({
    isInTrial: false,
    trialPeriod: null,
    daysRemaining: null,
    loading: true,
    error: null
  })

  const loadTrialData = async () => {
    if (!user?.id) {
      setTrialData({
        isInTrial: false,
        trialPeriod: null,
        daysRemaining: null,
        loading: false,
        error: null
      })
      return
    }

    try {
      setTrialData(prev => ({ ...prev, loading: true, error: null }))
      
      const result = await checkTrialPeriod(user.id)
      
      setTrialData({
        isInTrial: result.isInTrial,
        trialPeriod: result.trialPeriod,
        daysRemaining: result.daysRemaining,
        loading: false,
        error: null
      })
    } catch (error: any) {
      console.error('Erro ao carregar dados do trial:', error)
      setTrialData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }

  const refreshTrialData = () => {
    loadTrialData()
  }

  useEffect(() => {
    if (!userLoading) {
      loadTrialData()
    }
  }, [user?.id, userLoading])

  return {
    ...trialData,
    refreshTrialData
  }
}