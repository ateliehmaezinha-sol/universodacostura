import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tecidos = [
  { nome: "Crepe", composicao: "Poliéster", gramatura: "Média", elasticidade: "Baixa", caimento: "Fluido", roupas: "Vestidos, blusas, saias", forro: "Dispensável (opcional: forro de malha fria ou viscose)", dificuldade: "Fácil", emoji: "🟤" },
  { nome: "Viscose", composicao: "Fibra natural regenerada", gramatura: "Leve", elasticidade: "Baixa", caimento: "Muito fluido", roupas: "Vestidos, camisas, blusas", forro: "Opcional (sugestão: forro de toque de seda ou musseline)", dificuldade: "Médio", emoji: "🟡" },
  { nome: "Seda", composicao: "Fibra natural (casulo)", gramatura: "Leve", elasticidade: "Nenhuma", caimento: "Ultra fluido", roupas: "Vestidos de festa, blusas", forro: "Recomendado: organza de seda, musseline ou charmeuse", dificuldade: "Avançado", emoji: "✨" },
  { nome: "Linho", composicao: "Fibra natural (linho)", gramatura: "Média", elasticidade: "Nenhuma", caimento: "Estruturado", roupas: "Calças, blazers, camisas", forro: "Opcional (sugestão: forro de bemberg ou viscose leve)", dificuldade: "Médio", emoji: "🟢" },
  { nome: "Tricoline", composicao: "Algodão", gramatura: "Leve", elasticidade: "Nenhuma", caimento: "Levemente estruturado", roupas: "Camisas, vestidos casuais", forro: "Dispensável (opcional: entretela leve para colarinhos)", dificuldade: "Fácil", emoji: "🔵" },
  { nome: "Cetim", composicao: "Poliéster/Seda", gramatura: "Média", elasticidade: "Baixa", caimento: "Fluido e brilhante", roupas: "Vestidos de festa, lingerie", forro: "Dispensável (sugestão: forro de toque de seda para vestidos)", dificuldade: "Avançado", emoji: "💫" },
  { nome: "Malha", composicao: "Algodão/Poliéster", gramatura: "Média", elasticidade: "Alta", caimento: "Justo ao corpo", roupas: "Camisetas, vestidos casuais", forro: "Dispensável (para transparência: forro de malha fria)", dificuldade: "Fácil", emoji: "🟠" },
  { nome: "Gabardine", composicao: "Algodão/Poliéster", gramatura: "Pesada", elasticidade: "Nenhuma", caimento: "Estruturado", roupas: "Calças, blazers, alfaiataria", forro: "Recomendado: forro de bemberg, acetato ou tafetá", dificuldade: "Médio", emoji: "⬛" },
  { nome: "Chiffon", composicao: "Poliéster/Seda", gramatura: "Muito leve", elasticidade: "Nenhuma", caimento: "Aéreo", roupas: "Sobreposições, vestidos", forro: "Obrigatório: forro de toque de seda, jersey fino ou charmeuse", dificuldade: "Avançado", emoji: "🤍" },
  { nome: "Oxford", composicao: "Poliéster", gramatura: "Média", elasticidade: "Nenhuma", caimento: "Estruturado", roupas: "Camisas, toalhas", forro: "Dispensável", dificuldade: "Fácil", emoji: "🔷" },
  { nome: "Jacquard", composicao: "Poliéster/Algodão", gramatura: "Pesada", elasticidade: "Baixa", caimento: "Estruturado texturizado", roupas: "Vestidos, saias, decoração", forro: "Recomendado: forro de tafetá ou acetato para estrutura", dificuldade: "Avançado", emoji: "🌟" },
  { nome: "Neoprene", composicao: "Borracha sintética", gramatura: "Pesada", elasticidade: "Alta", caimento: "Estruturado", roupas: "Saias, vestidos modernos", forro: "Dispensável (já possui camadas internas)", dificuldade: "Médio", emoji: "🟣" },
  { nome: "Tafetá", composicao: "Poliéster/Seda", gramatura: "Leve a média", elasticidade: "Nenhuma", caimento: "Estruturado com brilho", roupas: "Vestidos de festa, saias volumosas", forro: "Opcional: forro de toque de seda", dificuldade: "Médio", emoji: "💎" },
  { nome: "Organza", composicao: "Poliéster/Seda", gramatura: "Muito leve", elasticidade: "Nenhuma", caimento: "Aéreo e transparente", roupas: "Detalhes, sobreposições, véus", forro: "Obrigatório: forro de toque de seda ou charmeuse", dificuldade: "Avançado", emoji: "🦋" },
  { nome: "Moletom", composicao: "Algodão/Poliéster", gramatura: "Pesada", elasticidade: "Média", caimento: "Casual e confortável", roupas: "Moletons, calças jogger, conjuntos", forro: "Dispensável (já possui felpado interno)", dificuldade: "Fácil", emoji: "🧸" },
  { nome: "Jeans/Denim", composicao: "Algodão", gramatura: "Pesada", elasticidade: "Baixa a média", caimento: "Estruturado e firme", roupas: "Calças, jaquetas, saias", forro: "Opcional: forro de algodão para jaquetas", dificuldade: "Médio", emoji: "👖" },
  { nome: "Renda", composicao: "Poliéster/Algodão", gramatura: "Leve", elasticidade: "Baixa", caimento: "Delicado e vazado", roupas: "Vestidos, blusas, detalhes", forro: "Obrigatório: forro de toque de seda, cetim ou jersey", dificuldade: "Avançado", emoji: "🌸" },
  { nome: "Suede", composicao: "Poliéster", gramatura: "Média", elasticidade: "Baixa", caimento: "Levemente estruturado", roupas: "Saias, jaquetas, vestidos", forro: "Recomendado: forro de bemberg ou viscose", dificuldade: "Médio", emoji: "🍂" },
  { nome: "Alfaiataria", composicao: "Poliéster/Lã/Elastano", gramatura: "Média a pesada", elasticidade: "Baixa", caimento: "Estruturado e elegante", roupas: "Calças sociais, blazers, coletes", forro: "Recomendado: forro de bemberg, acetato ou tafetá fino", dificuldade: "Médio", emoji: "🎩" },
  { nome: "Tule", composicao: "Poliéster/Nylon", gramatura: "Muito leve", elasticidade: "Baixa", caimento: "Aéreo e volumoso", roupas: "Saias, vestidos de festa, detalhes", forro: "Obrigatório: forro de toque de seda ou cetim", dificuldade: "Médio", emoji: "🩰" },
];

