'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, FileText, Image, FileSpreadsheet, Sun, Moon } from 'lucide-react';
import { Message, UploadedFile, WebhookPayload, ChartData } from '@/types/chat';

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'http://localhost:5678/webhook/contabilidade-chat';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para obter saudação baseada no horário
  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });

    let greeting = '';
    if (hour >= 5 && hour < 12) {
      greeting = 'Bom dia!';
    } else if (hour >= 12 && hour < 18) {
      greeting = 'Boa tarde!';
    } else {
      greeting = 'Boa noite!';
    }

    return { greeting, date: day };
  };

  // Adicionar mensagem de boas-vindas quando o componente carrega
  useEffect(() => {
    const { greeting, date } = getGreeting();
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `${greeting}\n\n${date}\n\nSou sua assistente de IA especializada em contabilidade. Posso ajudar você com:\n\n• Cálculos fiscais e tributários\n• Análise de documentos contábeis\n• Interpretação de leis fiscais\n• Relatórios financeiros\n• E muito mais!\n\nComo posso ajudá-lo hoje?`,
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Gerenciar modo escuro
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (files: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await fileToBase64(file);
      
      newFiles.push({
        id: Date.now().toString() + i,
        name: file.name,
        size: file.size,
        type: file.type,
        content: content
      });
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove o prefixo "data:image/jpeg;base64," ou similar
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="w-4 h-4" />;
    if (fileType.includes('sheet') || fileType.includes('excel')) return <FileSpreadsheet className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() && uploadedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue || 'Arquivo enviado',
      role: 'user',
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      // Preparar payload para o webhook do n8n
      const payload: WebhookPayload = {
        message: inputValue || 'Arquivo enviado para análise',
        files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        conversationId: 'default'
      };

      console.log('Enviando para webhook:', payload);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      
      // Verificar se há dados de gráfico na resposta
      let chartImage: string | undefined;
      let chartData: ChartData | undefined;
      
      if (data.chartData || data.chart) {
        chartData = data.chartData || data.chart;
        try {
          // Converter gráfico JSON em imagem
          const chartResponse = await fetch('/api/chart-to-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(chartData),
          });
          
          if (chartResponse.ok) {
            const chartResult = await chartResponse.json();
            chartImage = chartResult.dataUri;
          }
        } catch (error) {
          console.error('Erro ao converter gráfico:', error);
        }
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message || data.response || 'Arquivo processado com sucesso!',
        role: 'assistant',
        timestamp: new Date(),
        chartData,
        chartImage
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique se o webhook do n8n está funcionando.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="w-full max-w-[800px] mx-auto flex items-center justify-between px-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Contabilidade IA Chat
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Faça perguntas sobre contabilidade ou envie documentos para análise
            </p>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="dark-mode-toggle p-2 rounded-lg transition-colors"
            title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Bem-vindo ao Chat de Contabilidade IA
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Faça perguntas sobre contabilidade ou envie documentos para análise
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm">
                  PDF
                </span>
                <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm">
                  Excel
                </span>
                <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm">
                  CSV
                </span>
                <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm">
                  JSON
                </span>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role === 'user' ? 'message-user' : ''}`}
          >
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {message.role === 'user' ? 'U' : 'IA'}
              </div>
            </div>
            <div className="message-content">
              <div className="flex flex-col space-y-2">
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                
                {/* Exibir gráfico se houver */}
                {message.chartImage && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img 
                      src={message.chartImage} 
                      alt="Gráfico"
                      className="w-full h-auto"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                )}
                
                {message.timestamp && (
                  <span className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                )}
                {message.files && message.files.length > 0 && (
                  <div className="mt-2 space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {message.files.map((file) => (
                      <div key={file.id} className="flex items-center space-x-2 text-sm opacity-75">
                        {getFileIcon(file.type)}
                        <span>{file.name}</span>
                        <span className="text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center">
                IA
              </div>
            </div>
            <div className="message-content">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                <span>Processando...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-container">
        <div className="chat-input">
          {/* Arquivos anexados */}
          {uploadedFiles.length > 0 && (
            <div className="w-full mb-2">
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.type)}
                      <span className="text-sm text-primary-800 dark:text-primary-200">{file.name}</span>
                      <span className="text-xs text-primary-600 dark:text-primary-400">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="ml-2 text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end space-x-2 w-full">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              title="Anexar arquivos"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  // Auto-resize textarea
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                }}
                onKeyPress={handleKeyPress}
                placeholder={uploadedFiles.length > 0 ? "Digite uma mensagem ou pressione Enter para enviar os arquivos..." : "Digite sua pergunta sobre contabilidade..."}
                className="input-field pr-12"
                rows={2}
                disabled={isLoading}
              />
              
              {/* Drag & Drop overlay */}
              <div
                className="absolute inset-0 border-2 border-dashed border-transparent rounded-lg pointer-events-none transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-primary-500', 'bg-primary-50');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-primary-500', 'bg-primary-50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-primary-500', 'bg-primary-50');
                  handleFileUpload(e.dataTransfer.files);
                }}
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={isLoading || (!inputValue.trim() && uploadedFiles.length === 0)}
              className="send-button flex-shrink-0 min-h-[56px] px-6"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.csv,.json,.xml,.rtf,.txt,.png,.jpg,.jpeg,.gif"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
