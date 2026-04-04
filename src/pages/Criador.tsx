import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, FileText, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

const sugestoes = [
  "Vestido de festa longo drapeado",
  "Blazer feminino de alfaiataria",
  "Macacão pantalona elegante",
  "Saia midi evasê para trabalho",
  "Blusa ciganinha para verão",
  "Vestido de noiva sereia",
  "Conjunto evangélico saia e blusa",
  "Cropped com amarração frontal",
  "Calça pantalona de linho",
  "Jaleco profissional estilizado",
];

export default function Criador() {
  const [comando, setComando] = useState("");
  const [resultado, setResultado] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const gerar = async () => {
    if (!comando.trim() || isLoading) return;
    setIsLoading(true);
    setResultado(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-clothing", {
        body: { prompt: comando },
      });

      if (error) {
        setResultado(`❌ ${error.message || "Erro ao gerar. Tente novamente."}`);
      } else if (data?.error) {
        setResultado(`❌ ${data.error}`);
      } else {
        setResultado(data.description);
      }
    } catch (err) {
      console.error(err);
      setResultado("❌ Erro ao responder, tente novamente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">🎨 Criador de Roupa IA</h1>
        <p className="text-muted-foreground mb-8">
          Descreva a peça e receba ficha técnica completa com tecidos, metragem e passo a passo
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Input
              placeholder="Ex: Vestido longo de festa com decote V..."
              value={comando}
              onChange={(e) => setComando(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && gerar()}
              disabled={isLoading}
              className="h-12 rounded-xl"
            />

            <div className="flex flex-wrap gap-2">
              {sugestoes.map((s) => (
                <button
                  key={s}
                  onClick={() => setComando(s)}
                  disabled={isLoading}
                  className="text-xs bg-card border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-accent transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>

            <Button
              onClick={gerar}
              disabled={!comando.trim() || isLoading}
              className="w-full h-12 bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl disabled:opacity-40"
            >
              {isLoading ? (
                <><Loader2 size={18} className="mr-2 animate-spin" /> Gerando com IA...</>
              ) : (
                <><Sparkles size={18} className="mr-2" /> Gerar Ficha Técnica</>
              )}
            </Button>
          </div>

          <div>
            {isLoading && !resultado ? (
              <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <Loader2 size={48} className="text-accent animate-spin mb-4" />
                <p className="text-muted-foreground text-sm">Gerando ficha técnica com IA...</p>
                <p className="text-muted-foreground text-xs mt-1">Isso pode levar alguns segundos</p>
              </div>
            ) : resultado ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-2xl p-6 max-h-[70vh] overflow-y-auto"
              >
                <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-accent" />
                  Ficha Técnica
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{resultado}</ReactMarkdown>
                </div>
              </motion.div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <FileText size={48} className="text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-sm">Sua ficha técnica aparecerá aqui</p>
                <p className="text-muted-foreground text-xs mt-1">Descreva a peça ou escolha uma sugestão</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