const dificuldades = ["Todos", "Fácil", "Médio", "Avançado"] as const;

export default function Tecidos() {
  const [busca, setBusca] = useState("");
  const [filtroDificuldade, setFiltroDificuldade] = useState<string>("Todos");

  const normalizeText = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const buscaNormalizada = normalizeText(busca.trim());

  const filtrados = tecidos.filter((t) => {
    if (filtroDificuldade !== "Todos" && t.dificuldade !== filtroDificuldade) return false;
    if (!buscaNormalizada) return true;
    return (
      normalizeText(t.nome).includes(buscaNormalizada) ||
      normalizeText(t.roupas).includes(buscaNormalizada) ||
      normalizeText(t.composicao).includes(buscaNormalizada) ||
      normalizeText(t.caimento).includes(buscaNormalizada) ||
      normalizeText(t.dificuldade).includes(buscaNormalizada)
    );
  });

  const getDificuldadeStyle = (d: string) => {
    if (d === "Fácil") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (d === "Médio") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  const getFilterStyle = (d: string) => {
    const isActive = filtroDificuldade === d;
    if (d === "Todos") return isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent";
    if (d === "Fácil") return isActive ? "bg-green-600 text-white" : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400";
    if (d === "Médio") return isActive ? "bg-yellow-600 text-white" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400";
    return isActive ? "bg-red-600 text-white" : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">📚 Biblioteca de Tecidos</h1>
        <p className="text-muted-foreground mb-6">Consulte informações sobre diversos tecidos</p>

        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tecido ou tipo de roupa..."
            className="pl-11 h-12 rounded-xl bg-card"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {dificuldades.map((d) => (
            <button
              key={d}
              onClick={() => setFiltroDificuldade(d)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${getFilterStyle(d)}`}
            >
              {d === "Todos" ? "Todos" : d} {d !== "Todos" && `(${tecidos.filter((t) => t.dificuldade === d).length})`}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-4">{filtrados.length} tecido{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((t, i) => (
            <motion.div
              key={t.nome}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border border-border rounded-2xl p-5 card-hover"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{t.emoji}</span>
                <h3 className="font-display text-xl font-semibold">{t.nome}</h3>
              </div>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-muted-foreground">Composição:</span> {t.composicao}</p>
                <p><span className="text-muted-foreground">Gramatura:</span> {t.gramatura}</p>
                <p><span className="text-muted-foreground">Elasticidade:</span> {t.elasticidade}</p>
                <p><span className="text-muted-foreground">Caimento:</span> {t.caimento}</p>
                <p><span className="text-muted-foreground">Roupas ideais:</span> {t.roupas}</p>
                <p><span className="text-muted-foreground">Forro:</span> {t.forro}</p>
                <div className="pt-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getDificuldadeStyle(t.dificuldade)}`}>
                    {t.dificuldade}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}
