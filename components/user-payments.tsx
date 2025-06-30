"use client"

import { DashboardCobrancas } from "@/components/dashboard-cobrancas"

interface UserPaymentsProps {
  userId: string
  userEmail: string
}

export function UserPayments({ userId, userEmail }: UserPaymentsProps) {
  // Componente simplificado que usa o novo dashboard automático
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Sistema de Pagamentos</h2>
        <p className="text-gray-600">Visualize todas as suas cobranças automaticamente</p>
      </div>
      
      <DashboardCobrancas />
    </div>
  )
} 