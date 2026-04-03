import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sewing-assistant`;

const sugestoes = [
  "Quanto de tecido para vestido longo godê total?",
  "Diferença entre evasê, meio godê e godê total?",
  "Melhor tecido para blazer feminino?",
  "Quanto de tecido para calça pantalona?",
  "Qual forro usar em vestido de festa?",
  "Quanto de tecido para saia midi evasê?",
];

export default function Assistente() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Olá! 👋 Sou a assistente de costura da Sol, com mais de 30 anos de experiência!\n\nPosso te ajudar com:\n- 📐 **Cálculo de tecido** para qualquer peça\n- ✂️ **Tipos de godê** (evasê, meio godê, godê total)\n- 🧵 **Recomendação de tecidos** ideais\n- 💡 **Dicas de costura** e acabamento\n\nPergunte por exemplo: *\"Quanto de tecido para um vestido longo com busto 102, cintura 80 e quadril 104 com saia godê?\"*",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs]);

  const enviar = async (text?: string) => {
    const message = text || input;
    if (!message.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: message };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setMsgs((prev) => [...prev, { role: "assistant", content: "⚠️ Sessão expirada. Faça login novamente." }]);
        setIsLoading(false);
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: newMsgs }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        const errorMsg = errorData.error || "Erro ao conectar com a assistente. Tente novamente.";
        setMsgs((prev) => [...prev, { role: "assistant", content: `⚠️ ${errorMsg}` }]);
        setIsLoading(false);
        return;
      }

      const data = await resp.json();
      setMsgs((prev) => [...prev, { role: "assistant", content: data.response || "Desculpe, não consegui gerar uma resposta." }]);
    } catch {
      setMsgs((prev) => [...prev, { role: "assistant", content: "⚠️ Erro de conexão. Verifique sua internet e tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]"
      >
        <h1 className="text-2xl font-display font-bold mb-2">
          💬 Assistente de Costura IA
        </h1>
        <p className="text-xs text-muted-foreground mb-3">
          Pergunte sobre quantidade de tecido, tipos de godê, melhores tecidos e
          dicas de costura
        </p>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2"
        >
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} className="text-accent" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_table]:text-xs [&_th]:px-2 [&_td]:px-2 [&_th]:py-1 [&_td]:py-1">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                  <User size={16} />
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && msgs[msgs.length - 1]?.role === "user" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-accent" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Pensando...
              </div>
            </motion.div>
          )}
        </div>

        {msgs.length <= 1 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {sugestoes.map((s) => (
              <button
                key={s}
                onClick={() => enviar(s)}
                disabled={isLoading}
                className="text-[11px] bg-muted/50 border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-accent transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Pergunte sobre tecidos, quantidade, godê, preços..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()}
            disabled={isLoading}
            className="h-12 rounded-xl flex-1"
          />
          <Button
            onClick={() => enviar()}
            disabled={!input.trim() || isLoading}
            className="h-12 w-12 bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl p-0"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
      </motion.div>
    </AppLayout>
  );
}
