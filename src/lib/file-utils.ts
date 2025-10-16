// Утилиты для работы с файлами и конвертации в base64 для AI запросов

export interface BothubMessageContent {
  type: "text" | "document";
  text?: string;
  source?: {
    type: "base64";
    media_type: string;
    data: string;
  };
}

/**
 * Конвертирует текстовый контент в base64
 */
export function textToBase64(text: string): string {
  // Используем TextEncoder для корректной работы с UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Конвертируем в base64
  let binary = '';
  data.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  
  return btoa(binary);
}

/**
 * Создает document content для отправки в AI
 */
export function createDocumentContent(
  content: string,
  filename: string,
  mediaType: string = "text/plain"
): BothubMessageContent {
  const base64Data = textToBase64(content);
  
  return {
    type: "document",
    source: {
      type: "base64",
      media_type: mediaType,
      data: base64Data
    }
  };
}

/**
 * Загружает Knowledge Base как document content
 */
export async function loadKnowledgeBaseAsDocument(): Promise<BothubMessageContent> {
  try {
    // Загружаем файл KB
    const response = await fetch('/src/lib/knowledge-base/mindbox-enhanced-kb.md');
    
    if (!response.ok) {
      throw new Error(`Failed to load KB: ${response.statusText}`);
    }
    
    const kbContent = await response.text();
    
    return createDocumentContent(
      kbContent,
      "mindbox-enhanced-kb.md",
      "text/markdown"
    );
  } catch (error) {
    console.error("Error loading Knowledge Base:", error);
    throw new Error("Не удалось загрузить файл Knowledge Base");
  }
}

/**
 * Создает text content для промпта
 */
export function createTextContent(text: string): BothubMessageContent {
  return {
    type: "text",
    text
  };
}
