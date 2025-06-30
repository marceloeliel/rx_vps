"use client"

import CarouselSimpleAdmin from "@/components/carousel-simple-admin"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CarouselSimplePage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Carrossel Simples</h1>
              <p className="text-gray-600">Gerenciamento do carrossel simplificado</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="py-8">
        <CarouselSimpleAdmin />
      </main>
    </div>
  )
}
