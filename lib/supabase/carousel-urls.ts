import { createClient } from "./client"

export interface CarouselUrls {
  id?: string
  url_1: string | null
  url_2: string | null
  url_3: string | null
  url_4: string | null
  url_5: string | null
  url_6: string | null
}

export interface CarouselImage {
  id: string
  url: string
  title: string
  description: string
  order: number
  active: boolean
}

// Função para obter imagens do carrossel da tabela carousel_images
export async function getCarouselImages(): Promise<CarouselImage[]> {
  const supabase = createClient()

  try {
    console.log("Buscando imagens da tabela carousel_images...")

    // Primeiro, vamos verificar quais colunas existem na tabela
    const { data, error } = await supabase
      .from("carousel_images")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Erro ao buscar imagens do carrossel:", error)
      return []
    }

    if (!data || data.length === 0) {
      console.log("Nenhuma imagem encontrada na tabela carousel_images")
      return []
    }

    console.log("Estrutura dos dados encontrados:", data[0])

    // Converter dados da tabela para o formato esperado
    const images: CarouselImage[] = data.map((item, index) => ({
      id: item.id || `carousel-${index + 1}`,
      url: item.public_url || item.storage_path || "",
      title: item.title || item.name || `Imagem ${index + 1}`,
      description: item.description || `Imagem ${index + 1} do carrossel`,
      order: item.display_order || index + 1,
      // Usar true como padrão já que não temos coluna is_active
      active: true,
    }))

    console.log(`${images.length} imagens carregadas da tabela carousel_images`)
    return images
  } catch (error) {
    console.error("Erro inesperado ao buscar imagens:", error)
    return []
  }
}

// Função para obter URLs do carrossel (mantida para compatibilidade)
export async function getCarouselUrls(): Promise<CarouselUrls | null> {
  try {
    const images = await getCarouselImages()

    if (images.length === 0) {
      return {
        url_1: null,
        url_2: null,
        url_3: null,
        url_4: null,
        url_5: null,
        url_6: null,
      }
    }

    // Converter imagens para formato de URLs
    const urls: CarouselUrls = {
      url_1: images[0]?.url || null,
      url_2: images[1]?.url || null,
      url_3: images[2]?.url || null,
      url_4: images[3]?.url || null,
      url_5: images[4]?.url || null,
      url_6: images[5]?.url || null,
    }

    return urls
  } catch (error) {
    console.error("Erro ao converter imagens para URLs:", error)
    return null
  }
}

// Função para atualizar URLs do carrossel na tabela carousel_images
export async function updateCarouselUrls(urls: Partial<CarouselUrls>): Promise<boolean> {
  const supabase = createClient()

  try {
    console.log("Atualizando URLs na tabela carousel_images...")

    // Primeiro, limpar todas as imagens existentes
    const { error: deleteError } = await supabase
      .from("carousel_images")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all

    if (deleteError) {
      console.error("Erro ao limpar imagens existentes:", deleteError)
      // Continuar mesmo com erro, pode ser que não tenha dados
    }

    // Inserir novas URLs
    const urlEntries = Object.entries(urls).filter(([_, url]) => url && url.trim())

    for (let i = 0; i < urlEntries.length; i++) {
      const [key, url] = urlEntries[i]
      const order = Number.parseInt(key.split("_")[1]) || i + 1

      if (url && url.trim()) {
        const { error: insertError } = await supabase.from("carousel_images").insert({
          name: `carousel-image-${order}`,
          storage_path: url.trim(),
          public_url: url.trim(),
          title: `Imagem ${order}`,
          description: `Imagem ${order} do carrossel`,
          display_order: order,
        })

        if (insertError) {
          console.error(`Erro ao inserir imagem ${order}:`, insertError)
        } else {
          console.log(`Imagem ${order} inserida com sucesso`)
        }
      }
    }

    console.log("URLs atualizadas com sucesso na tabela carousel_images")
    return true
  } catch (error) {
    console.error("Erro inesperado ao atualizar URLs:", error)
    return false
  }
}

// Função para validar se uma URL é válida
export function validateImageUrl(url: string): { valid: boolean; error?: string } {
  if (!url || !url.trim()) {
    return { valid: false, error: "URL não pode estar vazia" }
  }

  try {
    const urlObj = new URL(url)

    // Verificar se é HTTP ou HTTPS
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return { valid: false, error: "URL deve começar com http:// ou https://" }
    }

    // Verificar se parece ser uma imagem
    const pathname = urlObj.pathname.toLowerCase()
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]
    const hasImageExtension = imageExtensions.some((ext) => pathname.endsWith(ext))

    if (
      !hasImageExtension &&
      !pathname.includes("image") &&
      !urlObj.hostname.includes("imgur") &&
      !urlObj.hostname.includes("cloudinary") &&
      !urlObj.hostname.includes("unsplash")
    ) {
      return {
        valid: false,
        error: "URL deve apontar para uma imagem (jpg, png, webp, gif, svg) ou ser de um serviço de imagens conhecido",
      }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: "URL inválida" }
  }
}

// Função para testar se uma URL de imagem carrega
export async function testImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.crossOrigin = "anonymous"
    img.src = url

    // Timeout de 10 segundos
    setTimeout(() => resolve(false), 10000)
  })
}

// Função para adicionar uma nova imagem ao carrossel
export async function addCarouselImage(
  url: string,
  title?: string,
  description?: string,
  order?: number,
): Promise<boolean> {
  const supabase = createClient()

  try {
    // Validar URL primeiro
    const validation = validateImageUrl(url)
    if (!validation.valid) {
      console.error("URL inválida:", validation.error)
      return false
    }

    // Testar se imagem carrega
    const imageLoads = await testImageUrl(url)
    if (!imageLoads) {
      console.error("Imagem não pôde ser carregada:", url)
      return false
    }

    // Obter próxima ordem se não especificada
    if (!order) {
      const { data: maxOrder } = await supabase
        .from("carousel_images")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1)
        .single()

      order = (maxOrder?.display_order || 0) + 1
    }

    // Inserir nova imagem
    const { error } = await supabase.from("carousel_images").insert({
      name: `carousel-image-${order}`,
      storage_path: url,
      public_url: url,
      title: title || `Imagem ${order}`,
      description: description || `Imagem ${order} do carrossel`,
      display_order: order,
    })

    if (error) {
      console.error("Erro ao inserir imagem:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro inesperado ao adicionar imagem:", error)
    return false
  }
}

// Função para remover uma imagem do carrossel
export async function removeCarouselImage(imageId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("carousel_images").delete().eq("id", imageId)

    if (error) {
      console.error("Erro ao remover imagem:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro inesperado ao remover imagem:", error)
    return false
  }
}

// Função para obter todas as imagens (ativas e inativas)
export async function getAllCarouselImages(): Promise<CarouselImage[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("carousel_images")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Erro ao buscar todas as imagens:", error)
      return []
    }

    if (!data) return []

    return data.map((item, index) => ({
      id: item.id || `carousel-${index + 1}`,
      url: item.public_url || item.storage_path || "",
      title: item.title || item.name || `Imagem ${index + 1}`,
      description: item.description || `Imagem ${index + 1} do carrossel`,
      order: item.display_order || index + 1,
      active: true, // Assumir que todas estão ativas por enquanto
    }))
  } catch (error) {
    console.error("Erro inesperado ao buscar todas as imagens:", error)
    return []
  }
}
