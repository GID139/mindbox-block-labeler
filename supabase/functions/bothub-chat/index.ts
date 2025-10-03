const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model, temperature, stream = false } = await req.json();
    
    const BOTHUB_API_KEY = Deno.env.get('BOTHUB_API_KEY');
    if (!BOTHUB_API_KEY) {
      throw new Error('BOTHUB_API_KEY не настроен');
    }

    console.log('Запрос к Bothub API:', { model, messageCount: messages.length, stream });

    const response = await fetch('https://bothub.chat/api/v2/openai/v1/chat/completions', {
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
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка Bothub API:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `Ошибка API: ${response.status}`,
          details: errorText 
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
    console.log('Ответ от Bothub API получен');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Ошибка в bothub-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
