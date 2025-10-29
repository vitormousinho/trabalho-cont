export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  files?: UploadedFile[];
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

