'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Gift, Clock, Shield, Sparkles } from 'lucide-react'
import { getActiveCampaign, type PromotionalCampaign } from '@/lib/supabase/promotions'

interface PromotionalBannerProps {
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  showTimer?: boolean
}

export function PromotionalBanner({ 
  className = '', 
  variant = 'default',
  showTimer = true 
}: PromotionalBannerProps) {
  const [campaign, setCampaign] = useState<PromotionalCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const activeCampaign = await getActiveCampaign()
        setCampaign(activeCampaign)
      } catch (error) {
        console.error('Erro ao buscar campanha:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaign()
  }, [])

  useEffect(() => {
    if (!campaign?.end_date || !showTimer) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const endTime = new Date(campaign.end_date!).getTime()
      const difference = endTime - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`)
        } else {
          setTimeLeft(`${minutes}m`)
        }
      } else {
        setTimeLeft('Expirada')
      }
    }

    updateTimer()
    const timer = setInterval(updateTimer, 60000) // Atualiza a cada minuto

    return () => clearInterval(timer)
  }, [campaign?.end_date, showTimer])

  // Se está carregando ou não há campanha ativa, não mostra nada
  if (loading || !campaign) {
    return null
  }

  // Versão minimal
  if (variant === 'minimal') {
    return (
      <div className={`text-center ${className}`}>
        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1">
          <Gift className="h-3 w-3 mr-1" />
          {campaign.free_days} dias gratuitos
        </Badge>
      </div>
    )
  }

  // Versão compact
  if (variant === 'compact') {
    return (
      <Card className={`border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Gift className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 text-sm">
                🎉 {campaign.free_days} Dias Gratuitos!
              </h3>
              <p className="text-green-700 text-xs">
                Cadastre-se com CPF/CNPJ válido e ganhe acesso completo
              </p>
            </div>
            {showTimer && timeLeft && timeLeft !== 'Expirada' && (
              <div className="text-right">
                <div className="text-green-600 text-xs font-medium">Termina em</div>
                <div className="text-green-800 text-sm font-bold">{timeLeft}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Versão default (completa)
  return (
    <Card className={`relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 ${className}`}>
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-500/20 to-teal-600/20"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      
      {/* Sparkles animados */}
      <div className="absolute top-4 left-4">
        <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
      </div>
      <div className="absolute top-8 right-8">
        <Sparkles className="h-3 w-3 text-yellow-200 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <CardContent className="relative p-6 text-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Gift className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">🎉 Promoção Especial!</h2>
              <p className="text-green-100 text-sm">{campaign.name}</p>
            </div>
          </div>
          
          {showTimer && timeLeft && timeLeft !== 'Expirada' && (
            <div className="text-center bg-white/15 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-1 text-yellow-300 text-xs mb-1">
                <Clock className="h-3 w-3" />
                Termina em
              </div>
              <div className="text-white font-bold text-sm">{timeLeft}</div>
            </div>
          )}
        </div>

        {/* Oferta principal */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-yellow-300 mb-2">
            {campaign.free_days} DIAS
          </div>
          <div className="text-xl font-semibold mb-2">
            Acesso Gratuito Completo
          </div>
          <p className="text-green-100 text-sm">
            {campaign.description || 'Cadastre-se agora e aproveite todos os recursos da plataforma'}
          </p>
        </div>

        {/* Benefícios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-300 flex-shrink-0" />
            <span className="text-green-100">Painel completo de gestão</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-300 flex-shrink-0" />
            <span className="text-green-100">Anúncios ilimitados</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-300 flex-shrink-0" />
            <span className="text-green-100">Ferramentas profissionais</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-300 flex-shrink-0" />
            <span className="text-green-100">Suporte especializado</span>
          </div>
        </div>

        {/* Requisitos */}
        {campaign.requires_valid_document && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-yellow-300">Requisito</span>
            </div>
            <p className="text-xs text-green-100">
              É necessário informar CPF ou CNPJ válido durante o cadastro para ativar a promoção.
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center mt-4">
          <p className="text-xs text-green-200">
            ✨ Sem compromisso • Cancele quando quiser • Sem cartão de crédito
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default PromotionalBanner 