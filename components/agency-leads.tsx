"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { getAgencyLeads, getAgencyLeadsStats, type LeadWithUserData } from "@/lib/supabase/vehicle-favorites"
import { Heart, MessageCircle, Phone, Mail, Calendar, MapPin, Car, DollarSign } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AgencyLeadsProps {
  agencyId: string
}

interface LeadsStats {
  total: number
  thisMonth: number
  favorites: number
  contacts: number
}

const interestTypeConfig = {
  favorite: {
    label: "Favorito",
    icon: Heart,
    color: "bg-red-100 text-red-800",
    iconColor: "text-red-600"
  },
  contact_whatsapp: {
    label: "WhatsApp",
    icon: Phone,
    color: "bg-green-100 text-green-800",
    iconColor: "text-green-600"
  },
  contact_email: {
    label: "E-mail",
    icon: Mail,
    color: "bg-purple-100 text-purple-800",
    iconColor: "text-purple-600"
  },
  view_details: {
    label: "Visualização",
    icon: MessageCircle,
    color: "bg-blue-100 text-blue-800",
    iconColor: "text-blue-600"
  },
  simulation: {
    label: "Simulação",
    icon: DollarSign,
    color: "bg-orange-100 text-orange-800",
    iconColor: "text-orange-600"
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

export function AgencyLeads({ agencyId }: AgencyLeadsProps) {
  const [leads, setLeads] = useState<LeadWithUserData[]>([])
  const [stats, setStats] = useState<LeadsStats>({
    total: 0,
    thisMonth: 0,
    favorites: 0,
    contacts: 0
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadLeads()
    loadStats()
  }, [agencyId])

  const loadLeads = async () => {
    try {
      setLoading(true)
      const { data, error } = await getAgencyLeads(agencyId)
      
      if (error) {
        console.error('Erro ao carregar leads:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os leads",
          variant: "destructive"
        })
        return
      }

      setLeads(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar leads",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await getAgencyLeadsStats(agencyId)
      setStats(statsData)
    } catch (error) {
      console.error('❌ [LEADS] Erro ao carregar estatísticas:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      })
    }
  }

  const handleContactLead = (lead: LeadWithUserData) => {
    if (lead.user_profile.whatsapp) {
      const message = `Olá ${lead.user_profile.nome_completo}! Vi que você demonstrou interesse no ${lead.vehicle.marca_nome} ${lead.vehicle.modelo_nome} ${lead.vehicle.ano_fabricacao}. Gostaria de conversar sobre o veículo?`
      const whatsappUrl = `https://wa.me/55${lead.user_profile.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    } else if (lead.user_profile.email) {
      const subject = `Interesse em ${lead.vehicle.marca_nome} ${lead.vehicle.modelo_nome}`
      const body = `Olá ${lead.user_profile.nome_completo}!\n\nVi que você demonstrou interesse no ${lead.vehicle.marca_nome} ${lead.vehicle.modelo_nome} ${lead.vehicle.ano_fabricacao}.\n\nGostaria de conversar sobre o veículo e esclarecer suas dúvidas.\n\nAguardo seu contato!`
      const mailtoUrl = `mailto:${lead.user_profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.open(mailtoUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Este Mês</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favoritos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.favorites}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contatos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.contacts}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Phone className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Leads Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
              <p className="text-gray-600">Quando usuários demonstrarem interesse nos seus veículos, eles aparecerão aqui.</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {leads.map((lead) => {
                  const config = interestTypeConfig[lead.lead_type as keyof typeof interestTypeConfig] || interestTypeConfig.favorite
                  const IconComponent = config.icon

                  return (
                    <div key={lead.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Avatar do usuário */}
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {lead.user_profile.nome_completo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            {/* Informações do usuário */}
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900 truncate">
                                {lead.user_profile.nome_completo}
                              </h4>
                              <Badge className={config.color}>
                                <IconComponent className={`h-3 w-3 mr-1 ${config.iconColor}`} />
                                {config.label}
                              </Badge>
                            </div>

                            {/* Informações de contato */}
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              {lead.user_profile.whatsapp && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {lead.user_profile.whatsapp}
                                </span>
                              )}
                              {lead.user_profile.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {lead.user_profile.email}
                                </span>
                              )}
                              {lead.user_profile.cidade && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {lead.user_profile.cidade}, {lead.user_profile.estado}
                                </span>
                              )}
                            </div>

                            {/* Informações do veículo */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Car className="h-4 w-4 text-gray-600" />
                                <span className="font-medium text-gray-900">
                                  {lead.vehicle.marca_nome} {lead.vehicle.modelo_nome} {lead.vehicle.ano_fabricacao}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {formatPrice(lead.vehicle.preco)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(lead.created_at), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Mensagem do lead */}
                            {lead.contact_info && lead.contact_info.message && (
                              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                <p className="text-sm text-gray-700 italic">"{lead.contact_info.message}"</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleContactLead(lead)}
                            disabled={!lead.user_profile.whatsapp && !lead.user_profile.email}
                          >
                            {lead.user_profile.whatsapp ? (
                              <>
                                <Phone className="h-3 w-3 mr-1" />
                                WhatsApp
                              </>
                            ) : lead.user_profile.email ? (
                              <>
                                <Mail className="h-3 w-3 mr-1" />
                                E-mail
                              </>
                            ) : (
                              'Sem contato'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}