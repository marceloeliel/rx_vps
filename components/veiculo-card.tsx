"use client"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { deleteVeiculo, type Veiculo } from "@/lib/supabase/veiculos"
import { Edit, MoreVertical, Trash2, Eye, Users, Calendar, Gauge } from "lucide-react"

interface VeiculoCardProps {
  veiculo: Veiculo
  onDelete?: () => void
  showActions?: boolean
}

export default function VeiculoCard({ veiculo, onDelete, showActions = true }: VeiculoCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800"
      case "vendido":
        return "bg-blue-100 text-blue-800"
      case "inativo":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleEdit = () => {
    router.push(`/editar-veiculo/${veiculo.id}`)
  }

  const handleDelete = async () => {
    if (!veiculo.id) return

    setDeleting(true)
    try {
      const { error } = await deleteVeiculo(veiculo.id)

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao excluir veículo",
        })
        return
      }

      toast({
        title: "Sucesso!",
        description: "Veículo excluído com sucesso",
      })

      onDelete?.()
    } catch (error) {
      console.error("Erro ao excluir veículo:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao excluir veículo",
      })
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <div className="aspect-video bg-gray-100">
            <Image
              src={veiculo.foto_principal || "/placeholder.svg?height=200&width=300"}
              alt={`${veiculo.marca_nome} ${veiculo.modelo_nome}`}
              fill
              className="object-cover"
            />
          </div>
          {veiculo.destaque && <Badge className="absolute top-2 left-2 bg-orange-500 text-white">Destaque</Badge>}
          <Badge className={`absolute top-2 right-2 ${getStatusColor(veiculo.status || "ativo")}`}>
            {veiculo.status || "ativo"}
          </Badge>
          {showActions && (
            <div className="absolute bottom-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {veiculo.titulo || `${veiculo.marca_nome} ${veiculo.modelo_nome}`}
              </h3>
              <p className="text-sm text-gray-600">
                {veiculo.marca_nome} • {veiculo.modelo_nome}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-600">{formatCurrency(veiculo.preco || 0)}</span>
              {veiculo.tipo_preco && veiculo.tipo_preco !== "fixo" && (
                <Badge variant="outline" className="text-xs">
                  {veiculo.tipo_preco}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {veiculo.ano_fabricacao}/{veiculo.ano_modelo}
                </span>
              </div>
              {veiculo.quilometragem && (
                <div className="flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  <span>{formatNumber(veiculo.quilometragem)} km</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />0 {/* Visualizações - implementar futuramente */}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />0 leads {/* Leads - implementar futuramente */}
                </span>
              </div>

              <div className="flex gap-1">
                {veiculo.aceita_financiamento && (
                  <Badge variant="outline" className="text-xs">
                    Financia
                  </Badge>
                )}
                {veiculo.aceita_troca && (
                  <Badge variant="outline" className="text-xs">
                    Troca
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Veículo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
              <br />
              <br />
              <strong>
                {veiculo.marca_nome} {veiculo.modelo_nome} {veiculo.ano_fabricacao}
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
