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
    link: "",
  },
  {
    titulo: "Interpretação de Modelagem Feminina + Calças",
    desc: "Domine a técnica de interpretar e adaptar moldes para diferentes estilos e corpos. Transforme moldes base em peças exclusivas, incluindo modelagem completa de calças femininas.",
    emoji: "📋",
    link: "https://pay.kiwify.com.br/c9Q1vdU",
  },
  {
    titulo: "Modelagem Infantil - Moda Kids",
    desc: "Aprenda a criar moldes e peças infantis encantadoras. Técnicas especiais para roupas confortáveis e estilosas para crianças.",
    emoji: "🧒",
    link: "",
  },
  {
    titulo: "Costura Profissional",
    desc: "Da modelagem ao acabamento, ensino técnicas exclusivas usando base de modelagem do padrão industrial com as Réguas LD Molde Perfeito. Aqui no Atelieh Mãezinha a cliente prova uma vez só — já ensinei muitas alunas a fazer o mesmo, e o resultado surpreende até as clientes!",
    emoji: "🧵",
    destaque: true,
    link: "",
  },
  {
    titulo: "Assistente IA – Costureira Estrela de Sucesso ⭐🧵",
    desc: "Sua secretária digital que trabalha 24h, sem cobrar salário e sem fazer cara feia! A IA Costureira complementa o app, tira dúvidas sobre costura, tecidos, preços e acabamentos. Apoio, direção e incentivo diário para quem transformou a costura em fonte de renda. Porque quem aprende, não depende!",
    emoji: "🤖",
    destaque: true,
    link: "",
  },
  {
    titulo: "Camisa Feminina – 100% Online",
    desc: "Curso prático e descomplicado! Aprenda do zero ao acabamento perfeito usando base de modelagem do padrão industrial. Tire medidas, modele, corte e costure camisas femininas exclusivas. Inclui suporte VIP no Telegram, mentoria por videochamada e comunidade de apoio. Aprenda também a vender suas camisas e criar um negócio lucrativo!",
    emoji: "👔",
    link: "",
  },
];
export default function Cursos() {
  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">🎓 Área de Cursos</h1>
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
              {c.link ? (
                <a href={c.link} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button
                    className={`w-full rounded-xl ${
                      c.destaque
                        ? "bg-accent text-accent-foreground hover:bg-gold-dark"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Comprar Curso
                  </Button>
                </a>
              ) : (
                <Button
                  className={`w-full rounded-xl ${
                    c.destaque
                      ? "bg-accent text-accent-foreground hover:bg-gold-dark"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                  disabled
                >
                  Em breve
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}
