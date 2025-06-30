import { Loader2, Car } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  submessage?: string
  showLogo?: boolean
}

export function LoadingScreen({ 
  message = "Carregando...", 
  submessage = "Aguarde enquanto preparamos tudo para você",
  showLogo = true 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-6">
        {showLogo && (
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">RX Autos</div>
              <div className="text-sm text-gray-600">Marketplace de Veículos</div>
            </div>
          </div>
        )}
        
        {/* Spinner principal */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Mensagens */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
          <p className="text-sm text-gray-600">{submessage}</p>
        </div>
        
        {/* Barra de progresso animada */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full animate-pulse"
            style={{
              width: '60%',
              animation: 'loading-bar 2s ease-in-out infinite'
            }}
          ></div>
        </div>
        
        {/* Dicas */}
        <div className="text-xs text-gray-500 mt-4">
          💡 Dica: Mantenha seus dados atualizados para uma experiência melhor
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 10%; }
          50% { width: 80%; }
          100% { width: 10%; }
        }
      `}</style>
    </div>
  )
}

// Componente de loading inline para usar dentro de outras páginas
export function InlineLoading({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
        <span className="text-sm text-gray-600">{message}</span>
      </div>
    </div>
  )
} 