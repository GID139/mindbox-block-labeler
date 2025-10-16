import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export interface BothubMessageContent {
  type: "text" | "document";
  text?: string;
  source?: {
    type: "base64";
    media_type: string;
    data: string;
  };
}

export interface BothubMessage {
  role: "system" | "user" | "assistant";
  content: string | BothubMessageContent[];
}

interface BothubAPIOptions {
  model: string;
  temperature?: number;
  stream?: boolean;
  signal?: AbortSignal;
}

// Вспомогательная функция для задержки
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Проверяем, нужно ли делать retry для этой ошибки
const shouldRetry = (error: any, attempt: number): boolean => {
  // Не делаем retry после максимального количества попыток
  if (attempt >= 3) return false;
  
  // Не retry для отмененных запросов
  if (error.name === 'AbortError' || error.message?.includes('abort')) return false;
  
  // Retry для сетевых ошибок
  if (error instanceof TypeError && error.message.includes('fetch')) return true;
  
  // Retry для временных ошибок сервера
  if (error.message?.includes('429') || error.message?.includes('503') || error.message?.includes('502')) return true;
  
  // Retry для timeout ошибок
  if (error.message?.includes('timeout') || error.message?.includes('timed out')) return true;
  
  return false;
};

// Вычисляем задержку с экспоненциальным backoff
const getRetryDelay = (attempt: number): number => {
  // Экспоненциальная задержка: 1s, 2s, 4s
  return Math.min(1000 * Math.pow(2, attempt - 1), 4000);
};

export async function callBothubAPI(
  messages: BothubMessage[],
  options: BothubAPIOptions
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Проверяем отмену перед каждой попыткой
      if (options.signal?.aborted) {
        throw new Error('Request cancelled');
      }
      
      if (attempt > 1) {
        const delay = getRetryDelay(attempt - 1);
        toast.info(`Повторная попытка ${attempt}/3 через ${delay / 1000}с...`);
        await sleep(delay);
      }
      
      const { data, error } = await supabase.functions.invoke("bothub-chat", {
        body: {
          messages,
          model: options.model,
          ...(options.temperature !== undefined && { temperature: options.temperature }),
          stream: options.stream ?? false,
        },
      });

      // Проверяем отмену после запроса
      if (options.signal?.aborted) {
        throw new Error('Request cancelled');
      }

      // Проверка на ошибки от Supabase
      if (error) {
        logger.error("Supabase invoke error", "bothub-api", { error: error.message, attempt });
        lastError = new Error(`Ошибка соединения с сервером: ${error.message}`);
        if (shouldRetry(lastError, attempt)) continue;
        throw lastError;
      }

      // Проверка на наличие данных
      if (!data) {
        lastError = new Error("Пустой ответ от сервера");
        if (shouldRetry(lastError, attempt)) continue;
        throw lastError;
      }

      // Проверка на ошибки от edge function
      if (data.error) {
        logger.error("Edge function error", "bothub-api", { error: data.error, requestId: data.requestId, attempt });
        const errorMsg = data.error;
        const requestId = data.requestId;
        
        lastError = new Error(
          `${errorMsg}${requestId ? ` (ID запроса: ${requestId})` : ''}`
        );
        
        if (shouldRetry(lastError, attempt)) continue;
        throw lastError;
      }

      // Извлекаем текст из ответа
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        logger.error("Invalid response format", "bothub-api", { data, attempt });
        lastError = new Error("Некорректный формат ответа от AI модели");
        if (shouldRetry(lastError, attempt)) continue;
        throw lastError;
      }

      // Успешный ответ
      if (attempt > 1) {
        toast.success(`Успешно выполнено с попытки ${attempt}/3`);
      }
      return content;
      
    } catch (error) {
      // Проверяем, была ли отмена
      if (error instanceof Error && (error.name === 'AbortError' || error.message === 'Request cancelled')) {
        toast.info("Запрос отменен");
        throw error;
      }
      
      logger.error(`API call attempt ${attempt}/3 failed`, "bothub-api", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        attempt
      });
      
      lastError = error instanceof Error ? error : new Error("Неизвестная ошибка при обращении к AI модели");
      
      // Проверяем, нужно ли делать retry
      if (!shouldRetry(lastError, attempt)) {
        throw lastError;
      }
    }
  }
  
  // Если все попытки исчерпаны
  toast.error("Все попытки исчерпаны");
  throw lastError || new Error("Не удалось выполнить запрос после 3 попыток");
}

// Оценка токенов (упрощенная, ~4 символа = 1 токен для кириллицы)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
