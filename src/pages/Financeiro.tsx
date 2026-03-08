import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, TrendingUp, DollarSign, Wallet } from "lucide-react";

interface Servico {
  id: string;
  cliente: string;
  tipo: string;
  valor: number;
  custo: number;
  data: string;
}

export default function Financeiro() {
  const [servicos, setServicos] = useState<Servico[]>(() => {
    const s = localStorage.getItem("atelie_servicos");
    return s ? JSON.parse(s) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cliente: "", tipo: "", valor: "", custo: "", data: "" });

  const salvar = (list: Servico[]) => {
    setServicos(list);
    localStorage.setItem("atelie_servicos", JSON.stringify(list));
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    salvar([...servicos, {
      id: Date.now().toString(),
      cliente: form.cliente,
      tipo: form.tipo,
      valor: parseFloat(form.valor) || 0,
      custo: parseFloat(form.custo) || 0,
      data: form.data,
    }]);
    setForm({ cliente: "", tipo: "", valor: "", custo: "", data: "" });
    setShowForm(false);
  };

  const faturamento = servicos.reduce((a, s) => a + s.valor, 0);
  const custos = servicos.reduce((a, s) => a + s.custo, 0);
  const lucro = faturamento - custos;

  const stats = [
    { label: "Faturamento", value: faturamento, icon: DollarSign, color: "bg-accent/10 text-accent" },
    { label: "Custos", value: custos, icon: Wallet, color: "bg-secondary" },
    { label: "Lucro", value: lucro, icon: TrendingUp, color: "bg-primary text-primary-foreground" },
  ];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">💰 Controle Financeiro</h1>
            <p className="text-muted-foreground">Gerencie as finanças do seu ateliê</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl">
            <Plus size={18} className="mr-2" /> Novo Serviço
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className={`${s.color} rounded-2xl p-6 border border-border`}>
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={18} />
                <span className="text-sm font-medium">{s.label}</span>
              </div>
              <p className="text-3xl font-display font-bold">R$ {s.value.toLocaleString("pt-BR")}</p>
            </div>
          ))}
        </div>

        {showForm && (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={add} className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cliente</Label><Input placeholder="Nome" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Tipo de Roupa</Label><Input placeholder="Ex: Vestido" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Valor Cobrado (R$)</Label><Input type="number" placeholder="0" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Custo do Tecido (R$)</Label><Input type="number" placeholder="0" value={form.custo} onChange={(e) => setForm({ ...form, custo: e.target.value })} /></div>
              <div className="space-y-2"><Label>Data</Label><Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} /></div>
            </div>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl">Salvar</Button>
          </motion.form>
        )}

        {servicos.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-4 font-semibold">Cliente</th>
                  <th className="text-left p-4 font-semibold">Tipo</th>
                  <th className="text-right p-4 font-semibold">Valor</th>
                  <th className="text-right p-4 font-semibold">Custo</th>
                  <th className="text-right p-4 font-semibold">Lucro</th>
                </tr>
              </thead>
              <tbody>
                {servicos.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="p-4">{s.cliente}</td>
                    <td className="p-4">{s.tipo}</td>
                    <td className="p-4 text-right">R$ {s.valor.toLocaleString("pt-BR")}</td>
                    <td className="p-4 text-right">R$ {s.custo.toLocaleString("pt-BR")}</td>
                    <td className="p-4 text-right font-semibold">R$ {(s.valor - s.custo).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
