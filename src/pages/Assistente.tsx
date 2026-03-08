import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const respostas: Record<string, string> = {
  "forro": "Para viscose, recomendo forro de malha fria ou meia malha. Se for um vestido mais estruturado, use forro de crepe leve. O forro ajuda a evitar transparência e dá melhor caimento.",
  "agulha": "Para tecidos finos como seda e chiffon, use agulha Microtex 60/70. Para malha, use ponta bola 70/80. Para jeans, agulha 90/100 ou 110.",
  "linha": "Linha de poliéster é a mais versátil. Para tecidos delicados, use linha fina de poliéster. Para overloque, use fio texturizado.",
  "preco": "Para precificar, considere: custo do tecido + aviamentos + mão de obra (tempo × valor/hora) + margem de lucro de 30% a 50%. Use nossa calculadora para valores mais precisos!",
  "tecido": "Para vestidos de festa, crepe, cetim e seda são ideais. Para o dia a dia, viscose e malha. Para alfaiataria, gabardine e linho. Consulte nossa biblioteca de tecidos!",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, val] of Object.entries(respostas)) {
    if (lower.includes(key)) return val;
  }
  return "Ótima pergunta! 🧵 Para uma resposta mais precisa com IA, conecte o Lovable Cloud. Por enquanto, confira nossa biblioteca de tecidos e calculadora de preços que podem ajudar!";
}

export default function Assistente() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Olá! 👋 Sou a assistente de costura da Sol. Como posso ajudar você hoje? Pergunte sobre tecidos, forros, agulhas, linhas ou preços!" },
  ]);
  const [input, setInput] = useState("");

  const enviar = () => {
    if (!input.trim()) return;
    const userMsg: Msg = { role: "user", content: input };
    const resp: Msg = { role: "assistant", content: getResponse(input) };
    setMsgs([...msgs, userMsg, resp]);
    setInput("");
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
        <h1 className="text-2xl font-display font-bold mb-4">💬 Assistente de Costura</h1>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-accent" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}>
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Pergunte sobre costura, tecidos, preços..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()}
            className="h-12 rounded-xl flex-1"
          />
          <Button onClick={enviar} className="h-12 w-12 bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl p-0">
            <Send size={18} />
          </Button>
        </div>
      </motion.div>
    </AppLayout>
  );
}
