"use client"

import AdminCarrossel from "@/components/admin-carrossel"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Metadata } from "next"

export default function CarrosselAdminPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-gray-600">Gerenciamento do carrossel da home</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                🏠 Ver Site
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="py-8">
        <AdminCarrossel />
      </main>
    </div>
  )
}
