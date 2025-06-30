# API FIPE - Fipe Online

Este projeto utiliza a **Fipe Online API** para consultar dados da tabela FIPE (Fundação Instituto de Pesquisas Econômicas) e facilitar o preenchimento automático de informações de veículos.

## 📋 Sobre a API

- **URL Base**: `https://fipe.parallelum.com.br/api/v2`
- **Documentação**: [Fipe Online API](https://fipe.online/docs/api/fipe)
- **Autenticação**: Token JWT obrigatório
- **Limite**: Acesso ilimitado com token válido

## 🔑 Autenticação

A API requer um token de autenticação no header `X-Subscription-Token`. O token está configurado no arquivo `lib/fipe-api.ts`.

```typescript
const headers = {
  'Content-Type': 'application/json',
  'X-Subscription-Token': 'seu-token-aqui'
}
```

## 🚗 Tipos de Veículo Suportados

| Tipo | Código API | Descrição |
|------|------------|-----------|
| Carro | `cars` | Automóveis e utilitários |
| Moto | `motorcycles` | Motocicletas |
| Caminhão | `trucks` | Caminhões e veículos pesados |

## 📡 Endpoints Utilizados

### 1. Buscar Marcas
```http
GET /{vehicleType}/brands
```

**Exemplo:**
```typescript
const marcas = await buscarMarcas('carro')
// Retorna: [{ code: "23", name: "VW - VolksWagen" }, ...]
```

### 2. Buscar Modelos
```http
GET /{vehicleType}/brands/{brandId}/models
```

**Exemplo:**
```typescript
const modelos = await buscarModelos('carro', '23')
// Retorna: [{ code: "5585", name: "AMAROK CD2.0 16V/S CD2.0 16V TDI 4x2 Die" }, ...]
```

### 3. Buscar Anos
```http
GET /{vehicleType}/brands/{brandId}/models/{modelId}/years
```

**Exemplo:**
```typescript
const anos = await buscarAnos('carro', '23', '5585')
// Retorna: [{ code: "2022-3", name: "2022 Diesel" }, ...]
```

### 4. Buscar Preço FIPE
```http
GET /{vehicleType}/brands/{brandId}/models/{modelId}/years/{yearId}
```

**Exemplo:**
```typescript
const preco = await buscarPrecoFipe('carro', '23', '5585', '2022-3')
// Retorna: {
//   brand: "VW - VolksWagen",
//   model: "AMAROK High.CD 2.0 16V TDI 4x4 Dies. Aut",
//   modelYear: 2022,
//   fuel: "Diesel",
//   codeFipe: "005340-6",
//   price: "R$ 150.000,00",
//   referenceMonth: "abril de 2024"
// }
```

## 🛠️ Como Usar

### 1. Hook useFipe

```typescript
import { useFipe } from '@/hooks/use-fipe'

function MeuComponente() {
  const {
    data,
    loading,
    errors,
    selectedMarca,
    selectedModelo,
    selectedAno,
    handleMarcaChange,
    handleModeloChange,
    handleAnoChange,
    buscarPreco,
    mapearCombustivelFipe
  } = useFipe({ 
    tipoVeiculo: 'carro',
    enableCache: true 
  })

  return (
    <div>
      {/* Seus componentes aqui */}
    </div>
  )
}
```

### 2. Componente FipeSelector

```typescript
import { FipeSelector } from '@/components/fipe-selector'

function FormularioVeiculo() {
  const handleFipeSelect = (dados) => {
    console.log('Dados FIPE:', dados)
    // Aplicar dados ao formulário
  }

  return (
    <FipeSelector 
      tipoVeiculo="carro"
      onSelect={handleFipeSelect}
    />
  )
}
```

## 📊 Estrutura dos Dados

### FipeMarca
```typescript
interface FipeMarca {
  code: string    // Código da marca
  name: string    // Nome da marca
}
```

### FipeModelo
```typescript
interface FipeModelo {
  code: string    // Código do modelo
  name: string    // Nome do modelo
}
```

### FipeAno
```typescript
interface FipeAno {
  code: string    // Código do ano (ex: "2022-3")
  name: string    // Nome do ano (ex: "2022 Diesel")
}
```

### FipePreco
```typescript
interface FipePreco {
  brand: string           // Marca
  model: string          // Modelo
  modelYear: number      // Ano do modelo
  fuel: string          // Combustível
  fuelAcronym: string   // Sigla do combustível
  codeFipe: string      // Código FIPE
  price: string         // Preço formatado
  priceHistory: any[]   // Histórico de preços
  referenceMonth: string // Mês de referência
  vehicleType: number   // Tipo do veículo
}
```

## 🔄 Fluxo de Funcionamento

1. **Seleção do Tipo**: Usuário escolhe o tipo de veículo
2. **Carregamento de Marcas**: API busca marcas disponíveis
3. **Seleção da Marca**: Usuário escolhe a marca
4. **Carregamento de Modelos**: API busca modelos da marca
5. **Seleção do Modelo**: Usuário escolhe o modelo
6. **Carregamento de Anos**: API busca anos disponíveis
7. **Seleção do Ano**: Usuário escolhe o ano
8. **Consulta de Preço**: API busca preço FIPE
9. **Aplicação dos Dados**: Dados são aplicados ao formulário

## ⚡ Cache

O sistema implementa cache inteligente para:
- Evitar requisições desnecessárias
- Melhorar performance
- Reduzir carga na API

```typescript
// Cache é habilitado por padrão
const { data } = useFipe({ 
  tipoVeiculo: 'carro',
  enableCache: true 
})
```

## 🚨 Tratamento de Erros

O sistema trata automaticamente:
- Erros de rede
- Erros de autenticação
- Dados não encontrados
- Timeouts

```typescript
const { errors } = useFipe({ tipoVeiculo: 'carro' })

if (errors.marcas) {
  console.log('Erro ao carregar marcas:', errors.marcas)
}
```

## 📱 Estados de Loading

```typescript
const { loading } = useFipe({ tipoVeiculo: 'carro' })

if (loading.marcas) {
  return <div>Carregando marcas...</div>
}
```

## 🔧 Funções Auxiliares

### mapearCombustivelFipe
Converte combustível da API para formato do sistema:
```typescript
const combustivel = mapearCombustivelFipe('Diesel') // Retorna: 'Diesel'
```

### extrairAnoDoCodigo
Extrai ano do código do ano:
```typescript
const ano = extrairAnoDoCodigo('2022-3') // Retorna: 2022
```

### formatarPrecoFipe
Converte preço formatado para número:
```typescript
const valor = formatarPrecoFipe('R$ 150.000,00') // Retorna: 150000
```

## 🎯 Exemplo Completo

```typescript
import { useFipe } from '@/hooks/use-fipe'

function CadastroVeiculo() {
  const {
    data: { marcas, modelos, anos, precoFipe, valorFipe },
    loading,
    errors,
    selectedMarca,
    selectedModelo,
    selectedAno,
    handleMarcaChange,
    handleModeloChange,
    handleAnoChange,
    buscarPreco
  } = useFipe({ tipoVeiculo: 'carro' })

  // Aplicar dados quando todos estiverem selecionados
  useEffect(() => {
    if (selectedMarca && selectedModelo && selectedAno) {
      buscarPreco(selectedMarca, selectedModelo, selectedAno)
    }
  }, [selectedMarca, selectedModelo, selectedAno])

  return (
    <div>
      {/* Seus campos de formulário aqui */}
    </div>
  )
}
```

## 📝 Notas Importantes

- A API requer autenticação válida
- Os dados são atualizados mensalmente
- Alguns veículos podem não ter preço FIPE disponível
- O cache melhora significativamente a performance
- Todos os erros são tratados automaticamente

## 🔗 Links Úteis

- [Documentação Oficial da API](https://fipe.online/docs/api/fipe)
- [Tabela FIPE Oficial](https://veiculos.fipe.org.br/)
- [Fipe Online](https://fipe.online/) 