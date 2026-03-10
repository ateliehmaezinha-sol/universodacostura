import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Calculadora from "./pages/Calculadora";
import Identificador from "./pages/Identificador";
import Criador from "./pages/Criador";
import Tecidos from "./pages/Tecidos";
import Ideias from "./pages/Ideias";
import Clientes from "./pages/Clientes";
import Financeiro from "./pages/Financeiro";
import Cursos from "./pages/Cursos";
import Assistente from "./pages/Assistente";
import Loja from "./pages/Loja";
import NotFound from "./pages/NotFound";
import QuizFunil from "./pages/QuizFunil";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calculadora" element={<Calculadora />} />
          <Route path="/identificador" element={<Identificador />} />
          <Route path="/criador" element={<Criador />} />
          <Route path="/tecidos" element={<Tecidos />} />
          <Route path="/ideias" element={<Ideias />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/assistente" element={<Assistente />} />
          <Route path="/loja" element={<Loja />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
