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
  "Quanto de tecido para vestido longo godê?",
  "Melhor tecido para blazer feminino?",
  "Quanto cobrar por uma saia midi?",
  "Diferença entre evasê e godê total?",
  "Qual forro usar em vestido de festa?",
  "Dicas de acabamento para iniciantes",
];

export default function Assistente() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Olá! 👋 Sou a assistente de costura com IA!\n\nPosso te ajudar com:\n- 📐 **Cálculo de tecido** para qualquer peça\n- ✂️ **Tipos de modelagem** e variações de godê\n- 🧵 **Recomendação de tecidos** ideais\n- 💰 **Precificação** dos seus serviços\n- 💡 **Dicas de costura** e acabamento\n\nPergunte o que quiser! 😊",
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

    let assistantContent = "";

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: newMsgs.filter(m => m.role === "user" || m.role === "assistant").map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        const errMsg = errData?.error || "Erro ao responder, tente novamente";
        setMsgs(prev => [...prev, { role: "assistant", content: `❌ ${errMsg}` }]);
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        setMsgs(prev => [...prev, { role: "assistant", content: "❌ Erro ao responder, tente novamente" }]);
        setIsLoading(false);
        return;
      }

      // Stream SSE response
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsertAssistant = (nextChunk: string) => {
        assistantContent += nextChunk;
        setMsgs(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
          }
          return [...prev, { role: "assistant", content: assistantContent }];
        });
      };

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }

      if (!assistantContent) {
        setMsgs(prev => [...prev, { role: "assistant", content: "Desculpe, não consegui gerar uma resposta. Tente novamente! 🙏" }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMsgs(prev => [...prev, { role: "assistant", content: "❌ Erro ao responder, tente novamente" }]);
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
        <h1 className="text-2xl font-display font-bold mb-1">
          💬 Assistente de Costura IA
        </h1>
        <p className="text-xs text-muted-foreground mb-3">
          Tire dúvidas sobre tecidos, metragem, precificação e costura com inteligência artificial
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
            placeholder="Pergunte sobre tecidos, metragem, preço..."
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
