# Documentação da API - Integração com n8n Webhook

## 📤 FORMATO DE ENVIO (Frontend → n8n)

Sim, **já é possível enviar arquivos para o webhook do n8n**! Os arquivos são convertidos automaticamente para Base64 antes do envio.

### Requisição HTTP

```
POST http://localhost:5678/webhook/contabilidade-chat
Content-Type: application/json
```

### Estrutura do Payload Enviado

```json
{
  "message": "Texto da mensagem do usuário",
  "files": [
    {
      "id": "1234567890123",
      "name": "documento.pdf",
      "size": 102400,
      "type": "application/pdf",
      "content": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoK..."
    }
  ],
  "conversationId": "default"
}
```

### Campos Detalhados

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `message` | string | Sim | Texto da mensagem do usuário. Se não houver texto mas houver arquivos, será "Arquivo enviado para análise" |
| `files` | array | Não | Lista de arquivos anexados. Se não houver arquivos, este campo não será incluído |
| `files[].id` | string | Sim | ID único do arquivo (timestamp + índice) |
| `files[].name` | string | Sim | Nome do arquivo com extensão |
| `files[].size` | number | Sim | Tamanho do arquivo em bytes |
| `files[].type` | string | Sim | MIME type do arquivo (ex: "application/pdf", "image/png") |
| `files[].content` | string | Sim | Conteúdo do arquivo codificado em **Base64** (sem prefixo data:URL) |
| `conversationId` | string | Não | ID da conversação (padrão: "default") |

### Tipos de Arquivo Suportados

O frontend aceita e converte os seguintes tipos de arquivo:

- **Documentos**: PDF, TXT, RTF
- **Planilhas**: XLSX, XLS, CSV
- **Dados**: JSON, XML
- **Imagens**: PNG, JPG, JPEG, GIF

### Exemplo Completo - Mensagem com Arquivo PDF

```json
{
  "message": "Analise este documento contábil",
  "files": [
    {
      "id": "1701234567890",
      "name": "balanco_patrimonial.pdf",
      "size": 245760,
      "type": "application/pdf",
      "content": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERi9UZXh0XT4+L0NvbnRlbnRzIDQgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvTGVuZ3RoIDE1Pj4Kc3RyZWFtCkJUCi9GOCAxMiBUZgoxMDAgNzAwIFRkCihCYWxhbmNvIFBhdHJpbW9uaWFsKSBUagogRUoKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTQgMDAwMDAgbiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDQwIDAwMDAwIG4gCjAwMDAwMDAwNzIgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDYvUm9vdCA1IDAgUj4+CnN0YXJ0eHJlZgo5NQolJUVPRg=="
    }
  ],
  "conversationId": "default"
}
```

### Exemplo - Mensagem Apenas com Texto

```json
{
  "message": "Qual é o valor do ICMS sobre uma venda de R$ 1.000,00?",
  "conversationId": "default"
}
```

### Exemplo - Apenas Arquivo (sem mensagem)

```json
{
  "message": "Arquivo enviado para análise",
  "files": [
    {
      "id": "1701234567891",
      "name": "dados_financeiros.xlsx",
      "size": 51200,
      "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content": "UEsDBBQAAAAIAA..."
    }
  ],
  "conversationId": "default"
}
```

---

## 📥 FORMATO DE RECEBIMENTO (n8n → Frontend)

O frontend espera receber uma resposta JSON do webhook do n8n com a seguinte estrutura:

### Estrutura da Resposta Esperada

```json
{
  "message": "Resposta da IA em texto",
  "success": true,
  "chartData": {
    "type": "line",
    "title": "Gráfico de Vendas",
    "labels": ["Jan", "Fev", "Mar"],
    "datasets": [{
      "label": "Vendas",
      "data": [100, 200, 150],
      "backgroundColor": "#3b82f6",
      "borderColor": "#2563eb"
    }],
    "width": 800,
    "height": 400
  }
}
```

### Campos da Resposta

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `message` | string | Sim* | Texto da resposta da IA. O frontend também aceita `response` como alternativa |
| `response` | string | Não | Alternativa para `message` (usa se `message` não estiver presente) |
| `success` | boolean | Não | Indica se a operação foi bem-sucedida |
| `error` | string | Não | Mensagem de erro (se houver) |
| `chartData` ou `chart` | object | Não | Dados do gráfico para renderização automática |

**Nota**: O campo `message` ou `response` é obrigatório. Se nenhum estiver presente, o frontend exibirá "Arquivo processado com sucesso!"

