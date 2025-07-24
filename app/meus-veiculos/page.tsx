"use client"
import { useState, useEffect } from "react"
import SubscriptionGuard from "@/components/subscription-guard"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getVeiculosUsuario, type Veiculo } from "@/lib/supabase/veiculos"
import VeiculoCard from "@/components/veiculo-card"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, Filter, ArrowLeft } from "lucide-react"

export default function MeusVeiculosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")

  useEffect(() => {
    const checkUserAndLoadVeiculos = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          toast({
            variant: "destructive",
            title: "Acesso negado",
            description: "Você precisa estar logado para acessar esta página.",
          })
          router.push("/login")
          return
        }

        await loadVeiculos()
      } catch (error) {
        console.error("Erro ao verificar usuário:", error)
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar dados.",
        })
      }
    }

    checkUserAndLoadVeiculos()
  }, [supabase, router, toast])

  const loadVeiculos = async () => {
    setLoading(true)
    try {
      const { data, error } = await getVeiculosUsuario()

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar veículos",
        })
        return
      }

      setVeiculos(data || [])
    } catch (error) {
      console.error("Erro ao carregar veículos:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao carregar veículos",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVeiculoDeleted = () => {
    loadVeiculos()
  }

  const filteredVeiculos = veiculos.filter((veiculo) => {
    const matchesSearch =
      veiculo.marca_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.modelo_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.titulo?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "todos" || veiculo.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const stats = {
    total: veiculos.length,
    ativos: veiculos.filter((v) => v.status === "ativo").length,
    vendidos: veiculos.filter((v) => v.status === "vendido").length,
    faturamento: veiculos.filter((v) => v.status === "vendido").reduce((total, v) => total + (v.preco || 0), 0),
  }

  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Meus Veículos</h1>
              <p className="text-gray-600">Gerencie todos os seus veículos cadastrados</p>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => router.push("/cadastro-veiculo")}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Veículo
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
                  <p className="text-sm text-gray-600">Ativos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.vendidos}</p>
                  <p className="text-sm text-gray-600">Vendidos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-600">{formatCurrency(stats.faturamento)}</p>
                  <p className="text-sm text-gray-600">Faturamento</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por marca, modelo ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="vendido">Vendidos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando veículos...</p>
          </div>
        ) : filteredVeiculos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVeiculos.map((veiculo) => (
              <VeiculoCard key={veiculo.id} veiculo={veiculo} onDelete={handleVeiculoDeleted} showActions={true} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "todos" ? "Nenhum veículo encontrado" : "Nenhum veículo cadastrado"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "todos"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando seu primeiro veículo"}
              </p>
              {!searchTerm && statusFilter === "todos" && (
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => router.push("/cadastro-veiculo")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Veículo
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </SubscriptionGuard>
  )
}
