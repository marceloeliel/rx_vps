"use client"

import { DashboardCobrancas } from "@/components/dashboard-cobrancas"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MinhasCobrancasPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 lg:px-6 lg:py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Minhas Cobranças</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">
                Acompanhe o status de todos os seus pagamentos
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal com margens adequadas */}
      <main className="max-w-7xl mx-auto px-4 py-6 lg:px-6 lg:py-8">
        <DashboardCobrancas />
      </main>
    </div>
  )
} 