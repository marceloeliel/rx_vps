"use client"

// Componente DashboardCobrancas removido - sistema de pagamentos desabilitado
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MinhasCobrancasPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header fixo */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 lg:px-6 lg:py-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-1 sm:p-2 flex-shrink-0">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Minhas Cobranças</h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 line-clamp-2">
                Acompanhe o status de todos os seus pagamentos
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal com margens adequadas */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:px-6 lg:py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sistema de Pagamentos Desabilitado</h2>
          <p className="text-gray-600">
            O sistema de cobranças está temporariamente desabilitado. Entre em contato conosco para mais informações.
          </p>
        </div>
      </main>
    </div>
  )
}