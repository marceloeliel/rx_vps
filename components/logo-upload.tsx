"use client"
import { useState, useRef } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Camera, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import {
  uploadAgenciaLogo,
  deleteAgenciaLogo,
  validateImageFile,
  resizeImage,
  fileToBase64,
  extractStoragePathFromUrl,
  type UploadResult,
  type UploadProgress,
} from "@/lib/supabase/storage"

interface LogoUploadProps {
  userId: string
  currentLogoUrl?: string
  onLogoChange: (logoUrl: string | null) => void
  disabled?: boolean
  className?: string
}

export function LogoUpload({
  userId,
  currentLogoUrl,
  onLogoChange,
  disabled = false,
  className = "",
}: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (file: File) => {
    if (disabled) return

    // Validar arquivo
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: validation.error,
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Criar preview
      const preview = await fileToBase64(file)
      setPreviewUrl(preview)

      // Redimensionar imagem se necessário
      let fileToUpload = file
      if (file.size > 500 * 1024) {
        // Se maior que 500KB, redimensionar
        toast({
          title: "Otimizando imagem...",
          description: "Redimensionando para melhor performance.",
        })
        fileToUpload = await resizeImage(file, 400, 400)
      }

      // Deletar logo anterior se existir
      if (currentLogoUrl) {
        const oldPath = extractStoragePathFromUrl(currentLogoUrl)
        if (oldPath) {
          await deleteAgenciaLogo(userId, oldPath)
        }
      }

      // Fazer upload
      const result: UploadResult = await uploadAgenciaLogo(userId, fileToUpload, (progress: UploadProgress) => {
        setUploadProgress(progress.percentage)
      })

      if (result.success && result.url) {
        setPreviewUrl(result.url)
        onLogoChange(result.url)
        toast({
          title: "✅ Logo enviada com sucesso!",
          description: "Sua logo foi salva e já está sendo exibida.",
        })
      } else {
        throw new Error(result.error || "Erro no upload")
      }
    } catch (error) {
      console.error("Erro no upload:", error)
      setPreviewUrl(currentLogoUrl || null)
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro inesperado durante o upload.",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveLogo = async () => {
    if (disabled || !currentLogoUrl) return

    setUploading(true)

    try {
      const logoPath = extractStoragePathFromUrl(currentLogoUrl)
      if (logoPath) {
        const success = await deleteAgenciaLogo(userId, logoPath)
        if (success) {
          setPreviewUrl(null)
          onLogoChange(null)
          toast({
            title: "Logo removida",
            description: "A logo foi removida com sucesso.",
          })
        } else {
          throw new Error("Erro ao remover logo")
        }
      }
    } catch (error) {
      console.error("Erro ao remover logo:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover a logo.",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-sm font-medium text-gray-900">Logo da Agência</Label>

      {/* Preview da logo atual */}
      {previewUrl && (
        <div className="relative inline-block">
          <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Logo da agência"
              width={128}
              height={128}
              className="w-full h-full object-contain"
            />
          </div>
          {!uploading && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Área de upload */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? "border-orange-500 bg-orange-50"
            : uploading
              ? "border-gray-300 bg-gray-50"
              : "border-gray-300 hover:border-gray-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleFileSelect(file)
            }
          }}
          className="hidden"
          disabled={disabled}
        />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 text-orange-500 mx-auto animate-spin" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Enviando logo...</p>
              <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              <p className="text-xs text-gray-500">{Math.round(uploadProgress)}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              {previewUrl ? <Camera className="h-8 w-8 text-gray-400" /> : <Upload className="h-8 w-8 text-gray-400" />}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {previewUrl ? "Clique para alterar a logo" : "Clique para fazer upload ou arraste uma imagem"}
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WebP ou GIF até 2MB</p>
            </div>
            <Button type="button" variant="outline" className="text-sm" disabled={disabled}>
              {previewUrl ? "Alterar Logo" : "Selecionar Arquivo"}
            </Button>
          </div>
        )}
      </div>

      {/* Dicas de otimização */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Dicas para melhor resultado:</p>
            <ul className="text-xs space-y-1 text-blue-700">
              <li>• Use imagens quadradas (1:1) para melhor visualização</li>
              <li>• Prefira fundos transparentes (PNG) ou brancos</li>
              <li>• Resolução recomendada: 400x400 pixels</li>
              <li>• Evite textos muito pequenos na logo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Status de validação */}
      {!previewUrl && (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <span>Logo não obrigatória, mas recomendada para maior credibilidade</span>
        </div>
      )}
    </div>
  )
}
