# Contabilidade IA Chat

Sistema de chat com IA especializada em contabilidade, desenvolvido em React/Next.js que se comunica com um webhook do n8n.

## Características

- Interface similar ao ChatGPT
- Upload de arquivos (PDF, Excel, CSV, JSON, XML, RTF, imagens)
- Comunicação com webhook do n8n
- Design responsivo e moderno
- Sem necessidade de login

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure a URL do webhook:
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` e configure a URL do seu webhook do n8n:
```
NEXT_PUBLIC_WEBHOOK_URL=https://sua-vm.com/webhook/contabilidade-chat
```

3. Execute o projeto:
```bash
npm run dev
```

## Como usar

1. Acesse `http://localhost:3000`
2. Digite sua pergunta sobre contabilidade
3. Opcionalmente, anexe arquivos clicando no ícone de clipe
4. Pressione Enter ou clique em enviar

## Formatos de arquivo suportados

- PDF
- Excel (.xlsx, .xls)
- CSV
- JSON
- XML
- RTF
- Texto (.txt)
- Imagens (.png, .jpg, .jpeg, .gif)

## Estrutura do projeto

```
├── app/
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página principal do chat
├── types/
│   └── chat.ts            # Tipos TypeScript
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Integração com n8n

O frontend envia requisições POST para o webhook do n8n com a seguinte estrutura:

```json
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

O n8n deve retornar uma resposta JSON com:
```json
{
  "message": "Resposta da IA",
  "success": true
}
```

## Deploy

Para fazer deploy em produção:

1. Configure a variável de ambiente `NEXT_PUBLIC_WEBHOOK_URL`
2. Execute o build:
```bash
npm run build
npm start
```

Ou use plataformas como Vercel, Netlify, etc.

