"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Crown, Star, Zap, Shield, TrendingUp } from "lucide-react"

interface PremiumBannerProps {
  className?: string
}

export function PremiumBanner({ className }: PremiumBannerProps) {
  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 border-0 shadow-xl ${className}`}>
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-red-600/20"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

      <CardContent className="relative p-4 lg:p-6 text-white">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Crown className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-bold">Torne-se Premium</h3>
              <p className="text-orange-100 text-xs lg:text-sm">Desbloqueie todo o potencial</p>
            </div>
          </div>
          <div className="bg-yellow-400 text-orange-900 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            🔥 OFERTA
          </div>
        </div>

        {/* Lista de benefícios */}
        <div className="space-y-2 mb-4 lg:mb-6">
          <div className="flex items-center gap-2 text-xs lg:text-sm">
            <Star className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-300 fill-current" />
            <span>Anúncios em destaque</span>
          </div>
          <div className="flex items-center gap-2 text-xs lg:text-sm">
            <Zap className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-300" />
            <span>Estatísticas avançadas</span>
          </div>
          <div className="flex items-center gap-2 text-xs lg:text-sm">
            <Shield className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-300" />
            <span>Suporte prioritário</span>
          </div>
          <div className="flex items-center gap-2 text-xs lg:text-sm">
            <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-300" />
            <span>Mais vendas garantidas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 