### Estrutura do chartData

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `type` | string | Tipo do gráfico: `"line"`, `"bar"`, `"pie"`, `"area"` |
| `title` | string | Título do gráfico (opcional) |
| `labels` | string[] | Array com os rótulos do eixo X (ou categorias para pizza) |
| `datasets` | array | Array de conjuntos de dados |
| `datasets[].label` | string | Nome da série de dados |
| `datasets[].data` | number[] | Valores numéricos do gráfico |
| `datasets[].backgroundColor` | string/string[] | Cor de fundo (pode ser array para gráfico de pizza) |
| `datasets[].borderColor` | string | Cor da borda (opcional) |
| `width` | number | Largura do gráfico em pixels (padrão: 800) |
| `height` | number | Altura do gráfico em pixels (padrão: 400) |

### Exemplo - Resposta Simples (apenas texto)

```json
{
  "message": "O ICMS sobre uma venda de R$ 1.000,00 com alíquota de 18% é R$ 180,00.",
  "success": true
}
```

### Exemplo - Resposta com Gráfico

```json
{
  "message": "Aqui está o gráfico de vendas do último trimestre:",
  "chartData": {
    "type": "bar",
    "title": "Vendas por Mês - Trimestre",
    "labels": ["Janeiro", "Fevereiro", "Março"],
    "datasets": [
      {
        "label": "Vendas em R$",
        "data": [15000, 18000, 22000],
        "backgroundColor": "#3b82f6",
        "borderColor": "#2563eb"
      }
    ],
    "width": 800,
    "height": 400
  },
  "success": true
}
```

### Exemplo - Resposta com Gráfico de Pizza

```json
{
  "message": "Distribuição dos custos:",
  "chart": {
    "type": "pie",
    "title": "Distribuição de Custos",
    "labels": ["Salários", "Aluguel", "Material", "Outros"],
    "datasets": [
      {
        "label": "Custos",
        "data": [40, 25, 20, 15],
        "backgroundColor": ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"]
      }
    ]
  },
  "success": true
}
```

### Exemplo - Resposta com Erro

```json
{
  "message": "Não foi possível processar o documento.",
  "success": false,
  "error": "Formato de arquivo não suportado"
}
```

### Exemplo - Resposta Alternativa (usando `response`)

```json
{
  "response": "Análise concluída. O documento apresenta as seguintes informações...",
  "success": true
}
```

---

## 🔄 Fluxo Completo

### 1. Usuário envia mensagem com arquivo

**Frontend envia:**
```json
{
  "message": "Analise este documento",
  "files": [{
    "id": "123",
    "name": "balanco.pdf",
    "size": 245760,
    "type": "application/pdf",
    "content": "JVBERi0xLjQK..."
  }]
}
```

### 2. n8n processa e responde

**n8n responde:**
```json
{
  "message": "O documento foi analisado. Encontrei as seguintes informações contábeis...",
  "chartData": {
    "type": "bar",
    "labels": ["Ativo", "Passivo"],
    "datasets": [{
      "label": "Valores",
      "data": [500000, 300000]
    }]
  }
}
```

### 3. Frontend exibe resultado

- Mostra a mensagem de texto
- Converte automaticamente o `chartData` em imagem SVG
- Exibe o gráfico renderizado dentro da mensagem da IA

---

## ⚙️ Configuração

### Variável de Ambiente

Configure a URL do webhook no arquivo `.env.local`:

```env
NEXT_PUBLIC_WEBHOOK_URL=http://localhost:5678/webhook/contabilidade-chat
```

Ou para produção:

```env
NEXT_PUBLIC_WEBHOOK_URL=https://seu-servidor.com/webhook/contabilidade-chat
```

---

## 📝 Notas Importantes

1. **Base64**: Os arquivos são enviados codificados em Base64, mas **sem o prefixo** `data:image/png;base64,`. Apenas o conteúdo Base64 puro.

2. **Tamanho**: Não há limite hardcoded no frontend, mas recomenda-se arquivos menores que 10MB para melhor performance.

3. **Gráficos**: Se o n8n retornar `chartData` ou `chart`, o frontend automaticamente:
   - Chama a API `/api/chart-to-image`
   - Converte para imagem SVG
   - Exibe o gráfico dentro da mensagem

4. **Compatibilidade**: O formato é compatível com os conversores do n8n que processam:
   - Text File
   - PDF
   - CSV
   - JSON
   - XML
   - XLSX
   - RTF

---

## 🧪 Testando

### Teste com cURL

**Enviar mensagem simples:**
```bash
curl -X POST http://localhost:5678/webhook/contabilidade-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá, como você pode me ajudar?",
    "conversationId": "default"
  }'
```

**Enviar com arquivo Base64:**
```bash
curl -X POST http://localhost:5678/webhook/contabilidade-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analise este arquivo",
    "files": [{
      "id": "123",
      "name": "teste.pdf",
      "size": 1024,
      "type": "application/pdf",
      "content": "JVBERi0xLjQK..."
    }]
  }'
```

