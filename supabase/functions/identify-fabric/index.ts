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
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em tecidos e costura. Analise a imagem do tecido enviada e identifique:

1. O nome do tecido (seja específico, ex: Crepe, Viscose, Cetim, Malha, Tricoline, Oxford, Linho, Seda, Chiffon, Organza, Tule, Jeans/Denim, Moletom, Neoprene, Renda, Jacquard, Brim, Sarja, Popeline, Gabardine, Cambraia, Musseline, Tafetá, Veludo, Suede, etc.)
2. A composição provável
3. O tipo de caimento
4. O nível de elasticidade
5. A dificuldade de costura
6. Roupas ideais para esse tecido
7. Se precisa de forro
8. Agulha recomendada
9. Linha recomendada

Responda APENAS em formato JSON válido, sem markdown, sem código, apenas o JSON puro:
{
  "nome": "Nome do Tecido",
  "composicao": "Composição provável",
  "caimento": "Tipo de caimento",
  "elasticidade": "Nível de elasticidade",
  "dificuldade": "Fácil/Médio/Avançado",
  "roupas": "Lista de roupas ideais",
  "forro": "Se precisa de forro ou não",
  "agulha": "Agulha recomendada",
  "linha": "Linha recomendada",
  "confianca": "Alta/Média/Baixa",
  "observacoes": "Observações extras sobre o tecido"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identifique este tecido na imagem. Analise a textura, brilho, transparência, trama e aparência geral.",
              },
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON from the AI response
    let fabricInfo;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      
      let jsonStr = jsonMatch[0];
      // Fix unescaped quotes inside string values by replacing inner quotes
      // First try direct parse
      try {
        fabricInfo = JSON.parse(jsonStr);
      } catch {
        // Remove control characters and fix common JSON issues
        jsonStr = jsonStr
          .replace(/[\x00-\x1F\x7F]/g, (ch) => ch === '\n' || ch === '\r' || ch === '\t' ? ch : '')
          .replace(/\n/g, ' ')
          .replace(/\r/g, '')
          .replace(/\t/g, ' ');
        
        // Try to extract values manually if JSON.parse still fails
        try {
          fabricInfo = JSON.parse(jsonStr);
        } catch {
          // Last resort: extract key-value pairs with regex
          const extract = (key: string): string => {
            const re = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.|"(?!\\s*[,}]))*)"`, 's');
            const m = jsonStr.match(re);
            return m ? m[1].replace(/"/g, '') : '';
          };
          fabricInfo = {
            nome: extract('nome'),
            composicao: extract('composicao'),
            caimento: extract('caimento'),
            elasticidade: extract('elasticidade'),
            dificuldade: extract('dificuldade'),
            roupas: extract('roupas'),
            forro: extract('forro'),
            agulha: extract('agulha'),
            linha: extract('linha'),
            confianca: extract('confianca'),
            observacoes: extract('observacoes'),
          };
          if (!fabricInfo.nome) {
            throw new Error("Could not extract fabric name");
          }
        }
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse fabric identification");
    }

    return new Response(JSON.stringify(fabricInfo), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("identify-fabric error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro ao identificar tecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
