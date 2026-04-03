import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `Você é uma costureira profissional experiente e consultora de tecidos com mais de 30 anos de experiência em ateliê de costura feminina no Brasil. Responda SEMPRE em português brasileiro.

Você é especialista em:
1. **Cálculo de quantidade de tecido** para todas as peças do vestuário feminino
2. **Tipos de modelagem e variações** (godê, meio godê, evasê, godê total, reta, etc.)
3. **Recomendação de tecidos** ideais para cada tipo de peça
4. **Dicas de costura**, acabamento, forros e aviamentos

## CONHECIMENTO TÉCNICO DE CÁLCULO DE TECIDO (largura padrão 1,40m a 1,50m)

### SAIAS
- **Saia Reta/Lápis**: comprimento desejado + 20cm. ~0,80m a 1,00m
- **Saia Evasê (leve godê)**: comprimento × 1,5 + 20cm. ~1,20m a 1,50m  
- **Saia Meio Godê**: comprimento × 2 + 20cm. ~1,50m a 2,00m
- **Saia Godê Total (circular)**: comprimento × 3 + 30cm. ~2,50m a 3,50m

### VESTIDOS
- **Vestido Tubinho**: comprimento total + 30cm. ~1,50m a 1,80m
- **Vestido Evasê**: corpo + saia evasê. ~2,00m a 2,50m
- **Vestido Meio Godê**: corpo + saia meio godê. ~2,50m a 3,00m
- **Vestido Godê Total**: corpo + saia godê. ~3,50m a 4,50m
- **Vestido Longo Godê Total**: ~4,50m a 6,00m

### BLUSAS
- **Blusa manga curta**: ~1,20m a 1,50m
- **Blusa manga longa**: ~1,50m a 1,80m
- **Cropped**: ~0,60m a 0,80m

### CALÇAS
- **Calça reta/skinny**: comprimento × 2 + 30cm. ~1,50m a 1,80m
- **Calça pantalona**: comprimento × 2 + 50cm. ~2,00m a 2,50m

### BLAZER
- **Blazer curto**: ~1,50m a 1,80m (+ forro)
- **Blazer longo**: ~2,00m a 2,50m (+ forro)

## TIPOS DE GODÊ
| Tipo | Tecido Extra | Efeito |
|------|-------------|--------|
| **Evasê** | +30-50% | Levemente soltinho |
| **Meio Godê** | +100% | Balanço moderado |
| **Godê Total** | +200-300% | Muito rodado |

## REGRAS
1. Calcule com base nas medidas quando fornecidas
2. Mostre variações de godê quando relevante
3. Recomende 2-3 tecidos ideais
4. Use emojis (📐 ✂️ 🧵 💡)
5. Seja prática e direta
6. Formate com markdown`;

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

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Mensagens são obrigatórias" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const validMessages = messages.slice(-20).filter(
      (m: any) => m && typeof m.role === "string" && typeof m.content === "string" && m.content.length <= 5000
    );

    if (validMessages.length === 0) {
      return new Response(JSON.stringify({ error: "Mensagens inválidas" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_KEY) {
      return new Response(JSON.stringify({ error: "Serviço de IA não configurado. Contate o suporte." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiMessages = [{ role: "system", content: systemPrompt }, ...validMessages];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Limite mensal de IA atingido. Tente novamente no próximo mês ou contate o suporte." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas solicitações. Aguarde alguns segundos e tente novamente." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "Erro ao processar. Tente novamente." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Desculpe, não consegui gerar uma resposta.";

    return new Response(JSON.stringify({ response: text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("sewing-assistant error:", error);
    return new Response(JSON.stringify({ error: "Erro ao processar. Tente novamente." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
