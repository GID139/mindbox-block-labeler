// Gemini API утилиты
import { toast } from "sonner";

const GEMINI_API_KEY = 'AIzaSyBQsJJZUEBWYCtEQQpexcHb57JJBHdS8Lo';
const DEFAULT_MODEL = 'gemini-1.5-pro';

interface GeminiOptions {
  model?: string;
  onStart?: () => void;
  onFinish?: (text: string) => void;
}

export async function callGeminiAPI(
  prompt: string, 
  options: GeminiOptions = {}
): Promise<string> {
  const { model = DEFAULT_MODEL, onStart, onFinish } = options;
  
  if (onStart) onStart();

  const requestOnce = async (currentModel: string): Promise<string> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        if (response.status === 503 && currentModel === DEFAULT_MODEL) {
          console.log('Gemini-1.5-pro unavailable, fallback to flash');
          await new Promise(resolve => setTimeout(resolve, 1200));
          return requestOnce('gemini-1.5-flash');
        }
        throw new Error(`Gemini API error ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (onFinish) onFinish(text);
      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      toast.error('Ошибка при обращении к Gemini API');
      throw error;
    }
  };

  return requestOnce(model);
}

export function estimateTokens(text: string): number {
  if (!text) return 0;
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.ceil((charCount * 0.4 + wordCount * 1.3) / 4);
}
