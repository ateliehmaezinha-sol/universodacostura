import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { medidas, tipoMedida, peca, nomeCliente } = await req.json();

    if (!peca || !medidas) {
      return new Response(JSON.stringify({ error: "Peça e medidas são obrigatórias" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const GEMINI_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GEMINI_KEY) {
      return new Response(JSON.stringify({ error: "Chave da API Gemini não configurada." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const systemPrompt = `Você é uma costureira profissional e consultora de tecidos com mais de 30 anos de experiência. 
Responda SEMPRE em português brasileiro, de forma clara e prática.

Quando receber medidas corporais e uma peça para confeccionar, você deve:

1. **Quantidade de tecido**: Calcule a metragem exata necessária considerando:
   - As medidas corporais fornecidas
   - O tipo de peça (modelagem, comprimento, volume)
   - Margem de costura (2-3cm por costura)
   - Folga de movimento quando necessário
   - Considere tecido com largura padrão de 1,40m a 1,50m
   - Acrescente 10-15% de margem de segurança

2. **Melhores tecidos**: Recomende 2-3 opções de tecido ideais para a peça, explicando por quê.

3. **Dicas de confecção**: Dê 2-3 dicas práticas para essa peça específica.

Formato da resposta:
📐 METRAGEM NECESSÁRIA
[quantidade em metros] de tecido (largura 1,50m)
[detalhamento do cálculo]

🧵 TECIDOS RECOMENDADOS
1. [Tecido] - [motivo]
2. [Tecido] - [motivo]
3. [Tecido] - [motivo]

✂️ DICAS DE CONFECÇÃO
• [dica 1]
• [dica 2]
• [dica 3]`;

    const userMessage = `Cliente: ${nomeCliente || "Cliente"}
Tipo: ${tipoMedida}
Medidas: ${medidas}

Peça desejada: ${peca}

Calcule a quantidade de tecido necessária e recomende os melhores tecidos.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Entendido! Pronta para calcular." }] },
            { role: "user", parts: [{ text: userMessage }] },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao calcular. Tente novamente." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const resultado = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!resultado) {
      return new Response(JSON.stringify({ error: "Não foi possível gerar o cálculo." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ resultado }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("calculate-fabric error:", error);
    return new Response(JSON.stringify({ error: "Erro ao processar. Tente novamente." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
