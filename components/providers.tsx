"use client"

import { UserProvider } from "@/lib/contexts/user-context"
import { Toaster } from "sonner"
import { PWAInstallBanner } from "@/components/pwa-install-banner"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <UserProvider>
      {children}
      <Toaster 
        position="top-right" 
        richColors 
        expand={false}
        duration={4000}
      />
      <PWAInstallBanner />
    </UserProvider>
  )
}