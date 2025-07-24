import { createClient } from "./client"

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

// Função para fazer upload de foto de perfil
export async function uploadProfilePhoto(userId: string, file: File): Promise<UploadResult> {
  const supabase = createClient()

  try {
    // Validar arquivo
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "Arquivo deve ser uma imagem.",
      }
    }

    // Verificar tamanho (2MB máximo)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "Arquivo muito grande. Tamanho máximo: 2MB.",
      }
    }

    // Redimensionar imagem antes do upload
    const resizedFile = await resizeProfileImage(file)

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    const fileName = `${userId}/profile-${Date.now()}.${fileExtension}`

    // Fazer upload do arquivo como base64 se o storage falhar
    try {
      // Tentar fazer upload para o storage
      const { data, error } = await supabase.storage.from("perfil").upload(fileName, resizedFile, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) {
        throw error
      }

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("perfil").getPublicUrl(fileName)

      return {
        success: true,
        url: publicUrl,
        path: fileName,
      }
    } catch (storageError) {
      console.log("⚠️ [PROFILE-STORAGE] Erro no storage, usando base64:", storageError)

      // Converter para base64 como fallback
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve({
            success: true,
            url: reader.result as string,
            path: fileName,
          })
        }
        reader.readAsDataURL(resizedFile)
      })
    }
  } catch (error) {
    console.error("❌ [PROFILE-STORAGE] Erro inesperado no upload:", error)
    return {
      success: false,
      error: "Erro inesperado durante o upload",
    }
  }
}

// Função para deletar foto de perfil
export async function deleteProfilePhoto(userId: string, photoUrl: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Se for uma URL base64, não precisa deletar do storage
    if (photoUrl.startsWith('data:')) {
      return true
    }

    // Extrair path da URL
    const path = extractStoragePathFromUrl(photoUrl)
    if (!path) {
      console.log("⚠️ [PROFILE-STORAGE] Não foi possível extrair path da URL:", photoUrl)
      return false
    }

    console.log("🗑️ [PROFILE-STORAGE] Tentando deletar arquivo:", path)

    // Verificar se o path pertence ao usuário
    if (!path.startsWith(`${userId}/`)) {
      console.error("❌ [PROFILE-STORAGE] Tentativa de deletar arquivo de outro usuário:", path)
      return false
    }

    const { error } = await supabase.storage.from("perfil").remove([path])

    if (error) {
      console.error("❌ [PROFILE-STORAGE] Erro ao deletar foto:", error)
      // Mesmo com erro, retornamos true para não bloquear o upload da nova foto
      return true
    }

    console.log("✅ [PROFILE-STORAGE] Foto deletada com sucesso:", path)
    return true
  } catch (error) {
    console.error("❌ [PROFILE-STORAGE] Erro inesperado ao deletar foto:", error)
    // Mesmo com erro, retornamos true para não bloquear o upload da nova foto
    return true
  }
}

// Função para extrair path do storage de uma URL
function extractStoragePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    const bucketIndex = pathParts.findIndex((part) => part === "perfil")
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join("/")
    }
    return null
  } catch {
    return null
  }
}

// Função para redimensionar imagem
export function resizeProfileImage(file: File, maxSize = 300): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calcular novas dimensões (quadrado)
      const size = Math.min(img.width, img.height)
      canvas.width = maxSize
      canvas.height = maxSize

      // Desenhar imagem centralizada e cortada
      const offsetX = (img.width - size) / 2
      const offsetY = (img.height - size) / 2

      ctx?.drawImage(img, offsetX, offsetY, size, size, 0, 0, maxSize, maxSize)

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
