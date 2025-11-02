export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  files?: UploadedFile[];
  chartData?: ChartData;
  chartImage?: string; // URL ou data URI da imagem do gráfico
}

export interface ChartData {
  type?: 'line' | 'bar' | 'pie' | 'area';
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }>;
  title?: string;
  width?: number;
  height?: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string; // base64 content
}

export interface ChatResponse {
  message: string;
  success: boolean;
  error?: string;
}

export interface WebhookPayload {
  message: string;
  files?: UploadedFile[];
  conversationId?: string;
}

