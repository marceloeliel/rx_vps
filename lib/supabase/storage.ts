import { createClient } from "./client"

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// Função para fazer upload de logo da agência
export async function uploadAgenciaLogo(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
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
    const fileName = `${userId}/logo-${Date.now()}.${fileExtension}`

    // Fazer upload do arquivo
    const { data, error } = await supabase.storage.from("agencia-logos").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true, // Substitui se já existir
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
    } = supabase.storage.from("agencia-logos").getPublicUrl(fileName)

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

// Função para deletar logo da agência
export async function deleteAgenciaLogo(userId: string, logoPath: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Verificar se o path pertence ao usuário
    if (!logoPath.startsWith(`${userId}/`)) {
      console.error("Tentativa de deletar arquivo de outro usuário")
      return false
    }

    const { error } = await supabase.storage.from("agencia-logos").remove([logoPath])

    if (error) {
      console.error("Erro ao deletar logo:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro inesperado ao deletar logo:", error)
    return false
  }
}

// Função para listar logos do usuário
export async function listUserLogos(userId: string): Promise<string[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage.from("agencia-logos").list(userId)

    if (error) {
      console.error("Erro ao listar logos:", error)
      return []
    }

    return data?.map((file) => `${userId}/${file.name}`) || []
  } catch (error) {
    console.error("Erro inesperado ao listar logos:", error)
    return []
  }
}

// Função para obter URL pública de uma logo
export function getLogoPublicUrl(logoPath: string): string {
  const supabase = createClient()
  const {
    data: { publicUrl },
  } = supabase.storage.from("agencia-logos").getPublicUrl(logoPath)
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

  // Verificar tamanho (2MB máximo)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Arquivo muito grande. Tamanho máximo: 2MB.",
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

// Função para redimensionar imagem (opcional)
export function resizeImage(file: File, maxWidth = 400, maxHeight = 400): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
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

// Função para converter arquivo para base64 (preview)
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Função para extrair path do storage de uma URL
export function extractStoragePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    const bucketIndex = pathParts.findIndex((part) => part === "agencia-logos")
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join("/")
    }
    return null
  } catch {
    return null
  }
}
