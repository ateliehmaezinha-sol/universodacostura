import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calculator, Camera, Palette, BookOpen, Lightbulb,
  Users, DollarSign, GraduationCap
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import YoutubeCard from "@/components/YoutubeCard";

const features = [
  { path: "/calculadora", label: "Calculadora de Preço", desc: "Calcule o valor ideal dos seus serviços", icon: Calculator, emoji: "🧮" },
  { path: "/identificador", label: "Identificar Tecido", desc: "Descubra o tecido pela foto", icon: Camera, emoji: "📸" },
  { path: "/criador", label: "Criar Roupa", desc: "Gere ideias com foto do tecido", icon: Palette, emoji: "🎨" },
  { path: "/tecidos", label: "Biblioteca de Tecidos", desc: "Consulte nossa base de tecidos", icon: BookOpen, emoji: "📚" },
  { path: "/ideias", label: "Ideias de Modelos", desc: "Inspire-se com modelos incríveis", icon: Lightbulb, emoji: "💡" },
  { path: "/clientes", label: "Cadastro de Clientes", desc: "Organize seus clientes e medidas", icon: Users, emoji: "👥" },
  { path: "/financeiro", label: "Controle Financeiro", desc: "Gerencie as finanças do atelieh", icon: DollarSign, emoji: "💰" },
  { path: "/cursos", label: "Cursos da Sol", desc: "Aprenda com a Sol", icon: GraduationCap, emoji: "🎓" },
];

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("atelie_user") || '{"nome":"Costureira"}');

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            Olá, <span className="gold-gradient-text">{user.nome?.split(" ")[0] || "Costureira"}</span> ✨
          </h1>
          <p className="text-muted-foreground mt-2">O que vamos criar hoje?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.path}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={f.path}
                className="block bg-card border border-border rounded-2xl p-6 card-hover group"
              >
                <div className="text-4xl mb-4">{f.emoji}</div>
                <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-accent transition-colors">
                  {f.label}
                </h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <YoutubeCard />
        </div>
      </motion.div>
    </AppLayout>
  );
}
