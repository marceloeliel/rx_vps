'use client'

import { useState, useEffect } from 'react'
import { Star, MapPin, Clock, Users, TrendingUp, Phone, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { getActivePaidAds, type PaidAd } from '@/lib/supabase/paid-ads'

interface PaidAdsSectionProps {
  maxAds?: number
  showTitle?: boolean
}

export default function PaidAdsSection({ maxAds = 10, showTitle = true }: PaidAdsSectionProps) {
  const [ads, setAds] = useState<PaidAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const activeAds = await getActivePaidAds()
        setAds(activeAds.slice(0, maxAds))
      } catch (err) {
        console.error('Erro ao carregar anúncios pagos:', err)
        setError('Erro ao carregar anúncios. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [maxAds])

  // Auto-advance carousel every 15 seconds
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length)
      }, 15000)

      return () => clearInterval(interval)
    }
  }, [ads.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {showTitle && (
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Agências em Destaque
            </h2>
          )}
          
          <div className="relative h-[580px] md:h-96 bg-gray-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full animate-shimmer"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {showTitle && (
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Agências em Destaque
            </h2>
          )}
          
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (ads.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {showTitle && (
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Agências em Destaque
            </h2>
          )}
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Nenhuma agência em destaque no momento.
            </p>
            <p className="text-sm text-gray-500">
              Interessado em destacar sua agência? Entre em contato conosco!
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div>
      <section className="pt-16 pb-0 bg-gray-50">
        <div className="w-full">
          {showTitle && (
            <div className="container mx-auto px-4 mb-12">
              <h2 className="text-3xl font-bold text-center text-gray-800">
                Agências em Destaque
              </h2>
            </div>
          )}
          
          {/* Carousel Container - Full Width */}
          <div className="relative h-[580px] md:h-96 overflow-hidden shadow-2xl">
          {/* Slides */}
          <div className="relative h-full">
            {ads.map((ad, index) => (
                             <div
                 key={ad.id}
                 className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                   index === currentIndex ? 'opacity-100' : 'opacity-0'
                 }`}
               >
                                  {/* Split Layout Container */}
                 <div className="flex flex-col md:flex-row h-full">
                   {/* Info Section - Mobile: Full width on top, Desktop: 2/3 left */}
                   <div className="w-full md:w-2/3 h-96 md:h-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 relative overflow-hidden">
                     {/* Gradient blend towards image */}
                     <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 md:bg-gradient-to-r md:from-gray-900 md:via-gray-800 md:to-transparent"></div>
                     
                     {/* Content */}
                     <div className="relative z-10 h-full py-8 px-6 md:p-8 lg:p-10">
                       <div className="w-full text-white h-full flex flex-col justify-center">
                         <div className="flex flex-col justify-center py-6">
                           {/* Header Section */}
                           <div className="mb-6">
                             {/* Featured Badge */}
                             {ad.is_featured && (
                               <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                                 ⭐ DESTAQUE
                               </div>
                             )}

                             {/* Company Name */}
                             <h3 className="text-2xl md:text-2xl lg:text-3xl font-bold mb-3 drop-shadow-lg">
                               {ad.company_name}
                             </h3>

                             {/* Title */}
                             <h4 className="text-lg md:text-lg lg:text-xl font-semibold mb-3 text-white/90 drop-shadow-md">
                               {ad.title}
                             </h4>

                             {/* Description */}
                             <p className="text-white/80 mb-0 text-base drop-shadow-sm line-clamp-2">
                               {ad.description}
                             </p>
                           </div>

                           {/* Info Cards */}
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                             <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                               <div className="flex items-center justify-center gap-1 mb-1">
                                 <Star size={16} className="text-yellow-300 fill-yellow-300" />
                                 <span className="font-bold text-white text-base">{ad.rating}</span>
                               </div>
                               <div className="text-white/70 text-sm">
                                 {ad.review_count} avaliações
                               </div>
                             </div>

                             <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                               <div className="flex items-center justify-center gap-1 mb-1">
                                 <Users size={16} className="text-white" />
                                 <span className="font-bold text-white text-base">{ad.vehicle_count}+</span>
                               </div>
                               <div className="text-white/70 text-sm">Veículos</div>
                             </div>

                             <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                               <div className="flex items-center justify-center gap-1 mb-1">
                                 <MapPin size={16} className="text-white" />
                                 <span className="font-bold text-white text-sm">{ad.location}</span>
                               </div>
                               <div className="text-white/70 text-sm">Local</div>
                             </div>

                             <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                               <div className="flex items-center justify-center gap-1 mb-1">
                                 <TrendingUp size={16} className="text-green-300" />
                                 <span className="font-bold text-white text-base">{ad.satisfaction_rate}%</span>
                               </div>
                               <div className="text-white/70 text-sm">Satisfação</div>
                             </div>
                           </div>

                           {/* Action Buttons */}
                           <div className="flex gap-3 md:gap-4">
                             <button 
                               onClick={() => {
                                 // Usar WhatsApp da agência se disponível, senão usar o número da RX
                                 const telefone = ad.agencia_whatsapp || ad.agencia_telefone || '5573999377300'
                                 const message = `Olá! Vim do RX Veículos e tenho interesse nos veículos da ${ad.company_name}.`
                                 const whatsappUrl = `https://wa.me/${telefone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
                                 window.open(whatsappUrl, '_blank')
                               }}
                               className="group relative flex-1 px-4 md:px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 overflow-hidden text-base"
                               style={{ backgroundColor: ad.primary_color }}
                             >
                               <div className="flex items-center justify-center gap-2">
                                 <Phone size={18} />
                                 <span>Entrar em Contato</span>
                               </div>
                               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                             </button>

                             <button 
                               onClick={() => {
                                 // Direcionar para página de veículos filtrada pela agência
                                 if (ad.agencia_user_id) {
                                   window.location.href = `/veiculos?agencia=${ad.agencia_user_id}`
                                 } else {
                                   window.location.href = '/veiculos'
                                 }
                               }}
                               className="group relative flex-1 px-4 md:px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 text-base"
                             >
                               <div className="flex items-center justify-center gap-2">
                                 <Eye size={18} />
                                 <span>Ver Estoque</span>
                               </div>
                             </button>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Image Section - Mobile: Full width below, Desktop: 1/3 right */}
                   <div className="w-full md:w-1/3 flex-1 md:h-full relative overflow-hidden">
                     <img 
                       src={ad.image_url} 
                       alt={ad.company_name}
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement
                         target.src = '/images/placeholder-car.jpg'
                       }}
                     />
                     {/* Subtle gradient overlay from left */}
                     <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-gray-900/20 via-transparent to-transparent"></div>
                   </div>
                 </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {ads.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                aria-label="Slide anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 z-20"
              >
                <ChevronLeft size={24} />
              </button>
              
              <button
                onClick={nextSlide}
                aria-label="Próximo slide"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 z-20"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {ads.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {ads.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Ir para slide ${index + 1}`}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        </div>
      </section>

      {/* CTA Section - Full Width Bar */}
      {ads.length > 0 && (
        <section className="py-6 sm:py-8 bg-white relative overflow-hidden shadow-lg">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23000000 fillOpacity=0.02%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>

          <div className="relative z-10 h-full flex items-center justify-center px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-7xl gap-4">
              
              {/* Conteúdo */}
              <div className="text-center sm:text-left text-gray-800">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold">Destaque Sua Agência!</h3>
                  <div className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full border border-orange-200 hidden sm:block">
                    OPORTUNIDADE
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm sm:text-base">
                  Apareça aqui e alcance milhares de clientes potenciais em todo o Brasil
                </p>
              </div>
              
              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
                <button 
                  onClick={() => {
                    const message = `Olá! Gostaria de informações sobre como destacar minha agência na plataforma RX Veículos.`
                    const whatsappUrl = `https://wa.me/5573999377300?text=${encodeURIComponent(message)}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  className="bg-orange-600 text-white hover:bg-orange-700 px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group rounded-lg flex items-center justify-center gap-2"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Phone size={16} />
                    Falar com Vendas
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
                
                <button 
                  onClick={() => {
                    window.location.href = '/planos'
                  }}
                  className="bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 px-6 py-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105 rounded-lg flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  Ver Planos
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
} 