"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getVeiculo, type Veiculo } from "@/lib/supabase/veiculos"
import VeiculoForm from "@/components/veiculo-form"

export default function EditarVeiculoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVeiculo = async () => {
      if (!params.id || typeof params.id !== "string") {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "ID do veículo inválido",
        })
        router.push("/painel-agencia")
        return
      }

      try {
        const { data, error } = await getVeiculo(params.id)

        if (error || !data) {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Veículo não encontrado",
          })
          router.push("/painel-agencia")
          return
        }

        setVeiculo(data)
      } catch (error) {
        console.error("Erro ao carregar veículo:", error)
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar dados do veículo",
        })
        router.push("/painel-agencia")
      } finally {
        setLoading(false)
      }
    }

    loadVeiculo()
  }, [params.id, router, toast])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do veículo...</p>
        </div>
      </div>
    )
  }

  if (!veiculo) {
    return null
  }

  return <VeiculoForm veiculo={veiculo} isEditing={true} />
}
