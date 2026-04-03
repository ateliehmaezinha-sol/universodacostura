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

    const { fabricImageBase64, prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_KEY) {
      return new Response(JSON.stringify({ error: "Serviço de IA não configurado. Contate o suporte." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const textPrompt = `You are a fashion designer AI. Generate a realistic, professional fashion photo of the following clothing item: "${prompt}". 
The garment should use the fabric/texture shown in the reference image if provided. 
Show the complete outfit on a mannequin or fashion model silhouette against a clean studio background. 
Make it look like a professional fashion catalog photo with good lighting and realistic fabric draping.
The image should be photorealistic and high quality.`;

    const content: any[] = [{ type: "text", text: textPrompt }];
    if (fabricImageBase64) {
      content.push({ type: "image_url", image_url: { url: fabricImageBase64 } });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [{ role: "user", content }],
        modalities: ["image", "text"],
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
      return new Response(JSON.stringify({ error: "Erro ao gerar. Tente novamente." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;
    let imageUrl: string | null = null;
    let textContent = choice?.content || "";

    if (choice?.images?.length > 0) {
      imageUrl = choice.images[0].image_url.url;
    }

    if (!imageUrl) {
      return new Response(JSON.stringify({ description: textContent, imageUrl: null, publicImageUrl: null }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let publicImageUrl: string | null = null;
    try {
      const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const fileName = `criacao-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
      const { error: uploadError } = await supabaseAdmin.storage.from("generated-images").upload(fileName, binaryData, { contentType: "image/png", upsert: false });
      if (!uploadError) {
        const { data: urlData } = supabaseAdmin.storage.from("generated-images").getPublicUrl(fileName);
        publicImageUrl = urlData.publicUrl;
      }
    } catch (e) { console.error("Upload error:", e); }

    return new Response(JSON.stringify({ imageUrl, publicImageUrl, description: textContent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("generate-clothing error:", error);
    return new Response(JSON.stringify({ error: "Erro ao processar. Tente novamente." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
