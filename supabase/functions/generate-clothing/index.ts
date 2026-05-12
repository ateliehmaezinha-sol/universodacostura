import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Não autorizado" }, 401);
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return json({ error: "Não autorizado" }, 401);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Requisição inválida" }, 400);
    }

    const { prompt, imageBase64, mode } = body ?? {};
    if (!prompt || typeof prompt !== "string") {
      return json({ error: "Prompt é obrigatório" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY ausente");
      return json({ error: "Chave da API não configurada." }, 500);
    }

    const hasImage = typeof imageBase64 === "string" && imageBase64.length > 0;

    // Garante que a imagem está como data URI completo
    let imageDataUrl: string | null = null;
    if (hasImage) {
      imageDataUrl = imageBase64.startsWith("data:")
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;

      // Limita tamanho da imagem (~5MB em base64)
      if (imageDataUrl.length > 7_000_000) {
        return json(
          { error: "Imagem muito grande. Use uma foto menor (até 5MB)." },
          413,
        );
      }
    }

    const isFabricMode = mode === "fabric" || (hasImage && mode !== "garment");
    const isGarmentMode = mode === "garment";

    let systemPrompt: string;
    if (hasImage && isFabricMode) {
      systemPrompt = `Você é uma designer de moda profissional brasileira com 20 anos de experiência criando peças no Atelieh Mãezinha.
A usuária enviou uma FOTO DE TECIDO. Sua missão:
1. Analise visualmente o tecido: tipo provável (algodão, viscose, malha, crepe, linho, jeans, etc), peso/caimento, estampa/cor, brilho, transparência.
2. Sugira de 4 a 6 PEÇAS DE ROUPA ideais para esse tecido, considerando os nichos: Feminino, Evangélico (modesto) e Infantil.
3. Para CADA peça, traga em markdown bem formatado:
   - ## Nome da peça (com emoji)
   - **Por que combina com este tecido:** breve justificativa técnica
   - **Metragem:** estimativa (largura 1,40m / 1,50m)
   - **Aviamentos:** linha, zíper, elástico, entretela, etc
   - **Passo a passo resumido:** 3 a 5 etapas
   - **Preço sugerido de venda:** faixa em R$
Use emojis (✂️ 🧵 📐 💡 💰 👗) e markdown limpo. Responda SEMPRE em português do Brasil.`;
    } else if (hasImage && isGarmentMode) {
      systemPrompt = `Você é uma designer de moda brasileira. A usuária enviou foto de uma ROUPA PRONTA.
Crie a FICHA TÉCNICA COMPLETA para reproduzir a peça:
1. Nome e descrição detalhada
2. Tecidos recomendados (com gramatura)
3. Metragem (largura 1,40m / 1,50m) e aviamentos
4. Passo a passo de costura (6-10 etapas)
5. Dicas de acabamento profissional
6. Preço sugerido de venda
Use emojis (✂️ 🧵 📐 💡 💰) e markdown. Responda em português do Brasil.`;
    } else {
      systemPrompt = `Você é uma designer de moda profissional brasileira com 20 anos de experiência. 
Quando a usuária descreve uma peça, gere ficha técnica completa:
1. Nome e descrição visual
2. Tecidos recomendados (3 opções)
3. Metragem estimada (1,40m-1,50m)
4. Aviamentos
5. Passo a passo (5-8 etapas)
6. Dicas de acabamento
7. Estimativa de preço de venda
Use emojis (✂️ 🧵 📐 💡 💰) e markdown.`;
    }

    const userTextForFabric = "Analise este tecido e me sugira de 4 a 6 peças de roupa ideais para confeccionar com ele, com ficha resumida de cada peça.";
    const userContent: any = hasImage
      ? [
          { type: "text", text: isFabricMode ? userTextForFabric : prompt },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ]
      : `Crie a ficha técnica completa para: "${prompt}"`;

    const model = "google/gemini-2.5-pro";

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return json({ error: "Muitas solicitações. Aguarde e tente novamente." }, 429);
      }
      if (aiResponse.status === 402) {
        return json({ error: "Limite de uso atingido. Tente mais tarde." }, 402);
      }
      return json({
        error: `Erro ao gerar (${aiResponse.status}). Tente novamente${hasImage ? " com uma foto menor ou mais nítida" : ""}.`,
      }, 500);
    }

    const data = await aiResponse.json();
    const description = data?.choices?.[0]?.message?.content;

    if (!description) {
      console.error("Resposta sem conteúdo:", JSON.stringify(data).slice(0, 500));
      return json({ error: "A IA não retornou conteúdo. Tente novamente." }, 500);
    }

    return json({ description, imageUrl: null, publicImageUrl: null });
  } catch (error) {
    console.error("generate-clothing exception:", error);
    return json({ error: "Erro ao processar. Tente novamente." }, 500);
  }
});
