import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

const MODELOS: Record<string, { descricao: string; tecidos: string[]; dicas: string[] }> = {
  "Vestido elegante drapeado para festa": {
    descricao: "**Vestido de Festa Drapeado**\n\nModelo longo com drapeado na cintura, decote V e saia fluida. Ideal para eventos formais e formaturas.\n\n📐 **Metragem**: 4,5m a 5,5m de tecido (largura 1,50m)\n\n**Modelagem**: Corte em viés para o corpo, saia godê total para máximo caimento.",
    tecidos: ["Crepe de seda", "Musseline", "Jersey acetinado"],
    dicas: ["Faça o drapeado com alfinetes antes de costurar", "Use barbatanas no corpete para sustentação", "Forre com cetim para conforto"],
  },
  "Blusa ciganinha para verão": {
    descricao: "**Blusa Ciganinha**\n\nModelo com ombros de fora, elástico no decote e cintura. Mangas bufantes com elástico nos punhos. Perfeita para o verão.\n\n📐 **Metragem**: 1,5m a 1,8m de tecido (largura 1,50m)",
    tecidos: ["Viscose estampada", "Tricoline", "Laise"],
    dicas: ["Use elástico chato de 1cm no decote", "Faça o decote 15cm maior que a medida do ombro", "Franzido generoso nas mangas para efeito bufante"],
  },
  "Conjunto saia e blusa evangélico": {
    descricao: "**Conjunto Evangélico — Saia Midi + Blusa**\n\nSaia midi godê abaixo do joelho com blusa social de manga 3/4. Conjunto elegante e discreto.\n\n📐 **Metragem**: Saia: 2,0m + Blusa: 1,5m = **3,5m total**",
    tecidos: ["Crepe", "Gabardine leve", "Oxford"],
    dicas: ["Saia com comprimento 5cm abaixo do joelho", "Blusa com gola padre para elegância", "Use forro na saia se o tecido for claro"],
  },
  "Saia midi evasê elegante": {
    descricao: "**Saia Midi Evasê**\n\nModelo na altura do joelho com corte evasê suave. Versátil para trabalho e lazer.\n\n📐 **Metragem**: 1,2m a 1,5m de tecido (largura 1,50m)",
    tecidos: ["Crepe", "Sarja", "Linho"],
    dicas: ["Cós com zíper invisível lateral", "Bainha italiana para acabamento", "Forre se o tecido for fino"],
  },
  "Blazer feminino de alfaiataria": {
    descricao: "**Blazer Feminino de Alfaiataria**\n\nCorte clássico com lapela, dois botões, bolsos embutidos. Peça-chave do guarda-roupa profissional.\n\n📐 **Metragem**: 1,8m tecido principal + 1,8m forro = **3,6m total**",
    tecidos: ["Gabardine", "Oxford", "Linho estruturado"],
    dicas: ["Use entretela em frentes, gola e punhos", "Forre com bemberg ou cetim", "Monte os bolsos antes de unir frente e costas"],
  },
};

const sugestoes = Object.keys(MODELOS);

export default function Criador() {
  const [comando, setComando] = useState("");
  const [resultado, setResultado] = useState<string | null>(null);

  const gerar = () => {
    if (!comando.trim()) return;

    // Find best match
    const q = comando.toLowerCase();
    let match = Object.entries(MODELOS).find(([key]) => q.includes(key.toLowerCase().split(" ")[0]));
    
    if (!match) {
      // Try keyword matching
      for (const [key, val] of Object.entries(MODELOS)) {
        const words = key.toLowerCase().split(" ");
        if (words.some(w => w.length > 3 && q.includes(w))) {
          match = [key, val];
          break;
        }
      }
    }

    if (match) {
      const [, modelo] = match;
      const text = `${modelo.descricao}\n\n🧵 **Tecidos Recomendados**:\n${modelo.tecidos.map((t, i) => `${i + 1}. **${t}**`).join("\n")}\n\n✂️ **Dicas de Confecção**:\n${modelo.dicas.map(d => `• ${d}`).join("\n")}`;
      setResultado(text);
    } else {
      setResultado(`✨ **Criação: ${comando}**\n\nPara esta peça, recomendo:\n\n📐 **Passo a passo**:\n1. Tire as medidas: busto, cintura, quadril e comprimento desejado\n2. Escolha um tecido com bom caimento\n3. Faça a modelagem em papel primeiro\n4. Corte com margem de costura de 2cm\n\n🧵 **Tecidos sugeridos**:\n1. **Crepe** — versátil e elegante\n2. **Viscose** — confortável e acessível\n3. **Gabardine** — para peças estruturadas\n\n💡 *Use a aba "Assistente de Costura" para calcular a metragem exata com base nas suas medidas!*`);
    }
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">🎨 Criador de Roupa</h1>
        <p className="text-muted-foreground mb-8">
          Selecione um modelo e veja tecidos, metragem e dicas de confecção — 100% offline
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Descreva o que quer criar..."
                value={comando}
                onChange={(e) => setComando(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && gerar()}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {sugestoes.map((s) => (
                <button
                  key={s}
                  onClick={() => { setComando(s); }}
                  className="text-xs bg-card border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            <Button
              onClick={gerar}
              disabled={!comando.trim()}
              className="w-full h-12 bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl disabled:opacity-40"
            >
              <Sparkles size={18} className="mr-2" /> Gerar Criação
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              ✨ Modelos com metragem, tecidos recomendados e dicas de confecção
            </p>
          </div>

          <div>
            {resultado ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-accent" />
                  Criação Pronta!
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_table]:text-xs">
                  <ReactMarkdown>{resultado}</ReactMarkdown>
                </div>
              </motion.div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <FileText size={48} className="text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-sm">Sua criação aparecerá aqui</p>
                <p className="text-muted-foreground text-xs mt-1">Descreva a peça ou escolha uma sugestão</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
