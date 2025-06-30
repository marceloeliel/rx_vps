"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ExternalLink, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import {
  getAllCarouselImages,
  updateCarouselUrls,
  addCarouselImage,
  removeCarouselImage,
  validateImageUrl,
  testImageUrl,
  type CarouselImage,
  type CarouselUrls,
} from "@/lib/supabase/carousel-urls"

export default function CarouselUrlAdmin() {
  const [images, setImages] = useState<CarouselImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [urls, setUrls] = useState<CarouselUrls>({
    url_1: "",
    url_2: "",
    url_3: "",
    url_4: "",
    url_5: "",
    url_6: "",
  })
  const [urlValidation, setUrlValidation] = useState<
    Record<string, { valid: boolean; error?: string; testing?: boolean }>
  >({})
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newImageTitle, setNewImageTitle] = useState("")
  const [newImageDescription, setNewImageDescription] = useState("")
  const [addingImage, setAddingImage] = useState(false)
  const { toast } = useToast()

  // Carregar imagens existentes
  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      setLoading(true)
      const loadedImages = await getAllCarouselImages()
      setImages(loadedImages)

      // Preencher URLs para modo compatibilidade
      const urlsFromImages: CarouselUrls = {
        url_1: loadedImages[0]?.url || "",
        url_2: loadedImages[1]?.url || "",
        url_3: loadedImages[2]?.url || "",
        url_4: loadedImages[3]?.url || "",
        url_5: loadedImages[4]?.url || "",
        url_6: loadedImages[5]?.url || "",
      }
      setUrls(urlsFromImages)
    } catch (error) {
      console.error("Erro ao carregar imagens:", error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar imagens",
        description: "Não foi possível carregar as imagens do carrossel.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Validar URL em tempo real
  const validateUrl = async (key: string, url: string) => {
    if (!url.trim()) {
      setUrlValidation((prev) => ({ ...prev, [key]: { valid: false, error: "URL vazia" } }))
      return
    }

    setUrlValidation((prev) => ({ ...prev, [key]: { valid: false, testing: true } }))

    const validation = validateImageUrl(url)
    if (!validation.valid) {
      setUrlValidation((prev) => ({ ...prev, [key]: { valid: false, error: validation.error, testing: false } }))
      return
    }

    // Testar se imagem carrega
    const imageLoads = await testImageUrl(url)
    setUrlValidation((prev) => ({
      ...prev,
      [key]: { valid: imageLoads, error: imageLoads ? undefined : "Imagem não carrega", testing: false },
    }))
  }

  // Atualizar URL
  const handleUrlChange = (key: keyof CarouselUrls, value: string) => {
    setUrls((prev) => ({ ...prev, [key]: value }))

    // Debounce validation
    setTimeout(() => {
      validateUrl(key, value)
    }, 500)
  }

  // Salvar URLs (modo compatibilidade)
  const handleSaveUrls = async () => {
    setSaving(true)
    try {
      const success = await updateCarouselUrls(urls)
      if (success) {
        toast({
          title: "URLs salvas com sucesso!",
          description: "As imagens do carrossel foram atualizadas.",
        })
        await loadImages() // Recarregar para mostrar mudanças
      } else {
        throw new Error("Falha ao salvar URLs")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar URLs",
        description: "Não foi possível salvar as URLs do carrossel.",
      })
    } finally {
      setSaving(false)
    }
  }

  // Adicionar nova imagem
  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      toast({
        variant: "destructive",
        title: "URL obrigatória",
        description: "Por favor, insira uma URL para a imagem.",
      })
      return
    }

    setAddingImage(true)
    try {
      const success = await addCarouselImage(newImageUrl, newImageTitle || undefined, newImageDescription || undefined)

      if (success) {
        toast({
          title: "Imagem adicionada!",
          description: "A nova imagem foi adicionada ao carrossel.",
        })
        setNewImageUrl("")
        setNewImageTitle("")
        setNewImageDescription("")
        await loadImages()
      } else {
        throw new Error("Falha ao adicionar imagem")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar imagem",
        description: "Não foi possível adicionar a imagem ao carrossel.",
      })
    } finally {
      setAddingImage(false)
    }
  }

  // Remover imagem
  const handleRemoveImage = async (imageId: string) => {
    try {
      const success = await removeCarouselImage(imageId)
      if (success) {
        toast({
          title: "Imagem removida!",
          description: "A imagem foi removida do carrossel.",
        })
        await loadImages()
      } else {
        throw new Error("Falha ao remover imagem")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover imagem",
        description: "Não foi possível remover a imagem.",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando imagens...</span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Gerenciar Carrossel</h1>
        <p className="text-gray-600">Configure as imagens que aparecem no carrossel da página inicial</p>
      </div>

      {/* Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{images.length}</div>
            <div className="text-sm text-gray-600">Imagens Cadastradas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{images.filter((img) => img.url).length}</div>
            <div className="text-sm text-gray-600">URLs Válidas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{Math.min(images.length, 6)}</div>
            <div className="text-sm text-gray-600">Exibidas no Carrossel</div>
          </CardContent>
        </Card>
      </div>

      {/* Imagens Existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Imagens Atuais</CardTitle>
          <CardDescription>Imagens cadastradas na tabela carousel_images</CardDescription>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma imagem cadastrada ainda.</p>
              <p className="text-sm">Use o formulário abaixo para adicionar a primeira imagem.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="border rounded-lg p-4">
                  <div className="relative aspect-video mb-3 bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={image.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=300&text=Erro+ao+carregar"
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">#{image.order}</Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => window.open(image.url, "_blank")}>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRemoveImage(image.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="font-medium text-sm">{image.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{image.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adicionar Nova Imagem */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Imagem</CardTitle>
          <CardDescription>Adicione uma nova imagem ao carrossel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="new-url">URL da Imagem *</Label>
            <Input
              id="new-url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>
          <div>
            <Label htmlFor="new-title">Título (opcional)</Label>
            <Input
              id="new-title"
              value={newImageTitle}
              onChange={(e) => setNewImageTitle(e.target.value)}
              placeholder="Título da imagem"
            />
          </div>
          <div>
            <Label htmlFor="new-description">Descrição (opcional)</Label>
            <Textarea
              id="new-description"
              value={newImageDescription}
              onChange={(e) => setNewImageDescription(e.target.value)}
              placeholder="Descrição da imagem para acessibilidade"
              rows={2}
            />
          </div>
          <Button onClick={handleAddImage} disabled={addingImage || !newImageUrl.trim()}>
            {addingImage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Adicionando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Imagem
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Modo Compatibilidade - 6 URLs Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Modo Compatibilidade - 6 URLs Rápidas</CardTitle>
          <CardDescription>Configure até 6 imagens de uma vez (substitui todas as existentes)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(urls).map(([key, value]) => {
            const validation = urlValidation[key]
            const urlKey = key as keyof CarouselUrls

            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id={key}
                      value={value || ""}
                      onChange={(e) => handleUrlChange(urlKey, e.target.value)}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className={
                        validation?.valid === false ? "border-red-500" : validation?.valid ? "border-green-500" : ""
                      }
                    />
                    {validation?.testing && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                  </div>
                  {value && (
                    <Button size="sm" variant="outline" onClick={() => window.open(value, "_blank")}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {validation?.error && <p className="text-sm text-red-600">{validation.error}</p>}
                {validation?.valid && <p className="text-sm text-green-600">✓ URL válida</p>}
              </div>
            )
          })}

          <Button onClick={handleSaveUrls} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              "Salvar URLs (Substitui Todas)"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
