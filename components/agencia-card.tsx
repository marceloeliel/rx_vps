import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Globe, Users, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { DadosAgencia } from "@/lib/supabase/agencias"

interface AgenciaCardProps {
  agencia: DadosAgencia
  showFullDetails?: boolean
  showContactInfo?: boolean
  className?: string
}

export function AgenciaCard({
  agencia,
  showFullDetails = false,
  showContactInfo = true,
  className = "",
}: AgenciaCardProps) {
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const formatCnpj = (cnpj: string) => {
    const cleaned = cnpj.replace(/\D/g, "")
    if (cleaned.length === 14) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
    }
    return cnpj
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Logo da agência */}
          <div className="flex-shrink-0">
            {agencia.logo_url ? (
              <Image
                src={agencia.logo_url || "/placeholder.svg"}
                alt={`Logo ${agencia.nome_fantasia}`}
                width={64}
                height={64}
                className="w-16 h-16 object-contain rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Informações principais */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900 truncate">
              {agencia.nome_fantasia || agencia.razao_social}
            </CardTitle>
            {agencia.nome_fantasia && agencia.razao_social && agencia.nome_fantasia !== agencia.razao_social && (
              <p className="text-sm text-gray-600 truncate">{agencia.razao_social}</p>
            )}

            {/* Localização */}
            <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {agencia.cidade && agencia.estado
                  ? `${agencia.cidade}, ${agencia.estado}`
                  : "Localização não informada"}
              </span>
            </div>

            {/* Especialidades */}
            {agencia.especialidades && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{agencia.especialidades}</p>
            )}
          </div>

          {/* Badge de verificação */}
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Verificada
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{agencia.total_vendedores || 0}</div>
            <div className="text-xs text-gray-600">Vendedores</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{agencia.vendas_ano || 0}</div>
            <div className="text-xs text-gray-600">Vendas/Ano</div>
          </div>
        </div>

        {/* Serviços oferecidos */}
        {agencia.servicos_oferecidos && agencia.servicos_oferecidos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Serviços</h4>
            <div className="flex flex-wrap gap-1">
              {agencia.servicos_oferecidos.slice(0, 3).map((servico, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {servico}
                </Badge>
              ))}
              {agencia.servicos_oferecidos.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{agencia.servicos_oferecidos.length - 3} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Informações de contato */}
        {showContactInfo && (
          <div className="space-y-2">
            {agencia.telefone_principal && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{formatPhone(agencia.telefone_principal)}</span>
              </div>
            )}

            {agencia.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{agencia.email}</span>
              </div>
            )}

            {agencia.website && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <Link href={agencia.website} target="_blank" className="text-orange-500 hover:text-orange-600 truncate">
                  {agencia.website.replace(/^https?:\/\//, "")}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Horário de funcionamento */}
        {agencia.horario_funcionamento && showFullDetails && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-1">
              <Clock className="h-4 w-4" />
              Horário de Funcionamento
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-line">{agencia.horario_funcionamento}</p>
          </div>
        )}

        {/* Descrição completa */}
        {agencia.descricao && showFullDetails && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Sobre a Agência</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">{agencia.descricao}</p>
          </div>
        )}

        {/* Informações adicionais */}
        {showFullDetails && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <div className="text-sm font-medium text-gray-900">CNPJ</div>
              <div className="text-sm text-gray-600">{agencia.cnpj ? formatCnpj(agencia.cnpj) : "Não informado"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Fundação</div>
              <div className="text-sm text-gray-600">{agencia.ano_fundacao || "Não informado"}</div>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-4">
          <Button className="flex-1 bg-orange-500 hover:bg-orange-600">Ver Veículos</Button>
          {agencia.whatsapp && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`https://wa.me/55${agencia.whatsapp.replace(/\D/g, "")}`} target="_blank">
                WhatsApp
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
