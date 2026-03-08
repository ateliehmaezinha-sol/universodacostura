import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const tecidos = [
  { nome: "Crepe", composicao: "Poliéster", gramatura: "Média", elasticidade: "Baixa", caimento: "Fluido", roupas: "Vestidos, blusas, saias", forro: "Dispensável", dificuldade: "Fácil", emoji: "🟤" },
  { nome: "Viscose", composicao: "Fibra natural regenerada", gramatura: "Leve", elasticidade: "Baixa", caimento: "Muito fluido", roupas: "Vestidos, camisas, blusas", forro: "Opcional", dificuldade: "Médio", emoji: "🟡" },
  { nome: "Seda", composicao: "Fibra natural (casulo)", gramatura: "Leve", elasticidade: "Nenhuma", caimento: "Ultra fluido", roupas: "Vestidos de festa, blusas", forro: "Recomendado", dificuldade: "Avançado", emoji: "✨" },
  { nome: "Linho", composicao: "Fibra natural (linho)", gramatura: "Média", elasticidade: "Nenhuma", caimento: "Estruturado", roupas: "Calças, blazers, camisas", forro: "Opcional", dificuldade: "Médio", emoji: "🟢" },
  { nome: "Tricoline", composicao: "Algodão", gramatura: "Leve", elasticidade: "Nenhuma", caimento: "Levemente estruturado", roupas: "Camisas, vestidos casuais", forro: "Dispensável", dificuldade: "Fácil", emoji: "🔵" },
  { nome: "Cetim", composicao: "Poliéster/Seda", gramatura: "Média", elasticidade: "Baixa", caimento: "Fluido e brilhante", roupas: "Vestidos de festa, lingerie", forro: "Dispensável", dificuldade: "Avançado", emoji: "💫" },
  { nome: "Malha", composicao: "Algodão/Poliéster", gramatura: "Média", elasticidade: "Alta", caimento: "Justo ao corpo", roupas: "Camisetas, vestidos casuais", forro: "Dispensável", dificuldade: "Fácil", emoji: "🟠" },
  { nome: "Gabardine", composicao: "Algodão/Poliéster", gramatura: "Pesada", elasticidade: "Nenhuma", caimento: "Estruturado", roupas: "Calças, blazers, alfaiataria", forro: "Recomendado", dificuldade: "Médio", emoji: "⬛" },
  { nome: "Chiffon", composicao: "Poliéster/Seda", gramatura: "Muito leve", elasticidade: "Nenhuma", caimento: "Aéreo", roupas: "Sobreposições, vestidos", forro: "Obrigatório", dificuldade: "Avançado", emoji: "🤍" },
  { nome: "Oxford", composicao: "Poliéster", gramatura: "Média", elasticidade: "Nenhuma", caimento: "Estruturado", roupas: "Camisas, toalhas", forro: "Dispensável", dificuldade: "Fácil", emoji: "🔷" },
  { nome: "Jacquard", composicao: "Poliéster/Algodão", gramatura: "Pesada", elasticidade: "Baixa", caimento: "Estruturado texturizado", roupas: "Vestidos, saias, decoração", forro: "Recomendado", dificuldade: "Avançado", emoji: "🌟" },
  { nome: "Neoprene", composicao: "Borracha sintética", gramatura: "Pesada", elasticidade: "Alta", caimento: "Estruturado", roupas: "Saias, vestidos modernos", forro: "Dispensável", dificuldade: "Médio", emoji: "🟣" },
];

export default function Tecidos() {
  const [busca, setBusca] = useState("");
  const filtrados = tecidos.filter((t) =>
    t.nome.toLowerCase().includes(busca.toLowerCase()) ||
    t.roupas.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">📚 Biblioteca de Tecidos</h1>
        <p className="text-muted-foreground mb-6">Consulte informações sobre diversos tecidos</p>

        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tecido ou tipo de roupa..."
            className="pl-11 h-12 rounded-xl bg-card"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((t, i) => (
            <motion.div
              key={t.nome}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
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
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    t.dificuldade === "Fácil" ? "bg-green-100 text-green-700" :
                    t.dificuldade === "Médio" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
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
