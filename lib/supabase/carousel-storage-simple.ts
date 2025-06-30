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

// Função para verificar se a tabela carousel_images existe
async function checkTableExists(): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("carousel_images").select("id").limit(1)
    return !error
  } catch (error) {
    return false
  }
}

// Função para testar permissões de forma mais robusta
async function testPermissions(): Promise<{ canRead: boolean; canWrite: boolean; error?: string }> {
  const supabase = createClient()

  try {
    // Testar leitura
    const { error: readError } = await supabase.from("carousel_images").select("id").limit(1)
    const canRead = !readError

    // Testar escrita com dados únicos
    const testId = `test-${Date.now()}-${Math.random().toString(36).substring(2)}`
    const { error: writeError } = await supabase
      .from("carousel_images")
      .insert({
        name: testId,
        storage_path: testId,
        public_url: `https://test.com/${testId}`,
        title: "Test",
        description: "Test",
        display_order: 999999,
        is_active: false,
      })
      .select()

    const canWrite = !writeError

    // Se conseguiu inserir, tentar deletar o teste
    if (canWrite) {
      await supabase.from("carousel_images").delete().eq("name", testId)
    }

    return {
      canRead,
      canWrite,
      error: writeError?.message,
    }
  } catch (error) {
    return {
      canRead: false,
      canWrite: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
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
    // Verificar se a tabela existe
    const tableExists = await checkTableExists()
    if (!tableExists) {
      return {
        success: false,
        error: "Tabela carousel_images não existe. Execute o script SQL 'create-carousel-images-table.sql' primeiro.",
      }
    }

    // Testar permissões
    const { canWrite, error: permError } = await testPermissions()
    if (!canWrite) {
      return {
        success: false,
        error: `Erro de permissão na tabela: ${permError}. Execute o script 'fix-carousel-permissions-complete.sql' para corrigir.`,
      }
    }

    // Validar arquivo
    const validationResult = validateImageFile(file)
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error,
      }
    }

    // Redimensionar imagem para o carrossel
    const resizedFile = await resizeCarouselImage(file)

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    const fileName = `carousel-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`

    console.log("Tentando upload do arquivo:", fileName)

    // Fazer upload do arquivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("carousel-images")
      .upload(fileName, resizedFile, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Erro no upload do storage:", uploadError)
      return {
        success: false,
        error: `Erro no upload do storage: ${uploadError.message}. Verifique as permissões do bucket 'carousel-images' no Supabase Dashboard.`,
      }
    }

    console.log("Upload do storage bem-sucedido:", uploadData)

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("carousel-images").getPublicUrl(fileName)

    console.log("URL pública gerada:", publicUrl)

    // Salvar metadados na tabela
    const { data: insertData, error: metadataError } = await supabase
      .from("carousel_images")
      .insert({
        name: file.name,
        storage_path: fileName,
        public_url: publicUrl,
        title: title || file.name.replace(/\.[^/.]+$/, ""),
        description: description || "",
        display_order: order,
        is_active: true,
      })
      .select()

    if (metadataError) {
      console.error("Erro ao salvar metadados:", metadataError)
      // Tentar deletar o arquivo do storage se não conseguiu salvar metadados
      await supabase.storage.from("carousel-images").remove([fileName])
      return {
        success: false,
        error: `Erro ao salvar metadados: ${metadataError.message}`,
      }
    }

    console.log("Metadados salvos com sucesso:", insertData)

    return {
      success: true,
      url: publicUrl,
      path: fileName,
    }
  } catch (error) {
    console.error("Erro inesperado no upload:", error)
    return {
      success: false,
      error: `Erro inesperado: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    }
  }
}

// Função para deletar imagem do carrossel
export async function deleteCarouselImage(imagePath: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Verificar se a tabela existe
    const tableExists = await checkTableExists()
    if (!tableExists) {
      console.warn("Tabela carousel_images não existe")
      return false
    }

    // Testar permissões
    const { canWrite } = await testPermissions()
    if (!canWrite) {
      console.warn("Sem permissão para deletar dados")
      return false
    }

    // Deletar metadados da tabela primeiro
    const { error: metadataError } = await supabase.from("carousel_images").delete().eq("storage_path", imagePath)

    if (metadataError) {
      console.error("Erro ao deletar metadados:", metadataError)
      return false
    }

    // Deletar arquivo do storage
    const { error: storageError } = await supabase.storage.from("carousel-images").remove([imagePath])

    if (storageError) {
      console.error("Erro ao deletar imagem do storage:", storageError)
      // Mesmo com erro no storage, consideramos sucesso se os metadados foram deletados
    }

    return true
  } catch (error) {
    console.error("Erro inesperado ao deletar imagem:", error)
    return false
  }
}

// Função para listar imagens ativas do carrossel
export async function listActiveCarouselImages(): Promise<CarouselImage[]> {
  const supabase = createClient()

  try {
    // Verificar se a tabela existe
    const tableExists = await checkTableExists()
    if (!tableExists) {
      console.warn("Tabela carousel_images não existe. Retornando array vazio.")
      return []
    }

    const { data, error } = await supabase
      .from("carousel_images")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Erro ao listar imagens:", error)
      return []
    }

    // Converter para formato CarouselImage
    const images: CarouselImage[] =
      data?.map((item) => ({
        id: item.id,
        name: item.name,
        url: item.public_url,
        title: item.title,
        description: item.description,
        order: item.display_order,
        active: item.is_active,
        created_at: item.created_at,
      })) || []

    return images
  } catch (error) {
    console.error("Erro inesperado ao listar imagens:", error)
    return []
  }
}

// Função para listar todas as imagens do carrossel (incluindo inativas)
export async function listAllCarouselImages(): Promise<CarouselImage[]> {
  const supabase = createClient()

  try {
    // Verificar se a tabela existe
    const tableExists = await checkTableExists()
    if (!tableExists) {
      console.warn("Tabela carousel_images não existe. Retornando array vazio.")
      return []
    }

    const { data, error } = await supabase
      .from("carousel_images")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Erro ao listar todas as imagens:", error)
      return []
    }

    const images: CarouselImage[] =
      data?.map((item) => ({
        id: item.id,
        name: item.name,
        url: item.public_url,
        title: item.title,
        description: item.description,
        order: item.display_order,
        active: item.is_active,
        created_at: item.created_at,
      })) || []

    return images
  } catch (error) {
    console.error("Erro inesperado ao listar todas as imagens:", error)
    return []
  }
}

// Função para atualizar status de uma imagem
export async function updateCarouselImageStatus(id: string, isActive: boolean): Promise<boolean> {
  const supabase = createClient()

  try {
    // Verificar se a tabela existe
    const tableExists = await checkTableExists()
    if (!tableExists) {
      console.warn("Tabela carousel_images não existe")
      return false
    }

    // Testar permissões
    const { canWrite } = await testPermissions()
    if (!canWrite) {
      console.warn("Sem permissão para atualizar dados")
      return false
    }

    const { error } = await supabase.from("carousel_images").update({ is_active: isActive }).eq("id", id)

    if (error) {
      console.error("Erro ao atualizar status:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro inesperado ao atualizar status:", error)
    return false
  }
}

// Função para atualizar ordem das imagens
export async function updateCarouselImageOrder(id: string, newOrder: number): Promise<boolean> {
  const supabase = createClient()

  try {
    // Verificar se a tabela existe
    const tableExists = await checkTableExists()
    if (!tableExists) {
      console.warn("Tabela carousel_images não existe")
      return false
    }

    // Testar permissões
    const { canWrite } = await testPermissions()
    if (!canWrite) {
      console.warn("Sem permissão para atualizar dados")
      return false
    }

    const { error } = await supabase.from("carousel_images").update({ display_order: newOrder }).eq("id", id)

    if (error) {
      console.error("Erro ao atualizar ordem:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro inesperado ao atualizar ordem:", error)
    return false
  }
}

// Função para atualizar metadados de uma imagem
export async function updateCarouselImageMetadata(id: string, title: string, description: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Verificar se a tabela existe
    const tableExists = await checkTableExists()
    if (!tableExists) {
      console.warn("Tabela carousel_images não existe")
      return false
    }

    // Testar permissões
    const { canWrite } = await testPermissions()
    if (!canWrite) {
      console.warn("Sem permissão para atualizar dados")
      return false
    }

    const { error } = await supabase
      .from("carousel_images")
      .update({
        title: title,
        description: description,
      })
      .eq("id", id)

    if (error) {
      console.error("Erro ao atualizar metadados:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro inesperado ao atualizar metadados:", error)
    return false
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

      canvas.width = Math.min(width, maxWidth)
      canvas.height = Math.min(height, maxHeight)

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

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
        0.9, // Qualidade 90%
      )
    }

    img.onerror = () => reject(new Error("Erro ao carregar imagem"))
    img.crossOrigin = "anonymous"
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
