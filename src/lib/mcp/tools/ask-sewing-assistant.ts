import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

const systemPrompt = `Você é uma costureira profissional com 30+ anos de experiência em ateliê feminino no Brasil.
Responda SEMPRE em português brasileiro, de forma prática e direta.
Especialidades: cálculo de tecido, modelagem (godê, evasê, reta), tecidos ideais, acabamento, precificação, medidas.
Use markdown e emojis (📐 ✂️ 🧵 💡) quando ajudar.`;

export default defineTool({
  name: "ask_sewing_assistant",
  title: "Perguntar à assistente de costura",
  description:
    "Faz uma pergunta livre à assistente de costura do Unicost IA (tecidos, modelagem, metragem, precificação, dicas).",
  inputSchema: {
    question: z.string().min(1).max(5000).describe("Pergunta em português."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ question }, ctx: ToolContext) => {
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
          { role: "user", content: question },
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
