# Deploy no Vercel - Contabilidade IA Chat

## 🚀 Como fazer deploy no Vercel:

### 1. **Preparar o projeto**
```bash
# Instalar dependências
npm install

# Testar build local
npm run build
```

### 2. **Conectar ao Vercel**

**Opção A - Via GitHub (Recomendado):**
1. Faça commit do código para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Conecte seu repositório GitHub
5. Configure as variáveis de ambiente

**Opção B - Via Vercel CLI:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Seguir as instruções no terminal
```

### 3. **Configurar Variáveis de Ambiente**

No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```
NEXT_PUBLIC_WEBHOOK_URL = https://sua-vm.com/webhook/contabilidade-chat
```

**⚠️ IMPORTANTE:** Substitua `https://sua-vm.com/webhook/contabilidade-chat` pela URL real do seu webhook do n8n.

### 4. **Configurações do Build**

O projeto já está configurado para Vercel:
- ✅ `next.config.js` otimizado
- ✅ `package.json` com scripts corretos
- ✅ TypeScript configurado
- ✅ Tailwind CSS configurado

### 5. **Testar o Deploy**

Após o deploy:
1. Acesse a URL fornecida pelo Vercel
2. Teste o modo escuro (botão sol/lua)
3. Teste o upload de arquivos
4. Verifique se as requisições chegam no n8n

### 6. **Configuração do n8n**

Certifique-se que seu webhook do n8n aceita requisições do domínio do Vercel:

```json
// Estrutura da requisição que será enviada
{
  "message": "Sua pergunta aqui",
  "files": [
    {
      "id": "unique-id",
      "name": "arquivo.pdf",
      "size": 1024,
      "type": "application/pdf",
      "content": "base64-content"
    }
  ],
  "conversationId": "default"
}
```

### 7. **Domínio Personalizado (Opcional)**

Se quiser um domínio personalizado:
1. Vá em **Settings > Domains**
2. Adicione seu domínio
3. Configure o DNS conforme instruções

## 🔧 Troubleshooting

**Erro de CORS:** Configure seu n8n para aceitar requisições do domínio do Vercel.

**Webhook não responde:** Verifique se a URL está correta e se o n8n está rodando.

**Build falha:** Verifique se todas as dependências estão no `package.json`.

## 📱 Resultado Final

Você terá uma aplicação web moderna com:
- ✅ Interface igual ao ChatGPT
- ✅ Modo escuro/claro
- ✅ Upload de arquivos
- ✅ Mensagens de boas-vindas
- ✅ Integração com n8n
- ✅ Deploy automático no Vercel
