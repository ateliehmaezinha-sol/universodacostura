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
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { imageBase64, mode, userFeedback } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const MAX_B64 = 7_000_000; // ~5 MB decoded
    if (typeof imageBase64 !== "string" || imageBase64.length > MAX_B64) {
      return new Response(JSON.stringify({ error: "Imagem muito grande. Envie uma imagem menor." }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (mode !== undefined && mode !== null && !["fabric", "garment", "roupa", "tecido"].includes(mode)) {
      return new Response(JSON.stringify({ error: "Modo inválido." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (userFeedback !== undefined && userFeedback !== null && (typeof userFeedback !== "string" || userFeedback.length > 500)) {
      return new Response(JSON.stringify({ error: "Feedback muito longo." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isGarmentMode = mode === "garment" || mode === "roupa";

    let feedbackInstruction = "";
    if (userFeedback) {
      feedbackInstruction = `\n\nIMPORTANTE: O usuário informou que a análise anterior estava incorreta. O feedback do usuário é: "${userFeedback}". Reavalie com extremo cuidado e, se o feedback for compatível com os sinais visuais, priorize essa correção.`;
    }

    const mandatoryProtocol = `PROTOCOLO OBRIGATÓRIO (use internamente antes de decidir o nome final):
1) Classifique PRIMEIRO a ESTRUTURA: MALHA ou TECIDO PLANO.
2) Só depois escolha a família do tecido.
3) Se os sinais de MALHA forem dominantes, NÃO retorne tecido plano (crepe plano, viscose plana, chiffon, sarja etc).

SINAIS FORTES DE MALHA (knit):
- Linhas horizontais/colunas de laçadas contínuas na superfície
- Elasticidade visível, principalmente transversal
- Borda cortada que não desfia como tecido plano (pode enrolar)
- Toque e queda mais flexíveis/macios

SINAIS FORTES DE TECIDO PLANO (woven):
- Estrutura urdume + trama (grade cruzada)
- Menor elasticidade natural (exceto com elastano)
- Borda tende a desfiar quando cortada
- Pode ter corpo mais estável dependendo da construção

CASOS CRÍTICOS DE DECISÃO:
- MALHA HELANCA/HELANQUINHA (forro): malha fina, superfície lisa, leve brilho sintético, elasticidade leve a moderada, muito usada como forro de vestidos/saias.
- BENGALINE: tecido plano estruturado, firme, com elasticidade moderada e possível diagonal de sarja; não tem comportamento típico de malha de forro.
- CREPE DE VISCOSE / VISCOSE DIGITAL: tecido plano leve e fluido; pode ter leve transparência e estampa digital vibrante.
- CHIFFON/GEORGETTE: tecido plano muito leve, translúcido; não tem construção de malha.

REGRAS ANTI-ERRO:
- Se houver aparência de malha de forro preta/fina/lisa + elasticidade leve + borda sem desfiar, priorize "Malha Helanca (Helanquinha)" ou "Malha poliéster com elastano para forro".
- Não chame de moletom se não houver espessura alta e avesso peluciado.
- Em dúvida entre duas opções, escolha a que melhor respeita a ESTRUTURA (malha vs plano) e reduza a confiança.`;

    const taxonomyReference = `CATÁLOGO DE REFERÊNCIA (avaliar candidatos):
- MALHAS: helanca/helanquinha, malha poliéster com elastano, viscolycra, suplex, meia malha, ribana, moletinho, moletom.
- PLANOS LEVES: viscose, viscose digital, crepe de viscose, crepe georgette, chiffon, tricoline leve.
- PLANOS ESTRUTURADOS: bengaline, sarja, brim, gabardine, oxford.
- ESPECIAIS: cetim, neoprene, tule, renda.

Para estampas digitais vibrantes com fundo escuro e caimento fluido, considere prioritariamente viscose digital/crepe de viscose, desde que a estrutura NÃO seja malha.`;

    const responseSchema = `Responda APENAS em JSON válido, sem markdown:
{
  "nome": "Nome do tecido",
  "composicao": "Composição provável",
  "caimento": "Tipo de caimento",
  "elasticidade": "Nível de elasticidade",
  "dificuldade": "Fácil/Médio/Avançado",
  "roupas": "Peças ideais/uso principal",
  "forro": "Se precisa de forro ou se é usado como forro",
  "agulha": "Agulha recomendada",
  "linha": "Linha recomendada",
  "confianca": "Alta/Média/Baixa",
  "observacoes": "Explique brevemente os sinais visuais que sustentam a decisão"
}`;

    const systemPrompt = isGarmentMode
      ? `Você é um especialista têxtil sênior em identificação por imagem de ROUPA PRONTA.

${mandatoryProtocol}

${taxonomyReference}

Ao analisar roupa pronta, observe: área de costura, dobras, recuperação após tensão, brilho, espessura, transparência e comportamento do forro quando visível.${feedbackInstruction}

Identifique o tecido principal da peça e possíveis misturas/composição. Se o tecido principal não estiver totalmente visível, declare incerteza em "confianca" e explique em "observacoes".

${responseSchema}`
      : `Você é um especialista têxtil sênior em identificação por imagem de TECIDO (amostra/foto aproximada).

${mandatoryProtocol}

${taxonomyReference}

Para foto de tecido, dê peso alto a: construção (malha x plano), presença de laçadas, borda cortada, nível real de desfiamento, granulação de superfície (crepe), transparência e resposta da dobra.${feedbackInstruction}

Se detectar padrão típico de forro elástico fino, prefira classificar como malha de forro (ex: helanquinha) em vez de tecidos planos fluidos.

${responseSchema}`;

    const userText = isGarmentMode
      ? "Identifique o tecido desta roupa pronta seguindo o protocolo: primeiro estrutura (malha ou tecido plano), depois tipo específico e composição."
      : "Identifique o tecido da imagem seguindo o protocolo: primeiro estrutura (malha ou tecido plano), depois tipo específico (ex: helanquinha, crepe, viscose, bengaline).";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: imageBase64 } },
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

    let fabricInfo;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");

      let jsonStr = jsonMatch[0];
      try {
        fabricInfo = JSON.parse(jsonStr);
      } catch {
        jsonStr = jsonStr
          .replace(/[\x00-\x1F\x7F]/g, (ch: string) => (ch === "\n" || ch === "\r" || ch === "\t" ? ch : ""))
          .replace(/\n/g, " ")
          .replace(/\r/g, "")
          .replace(/\t/g, " ");

        try {
          fabricInfo = JSON.parse(jsonStr);
        } catch {
          const extract = (key: string): string => {
            const re = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.|"(?!\\s*[,}]))*)"`, "s");
            const m = jsonStr.match(re);
            return m ? m[1].replace(/"/g, "") : "";
          };

          fabricInfo = {
            nome: extract("nome"),
            composicao: extract("composicao"),
            caimento: extract("caimento"),
            elasticidade: extract("elasticidade"),
            dificuldade: extract("dificuldade"),
            roupas: extract("roupas"),
            forro: extract("forro"),
            agulha: extract("agulha"),
            linha: extract("linha"),
            confianca: extract("confianca"),
            observacoes: extract("observacoes"),
          };

          if (!fabricInfo.nome) {
            throw new Error("Could not extract fabric name");
          }
        }
      }
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse fabric identification");
    }

    return new Response(JSON.stringify(fabricInfo), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("identify-fabric error:", e);
    return new Response(
      JSON.stringify({ error: "Erro ao identificar tecido. Tente novamente." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
