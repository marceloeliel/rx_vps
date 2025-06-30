"use client"

import type { Metadata } from "next"
import CarouselUrlAdmin from "@/components/carousel-url-admin"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CarouselUrlsAdminPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
                <p className="text-gray-600">Gerenciar carrossel da página inicial</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <CarouselUrlAdmin />
      </div>
    </div>
  )
}
