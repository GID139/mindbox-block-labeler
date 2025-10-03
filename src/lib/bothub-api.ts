import { supabase } from "@/integrations/supabase/client";

interface BothubMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface BothubAPIOptions {
  model: string;
  temperature?: number;
  stream?: boolean;
}

export async function callBothubAPI(
  messages: BothubMessage[],
  options: BothubAPIOptions
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke("bothub-chat", {
      body: {
        messages,
        model: options.model,
        temperature: options.temperature ?? 0.7,
        stream: options.stream ?? false,
      },
    });

    // Проверка на ошибки от Supabase
    if (error) {
      console.error("Supabase invoke error:", error);
      throw new Error(`Ошибка соединения с сервером: ${error.message}`);
    }

    // Проверка на наличие данных
    if (!data) {
      throw new Error("Пустой ответ от сервера");
    }

    // Проверка на ошибки от edge function
    if (data.error) {
      console.error("Edge function error:", data);
      const errorMsg = data.error;
      const requestId = data.requestId;
      
      // Формируем понятное сообщение для пользователя
      throw new Error(
        `${errorMsg}${requestId ? ` (ID запроса: ${requestId})` : ''}`
      );
    }

    // Извлекаем текст из ответа
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("Invalid response format:", data);
      throw new Error("Некорректный формат ответа от AI модели");
    }

    return content;
  } catch (error) {
    // Логируем для отладки
    console.error("Error calling Bothub API:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Пробрасываем ошибку дальше с понятным сообщением
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Неизвестная ошибка при обращении к AI модели");
  }
}

// Оценка токенов (упрощенная, ~4 символа = 1 токен для кириллицы)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
