"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, ExternalLink, RefreshCw, Plus, Upload, TestTube } from "lucide-react"
import Image from "next/image"
import {
  getTodasImagensCarrossel,
  adicionarImagemCarrossel,
  removerImagemCarrossel,
  adicionarMultiplasImagensCarrossel,
  testarTabelaCarrossel,
  type ImagemCarrossel,
} from "@/lib/supabase/carrossel"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

export default function AdminCarrossel() {
  const [imagens, setImagens] = useState<ImagemCarrossel[]>([])
  const [loading, setLoading] = useState(true)
  const [processando, setProcessando] = useState(false)
  const [novaUrl, setNovaUrl] = useState("")
  const [multiplasUrls, setMultiplasUrls] = useState("")
  const { toast } = useToast()

  const carregarImagens = async () => {
    setLoading(true)
    try {
      const dados = await getTodasImagensCarrossel()
      setImagens(dados)
    } catch (error) {
      console.error("Erro ao carregar imagens:", error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar",
        description: "Não foi possível carregar as imagens do carrossel.",
      })
    } finally {
      setLoading(false)
    }
  }

  const adicionarImagem = async () => {
    if (!novaUrl.trim()) {
      toast({
        variant: "destructive",
        title: "URL obrigatória",
        description: "Por favor, insira uma URL para a imagem.",
      })
      return
    }

    if (imagens.length >= 6) {
      toast({
        variant: "destructive",
        title: "Limite atingido",
        description: "Máximo de 6 imagens permitidas. Remova uma imagem primeiro.",
      })
      return
    }

    setProcessando(true)
    try {
      const sucesso = await adicionarImagemCarrossel(novaUrl.trim())

      if (sucesso) {
        toast({
          title: "✅ Imagem adicionada!",
          description: "A nova imagem foi adicionada ao carrossel.",
        })
        setNovaUrl("")
        await carregarImagens()
      } else {
        throw new Error("Falha ao adicionar imagem")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar a imagem.",
      })
    } finally {
      setProcessando(false)
    }
  }

  const removerImagem = async (imageId: string) => {
    try {
      const sucesso = await removerImagemCarrossel(imageId)
      if (sucesso) {
        toast({
          title: "🗑️ Imagem removida!",
          description: "A imagem foi removida do carrossel.",
        })
        await carregarImagens()
      } else {
        throw new Error("Falha ao remover imagem")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: "Não foi possível remover a imagem.",
      })
    }
  }

  const adicionarMultiplas = async () => {
    if (!multiplasUrls.trim()) {
      toast({
        variant: "destructive",
        title: "URLs obrigatórias",
        description: "Por favor, insira pelo menos uma URL.",
      })
      return
    }

    setProcessando(true)
    try {
      const urls = multiplasUrls
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0)
        .slice(0, 6) // Limitar a 6 URLs

      const sucesso = await adicionarMultiplasImagensCarrossel(urls)
      if (sucesso) {
        toast({
          title: "🎉 Imagens adicionadas!",
          description: `${urls.length} imagens foram adicionadas ao carrossel.`,
        })
        setMultiplasUrls("")
        await carregarImagens()
      } else {
        throw new Error("Falha ao adicionar imagens")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar as imagens.",
      })
    } finally {
      setProcessando(false)
    }
  }

  const testarTabela = async () => {
    await testarTabelaCarrossel()
    toast({
      title: "🧪 Teste executado!",
      description: "Verifique o console para ver os resultados.",
    })
  }

  useEffect(() => {
    carregarImagens()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🎠 Gerenciar Carrossel</h1>
          <p className="text-gray-600">Configure as imagens que aparecem no carrossel da página inicial</p>
          <p className="text-sm text-amber-600">⚠️ Máximo de 6 imagens (estrutura: url_1 até url_6)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testarTabela} variant="outline" size="sm">
            <TestTube className="w-4 h-4 mr-2" />
            Testar Tabela
          </Button>
          <Button onClick={carregarImagens} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{imagens.length}</div>
                <div className="text-sm text-gray-600">Imagens Cadastradas</div>
              </div>
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{6 - imagens.length}</div>
                <div className="text-sm text-gray-600">Slots Disponíveis</div>
              </div>
              <Plus className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">6</div>
                <div className="text-sm text-gray-600">Máximo Permitido</div>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Limite</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adicionar uma imagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Nova Imagem {imagens.length >= 6 && <Badge variant="destructive">Limite Atingido</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="url">URL da Imagem *</Label>
            <Input
              id="url"
              value={novaUrl}
              onChange={(e) => setNovaUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="mt-1"
              disabled={imagens.length >= 6}
            />
          </div>
          <Button
            onClick={adicionarImagem}
            disabled={!novaUrl.trim() || processando || imagens.length >= 6}
            className="w-full"
          >
            {processando ? "Adicionando..." : "Adicionar Imagem"}
          </Button>
          {imagens.length >= 6 && (
            <p className="text-sm text-amber-600">
              ⚠️ Máximo de 6 imagens atingido. Remova uma imagem para adicionar outra.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Adicionar múltiplas imagens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Substituir Todas as Imagens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="multiplas">URLs (uma por linha, máximo 6)</Label>
            <Textarea
              id="multiplas"
              value={multiplasUrls}
              onChange={(e) => setMultiplasUrls(e.target.value)}
              placeholder={`https://exemplo.com/imagem1.jpg
https://exemplo.com/imagem2.jpg
https://exemplo.com/imagem3.jpg
https://exemplo.com/imagem4.jpg
https://exemplo.com/imagem5.jpg
https://exemplo.com/imagem6.jpg`}
              rows={8}
              className="mt-1"
            />
          </div>
          <Button
            onClick={adicionarMultiplas}
            disabled={!multiplasUrls.trim() || processando}
            className="w-full"
            variant="secondary"
          >
            {processando ? "Processando..." : "Substituir Todas as Imagens"}
          </Button>
          <p className="text-sm text-amber-600">
            ⚠️ Esta ação irá remover todas as imagens existentes e adicionar as novas URLs (máximo 6)
          </p>
        </CardContent>
      </Card>

      {/* Lista de imagens */}
      <Card>
        <CardHeader>
          <CardTitle>🖼️ Imagens do Carrossel ({imagens.length}/6)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Carregando imagens...</span>
            </div>
          ) : imagens.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Nenhuma imagem encontrada</p>
              <p className="text-sm text-gray-400">Adicione imagens usando os formulários acima</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imagens.map((imagem) => (
                <div key={imagem.id} className="border rounded-lg overflow-hidden">
                  <div className="relative aspect-video bg-gray-100">
                    <Image
                      src={imagem.url || "/placeholder.svg"}
                      alt={imagem.titulo}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=300&text=Erro+ao+carregar"
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="default">Slot {imagem.ordem}</Badge>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(imagem.url, "_blank")}
                        title="Abrir imagem em nova aba"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => removerImagem(imagem.id)}
                        title="Remover imagem"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-medium text-sm">{imagem.titulo}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">{imagem.descricao}</p>
                    <div className="text-xs text-gray-500">ID: {imagem.id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">💡 Dicas para esta estrutura:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• A tabela tem 6 slots fixos (url_1, url_2, url_3, url_4, url_5, url_6)</li>
            <li>• Máximo de 6 imagens simultâneas</li>
            <li>• Use URLs diretas de imagens (jpg, png, webp, gif)</li>
            <li>• Recomendamos imagens com pelo menos 1200x600 pixels</li>
            <li>• Serviços gratuitos: Unsplash, Imgur, Cloudinary</li>
            <li>• O carrossel roda automaticamente a cada 4 segundos</li>
            <li>• Para reordenar, remova e adicione novamente na ordem desejada</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
