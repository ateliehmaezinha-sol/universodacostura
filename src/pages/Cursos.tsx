import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const cursos = [
  {
    titulo: "Modelagem Feminina",
    desc: "Aprenda a criar moldes profissionais do zero. Curso completo para iniciantes e intermediárias que desejam dominar a arte da modelagem.",
    emoji: "📐",
    destaque: true,
  },
  {
    titulo: "Interpretação de Modelagem",
    desc: "Domine a técnica de interpretar e adaptar moldes para diferentes estilos e corpos. Transforme moldes base em peças exclusivas.",
    emoji: "📋",
  },
  {
    titulo: "Calça Feminina Sob Medida",
    desc: "Curso específico para confecção de calças femininas perfeitas. Aprenda ajustes, forros e acabamentos profissionais.",
    emoji: "👖",
  },
  {
    titulo: "Costura Profissional",
    desc: "Do básico ao avançado: aprenda técnicas profissionais de costura, acabamento e uso correto de máquinas e ferramentas.",
    emoji: "🧵",
    destaque: true,
  },
  {
    titulo: "Alfaiataria Feminina",
    desc: "Domine a arte da alfaiataria feminina. Blazers, coletes, calças de alfaiataria com acabamento impecável.",
    emoji: "🧥",
  },
  {
    titulo: "Vestidos de Festa",
    desc: "Aprenda a criar vestidos de festa deslumbrantes. Drapeados, recortes, aplicações e forros profissionais.",
    emoji: "👗",
  },
];

export default function Cursos() {
  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">🎓 Cursos da Sol</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Aprenda com a Sol e transforme sua costura em uma carreira de sucesso
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((c, i) => (
            <motion.div
              key={c.titulo}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-6 card-hover flex flex-col ${
                c.destaque
                  ? "bg-primary text-primary-foreground border-2 border-accent"
                  : "bg-card border border-border"
              }`}
            >
              <div className="text-4xl mb-4">{c.emoji}</div>
              <h3 className="font-display text-xl font-semibold mb-3">{c.titulo}</h3>
              <p className={`text-sm flex-1 mb-6 ${c.destaque ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {c.desc}
              </p>
              <Button
                className={`w-full rounded-xl ${
                  c.destaque
                    ? "bg-accent text-accent-foreground hover:bg-gold-dark"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                <ExternalLink size={16} className="mr-2" />
                Saiba Mais
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}
