"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Search, MapPin, Loader2 } from "lucide-react"
import { AgenciaCard } from "@/components/agencia-card"
import { searchAgencias, getAgenciasStats, type DadosAgencia } from "@/lib/supabase/agencias"

export default function AgenciasPage() {
  const [agencias, setAgencias] = useState<DadosAgencia[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEstado, setSelectedEstado] = useState("")
  const [selectedCidade, setSelectedCidade] = useState("")
  const [stats, setStats] = useState<{ total: number; porEstado: { estado: string; count: number; }[]; mediaVendedores: number }>({ total: 0, porEstado: [], mediaVendedores: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 12

  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ]

  // Carregar agências
  const loadAgencias = async () => {
    setLoading(true)
    try {
      const { data, count } = await searchAgencias({
        nome: searchTerm || undefined,
        cidade: selectedCidade || undefined,
        estado: selectedEstado || undefined,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      })

      setAgencias(data)
      setTotalCount(count)
    } catch (error) {
      console.error("Erro ao carregar agências:", error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const statsData = await getAgenciasStats()
      setStats(statsData)
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    loadAgencias()
    loadStats()
  }, [currentPage])

  // Recarregar quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
    loadAgencias()
  }, [searchTerm, selectedEstado, selectedCidade])

  const handleSearch = () => {
    setCurrentPage(1)
    loadAgencias()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedEstado("")
    setSelectedCidade("")
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/rx_branco.png"
              alt="RX Autos Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <Link href="/" className="text-gray-300 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-orange-500">
              Home
            </Link>
            <span className="mx-2">{">"}</span>
            <span className="text-gray-900">Agências</span>
          </nav>
        </div>
      </div>

      {/* Page Title & Stats */}
      <div className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Agências Parceiras</h1>
              <p className="text-gray-600">Encontre agências de confiança em todo o Brasil</p>
            </div>

            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{stats.total}</div>
                <div className="text-sm text-gray-600">Agências</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{stats.mediaVendedores}</div>
                <div className="text-sm text-gray-600">Vendedores/Agência</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar por nome da agência..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="text"
                  placeholder="Cidade"
                  value={selectedCidade}
                  onChange={(e) => setSelectedCidade(e.target.value)}
                  className="w-40"
                />

                <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>

                <Button variant="outline" onClick={clearFilters}>
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">{loading ? "Carregando..." : `${totalCount} agências encontradas`}</p>

          <Select defaultValue="created_at">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Mais recentes</SelectItem>
              <SelectItem value="nome_fantasia">Nome A-Z</SelectItem>
              <SelectItem value="cidade">Cidade A-Z</SelectItem>
              <SelectItem value="vendas_ano">Mais vendas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid de Agências */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : agencias.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencias.map((agencia) => (
              <AgenciaCard key={agencia.id} agencia={agencia} showContactInfo={true} showFullDetails={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma agência encontrada</h3>
            <p className="text-gray-600 mb-4">Tente ajustar os filtros de busca ou remover alguns critérios.</p>
            <Button onClick={clearFilters} variant="outline">
              Limpar filtros
            </Button>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    {page}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
