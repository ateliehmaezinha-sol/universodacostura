import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";

const categorias = ["Todos", "Vestidos", "Saias", "Blusas", "Alfaiataria", "Infantil", "Moda Evangélica"];

const modelos = [
  { nome: "Vestido Midi Drapeado", cat: "Vestidos", tecido: "Crepe", dificuldade: "Médio", emoji: "👗" },
  { nome: "Vestido Longo de Festa", cat: "Vestidos", tecido: "Cetim / Seda", dificuldade: "Avançado", emoji: "✨" },
  { nome: "Vestido Camisa", cat: "Vestidos", tecido: "Viscose / Linho", dificuldade: "Médio", emoji: "👔" },
  { nome: "Saia Lápis", cat: "Saias", tecido: "Gabardine", dificuldade: "Fácil", emoji: "📐" },
  { nome: "Saia Godê", cat: "Saias", tecido: "Crepe / Viscose", dificuldade: "Médio", emoji: "🌀" },
  { nome: "Saia Plissada", cat: "Saias", tecido: "Crepe / Cetim", dificuldade: "Avançado", emoji: "🎀" },
  { nome: "Blusa Peplum", cat: "Blusas", tecido: "Crepe", dificuldade: "Médio", emoji: "🎭" },
  { nome: "Blusa Ciganinha", cat: "Blusas", tecido: "Viscose / Laise", dificuldade: "Fácil", emoji: "🌸" },
  { nome: "Blazer Feminino", cat: "Alfaiataria", tecido: "Gabardine / Linho", dificuldade: "Avançado", emoji: "🧥" },
  { nome: "Calça Alfaiataria", cat: "Alfaiataria", tecido: "Gabardine", dificuldade: "Avançado", emoji: "👖" },
  { nome: "Vestido Infantil Rodado", cat: "Infantil", tecido: "Tricoline / Algodão", dificuldade: "Fácil", emoji: "🧒" },
  { nome: "Conjunto Saia e Blusa", cat: "Moda Evangélica", tecido: "Crepe / Viscose", dificuldade: "Médio", emoji: "🕊️" },
  { nome: "Vestido Midi Evangélico", cat: "Moda Evangélica", tecido: "Crepe", dificuldade: "Médio", emoji: "💎" },
  { nome: "Saia Midi Evasê", cat: "Moda Evangélica", tecido: "Linho / Crepe", dificuldade: "Fácil", emoji: "🌿" },
];

export default function Ideias() {
  const [cat, setCat] = useState("Todos");
  const filtrados = cat === "Todos" ? modelos : modelos.filter((m) => m.cat === cat);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">💡 Ideias de Modelos</h1>
        <p className="text-muted-foreground mb-6">Inspire-se com modelos organizados por categoria</p>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                cat === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((m, i) => (
            <motion.div
              key={m.nome}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5 card-hover"
            >
              <div className="text-4xl mb-3">{m.emoji}</div>
              <h3 className="font-display font-semibold text-lg mb-2">{m.nome}</h3>
              <p className="text-sm text-muted-foreground">Tecido: {m.tecido}</p>
              <span className={`inline-block mt-3 text-xs px-3 py-1 rounded-full font-medium ${
                m.dificuldade === "Fácil" ? "bg-green-100 text-green-700" :
                m.dificuldade === "Médio" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {m.dificuldade}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}
