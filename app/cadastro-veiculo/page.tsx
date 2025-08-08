import VerificacaoVendedor from "@/components/verificacao-vendedor"
import VeiculoForm from "@/components/veiculo-form"
import SubscriptionGuard from "@/components/subscription-guard"
import { PlanPermissionGuard } from "@/components/plan-permission-guard"

export default function CadastroVeiculoPage() {
  return (
    <VerificacaoVendedor>
      <SubscriptionGuard>
        <PlanPermissionGuard requiredFeature="addVehicle" showUpgradePrompt={true}>
          <VeiculoForm />
        </PlanPermissionGuard>
      </SubscriptionGuard>
    </VerificacaoVendedor>
  )
}
