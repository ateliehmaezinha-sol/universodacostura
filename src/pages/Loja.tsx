import { motion } from "framer-motion";
import { ExternalLink, ShoppingBag, Sparkles, Scissors, Heart, Tablet } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";

const LOJA_URL = "https://lojadasmusas.com/solessenciafeminina";

const categorias = [
  {
    id: "autocuidado",
    titulo: "Autocuidado & Bem-estar",
    emoji: "✨",
    icon: Heart,
    desc: "Produtos físicos para cuidar de você enquanto cuida das suas clientes",
    cor: "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800",
    corTitulo: "text-rose-700 dark:text-rose-300",
    produtos: [
      { nome: "Kit Skincare Costureira", tipo: "Físico", emoji: "🌸", desc: "Hidratantes, cremes para mãos e protetor solar. Cuide das mãos que criam!" },
      { nome: "Suplementos Energia", tipo: "Físico", emoji: "💊", desc: "Vitaminas e suplementos para manter o pique nas longas horas de costura." },
      { nome: "Óleo Relaxante Muscular", tipo: "Físico", emoji: "💆", desc: "Alívio para ombros e costas após um dia de trabalho intenso." },
      { nome: "Kit Bem-estar Completo", tipo: "Físico", emoji: "🧴", desc: "Tudo o que você precisa para se cuidar com carinho." },
    ],
  },
  {
    id: "costura",
    titulo: "Acessórios & Materiais de Costura",
    emoji: "🧵",
    icon: Scissors,
    desc: "Produtos da Shopee com curadoria especial — aviamentos, retalhos e mais",
    cor: "bg-violet-50 border-violet-200 dark:bg-violet-950/20 dark:border-violet-800",
    corTitulo: "text-violet-700 dark:text-violet-300",
    produtos: [
      { nome: "Retalhos de Tecidos", tipo: "Shopee", emoji: "🎨", desc: "Pacotes de retalhos variados para projetos criativos, patches e patchwork." },
      { nome: "Entretelas e Manta Acrílica", tipo: "Shopee", emoji: "📋", desc: "Entretelas termocolantes, manta acrílica e outros materiais de base." },
      { nome: "Aviamentos Completos", tipo: "Shopee", emoji: "🪡", desc: "Botões, zíperes, elásticos, fitas, vieses, ilhoses e muito mais." },
      { nome: "Acessórios para Costura", tipo: "Shopee", emoji: "✂️", desc: "Agulhas, linhas, alfinetes, tesouras, réguas e ferramentas essenciais." },
    ],
  },
  {
    id: "digitais",
    titulo: "Produtos Digitais",
    emoji: "💻",
    icon: Tablet,
    desc: "E-books, moldes digitais e conteúdos exclusivos para baixar",
    cor: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
    corTitulo: "text-amber-700 dark:text-amber-300",
    produtos: [
      { nome: "E-book Tabela de Medidas", tipo: "Digital", emoji: "📏", desc: "Tabela completa de medidas femininas, masculinas e infantis." },
      { nome: "Moldes Base Digitais", tipo: "Digital", emoji: "📐", desc: "Moldes base em PDF para imprimir e usar nos seus projetos." },
      { nome: "Planner da Costureira", tipo: "Digital", emoji: "🗓️", desc: "Organize pedidos, clientes e finanças com esse planner especial." },
      { nome: "Guia de Tecidos", tipo: "Digital", emoji: "📖", desc: "Guia completo de tipos de tecidos, usos e cuidados para consulta rápida." },
    ],
  },
];

const badgeColors: Record<string, string> = {
  "Físico": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "Shopee": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "Digital": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

export default function Loja() {
  return (
    <AppLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-primary p-10 md:p-16 text-center w-full max-w-2xl mx-auto"
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--accent)) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--accent)) 0%, transparent 40%)" }}
          />
          <div className="relative z-10">
            <div className="text-6xl mb-6">🛍️</div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-3">
              Loja das Musas
            </h1>
            <p className="font-display text-xl md:text-2xl text-accent mb-4">
              Universo da Costura com a Sol
            </p>
            <p className="text-primary-foreground/70 max-w-lg mx-auto mb-10 text-sm md:text-base leading-relaxed">
              Seu cantinho especial de produtos de autocuidado, aviamentos, retalhos, entretelas e muito mais — tudo com curadoria da Sol para facilitar sua vida de costureira!
            </p>
            <a href={LOJA_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl px-10 py-7 text-base font-semibold shadow-lg"
              >
                <ShoppingBag size={20} className="mr-2" />
                Acessar Loja das Musas da Costura
                <ExternalLink size={16} className="ml-2" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
