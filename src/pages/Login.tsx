import { useState } from "react";
import qrcodeImg from "@/assets/qrcode.png";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const estados = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", cidade: "", estado: "", profissao: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      localStorage.setItem("atelie_user", JSON.stringify(form));
    } else {
      localStorage.setItem("atelie_user", JSON.stringify({ nome: form.nome || "Costureira", email: form.email }));
    }
    navigate("/dashboard");
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

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold rounded-xl">
            {isRegister ? "Criar minha conta" : "Entrar"}
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
