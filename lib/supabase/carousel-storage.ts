import { createClient } from "./client"

export interface CarouselImage {
  id: string
  name: string
  url: string
  title?: string
  description?: string
  order: number
  active: boolean
  created_at: string
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

// Função para fazer upload de imagem do carrossel
export async function uploadCarouselImage(
  file: File,
  title?: string,
  description?: string,
  order = 0,
): Promise<UploadResult> {
  const supabase = createClient()

  try {
    // Validar arquivo
    const validationResult = validateImageFile(file)
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error,
      }
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    const fileName = `carousel-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`

    // Fazer upload do arquivo
    const { data, error } = await supabase.storage.from("carousel-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Erro no upload:", error)
      return {
        success: false,
        error: `Erro no upload: ${error.message}`,
      }
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("carousel-images").getPublicUrl(fileName)

    return {
      success: true,
      url: publicUrl,
      path: fileName,
    }
  } catch (error) {
    console.error("Erro inesperado no upload:", error)
    return {
      success: false,
      error: "Erro inesperado durante o upload",
    }
  }
}

// Função para deletar imagem do carrossel
export async function deleteCarouselImage(imagePath: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage.from("carousel-images").remove([imagePath])

    if (error) {
      console.error("Erro ao deletar imagem:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro inesperado ao deletar imagem:", error)
    return false
  }
}

// Função para listar todas as imagens do carrossel
export async function listCarouselImages(): Promise<CarouselImage[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage.from("carousel-images").list()

    if (error) {
      console.error("Erro ao listar imagens:", error)
      return []
    }

    // Converter para formato CarouselImage
    const images: CarouselImage[] =
      data?.map((file, index) => ({
        id: file.id || file.name,
        name: file.name,
        url: getCarouselImageUrl(file.name),
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extensão como título padrão
        description: "",
        order: index,
        active: true,
        created_at: file.created_at || new Date().toISOString(),
      })) || []

    return images.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error("Erro inesperado ao listar imagens:", error)
    return []
  }
}

// Função para obter URL pública de uma imagem do carrossel
export function getCarouselImageUrl(imagePath: string): string {
  const supabase = createClient()
  const {
    data: { publicUrl },
  } = supabase.storage.from("carousel-images").getPublicUrl(imagePath)
  return publicUrl
}

// Função para validar arquivo de imagem
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Verificar tipo de arquivo
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.",
    }
  }

  // Verificar tamanho (5MB máximo)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Arquivo muito grande. Tamanho máximo: 5MB.",
    }
  }

  // Verificar se é realmente uma imagem
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "Arquivo deve ser uma imagem.",
    }
  }

  return { valid: true }
}

// Função para redimensionar imagem para o carrossel
export function resizeCarouselImage(file: File, maxWidth = 1920, maxHeight = 800): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img

      // Redimensionar para formato widescreen do carrossel
      const aspectRatio = width / height
      const targetAspectRatio = maxWidth / maxHeight

      if (aspectRatio > targetAspectRatio) {
        // Imagem mais larga - ajustar pela altura
        height = maxHeight
        width = height * aspectRatio
      } else {
        // Imagem mais alta - ajustar pela largura
        width = maxWidth
        height = width / aspectRatio
      }

      canvas.width = width
      canvas.height = height

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height)

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(resizedFile)
          } else {
            reject(new Error("Erro ao redimensionar imagem"))
          }
        },
        file.type,
        0.9, // Qualidade
      )
    }

    img.onerror = () => reject(new Error("Erro ao carregar imagem"))
    img.src = URL.createObjectURL(file)
  })
}

// Função para extrair path do storage de uma URL
export function extractCarouselPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    const bucketIndex = pathParts.findIndex((part) => part === "carousel-images")
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join("/")
    }
    return null
  } catch {
    return null
  }
}
