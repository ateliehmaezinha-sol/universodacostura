import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Calculator, Camera, Palette, Lightbulb, Users,
  DollarSign, GraduationCap, MessageCircle, Menu, X, LogOut, Scissors, ShoppingBag
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Início", icon: Home },
  { path: "/calculadora", label: "Calculadora", icon: Calculator },
  { path: "/identificador", label: "Identificar Tecido", icon: Camera },
  { path: "/criador", label: "Criar Roupa", icon: Palette },
  { path: "/tecidos", label: "Tecidos", icon: Scissors },
  { path: "/ideias", label: "Ideias", icon: Lightbulb },
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/financeiro", label: "Financeiro", icon: DollarSign },
  { path: "/cursos", label: "Cursos", icon: GraduationCap },
  { path: "/assistente", label: "Assistente", icon: MessageCircle },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("atelie_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-primary px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="text-primary-foreground">
          <Menu size={24} />
        </button>
        <h1 className="font-display text-lg text-primary-foreground">Atelieh Mãezinha</h1>
        <div className="w-6" />
      </header>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-primary/60"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-primary p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-xl text-primary-foreground">✨ Atelieh Mãezinha</span>
                <button onClick={() => setSidebarOpen(false)} className="text-primary-foreground/70">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-accent/20 text-accent"
                          : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-accent/10"
                      }`}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-primary-foreground/50 hover:text-primary-foreground text-sm">
                <LogOut size={18} /> Sair
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-primary flex-col p-6 z-40">
        <div className="mb-10">
          <h1 className="font-display text-2xl text-primary-foreground">✨ Atelieh</h1>
          <p className="font-display text-lg text-accent">Mãezinha</p>
          <p className="text-xs text-primary-foreground/40 mt-1">Estrelas de Sucesso Express</p>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-accent/20 text-accent"
                    : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-accent/10"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-primary-foreground/40 hover:text-primary-foreground/80 text-sm transition-colors">
          <LogOut size={18} /> Sair
        </button>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
