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
    const { fabricImageBase64, prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GOOGLE_GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GOOGLE_GEMINI_API_KEY não está configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const textPrompt = `You are a fashion designer AI. Generate a realistic, professional fashion photo of the following clothing item: "${prompt}". 
The garment should use the fabric/texture shown in the reference image if provided. 
Show the complete outfit on a mannequin or fashion model silhouette against a clean studio background. 
Make it look like a professional fashion catalog photo with good lighting and realistic fabric draping.
The image should be photorealistic and high quality.`;

    const parts: any[] = [{ text: textPrompt }];

    if (fabricImageBase64) {
      // Extract base64 data and mime type
      const match = fabricImageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 2048,
          },
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
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts;
    
    let imageUrl: string | null = null;
    let textContent = "";

    if (candidate) {
      for (const part of candidate) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        if (part.text) {
          textContent += part.text;
        }
      }
    }

    // If no image was generated, return the text description
    if (!imageUrl && textContent) {
      return new Response(
        JSON.stringify({ description: textContent, imageUrl: null, publicImageUrl: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "A IA não conseguiu gerar uma imagem. Tente reformular o pedido." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upload to storage for public URL
    let publicImageUrl: string | null = null;
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const fileName = `criacao-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("generated-images")
        .upload(fileName, binaryData, { contentType: "image/png", upsert: false });

      if (!uploadError) {
        const { data: urlData } = supabaseAdmin.storage
          .from("generated-images")
          .getPublicUrl(fileName);
        publicImageUrl = urlData.publicUrl;
      } else {
        console.error("Storage upload error:", uploadError);
      }
    } catch (uploadErr) {
      console.error("Failed to upload image to storage:", uploadErr);
    }

    return new Response(
      JSON.stringify({ imageUrl, publicImageUrl, description: textContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-clothing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
