"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  uploadVeiculoFoto,
  deleteVeiculoFoto,
  validateImageFile,
  fileToBase64,
  type UploadProgress,
  type FotoVeiculo,
  type FotoCategoria,
  FOTO_CATEGORIAS,
} from "@/lib/supabase/veiculo-storage"
import { Upload, X, Camera, AlertCircle, Star, Eye } from "lucide-react"
import Image from "next/image"

interface VeiculoFotoUploadProps {
  veiculoId: string
  fotos: string[]
  fotoPrincipal?: string
  onFotosChange: (fotos: string[]) => void
  onFotoPrincipalChange: (foto: string) => void
  maxFotos?: number
  isEditing?: boolean // Nova prop
}

interface FotoUploadState extends FotoVeiculo {
  uploading: boolean
  progress: number
  error?: string
  isTemp?: boolean
}

export default function VeiculoFotoUpload({
  veiculoId,
  fotos,
  fotoPrincipal,
  onFotosChange,
  onFotoPrincipalChange,
  maxFotos = 15,
  isEditing = false, // Nova prop com valor padrão
}: VeiculoFotoUploadProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Converter fotos existentes para o novo formato
  const [fotosState, setFotosState] = useState<FotoUploadState[]>(
    fotos.map((url) => ({
      url,
      categoria: url === fotoPrincipal ? "principal" : "outras",
      isPrincipal: url === fotoPrincipal,
      uploading: false,
      progress: 100,
    })),
  )

  const [selectedCategoria, setSelectedCategoria] = useState<FotoCategoria>("outras")

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)
    const remainingSlots = maxFotos - fotosState.length

    if (filesArray.length > remainingSlots) {
      toast({
        variant: "destructive",
        title: "Muitas fotos",
        description: `Você pode adicionar no máximo ${remainingSlots} fotos.`,
      })
      return
    }

    // Verificar se já existe foto principal
    const temFotoPrincipal = fotosState.some((foto) => foto.isPrincipal)

    // Se não tem foto principal e categoria selecionada não é principal, perguntar
    if (!temFotoPrincipal && selectedCategoria !== "principal" && filesArray.length === 1) {
      const definirComoPrincipal = confirm("Esta será sua primeira foto. Deseja defini-la como foto principal?")
      if (definirComoPrincipal) {
        setSelectedCategoria("principal")
      }
    }

    // Validar todos os arquivos primeiro
    for (const file of filesArray) {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: validation.error,
        })
        return
      }
    }

    // Processar uploads
    for (const file of filesArray) {
      try {
        // Verificar se categoria principal já existe
        let categoriaFinal = selectedCategoria
        if (selectedCategoria === "principal" && fotosState.some((foto) => foto.isPrincipal)) {
          categoriaFinal = "outras"
          toast({
            variant: "destructive",
            title: "Foto principal já existe",
            description: "Só pode haver uma foto principal. Esta será adicionada como 'Outras'.",
          })
        }

        // Se estiver editando e já existe foto na categoria, substituir
        if (isEditing && categoriaFinal !== "principal") {
          const fotoExistente = fotosState.find((f) => f.categoria === categoriaFinal && !f.isPrincipal)
          if (fotoExistente) {
            // Remover foto existente primeiro
            if (fotoExistente.path) {
              await deleteVeiculoFoto(fotoExistente.path)
            }

            // Remover do estado
            setFotosState((prev) => prev.filter((f) => f.url !== fotoExistente.url))

            // Remover da lista de fotos
            const fotosAtualizadas = fotos.filter((url) => url !== fotoExistente.url)
            onFotosChange(fotosAtualizadas)
          }
        }

        // Para foto principal, sempre substituir se já existir
        if (categoriaFinal === "principal") {
          const fotoPrincipalExistente = fotosState.find((f) => f.isPrincipal)
          if (fotoPrincipalExistente) {
            // Remover foto principal existente
            if (fotoPrincipalExistente.path) {
              await deleteVeiculoFoto(fotoPrincipalExistente.path)
            }

            // Remover do estado
            setFotosState((prev) => prev.filter((f) => f.url !== fotoPrincipalExistente.url))

            // Remover da lista de fotos
            const fotosAtualizadas = fotos.filter((url) => url !== fotoPrincipalExistente.url)
            onFotosChange(fotosAtualizadas)
          }
        }

        // Criar preview temporário
        const previewUrl = await fileToBase64(file)
        const tempFoto: FotoUploadState = {
          url: previewUrl,
          categoria: categoriaFinal,
          isPrincipal: categoriaFinal === "principal",
          uploading: true,
          progress: 0,
          isTemp: true,
        }

        setFotosState((prev) => [...prev, tempFoto])

        // Fazer upload real
        const result = await uploadVeiculoFoto(veiculoId, file, categoriaFinal, (progress: UploadProgress) => {
          setFotosState((prev) =>
            prev.map((foto) =>
              foto.url === previewUrl
                ? {
                    ...foto,
                    progress: progress.percentage,
                  }
                : foto,
            ),
          )
        })

        if (result.success && result.url) {
          // Atualizar com URL real
          setFotosState((prev) =>
            prev.map((foto) =>
              foto.url === previewUrl
                ? {
                    url: result.url!,
                    path: result.path,
                    categoria: categoriaFinal,
                    isPrincipal: categoriaFinal === "principal",
                    uploading: false,
                    progress: 100,
                    isTemp: false,
                  }
                : foto,
            ),
          )

          // Atualizar lista de fotos
          const newFotos = [...fotos, result.url]
          onFotosChange(newFotos)

          // Se é foto principal, atualizar
          if (categoriaFinal === "principal") {
            onFotoPrincipalChange(result.url)
          }

          toast({
            title: "Foto enviada!",
            description: `Foto ${FOTO_CATEGORIAS.find((cat) => cat.value === categoriaFinal)?.label} adicionada com sucesso.`,
          })
        } else {
          // Remover foto com erro
          setFotosState((prev) => prev.filter((foto) => foto.url !== previewUrl))
          toast({
            variant: "destructive",
            title: "Erro no upload",
            description: result.error || "Erro ao enviar foto.",
          })
        }
      } catch (error) {
        console.error("Erro no upload:", error)
        toast({
          variant: "destructive",
          title: "Erro inesperado",
          description: "Erro ao processar foto.",
        })
      }
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFoto = async (index: number) => {
    const foto = fotosState[index]
    if (!foto) return

    try {
      // Se tem path, deletar do storage
      if (foto.path) {
        const deleted = await deleteVeiculoFoto(foto.path)
        if (!deleted) {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Erro ao deletar foto do servidor.",
          })
          return
        }
      }

      // Remover do estado
      const newFotosState = fotosState.filter((_, i) => i !== index)
      setFotosState(newFotosState)

      // Atualizar lista de fotos
      const newFotos = fotos.filter((url) => url !== foto.url)
      onFotosChange(newFotos)

      // Se era a foto principal, limpar
      if (foto.isPrincipal) {
        onFotoPrincipalChange("")
      }

      toast({
        title: "Foto removida",
        description: `Foto ${FOTO_CATEGORIAS.find((cat) => cat.value === foto.categoria)?.label} deletada com sucesso.`,
      })
    } catch (error) {
      console.error("Erro ao remover foto:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover foto.",
      })
    }
  }

  const handleSetPrincipal = (index: number) => {
    const foto = fotosState[index]
    if (!foto || foto.isPrincipal) return

    // Remover principal de outras fotos
    const newFotosState = fotosState.map((f, i) => ({
      ...f,
      isPrincipal: i === index,
      categoria: (i === index ? "principal" : f.categoria === "principal" ? "outras" : f.categoria) as FotoCategoria,
    }))

    setFotosState(newFotosState)
    onFotoPrincipalChange(foto.url)

    toast({
      title: "Foto principal definida",
      description: "Esta foto será exibida como destaque do veículo.",
    })
  }

  const handleChangeCategoria = (index: number, novaCategoria: FotoCategoria) => {
    if (novaCategoria === "principal" && fotosState.some((foto) => foto.isPrincipal)) {
      toast({
        variant: "destructive",
        title: "Foto principal já existe",
        description: "Só pode haver uma foto principal.",
      })
      return
    }

    const newFotosState = fotosState.map((foto, i) => {
      if (i === index) {
        const isPrincipal = novaCategoria === "principal"
        return {
          ...foto,
          categoria: novaCategoria,
          isPrincipal,
        }
      }
      // Se esta foto vai ser principal, remover principal das outras
      if (novaCategoria === "principal" && foto.isPrincipal) {
        return {
          ...foto,
          isPrincipal: false,
          categoria: "outras" as FotoCategoria,
        }
      }
      return foto
    })

    setFotosState(newFotosState)

    // Atualizar foto principal se necessário
    if (novaCategoria === "principal") {
      onFotoPrincipalChange(fotosState[index].url)
    }

    toast({
      title: "Categoria alterada",
      description: `Foto definida como ${FOTO_CATEGORIAS.find((cat) => cat.value === novaCategoria)?.label}.`,
    })
  }

  const getCategoriaInfo = (categoria: FotoCategoria) => {
    return FOTO_CATEGORIAS.find((cat) => cat.value === categoria) || FOTO_CATEGORIAS[FOTO_CATEGORIAS.length - 1]
  }

  const fotosOrganizadas = fotosState.reduce(
    (acc, foto) => {
      if (!acc[foto.categoria]) {
        acc[foto.categoria] = []
      }
      acc[foto.categoria].push(foto)
      return acc
    },
    {} as Record<FotoCategoria, FotoUploadState[]>,
  )

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div>
        {isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Modo de edição:</span> Ao selecionar uma nova foto para uma categoria que já
              possui foto, a foto existente será substituída.
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-medium">Fotos do Veículo</h3>
            <p className="text-sm text-gray-500">
              Adicione até {maxFotos} fotos organizadas por categoria para melhor apresentação.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedCategoria} onValueChange={(value: FotoCategoria) => setSelectedCategoria(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOTO_CATEGORIAS.map((categoria) => (
                  <SelectItem key={categoria.value} value={categoria.value}>
                    <div className="flex items-center gap-2">
                      <span>{categoria.icon}</span>
                      <span>{categoria.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={fotosState.length >= maxFotos}
              className="whitespace-nowrap"
            >
              <Upload className="h-4 w-4 mr-2" />
              Adicionar Fotos
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          aria-label="Selecionar fotos do veículo"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {/* Drop Zone */}
        {fotosState.length === 0 && (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Adicione fotos do seu veículo</h4>
            <p className="text-gray-500 mb-4">
              Organize as fotos por categoria: {getCategoriaInfo(selectedCategoria).label}
            </p>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Fotos
            </Button>
          </div>
        )}
      </div>

      {/* Foto Principal Destacada */}
      {fotosState.some((foto) => foto.isPrincipal) && (
        <div>
          <h4 className="text-md font-medium mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            Foto Principal
          </h4>
          {fotosState
            .filter((foto) => foto.isPrincipal)
            .map((foto, index) => (
              <div key={index} className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Image src={foto.url || "/placeholder.svg"} alt="Foto principal" fill className="object-cover" />

                {foto.uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-xs">{Math.round(foto.progress)}%</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Galeria Organizada por Categoria */}
      {Object.entries(fotosOrganizadas).map(([categoria, fotos]) => {
        if (fotos.length === 0 || categoria === "principal") return null

        const categoriaInfo = getCategoriaInfo(categoria as FotoCategoria)

        return (
          <div key={categoria}>
            <h4 className="text-md font-medium mb-3 flex items-center gap-2">
              <span className="text-lg">{categoriaInfo.icon}</span>
              {categoriaInfo.label}
              <Badge variant="secondary">{fotos.length}</Badge>
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fotos.map((foto, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={foto.url || "/placeholder.svg"}
                      alt={categoriaInfo.label}
                      fill
                      className="object-cover"
                    />

                    {/* Loading Overlay */}
                    {foto.uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                          <p className="text-xs">{Math.round(foto.progress)}%</p>
                        </div>
                      </div>
                    )}

                    {/* Error Overlay */}
                    {foto.error && (
                      <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-white" />
                      </div>
                    )}

                    {/* Actions Overlay */}
                    {!foto.uploading && !foto.error && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-1">
                          {!foto.isPrincipal && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                const originalIndex = fotosState.findIndex((f) => f.url === foto.url)
                                handleSetPrincipal(originalIndex)
                              }}
                              className="text-xs h-7"
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Principal
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const originalIndex = fotosState.findIndex((f) => f.url === foto.url)
                              handleRemoveFoto(originalIndex)
                            }}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Temp Badge */}
                    {foto.isTemp && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          Enviando...
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Categoria Selector */}
                  {!foto.uploading && !foto.isPrincipal && (
                    <div className="mt-2">
                      <Select
                        value={foto.categoria}
                        onValueChange={(value: FotoCategoria) => {
                          const originalIndex = fotosState.findIndex((f) => f.url === foto.url)
                          handleChangeCategoria(originalIndex, value)
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FOTO_CATEGORIAS.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {foto.uploading && (
                    <div className="mt-2">
                      <Progress value={foto.progress} className="h-1" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Resumo */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Resumo das Fotos ({fotosState.length}/{maxFotos})
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {FOTO_CATEGORIAS.map((categoria) => {
            const count = fotosState.filter((foto) => foto.categoria === categoria.value).length
            if (count === 0) return null

            return (
              <div key={categoria.value} className="flex items-center gap-2">
                <span>{categoria.icon}</span>
                <span>{categoria.label}:</span>
                <Badge variant="outline" className="text-xs">
                  {count}
                </Badge>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
