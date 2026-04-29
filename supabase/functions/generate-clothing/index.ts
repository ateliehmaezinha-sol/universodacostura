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

    const { prompt, imageBase64 } = body ?? {};
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

    const systemPrompt = hasImage
      ? `Você é uma designer de moda profissional brasileira com 20 anos de experiência.
A usuária vai enviar uma FOTO. Você deve:
1. Identificar visualmente o que está na foto (tecido ou peça pronta)
2. Sugerir 3-5 peças de roupa ou ficha técnica para reproduzir
3. Para cada peça forneça: nome, descrição, metragem (largura 1,40m-1,50m), aviamentos, passo a passo (3-5 etapas) e estimativa de preço.
Use emojis (✂️ 🧵 📐 💡 💰) e markdown.`
      : `Você é uma designer de moda profissional brasileira com 20 anos de experiência. 
Quando a usuária descreve uma peça, gere ficha técnica completa:
1. Nome e descrição visual
2. Tecidos recomendados (3 opções)
3. Metragem estimada (1,40m-1,50m)
4. Aviamentos
5. Passo a passo (5-8 etapas)
6. Dicas de acabamento
7. Estimativa de preço de venda
Use emojis (✂️ 🧵 📐 💡 💰) e markdown.`;

    const userContent: any = hasImage
      ? [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ]
      : `Crie a ficha técnica completa para: "${prompt}"`;

    const model = hasImage ? "google/gemini-2.5-flash" : "google/gemini-2.5-flash";

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
