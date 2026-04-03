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
    const supabaseAuth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt é obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const GEMINI_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GEMINI_KEY) {
      return new Response(JSON.stringify({ error: "Chave da API Gemini não configurada." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const textPrompt = `Você é um designer de moda profissional. Gere uma imagem realista e profissional da seguinte peça de roupa: "${prompt}". 
Mostre a roupa completa em um manequim ou silhueta de modelo contra um fundo limpo de estúdio.
A imagem deve parecer uma foto profissional de catálogo de moda com boa iluminação e caimento realista do tecido.
A imagem deve ser fotorrealista e de alta qualidade.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: textPrompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao gerar imagem. Tente novamente." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    
    let imageBase64: string | null = null;
    let textContent = "";

    for (const part of parts) {
      if (part.inlineData) {
        imageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      if (part.text) {
        textContent += part.text;
      }
    }

    if (!imageBase64) {
      return new Response(JSON.stringify({ description: textContent, imageUrl: null, publicImageUrl: null }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Upload to storage
    let publicImageUrl: string | null = null;
    try {
      const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const fileName = `criacao-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
      const { error: uploadError } = await supabaseAdmin.storage.from("generated-images").upload(fileName, binaryData, { contentType: "image/png", upsert: false });
      if (!uploadError) {
        const { data: urlData } = supabaseAdmin.storage.from("generated-images").getPublicUrl(fileName);
        publicImageUrl = urlData.publicUrl;
      }
    } catch (e) { console.error("Upload error:", e); }

    return new Response(JSON.stringify({ imageUrl: imageBase64, publicImageUrl, description: textContent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("generate-clothing error:", error);
    return new Response(JSON.stringify({ error: "Erro ao processar. Tente novamente." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
