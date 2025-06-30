"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Trash2, ExternalLink, RefreshCw, Plus, Upload } from "lucide-react"
import {
  getCarouselImages,
  addCarouselImage,
  removeCarouselImage,
  addMultipleCarouselImages,
  testCarouselTable,
  type CarouselImage,
} from "@/lib/supabase/carousel-simple"

export default function CarouselSimpleAdmin() {
  const [images, setImages] = useState<CarouselImage[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newUrl, setNewUrl] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [multipleUrls, setMultipleUrls] = useState("")

  const loadImages = async () => {
    setLoading(true)
    try {
      const data = await getCarouselImages()
      setImages(data)
    } catch (error) {
      console.error("Erro ao carregar imagens:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddImage = async () => {
    if (!newUrl.trim()) return

    setAdding(true)
    try {
      const success = await addCarouselImage(
        newUrl.trim(),
        newTitle.trim() || undefined,
        newDescription.trim() || undefined,
      )
      if (success) {
        setNewUrl("")
        setNewTitle("")
        setNewDescription("")
        await loadImages()
      }
    } catch (error) {
      console.error("Erro ao adicionar imagem:", error)
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveImage = async (imageId: string) => {
    try {
      const success = await removeCarouselImage(imageId)
      if (success) {
        await loadImages()
      }
    } catch (error) {
      console.error("Erro ao remover imagem:", error)
    }
  }

  const handleAddMultiple = async () => {
    if (!multipleUrls.trim()) return

    setAdding(true)
    try {
      const urls = multipleUrls
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url)

      const success = await addMultipleCarouselImages(urls)
      if (success) {
        setMultipleUrls("")
        await loadImages()
      }
    } catch (error) {
      console.error("Erro ao adicionar múltiplas imagens:", error)
    } finally {
      setAdding(false)
    }
  }

  const handleTestTable = async () => {
    await testCarouselTable()
  }

  useEffect(() => {
    loadImages()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciar Carrossel - Simples</h1>
        <div className="flex gap-2">
          <Button onClick={handleTestTable} variant="outline" size="sm">
            🔍 Testar Tabela
          </Button>
          <Button onClick={loadImages} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-blue-600">{images.length}</div>
            <div className="text-gray-600">imagens cadastradas</div>
            {loading && <div className="text-sm text-gray-500">Carregando...</div>}
          </div>
        </CardContent>
      </Card>

      {/* Adicionar uma imagem */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Uma Imagem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="url">URL da Imagem *</Label>
            <Input
              id="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título da imagem"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Descrição da imagem"
              className="mt-1"
            />
          </div>
          <Button onClick={handleAddImage} disabled={!newUrl.trim() || adding} className="w-full">
            {adding ? "Adicionando..." : "Adicionar Imagem"}
          </Button>
        </CardContent>
      </Card>

      {/* Adicionar múltiplas imagens */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Adicionar Múltiplas Imagens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="multiple">URLs (uma por linha)</Label>
            <Textarea
              id="multiple"
              value={multipleUrls}
              onChange={(e) => setMultipleUrls(e.target.value)}
              placeholder={`https://exemplo.com/imagem1.jpg
https://exemplo.com/imagem2.jpg
https://exemplo.com/imagem3.jpg`}
              rows={6}
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleAddMultiple}
            disabled={!multipleUrls.trim() || adding}
            className="w-full"
            variant="secondary"
          >
            {adding ? "Processando..." : "Substituir Todas as Imagens"}
          </Button>
          <p className="text-sm text-gray-600">
            ⚠️ Isso irá remover todas as imagens existentes e adicionar as novas URLs
          </p>
        </CardContent>
      </Card>

      {/* Lista de imagens */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🖼️ Imagens Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando imagens...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma imagem cadastrada ainda.
              <br />
              Adicione algumas URLs acima para começar!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-3">
                  <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=300&text=Erro+ao+carregar"
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm">{image.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">{image.description}</p>
                    <p className="text-xs text-gray-500">Ordem: {image.order}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(image.url, "_blank")}
                      className="flex-1"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Abrir
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveImage(image.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
