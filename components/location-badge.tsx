"use client"

import { useState } from "react"
import { MapPin, Loader2, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocation } from "@/hooks/use-location"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface LocationBadgeProps {
  variant?: "navbar" | "sidebar"
  showIcon?: boolean
}

export function LocationBadge({ variant = "navbar", showIcon = true }: LocationBadgeProps) {
  const { location, loading, error, requestLocation, hasPermission } = useLocation()
  const [showDetails, setShowDetails] = useState(false)

  // Se não há localização e não está carregando, não mostrar nada
  if (!location && !loading && !error) {
    return null
  }

  // Versão para navbar (mais compacta)
  if (variant === "navbar") {
    return (
      <TooltipProvider>
        <Popover open={showDetails} onOpenChange={setShowDetails}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1 text-white" />
              ) : error ? (
                <MapPin className="h-3 w-3 mr-1 text-white" />
              ) : (
                showIcon && <MapPin className="h-3 w-3 mr-1 text-white" />
              )}
              
              <span className="text-xs truncate max-w-32">
                {loading ? (
                  "..."
                ) : error ? (
                  "Local"
                ) : location ? (
                  `${location.city}, ${location.stateCode}`
                ) : (
                  "Local"
                )}
              </span>
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-72 p-3" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Sua Localização</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Obtendo sua localização...
                </div>
              ) : error ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">{error}</p>
                  <Button
                    onClick={requestLocation}
                    size="sm"
                    className="w-full"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Permitir Localização
                  </Button>
                </div>
              ) : location ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <MapPin className="h-3 w-3" />
                      <span className="font-medium">Localização detectada</span>
                    </div>
                    <p className="text-gray-700">
                      <strong>{location.city}</strong>, {location.state}
                    </p>
                    <p className="text-xs text-gray-500">
                      {location.country}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={requestLocation}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Atualizar
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Usamos sua localização para mostrar veículos próximos a você
                  </p>
                </div>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    )
  }

  // Versão para sidebar (mais detalhada)
  return (
    <div className="px-3 py-2 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        ) : error ? (
          <MapPin className="h-4 w-4 text-red-500" />
        ) : (
          <MapPin className="h-4 w-4 text-green-500" />
        )}
        
        <div className="flex-1 min-w-0">
          {loading ? (
            <p className="text-sm text-gray-600">Detectando localização...</p>
          ) : error ? (
            <div>
              <p className="text-xs text-red-600">{error}</p>
              <Button
                onClick={requestLocation}
                size="sm"
                variant="outline"
                className="mt-1"
              >
                Tentar novamente
              </Button>
            </div>
          ) : location ? (
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {location.city}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {location.state}, {location.country}
              </p>
            </div>
          ) : (
            <Button
              onClick={requestLocation}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <MapPin className="h-3 w-3 mr-1" />
              Detectar Localização
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 