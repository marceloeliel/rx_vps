import { createClient } from "./client"

export interface CarouselImage {
  id: string
  url: string
  title: string
  description: string
  order: number
}

// Função simples para obter todas as imagens do carrossel
export async function getCarouselImages(): Promise<CarouselImage[]> {
  const supabase = createClient()

  try {
    console.log("Buscando imagens da tabela carousel_images...")

    // Buscar todas as imagens sem ordenação específica primeiro
    const { data, error } = await supabase.from("carousel_images").select("*")

    if (error) {
      console.error("Erro ao buscar imagens:", error)
      return []
    }

    if (!data || data.length === 0) {
      console.log("Nenhuma imagem encontrada")
      return []
    }

    console.log("Dados brutos da tabela:", data[0]) // Log para debug

    // Converter para formato simples, adaptando para diferentes estruturas possíveis
    const images: CarouselImage[] = data.map((item, index) => {
      // Tentar diferentes nomes de colunas para URL
      const url = item.url || item.public_url || item.storage_path || item.image_url || ""

      // Tentar diferentes nomes de colunas para ordem
      const order = item.order || item.display_order || item.position || item.sort_order || index + 1

      return {
        id: item.id || `img-${index}`,
        url: url,
        title: item.title || item.name || `Imagem ${index + 1}`,
        description: item.description || item.desc || `Descrição da imagem ${index + 1}`,
        order: Number(order),
      }
    })

    // Filtrar apenas imagens com URL válida
    const validImages = images.filter((img) => img.url && img.url.trim())

    // Ordenar por ordem
    validImages.sort((a, b) => a.order - b.order)

    console.log(`${validImages.length} imagens válidas encontradas`)
    console.log("Primeira imagem:", validImages[0]) // Log para debug

    return validImages
  } catch (error) {
    console.error("Erro inesperado:", error)
    return []
  }
}

// Função para adicionar nova imagem
export async function addCarouselImage(url: string, title?: string, description?: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Obter próxima ordem - buscar o maior valor atual
    const { data: existingImages } = await supabase.from("carousel_images").select("*")

    let nextOrder = 1
    if (existingImages && existingImages.length > 0) {
      // Tentar diferentes nomes de colunas para ordem
      const orders = existingImages.map((img) => {
        return img.order || img.display_order || img.position || img.sort_order || 0
      })
      nextOrder = Math.max(...orders) + 1
    }

    // Preparar dados para inserção
    const insertData: any = {
      url: url,
      title: title || `Imagem ${nextOrder}`,
      description: description || `Imagem ${nextOrder} do carrossel`,
    }

    // Adicionar campo de ordem (tentar diferentes nomes)
    insertData.order = nextOrder

    // Adicionar outros campos que podem existir
    insertData.name = `carousel-${nextOrder}`

    const { error } = await supabase.from("carousel_images").insert(insertData)

    if (error) {
      console.error("Erro ao inserir:", error)
      return false
    }

    console.log("Imagem adicionada com sucesso")
    return true
  } catch (error) {
    console.error("Erro inesperado ao adicionar:", error)
    return false
  }
}

// Função para remover imagem
export async function removeCarouselImage(imageId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("carousel_images").delete().eq("id", imageId)

    if (error) {
      console.error("Erro ao remover:", error)
      return false
    }

    console.log("Imagem removida com sucesso")
    return true
  } catch (error) {
    console.error("Erro inesperado ao remover:", error)
    return false
  }
}

// Função para atualizar imagem
export async function updateCarouselImage(
  imageId: string,
  updates: { url?: string; title?: string; description?: string; order?: number },
): Promise<boolean> {
  const supabase = createClient()

  try {
    const updateData: any = {}

    if (updates.url) updateData.url = updates.url
    if (updates.title) updateData.title = updates.title
    if (updates.description) updateData.description = updates.description
    if (updates.order) updateData.order = updates.order

    const { error } = await supabase.from("carousel_images").update(updateData).eq("id", imageId)

    if (error) {
      console.error("Erro ao atualizar:", error)
      return false
    }

    console.log("Imagem atualizada com sucesso")
    return true
  } catch (error) {
    console.error("Erro inesperado ao atualizar:", error)
    return false
  }
}

// Função para limpar todas as imagens
export async function clearAllCarouselImages(): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("carousel_images").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    if (error) {
      console.error("Erro ao limpar imagens:", error)
      return false
    }

    console.log("Todas as imagens foram removidas")
    return true
  } catch (error) {
    console.error("Erro inesperado ao limpar:", error)
    return false
  }
}

// Função para adicionar múltiplas URLs de uma vez
export async function addMultipleCarouselImages(urls: string[]): Promise<boolean> {
  const supabase = createClient()

  try {
    // Limpar imagens existentes primeiro
    await clearAllCarouselImages()

    // Adicionar novas imagens
    const imagesToInsert = urls
      .filter((url) => url && url.trim())
      .map((url, index) => ({
        name: `carousel-${index + 1}`,
        url: url.trim(),
        title: `Imagem ${index + 1}`,
        description: `Imagem ${index + 1} do carrossel`,
        order: index + 1,
      }))

    if (imagesToInsert.length === 0) {
      console.log("Nenhuma URL válida fornecida")
      return true
    }

    const { error } = await supabase.from("carousel_images").insert(imagesToInsert)

    if (error) {
      console.error("Erro ao inserir múltiplas imagens:", error)
      return false
    }

    console.log(`${imagesToInsert.length} imagens adicionadas com sucesso`)
    return true
  } catch (error) {
    console.error("Erro inesperado ao adicionar múltiplas imagens:", error)
    return false
  }
}

// Função para testar conexão e estrutura da tabela
export async function testCarouselTable(): Promise<void> {
  const supabase = createClient()

  try {
    console.log("=== TESTE DA TABELA CAROUSEL_IMAGES ===")

    const { data, error } = await supabase.from("carousel_images").select("*").limit(1)

    if (error) {
      console.error("❌ Erro ao acessar tabela:", error)
      return
    }

    if (!data || data.length === 0) {
      console.log("⚠️ Tabela existe mas está vazia")
      return
    }

    console.log("✅ Tabela acessível!")
    console.log("📋 Estrutura da primeira linha:", Object.keys(data[0]))
    console.log("📄 Dados da primeira linha:", data[0])
  } catch (error) {
    console.error("❌ Erro inesperado no teste:", error)
  }
}
