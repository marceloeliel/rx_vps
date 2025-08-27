'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface Field {
  key: string
  label: string
  type: 'text' | 'email' | 'select' | 'textarea' | 'number' | 'date'
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
}

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  fields: Field[]
  data?: any
  onSubmit: (data: any) => void
  submitLabel?: string
  loading?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function AdminModal({
  isOpen,
  onClose,
  title,
  description,
  fields,
  data = {},
  onSubmit,
  submitLabel = 'Salvar',
  loading = false,
  size = 'md'
}: AdminModalProps) {
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (isOpen) {
      setFormData(data)
      setErrors({})
    }
  }, [isOpen, data])

  const handleInputChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value })
    if (errors[key]) {
      setErrors({ ...errors, [key]: null })
    }
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    fields.forEach(field => {
      if (field.required && (!formData[field.key] || formData[field.key].toString().trim() === '')) {
        newErrors[field.key] = `${field.label} é obrigatório`
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      disabled={field.disabled || loading}
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[field.key] ? 'border-red-500' : 'border-gray-300'
                      } ${field.disabled ? 'bg-gray-100' : ''}`}
                    >
                      <option value="">Selecione...</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      disabled={field.disabled || loading}
                      rows={4}
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                        errors[field.key] ? 'border-red-500' : 'border-gray-300'
                      } ${field.disabled ? 'bg-gray-100' : ''}`}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      disabled={field.disabled || loading}
                      className={`${
                        errors[field.key] ? 'border-red-500' : ''
                      } ${field.disabled ? 'bg-gray-100' : ''}`}
                    />
                  )}
                  
                  {errors[field.key] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </div>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}