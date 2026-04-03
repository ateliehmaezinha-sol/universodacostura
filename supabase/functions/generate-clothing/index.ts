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

    const textPrompt = `You are a fashion designer AI. Generate a realistic, professional fashion photo of the following clothing item: "${prompt}". 
The garment should use the fabric/texture shown in the reference image if provided. 
Show the complete outfit on a mannequin or fashion model silhouette against a clean studio background. 
Make it look like a professional fashion catalog photo with good lighting and realistic fabric draping.
The image should be photorealistic and high quality.`;

    // Try Google Gemini first
    const GEMINI_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (GEMINI_KEY) {
      try {
        const parts: any[] = [{ text: textPrompt }];
        if (fabricImageBase64) {
          const base64Match = fabricImageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
          if (base64Match) {
            parts.push({ inlineData: { mimeType: base64Match[1], data: base64Match[2] } });
          }
        }

        const geminiResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
            }),
          }
        );

        if (geminiResp.ok) {
          const data = await geminiResp.json();
          const candidate = data.candidates?.[0]?.content?.parts;
          let imageUrl: string | null = null;
          let textContent = "";

          if (candidate) {
            for (const part of candidate) {
              if (part.text) textContent += part.text;
              if (part.inlineData) imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
          }

          if (imageUrl) {
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
          }

          if (textContent) {
            return new Response(JSON.stringify({ description: textContent, imageUrl: null, publicImageUrl: null }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        }
        const errText = await geminiResp.text();
        console.error("Gemini failed, falling back:", geminiResp.status, errText);
      } catch (e) {
        console.error("Gemini error, falling back:", e);
      }
    }

    // Fallback to Lovable AI Gateway
    if (!LOVABLE_KEY) {
      return new Response(JSON.stringify({ error: "Nenhuma API de IA configurada" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

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
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
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
