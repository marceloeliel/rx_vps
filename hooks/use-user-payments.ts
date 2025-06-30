import { useState, useEffect } from 'react'

interface Payment {
  id: string
  value: number
  status: string
  billingType: string
  description: string
  dueDate: string
  dateCreated: string
  invoiceUrl?: string
  invoiceNumber?: string
  pixTransaction?: {
    qrCode: {
      payload: string
      encodedImage: string
    }
  }
  bankSlipUrl?: string
}

interface UserPaymentsData {
  userId: string
  totalPayments: number
  pendingPayments: number
  hasPendingPayments: boolean
  payments: Payment[]
  pendingOnly: Payment[]
}

export function useUserPayments(userId?: string, userEmail?: string) {
  const [data, setData] = useState<UserPaymentsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = async () => {
    if (!userId || !userEmail) {
      setError("UserId e email são obrigatórios")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🔍 Buscando pagamentos para:", { userId, userEmail })
      
      const response = await fetch(`/api/asaas/payments/user/${userId}?email=${encodeURIComponent(userEmail)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ${response.status}`)
      }

      const paymentsData = await response.json()
      console.log("📊 Pagamentos recebidos:", paymentsData)
      
      setData(paymentsData)
    } catch (err: any) {
      console.error("❌ Erro ao buscar pagamentos:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const checkPendingPayments = async (): Promise<boolean> => {
    if (!userId || !userEmail) return false

    try {
      const response = await fetch(`/api/asaas/payments/user/${userId}?email=${encodeURIComponent(userEmail)}&status=PENDING`)
      
      if (!response.ok) return false

      const data = await response.json()
      return data.hasPendingPayments
    } catch (error) {
      console.error("❌ Erro ao verificar pagamentos pendentes:", error)
      return false
    }
  }

  const refreshPayments = () => {
    fetchPayments()
  }

  useEffect(() => {
    if (userId && userEmail) {
      fetchPayments()
    }
  }, [userId, userEmail])

  return {
    data,
    loading,
    error,
    refreshPayments,
    checkPendingPayments,
    // Helpers
    hasPendingPayments: data?.hasPendingPayments || false,
    totalPayments: data?.totalPayments || 0,
    pendingCount: data?.pendingPayments || 0,
    payments: data?.payments || [],
    pendingPayments: data?.pendingOnly || []
  }
} 