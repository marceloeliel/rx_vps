import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface AgencyPanelButtonProps {
  userType?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function AgencyPanelButton({ userType, className, variant = "default" }: AgencyPanelButtonProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleClick = () => {
    if (userType !== "agencia") {
      toast({
        variant: "destructive",
        title: "Acesso restrito",
        description: "Apenas agências cadastradas podem acessar o painel. Atualize seu perfil para tipo 'Agência' para ter acesso.",
      })
      return
    }

    router.push("/painel-agencia")
  }

  return (
    <Button
      onClick={handleClick}
      className={className}
      variant={variant}
    >
      Painel da Agência
    </Button>
  )
} 