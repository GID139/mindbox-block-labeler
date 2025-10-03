const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Таймаут для запросов к Bothub API (30 секунд)
const BOTHUB_TIMEOUT_MS = 30000;

// Утилита для запросов с таймаутом
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Превышено время ожидания ответа от API (30 секунд)');
    }
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    console.log(`[${requestId}] Начало обработки запроса`);
    
    const { messages, model, temperature, stream = false } = await req.json();
    
    // Валидация входных данных
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error(`[${requestId}] Ошибка валидации: отсутствуют сообщения`);
      return new Response(
        JSON.stringify({ error: 'Параметр "messages" обязателен и должен содержать хотя бы одно сообщение' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!model || typeof model !== 'string') {
      console.error(`[${requestId}] Ошибка валидации: некорректная модель`);
      return new Response(
        JSON.stringify({ error: 'Параметр "model" обязателен и должен быть строкой' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (temperature !== undefined && (typeof temperature !== 'number' || temperature < 0 || temperature > 2)) {
      console.error(`[${requestId}] Ошибка валидации: некорректная температура`);
      return new Response(
        JSON.stringify({ error: 'Параметр "temperature" должен быть числом от 0 до 2' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const BOTHUB_API_KEY = Deno.env.get('BOTHUB_API_KEY');
    if (!BOTHUB_API_KEY) {
      console.error(`[${requestId}] BOTHUB_API_KEY не настроен в секретах`);
      return new Response(
        JSON.stringify({ error: 'Ошибка конфигурации сервера: отсутствует API ключ' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Запрос к Bothub API:`, { 
      model, 
      messageCount: messages.length, 
      stream,
      temperature: temperature ?? 0.7
    });

    const response = await fetchWithTimeout(
      'https://bothub.chat/api/v2/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BOTHUB_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          stream,
        }),
      },
      BOTHUB_TIMEOUT_MS
    );

    if (!response.ok) {
      const errorText = await response.text();
      const duration = Date.now() - startTime;
      
      console.error(`[${requestId}] Ошибка Bothub API:`, {
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        errorPreview: errorText.substring(0, 200)
      });
      
      // Определяем тип ошибки для более понятного сообщения
      let userMessage = 'Ошибка при обращении к AI модели';
      if (response.status === 401) {
        userMessage = 'Ошибка авторизации: проверьте API ключ';
      } else if (response.status === 429) {
        userMessage = 'Превышен лимит запросов, попробуйте позже';
      } else if (response.status === 500) {
        userMessage = 'Ошибка на стороне AI сервиса, попробуйте позже';
      } else if (response.status >= 400 && response.status < 500) {
        userMessage = 'Некорректный запрос к AI модели';
      }
      
      return new Response(
        JSON.stringify({ 
          error: userMessage,
          status: response.status,
          requestId
        }), 
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Если stream=true, возвращаем поток напрямую
    if (stream) {
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Если stream=false, возвращаем JSON
    const data = await response.json();
    const duration = Date.now() - startTime;
    
    console.log(`[${requestId}] Успешный ответ от Bothub API:`, {
      duration: `${duration}ms`,
      model,
      tokensUsed: data.usage?.total_tokens || 'unknown'
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`[${requestId}] Критическая ошибка в bothub-chat function:`, {
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Определяем тип ошибки для пользователя
    let userMessage = 'Внутренняя ошибка сервера';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('таймаут') || error.message.includes('timeout')) {
        userMessage = 'Превышено время ожидания ответа (30 секунд). Попробуйте упростить запрос или повторите позже';
        statusCode = 504;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        userMessage = 'Ошибка соединения с AI сервисом. Проверьте подключение к интернету';
        statusCode = 503;
      } else if (error.message.includes('JSON')) {
        userMessage = 'Ошибка обработки ответа от AI модели';
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        requestId
      }), 
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
