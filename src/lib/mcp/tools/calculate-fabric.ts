import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

const systemPrompt = `Você é uma costureira profissional com 30+ anos de experiência.
Responda SEMPRE em português brasileiro.
Considere tecido com largura padrão 1,40m-1,50m e margem de 10-15%.

Formato:
📐 METRAGEM NECESSÁRIA
[quantidade] de tecido (largura 1,50m)
[detalhamento]

🧵 TECIDOS RECOMENDADOS
1. [tecido] - [motivo]
2. [tecido] - [motivo]

✂️ DICAS DE CONFECÇÃO
• [dica 1]
• [dica 2]`;

export default defineTool({
  name: "calculate_fabric",
  title: "Calcular metragem de tecido",
  description:
    "Calcula a quantidade de tecido necessária para uma peça a partir das medidas corporais e recomenda tecidos ideais.",
  inputSchema: {
    peca: z.string().min(1).max(500).describe("Peça desejada, ex: 'vestido longo godê'."),
    medidas: z.string().min(1).max(2000).describe("Medidas corporais (busto, cintura, quadril, comprimento, etc)."),
    tipoMedida: z.string().max(100).optional().describe("Tipo de medida, ex: 'adulto feminino'."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ peca, medidas, tipoMedida }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticada." }], isError: true };
    }
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return { content: [{ type: "text", text: "LOVABLE_API_KEY ausente." }], isError: true };
    }
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Tipo: ${tipoMedida ?? "não informado"}\nMedidas: ${medidas}\nPeça: ${peca}\n\nCalcule a metragem e recomende tecidos.`,
          },
        ],
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return { content: [{ type: "text", text: `Erro no gateway (${resp.status}): ${t.slice(0, 300)}` }], isError: true };
    }
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return { content: [{ type: "text", text }] };
  },
});
