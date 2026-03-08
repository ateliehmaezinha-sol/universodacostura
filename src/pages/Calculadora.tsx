import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const pecas: Record<string, number> = {
  vestido: 1.4, saia: 0.8, blusa: 0.7, calca: 1.0,
  blazer: 1.6, alfaiataria: 2.0, ajustes: 0.4,
};

const complexidades: Record<string, number> = {
  simples: 1.0, medio: 1.5, avancado: 2.2,
};

const regioes: Record<string, number> = {
  sudeste: 1.3, sul: 1.2, nordeste: 0.9, norte: 0.85, "centro-oeste": 1.0,
};

export default function Calculadora() {
  const [peca, setPeca] = useState("");
  const [tecido, setTecido] = useState("");
  const [complexidade, setComplexidade] = useState("");
  const [horas, setHoras] = useState("");
  const [regiao, setRegiao] = useState("");
  const [resultado, setResultado] = useState<null | { min: number; med: number; premium: number }>(null);

  const calcular = () => {
    const base = 50;
    const factorPeca = pecas[peca] || 1;
    const factorComplex = complexidades[complexidade] || 1;
    const factorRegiao = regioes[regiao] || 1;
    const h = parseFloat(horas) || 2;

    const preco = base * factorPeca * factorComplex * factorRegiao * (h * 0.5);
    setResultado({
      min: Math.round(preco * 0.8),
      med: Math.round(preco),
      premium: Math.round(preco * 1.4),
    });
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">🧮 Calculadora de Preço</h1>
        <p className="text-muted-foreground mb-8">Calcule o valor ideal dos seus serviços de costura</p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4 bg-card border border-border rounded-2xl p-6">
            <div className="space-y-2">
              <Label>Tipo de Peça</Label>
              <Select value={peca} onValueChange={setPeca}>
                <SelectTrigger><SelectValue placeholder="Selecione a peça" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(pecas).map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Tecido</Label>
              <Input placeholder="Ex: Crepe, Seda, Algodão..." value={tecido} onChange={(e) => setTecido(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Complexidade</Label>
              <Select value={complexidade} onValueChange={setComplexidade}>
                <SelectTrigger><SelectValue placeholder="Nível de complexidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples">Simples</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tempo Estimado (horas)</Label>
              <Input type="number" placeholder="Ex: 4" value={horas} onChange={(e) => setHoras(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Região do Brasil</Label>
              <Select value={regiao} onValueChange={setRegiao}>
                <SelectTrigger><SelectValue placeholder="Selecione a região" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sudeste">Sudeste</SelectItem>
                  <SelectItem value="sul">Sul</SelectItem>
                  <SelectItem value="nordeste">Nordeste</SelectItem>
                  <SelectItem value="norte">Norte</SelectItem>
                  <SelectItem value="centro-oeste">Centro-Oeste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={calcular} className="w-full h-12 bg-accent text-accent-foreground hover:bg-gold-dark font-semibold rounded-xl text-base">
              Calcular Preço
            </Button>
          </div>

          {resultado && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="font-display text-xl font-semibold">Resultado</h3>
              {[
                { label: "Preço Mínimo", value: resultado.min, color: "bg-secondary", desc: "Para clientes regulares" },
                { label: "Preço Médio", value: resultado.med, color: "bg-accent/10", desc: "Valor recomendado" },
                { label: "Preço Premium", value: resultado.premium, color: "bg-primary text-primary-foreground", desc: "Para peças especiais" },
              ].map((r) => (
                <div key={r.label} className={`${r.color} rounded-2xl p-6 border border-border`}>
                  <p className="text-sm font-medium opacity-70">{r.label}</p>
                  <p className="text-3xl font-display font-bold mt-1">
                    R$ {r.value.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs opacity-50 mt-1">{r.desc}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
