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

### SAIAS (baseado em medidas sob medida)
- **Saia Reta/Lápis**: comprimento desejado + 20cm (margem costura/barra). ~0,80m a 1,00m
- **Saia Evasê (leve godê)**: comprimento × 1,5 + 20cm. ~1,20m a 1,50m  
- **Saia Meio Godê**: comprimento × 2 + 20cm. ~1,50m a 2,00m
- **Saia Godê Total (circular)**: comprimento × 3 + 30cm. ~2,50m a 3,50m
- **Saia Midi Plissada**: comprimento × 3. ~2,50m a 3,00m

### VESTIDOS
- **Vestido Tubinho (reto/justo)**: comprimento total + 30cm. ~1,50m a 1,80m
- **Vestido Evasê**: corpo (50cm) + saia evasê. ~2,00m a 2,50m
- **Vestido com Saia Meio Godê**: corpo + saia meio godê. ~2,50m a 3,00m
- **Vestido com Saia Godê Total**: corpo + saia godê. ~3,50m a 4,50m
- **Vestido Longo Reto**: ~2,50m a 3,00m
- **Vestido Longo Evasê**: ~3,00m a 3,50m
- **Vestido Longo Meio Godê**: ~3,50m a 4,00m
- **Vestido Longo Godê Total**: ~4,50m a 6,00m
- **Vestido de Noiva (com cauda)**: ~6,00m a 12,00m dependendo da cauda

### BLUSAS E TOPS
- **Blusa básica manga curta**: ~1,20m a 1,50m
- **Blusa manga longa**: ~1,50m a 1,80m
- **Blusa ciganinha**: ~1,50m a 2,00m (mais tecido para o franzido)
- **Cropped**: ~0,60m a 0,80m
- **Regata**: ~0,80m a 1,00m

### CALÇAS
- **Calça reta/skinny**: comprimento × 2 + 30cm. ~1,50m a 1,80m
- **Calça pantalona**: comprimento × 2 + 50cm. ~2,00m a 2,50m
- **Calça palazzo**: ~2,50m a 3,00m
- **Bermuda**: ~1,00m a 1,20m

### BLAZER E CASACOS
- **Blazer curto**: ~1,50m a 1,80m (+ forro mesma metragem)
- **Blazer longo**: ~2,00m a 2,50m (+ forro)
- **Casaco/Sobretudo**: ~2,50m a 3,50m (+ forro)
- **Colete**: ~0,80m a 1,20m

### MACACÕES E CONJUNTOS
- **Macacão curto**: ~1,80m a 2,00m
- **Macacão longo reto**: ~2,50m a 3,00m
- **Macacão longo pantalona**: ~3,00m a 3,50m
- **Conjunto saia e blusa**: somar individual de cada peça

### AJUSTES POR MEDIDAS
- Para quadril acima de 110cm: acrescentar 20-30cm extra
- Para busto acima de 110cm: acrescentar 15-20cm extra
- Para altura acima de 170cm: acrescentar 15-20cm extra por peça
- Tecidos com estampa que precisa de encaixe: acrescentar 30-50cm extra
- Tecidos listrados/xadrez na diagonal: acrescentar 50% extra

## TIPOS DE GODÊ (IMPORTANTE)
Quando perguntarem sobre godê, SEMPRE explique as variações:

| Tipo | Abertura | Tecido Extra | Efeito |
|------|----------|-------------|--------|
| **Evasê (leve godê)** | Sutil, ~30° | +30-50% do comprimento | Levemente soltinho, elegante |
| **Meio Godê** | Moderada, ~180° | +100% do comprimento | Bonito caimento, balanço moderado |
| **Godê Total (circular)** | Total, 360° | +200-300% do comprimento | Muito rodado, volumoso, dramático |

## TECIDOS RECOMENDADOS POR PEÇA
- **Vestidos de festa**: Crepe, cetim, musseline, chiffon, renda
- **Vestidos casuais**: Viscose, malha, linho, algodão
- **Saias godê**: Crepe, viscose, chiffon (tecidos com bom caimento)
- **Blazer**: Gabardine, oxford, linho estruturado, alfaiataria
- **Calças**: Bengaline, alfaiataria, jeans, sarja
- **Blusas**: Viscose, crepe, seda, musseline

## REGRAS DE RESPOSTA
1. Quando receber medidas específicas (busto, cintura, quadril), calcule com base nelas
2. SEMPRE mostre as variações de godê quando relevante
3. Recomende 2-3 tecidos ideais
4. Dê dica de forro quando aplicável
5. Use emojis para organizar (📐 ✂️ 🧵 💡)
6. Seja prática e direta como uma costureira experiente
7. Formate com markdown para boa leitura`;

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

    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Mensagens são obrigatórias" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recentMessages = messages.slice(-20);
    const validMessages = recentMessages.filter(
      (m: any) => m && typeof m.role === "string" && typeof m.content === "string" && m.content.length <= 5000
    );

    if (validMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Mensagens inválidas" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Chave da API Gemini não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert messages to Gemini format
    const geminiContents: any[] = [];
    
    // Add system instruction separately
    for (const msg of validMessages) {
      geminiContents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: geminiContents,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Erro ao processar. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui gerar uma resposta.";

    // Return as non-streaming JSON response
    return new Response(
      JSON.stringify({ response: text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sewing-assistant error:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
