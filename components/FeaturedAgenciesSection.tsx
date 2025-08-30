'use client'

import { useState, useEffect } from 'react'
import { Star, MapPin, Clock, Users, TrendingUp, Phone, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { getActiveFeaturedAgencies, type FeaturedAgency } from '@/lib/supabase/featured-agencies'
import Link from 'next/link'

interface FeaturedAgenciesSectionProps {
  maxAgencies?: number
  showTitle?: boolean
}

export default function FeaturedAgenciesSection({ maxAgencies = 10, showTitle = true }: FeaturedAgenciesSectionProps) {
  const [agencies, setAgencies] = useState<FeaturedAgency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const activeAgencies = await getActiveFeaturedAgencies()
        
        // Se não há agências no banco, usar dados de exemplo para teste
        if (activeAgencies.length === 0) {
          const mockAgencies = [
            {
              id: '1',
              agencia_id: 'mock-1',
              title: 'Agência Premium',
              description: 'Especializada em veículos de luxo com atendimento personalizado.',
              highlight_text: 'Melhor atendimento da região',
              image_url: '/placeholder-agency.jpg',
              banner_url: '/placeholder-banner.jpg',
              display_order: 1,
              is_active: true,
              start_date: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              agencia_nome: 'João Silva',
              agencia_email: 'joao@agenciapremium.com',
              agencia_whatsapp: '11999999999',
              agencia_cidade: 'São Paulo',
              agencia_estado: 'SP'
            },
            {
              id: '2',
              agencia_id: 'mock-2',
              title: 'AutoMax Veículos',
              description: 'Mais de 20 anos no mercado com os melhores preços.',
              highlight_text: 'Financiamento facilitado',
              image_url: '/placeholder-agency.jpg',
              banner_url: '/placeholder-banner.jpg',
              display_order: 2,
              is_active: true,
              start_date: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              agencia_nome: 'Maria Santos',
              agencia_email: 'maria@automax.com',
              agencia_whatsapp: '11888888888',
              agencia_cidade: 'Rio de Janeiro',
              agencia_estado: 'RJ'
            }
          ]
          setAgencies(mockAgencies.slice(0, maxAgencies))
        } else {
          setAgencies(activeAgencies.slice(0, maxAgencies))
        }
      } catch (err) {
        console.error('Erro ao carregar agências em destaque:', err)
        // Em caso de erro, usar dados de exemplo
        const mockAgencies = [
          {
            id: '1',
            agencia_id: 'mock-1',
            title: 'Agência Premium',
            description: 'Especializada em veículos de luxo com atendimento personalizado.',
            highlight_text: 'Melhor atendimento da região',
            image_url: '/placeholder-agency.jpg',
            banner_url: '/placeholder-banner.jpg',
            display_order: 1,
            is_active: true,
            start_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            agencia_nome: 'João Silva',
            agencia_email: 'joao@agenciapremium.com',
            agencia_whatsapp: '11999999999',
            agencia_cidade: 'São Paulo',
            agencia_estado: 'SP'
          }
        ]
        setAgencies(mockAgencies.slice(0, maxAgencies))
        setError('Usando dados de exemplo - tabela não encontrada')
      } finally {
        setLoading(false)
      }
    }

    fetchAgencies()
  }, [maxAgencies])

  // Auto-advance carousel every 15 seconds
  useEffect(() => {
    if (agencies.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % agencies.length)
      }, 15000)

      return () => clearInterval(interval)
    }
  }, [agencies.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % agencies.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + agencies.length) % agencies.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const formatWhatsAppUrl = (whatsapp: string, agencyName: string) => {
    const cleanPhone = whatsapp.replace(/\D/g, '')
    const message = encodeURIComponent(`Olá! Vim através do site RX Autos e gostaria de saber mais sobre os veículos da ${agencyName}.`)
    return `https://wa.me/55${cleanPhone}?text=${message}`
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

  if (agencies.length === 0) {
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
          <div className="relative min-h-[400px] md:h-96 overflow-hidden shadow-2xl">
            {/* Slides */}
            <div className="relative h-full">
              {agencies.map((agency, index) => (
                <div
                  key={agency.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {/* Split Layout Container */}
                  <div className="flex flex-col md:flex-row min-h-[400px] md:h-full">
                    {/* Info Section - Mobile: Full width on top, Desktop: 2/3 left */}
                    <div className="w-full md:w-2/3 min-h-[300px] md:h-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 relative overflow-hidden">
                      {/* Gradient blend towards image */}
                      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 md:bg-gradient-to-r md:from-gray-900 md:via-gray-800 md:to-transparent"></div>
                      
                      {/* Content */}
                      <div className="relative z-10 h-full py-4 px-4 md:p-8 lg:p-10">
                        <div className="w-full text-white h-full flex flex-col justify-center">
                          <div className="flex flex-col justify-center py-2 md:py-6">
                            {/* Header Section */}
                            <div className="mb-4 md:mb-6">
                              {/* Featured Badge */}
                              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-2 md:mb-3">
                                ⭐ DESTAQUE
                              </div>

                              {/* Agency Name */}
                              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3 drop-shadow-lg">
                                {agency.agencia_nome}
                              </h3>

                              {/* Title */}
                              <h4 className="text-base md:text-lg lg:text-xl font-semibold mb-2 md:mb-3 text-white/90 drop-shadow-md">
                                {agency.title}
                              </h4>

                              {/* Description */}
                              <p className="text-white/80 mb-0 text-sm md:text-base drop-shadow-sm line-clamp-2">
                                {agency.description}
                              </p>
                            </div>

                            {/* Highlight Text */}
                            {agency.highlight_text && (
                              <div className="mb-4 md:mb-6">
                                <div className="bg-orange-500/20 backdrop-blur-sm rounded-lg p-3 border border-orange-300/30">
                                  <p className="text-orange-200 font-medium text-sm md:text-base text-center">
                                    🌟 {agency.highlight_text}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Location Info */}
                            {(agency.agencia_cidade || agency.agencia_estado) && (
                              <div className="mb-4 md:mb-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                                  <div className="flex items-center justify-center gap-2 mb-1">
                                    <MapPin size={16} className="text-white" />
                                    <span className="font-medium text-white text-sm md:text-base">
                                      {agency.agencia_cidade}{agency.agencia_cidade && agency.agencia_estado && ', '}{agency.agencia_estado}
                                    </span>
                                  </div>
                                  <div className="text-white/70 text-xs md:text-sm">
                                    Localização
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                              {agency.agencia_whatsapp && (
                                <a
                                  href={formatWhatsAppUrl(agency.agencia_whatsapp, agency.agencia_nome || 'Agência')}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                  <MessageCircle size={18} />
                                  <span>Entrar em Contato</span>
                                </a>
                              )}
                              
                              <Link
                                href={`/agencia/${agency.agencia_id}`}
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-semibold text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                              >
                                <TrendingUp size={18} />
                                <span>Ver Estoque</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Image Section - Mobile: Full width on bottom, Desktop: 1/3 right */}
                    <div className="w-full md:w-1/3 min-h-[200px] md:h-full relative overflow-hidden">
                      {agency.image_url ? (
                        <img
                          src={agency.image_url}
                          alt={`${agency.agencia_nome} - Imagem`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder.jpg'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <div className="text-center text-gray-600">
                            <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">{agency.agencia_nome}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay gradient for better text readability on mobile */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            {agencies.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 z-20 backdrop-blur-sm"
                  aria-label="Agência anterior"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 z-20 backdrop-blur-sm"
                  aria-label="Próxima agência"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {agencies.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {agencies.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-white shadow-lg'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Ir para agência ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}