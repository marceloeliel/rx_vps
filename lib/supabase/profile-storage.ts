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

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    const fileName = `${userId}/profile-${Date.now()}.${fileExtension}`

    // Fazer upload do arquivo
    const { data, error } = await supabase.storage.from("perfil").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
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
    } = supabase.storage.from("perfil").getPublicUrl(fileName)

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

// Função para deletar foto de perfil
export async function deleteProfilePhoto(userId: string, photoUrl: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Extrair path da URL
    const path = extractStoragePathFromUrl(photoUrl)
    if (!path) {
      console.log("⚠️ Não foi possível extrair path da URL:", photoUrl)
      return false
    }

    console.log("🗑️ Tentando deletar arquivo:", path)

    // Verificar se o path pertence ao usuário
    if (!path.startsWith(`${userId}/`)) {
      console.error("❌ Tentativa de deletar arquivo de outro usuário:", path)
      return false
    }

    const { error } = await supabase.storage.from("perfil").remove([path])

    if (error) {
      console.error("❌ Erro ao deletar foto:", error)
      // Mesmo com erro, retornamos true para não bloquear o upload da nova foto
      return true
    }

    console.log("✅ Foto deletada com sucesso:", path)
    return true
  } catch (error) {
    console.error("❌ Erro inesperado ao deletar foto:", error)
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

// Função para redimensionar imagem (opcional)
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
