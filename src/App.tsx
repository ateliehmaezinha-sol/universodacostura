import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import OAuthConsent from "./pages/OAuthConsent";
import WhatsAppButton from "@/components/WhatsAppButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/quiz" element={<QuizFunil />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/calculadora" element={<ProtectedRoute><Calculadora /></ProtectedRoute>} />
            <Route path="/identificador" element={<ProtectedRoute><Identificador /></ProtectedRoute>} />
            <Route path="/criador" element={<ProtectedRoute><Criador /></ProtectedRoute>} />
            <Route path="/tecidos" element={<ProtectedRoute><Tecidos /></ProtectedRoute>} />
            <Route path="/ideias" element={<ProtectedRoute><Ideias /></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
            <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
            <Route path="/cursos" element={<ProtectedRoute><Cursos /></ProtectedRoute>} />
            <Route path="/assistente" element={<ProtectedRoute><Assistente /></ProtectedRoute>} />
            <Route path="/loja" element={<ProtectedRoute><Loja /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppButton />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
