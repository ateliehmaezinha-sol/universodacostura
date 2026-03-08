import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { medidas, tipoMedida, peca, nomeCliente } = await req.json();

    if (!peca || !medidas) {
      return new Response(
        JSON.stringify({ error: "Peça e medidas são obrigatórias" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao calcular. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const resultado = data.choices?.[0]?.message?.content || "";

    if (!resultado) {
      return new Response(
        JSON.stringify({ error: "Não foi possível gerar o cálculo. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ resultado }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("calculate-fabric error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
