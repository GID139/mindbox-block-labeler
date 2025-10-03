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

    if (error) {
      console.error("Bothub API error:", error);
      throw new Error(`Ошибка API: ${error.message}`);
    }

    if (!data) {
      throw new Error("Пустой ответ от API");
    }

    // Извлекаем текст из ответа
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Некорректный формат ответа API");
    }

    return content;
  } catch (error) {
    console.error("Error calling Bothub API:", error);
    throw error;
  }
}

// Оценка токенов (упрощенная, ~4 символа = 1 токен для кириллицы)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
