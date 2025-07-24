# 🔧 Configuração de APIs

## 📋 Problemas Identificados e Soluções

### 1. **Erro 401 na API do Asaas**

**Problema:** A API de pagamentos está retornando erro 401 (Unauthorized)

**Causa:** Token da API Asaas não configurado ou inválido

**Solução:**
1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione sua chave da API Asaas:

```env
# API do Asaas - Pagamentos
ASAAS_API_KEY=sua_chave_aqui

# Para sandbox (desenvolvimento):
# ASAAS_API_KEY=$aact_test_sua_chave_sandbox_aqui

# Para produção:
# ASAAS_API_KEY=$aact_prod_sua_chave_producao_aqui
```

### 2. **Como obter a chave da API Asaas:**

1. Acesse o [painel do Asaas](https://www.asaas.com)
2. Vá em **Configurações** > **Integrações** > **API**
3. Copie sua chave de API
4. Cole no arquivo `.env.local`

### 3. **Verificar configuração:**

Após configurar, reinicie o servidor:
```bash
npm run dev
```

### 4. **Comportamento atual:**

- ✅ **Página de perfil carrega normalmente** mesmo com erro da API
- ⚠️ **Faturas pendentes não são exibidas** até a API ser configurada
- 🔄 **Sistema continua funcionando** com dados mock quando necessário

## 🐛 Debug

Para verificar se a configuração está funcionando:

1. Abra o console do navegador (F12)
2. Acesse a página de perfil
3. Procure pelos logs que começam com `[PERFIL]`
4. Se ver "API Asaas não configurada", configure a variável de ambiente

## 📞 Suporte

Se o problema persistir:
- Verifique se a chave da API está correta
- Confirme se sua conta Asaas está ativa
- Verifique se não há restrições de IP (se aplicável) 