import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const estados = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", cidade: "", estado: "", profissao: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Same-origin relative path to return to after auth (used by OAuth consent flow).
  const rawNext = params.get("next") ?? "";
  const nextPath = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";
  const postAuthTarget = nextPath || "/dashboard";
  const emailRedirectTo = `${window.location.origin}${postAuthTarget}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-4xl animate-pulse">✨</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={postAuthTarget} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.senha,
          options: {
            data: {
              nome: form.nome,
              cidade: form.cidade,
              estado: form.estado,
              profissao: form.profissao,
            },
            emailRedirectTo,
          },
        });

        if (error) {
          toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
          return;
        }

        toast({ title: "Conta criada!", description: "Verifique seu email para confirmar o cadastro." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.senha,
        });

        if (error) {
          toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
          return;
        }

        navigate(postAuthTarget);
      }
    } catch {
      toast({ title: "Erro", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-6xl mb-4"
          >
            ✨
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-primary-foreground">Atelieh Mãezinha</h1>
          <p className="text-primary-foreground/50 text-sm mt-1">Curso de Costura Estrelas de Sucesso Express</p>
          <p className="text-primary-foreground/40 text-xs mt-1">Universo da Costura com a Sol</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-background rounded-3xl p-8 shadow-2xl space-y-4">
          <h2 className="font-display text-xl font-semibold text-center mb-2">
            {isRegister ? "Criar Conta" : "Entrar"}
          </h2>

          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" placeholder="Seu nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <div className="relative">
              <Input id="senha" type={showPassword ? "text" : "password"} placeholder="Sua senha" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required minLength={6} className="pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" placeholder="Sua cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>
                      {estados.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profissao">Profissão</Label>
                <Input id="profissao" placeholder="Ex: Costureira, Estilista..." value={form.profissao} onChange={(e) => setForm({ ...form, profissao: e.target.value })} />
              </div>
            </>
          )}

          <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold rounded-xl">
            {submitting ? "Aguarde..." : isRegister ? "Criar minha conta" : "Entrar"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? "Já tem conta?" : "Não tem conta?"}{" "}
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-accent font-semibold hover:underline">
              {isRegister ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
