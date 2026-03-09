import { motion } from "framer-motion";
import { ExternalLink, ShoppingBag, Sparkles, Scissors, Heart, Tablet } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";

const LOJA_URL = "https://www.lojadasmusas.com/universodacosturadasol";

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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Banner principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 mb-10 text-center"
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--accent)) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--accent)) 0%, transparent 40%)" }}
          />
          <div className="relative z-10">
            <div className="text-5xl mb-4">🛍️</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
              Loja das Musas
            </h1>
            <p className="font-display text-xl text-accent mb-2">Universo da Costura com a Sol</p>
            <p className="text-primary-foreground/70 max-w-xl mx-auto mb-8 text-sm md:text-base">
              Seu cantinho especial de produtos de autocuidado, aviamentos, retalhos, entretelas e muito mais — tudo com curadoria da Sol para facilitar sua vida de costureira!
            </p>
            <a href={LOJA_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl px-8 py-6 text-base font-semibold shadow-lg"
              >
                <ShoppingBag size={20} className="mr-2" />
                Acessar Loja das Musas da Costura
                <ExternalLink size={16} className="ml-2" />
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Categorias */}
        <div className="space-y-10">
          {categorias.map((cat, ci) => {
            const Icon = cat.icon;
            return (
              <motion.section
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ci * 0.15 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Icon size={20} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold">{cat.emoji} {cat.titulo}</h2>
                    <p className="text-sm text-muted-foreground">{cat.desc}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cat.produtos.map((prod, pi) => (
                    <motion.div
                      key={prod.nome}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: ci * 0.15 + pi * 0.07 }}
                    >
                      <a
                        href={LOJA_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col h-full rounded-2xl border p-5 card-hover transition-all group ${cat.cor}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-3xl">{prod.emoji}</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColors[prod.tipo]}`}>
                            {prod.tipo}
                          </span>
                        </div>
                        <h3 className={`font-display font-semibold text-sm mb-2 group-hover:underline ${cat.corTitulo}`}>
                          {prod.nome}
                        </h3>
                        <p className="text-xs text-muted-foreground flex-1 mb-3">{prod.desc}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ExternalLink size={11} />
                          <span>Ver na Loja das Musas</span>
                        </div>
                      </a>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 rounded-2xl bg-card border border-border p-8 text-center"
        >
          <Sparkles className="mx-auto mb-3 text-accent" size={32} />
          <h3 className="font-display text-2xl font-bold mb-2">Encontre muito mais na loja!</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
            Acesse agora e descubra todos os produtos com curadoria especial da Sol para a costureira que quer se cuidar e produzir com qualidade.
          </p>
          <a href={LOJA_URL} target="_blank" rel="noopener noreferrer">
            <Button className="rounded-xl px-8" size="lg">
              <ShoppingBag size={18} className="mr-2" />
              Acessar Loja das Musas
              <ExternalLink size={14} className="ml-2" />
            </Button>
          </a>
        </motion.div>

      </motion.div>
    </AppLayout>
  );
}
