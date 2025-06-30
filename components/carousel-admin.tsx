"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ImageIcon,
  Plus,
  Shield,
} from "lucide-react"
import Image from "next/image"
import {
  listAllCarouselImages,
  uploadCarouselImage,
  deleteCarouselImage,
  updateCarouselImageStatus,
  updateCarouselImageOrder,
  updateCarouselImageMetadata,
  extractCarouselPathFromUrl,
  type CarouselImage,
} from "@/lib/supabase/carousel-storage-simple"
import { useToast } from "@/hooks/use-toast"

interface EditingImage {
  id: string
  title: string
  description: string
}

interface UploadProgress {
  file: File
  progress: number
  status: "uploading" | "processing" | "success" | "error"
  error?: string
}

export default function CarouselAdmin() {
  const [images, setImages] = useState<CarouselImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingImage, setEditingImage] = useState<EditingImage | null>(null)
  const [showInactive, setShowInactive] = useState(true)
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const { toast } = useToast()

  // Carregar imagens
  const loadImages = async () => {
    try {
      setLoading(true)
      setPermissionError(null)
      const allImages = await listAllCarouselImages()
      setImages(allImages)
      setTableExists(true)
    } catch (error) {
      console.error("Erro ao carregar imagens:", error)
      setTableExists(false)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as imagens do carrossel.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadImages()
  }, [])

  // Simular progresso de upload
  const simulateProgress = (file: File) => {
    setUploadProgress({
      file,
      progress: 0,
      status: "uploading",
    })

    // Simular progresso de upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (!prev) return null

        if (prev.progress < 70) {
          return { ...prev, progress: prev.progress + Math.random() * 20 }
        } else if (prev.progress < 90) {
          return { ...prev, progress: prev.progress + Math.random() * 10, status: "processing" }
        } else {
          clearInterval(interval)
          return { ...prev, progress: 100, status: "success" }
        }
      })
    }, 200)

    return interval
  }

  // Upload de nova imagem
  const handleUpload = async (file: File) => {
    if (!file) return

    try {
      setUploading(true)
      setPermissionError(null)
      const progressInterval = simulateProgress(file)

      const fileName = file.name.replace(/\.[^/.]+$/, "")
      const nextOrder = Math.max(...images.map((img) => img.order), 0) + 1

      const result = await uploadCarouselImage(file, fileName, `Imagem do carrossel - ${fileName}`, nextOrder)

      clearInterval(progressInterval)

      if (result.success) {
        setUploadProgress((prev) => (prev ? { ...prev, progress: 100, status: "success" } : null))

        toast({
          title: "Sucesso! 🎉",
          description: "Imagem enviada e adicionada ao carrossel!",
        })

        setTimeout(() => {
          setUploadProgress(null)
        }, 2000)

        await loadImages()
      } else {
        setUploadProgress((prev) => (prev ? { ...prev, status: "error", error: result.error } : null))

        // Verificar se é erro de permissão
        if (result.error?.includes("row-level security") || result.error?.includes("permissão")) {
          setPermissionError(result.error)
        }

        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: result.error || "Erro desconhecido",
        })

        setTimeout(() => {
          setUploadProgress(null)
        }, 3000)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado durante o upload.",
      })
      setUploadProgress(null)
    } finally {
      setUploading(false)
    }
  }

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
    // Limpar input
    event.target.value = ""
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  // Deletar imagem
  const handleDelete = async (image: CarouselImage) => {
    if (!confirm(`Tem certeza que deseja deletar "${image.title}"?\n\nEsta ação não pode ser desfeita.`)) return

    try {
      const imagePath = extractCarouselPathFromUrl(image.url)
      if (!imagePath) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível identificar o caminho da imagem.",
        })
        return
      }

      const success = await deleteCarouselImage(imagePath)
      if (success) {
        toast({
          title: "Sucesso! 🗑️",
          description: "Imagem deletada com sucesso!",
        })
        await loadImages()
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível deletar a imagem.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao deletar imagem.",
      })
    }
  }

  // Alterar status ativo/inativo
  const handleToggleActive = async (image: CarouselImage) => {
    try {
      const success = await updateCarouselImageStatus(image.id, !image.active)
      if (success) {
        toast({
          title: "Sucesso! 🔄",
          description: `Imagem ${!image.active ? "ativada" : "desativada"} com sucesso!`,
        })
        await loadImages()
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível alterar o status da imagem.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao alterar status.",
      })
    }
  }

  // Alterar ordem
  const handleChangeOrder = async (image: CarouselImage, direction: "up" | "down") => {
    const sortedImages = images.sort((a, b) => a.order - b.order)
    const currentIndex = sortedImages.findIndex((img) => img.id === image.id)

    if (direction === "up" && currentIndex === 0) return
    if (direction === "down" && currentIndex === sortedImages.length - 1) return

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const targetImage = sortedImages[targetIndex]

    try {
      // Trocar as ordens
      await updateCarouselImageOrder(image.id, targetImage.order)
      await updateCarouselImageOrder(targetImage.id, image.order)

      toast({
        title: "Sucesso! ↕️",
        description: "Ordem alterada com sucesso!",
      })
      await loadImages()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao alterar ordem.",
      })
    }
  }

  // Iniciar edição
  const startEditing = (image: CarouselImage) => {
    setEditingImage({
      id: image.id,
      title: image.title || image.name,
      description: image.description || "",
    })
  }

  // Cancelar edição
  const cancelEditing = () => {
    setEditingImage(null)
  }

  // Salvar edição
  const saveEditing = async () => {
    if (!editingImage) return

    try {
      const success = await updateCarouselImageMetadata(editingImage.id, editingImage.title, editingImage.description)
      if (success) {
        toast({
          title: "Sucesso! ✏️",
          description: "Informações atualizadas com sucesso!",
        })
        setEditingImage(null)
        await loadImages()
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível salvar as alterações.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar alterações.",
      })
    }
  }

  // Filtrar imagens
  const filteredImages = showInactive ? images : images.filter((img) => img.active)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-lg">Carregando imagens do carrossel...</div>
        </div>
      </div>
    )
  }

  // Se a tabela não existe, mostrar aviso
  if (tableExists === false) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-4">Tabela do Carrossel Não Encontrada</h2>
            <p className="text-red-700 mb-6">
              A tabela <code className="bg-red-200 px-2 py-1 rounded">carousel_images</code> não existe no banco de
              dados. Execute o script SQL para criar a estrutura necessária.
            </p>
            <div className="bg-white p-4 rounded-lg border border-red-200 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">📋 Passos para resolver:</h3>
              <ol className="text-left text-red-700 space-y-2">
                <li>
                  1. Execute o script:{" "}
                  <code className="bg-red-100 px-2 py-1 rounded">create-carousel-images-table.sql</code>
                </li>
                <li>
                  2. Execute o script:{" "}
                  <code className="bg-red-100 px-2 py-1 rounded">create-carousel-rls-policies.sql</code>
                </li>
                <li>3. Recarregue esta página</li>
              </ol>
            </div>
            <Button onClick={loadImages} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              🔄 Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se há erro de permissão, mostrar aviso específico
  if (permissionError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">Erro de Permissão</h2>
            <p className="text-yellow-700 mb-6">
              Não foi possível inserir dados devido às políticas de segurança (RLS) do Supabase.
            </p>
            <div className="bg-white p-4 rounded-lg border border-yellow-200 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">🔧 Soluções:</h3>
              <div className="text-left text-yellow-700 space-y-3">
                <div>
                  <h4 className="font-medium">Opção 1: Configurar políticas de segurança</h4>
                  <p className="text-sm">
                    Execute: <code className="bg-yellow-100 px-2 py-1 rounded">create-carousel-rls-policies.sql</code>
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Opção 2: Permitir acesso público (mais simples)</h4>
                  <p className="text-sm">
                    Execute:{" "}
                    <code className="bg-yellow-100 px-2 py-1 rounded">create-carousel-rls-policies-permissive.sql</code>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={loadImages}
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                🔄 Tentar Novamente
              </Button>
              <Button
                onClick={() => setPermissionError(null)}
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <X className="h-4 w-4 mr-2" />
                Fechar Aviso
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                🎠 Gerenciar Carrossel da Home
                {images.length === 0 && <Badge variant="secondary">Vazio</Badge>}
              </CardTitle>
              <p className="text-gray-600 mt-1">Gerencie as imagens que aparecem no carrossel da página inicial</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={showInactive} onCheckedChange={setShowInactive} id="show-inactive" />
                <Label htmlFor="show-inactive" className="flex items-center gap-1">
                  {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  Mostrar inativas
                </Label>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {images.filter((img) => img.active).length} ativas / {images.length} total
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Upload Area */}
          <div className="mb-8">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragActive
                  ? "border-orange-500 bg-orange-50 scale-105"
                  : uploading
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-orange-500 hover:bg-orange-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadProgress ? (
                // Upload Progress
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    {uploadProgress.status === "success" ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : uploadProgress.status === "error" ? (
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    ) : (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">
                        {uploadProgress.status === "uploading" && "Enviando imagem..."}
                        {uploadProgress.status === "processing" && "Processando imagem..."}
                        {uploadProgress.status === "success" && "Upload concluído!"}
                        {uploadProgress.status === "error" && "Erro no upload"}
                      </h3>
                      <p className="text-sm text-gray-600">{uploadProgress.file.name}</p>
                    </div>
                  </div>

                  <div className="max-w-md mx-auto">
                    <Progress
                      value={uploadProgress.progress}
                      className={`h-2 ${
                        uploadProgress.status === "success"
                          ? "bg-green-100"
                          : uploadProgress.status === "error"
                            ? "bg-red-100"
                            : ""
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">{Math.round(uploadProgress.progress)}%</p>
                  </div>

                  {uploadProgress.error && <p className="text-sm text-red-600 mt-2">{uploadProgress.error}</p>}
                </div>
              ) : (
                // Upload Area
                <>
                  <label htmlFor="upload-carousel" className="cursor-pointer block">
                    <div className="space-y-4">
                      {dragActive ? (
                        <>
                          <Upload className="h-16 w-16 mx-auto text-orange-500" />
                          <h3 className="text-xl font-semibold text-orange-700">Solte a imagem aqui!</h3>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-center gap-4">
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                            <Plus className="h-8 w-8 text-gray-300" />
                            <Upload className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">
                            {uploading ? "Enviando imagem..." : "Adicionar nova imagem ao carrossel"}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Clique aqui ou arraste uma imagem para fazer upload
                          </p>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-400">
                              Formatos aceitos: JPG, PNG, WebP, GIF • Tamanho máximo: 5MB
                            </p>
                            <p className="text-xs text-gray-400">Recomendado: 1920x800px para melhor qualidade</p>
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                  <input
                    id="upload-carousel"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>

          {/* Lista de Imagens */}
          {filteredImages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold mb-2">
                {images.length === 0
                  ? "Nenhuma imagem no carrossel ainda"
                  : showInactive
                    ? "Nenhuma imagem encontrada"
                    : "Nenhuma imagem ativa"}
              </h3>
              <p className="mb-4">
                {images.length === 0
                  ? "Faça upload da primeira imagem para começar!"
                  : showInactive
                    ? "Faça upload de uma imagem para começar."
                    : "Ative algumas imagens ou faça upload de novas imagens."}
              </p>
              {!showInactive && images.length > 0 && (
                <Button variant="outline" onClick={() => setShowInactive(true)} className="mt-2">
                  <Eye className="h-4 w-4 mr-2" />
                  Mostrar imagens inativas
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredImages
                .sort((a, b) => a.order - b.order)
                .map((image) => (
                  <Card
                    key={image.id}
                    className={`${!image.active ? "opacity-75 border-gray-300" : "border-orange-200"} hover:shadow-lg transition-all duration-200`}
                  >
                    <div className="relative">
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={image.title || image.name}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant={image.active ? "default" : "secondary"} className="bg-black/70 text-white">
                          {image.active ? "✅ Ativo" : "⏸️ Inativo"}
                        </Badge>
                        <Badge variant="outline" className="bg-black/70 text-white border-white/30">
                          #{image.order}
                        </Badge>
                      </div>
                      {!image.active && (
                        <div className="absolute inset-0 bg-black/40 rounded-t-lg flex items-center justify-center">
                          <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Imagem Inativa
                          </div>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      {editingImage?.id === image.id ? (
                        // Modo de edição
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`title-${image.id}`} className="text-sm font-medium">
                              Título
                            </Label>
                            <Input
                              id={`title-${image.id}`}
                              value={editingImage.title}
                              onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                              placeholder="Título da imagem"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`desc-${image.id}`} className="text-sm font-medium">
                              Descrição
                            </Label>
                            <Textarea
                              id={`desc-${image.id}`}
                              value={editingImage.description}
                              onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                              placeholder="Descrição da imagem"
                              rows={2}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveEditing} className="flex-1">
                              <Save className="h-3 w-3 mr-2" />
                              Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditing}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Modo de visualização
                        <>
                          <div className="mb-4">
                            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{image.title || image.name}</h3>
                            {image.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{image.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Criado em: {new Date(image.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>

                          {/* Controles */}
                          <div className="space-y-3">
                            {/* Status e Edição */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={image.active}
                                  onCheckedChange={() => handleToggleActive(image)}
                                  id={`active-${image.id}`}
                                />
                                <Label htmlFor={`active-${image.id}`} className="text-sm">
                                  {image.active ? "Ativo" : "Inativo"}
                                </Label>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => startEditing(image)}>
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                            </div>

                            {/* Ordem */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Posição no carrossel:</span>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleChangeOrder(image, "up")}
                                  disabled={image.order === 1}
                                  title="Mover para cima"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleChangeOrder(image, "down")}
                                  disabled={image.order === Math.max(...images.map((img) => img.order))}
                                  title="Mover para baixo"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Deletar */}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(image)}
                              className="w-full"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Deletar Imagem
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* Instruções */}
          {images.length > 0 && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas de uso:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • <strong>Ordem:</strong> Use as setas para definir a sequência das imagens no carrossel
                </li>
                <li>
                  • <strong>Status:</strong> Apenas imagens ativas aparecem no carrossel da home
                </li>
                <li>
                  • <strong>Qualidade:</strong> Para melhor resultado, use imagens com 1920x800px
                </li>
                <li>
                  • <strong>Performance:</strong> Mantenha apenas as imagens necessárias ativas
                </li>
              </ul>
            </div>
          )}

          {/* Primeira vez - Instruções especiais */}
          {images.length === 0 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                🚀 Começando com o Carrossel
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-orange-800">
                <div>
                  <h5 className="font-medium mb-2">📸 Tipos de imagem ideais:</h5>
                  <ul className="space-y-1">
                    <li>• Carros em destaque</li>
                    <li>• Promoções especiais</li>
                    <li>• Eventos da loja</li>
                    <li>• Novidades do estoque</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">⚡ Dicas de performance:</h5>
                  <ul className="space-y-1">
                    <li>• 3-5 imagens é o ideal</li>
                    <li>• Formato landscape (16:9)</li>
                    <li>• Qualidade alta mas otimizada</li>
                    <li>• Títulos descritivos</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
