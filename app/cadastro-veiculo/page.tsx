import VerificacaoVendedor from "@/components/verificacao-vendedor"
import VeiculoForm from "@/components/veiculo-form"
import SubscriptionGuard from "@/components/subscription-guard"

export default function CadastroVeiculoPage() {
  return (
    <VerificacaoVendedor>
      <SubscriptionGuard>
        <VeiculoForm />
      </SubscriptionGuard>
    </VerificacaoVendedor>
  )
}
