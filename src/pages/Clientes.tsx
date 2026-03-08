import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, User, Trash2 } from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  busto: string;
  cintura: string;
  quadril: string;
  historico: string[];
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem("atelie_clientes");
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", cidade: "", busto: "", cintura: "", quadril: "" });

  const salvar = (list: Cliente[]) => {
    setClientes(list);
    localStorage.setItem("atelie_clientes", JSON.stringify(list));
  };

  const addCliente = (e: React.FormEvent) => {
    e.preventDefault();
    const novo: Cliente = { id: Date.now().toString(), ...form, historico: [] };
    salvar([...clientes, novo]);
    setForm({ nome: "", telefone: "", cidade: "", busto: "", cintura: "", quadril: "" });
    setShowForm(false);
  };

  const remover = (id: string) => salvar(clientes.filter((c) => c.id !== id));

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">👥 Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus clientes e medidas</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl">
            <Plus size={18} className="mr-2" /> Nova Cliente
          </Button>
        </div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={addCliente}
            className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Nome da cliente" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input placeholder="(00) 00000-0000" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input placeholder="Cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
              </div>
            </div>
            <h4 className="font-display font-semibold text-sm pt-2">Medidas Corporais (cm)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Busto</Label>
                <Input placeholder="cm" value={form.busto} onChange={(e) => setForm({ ...form, busto: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Cintura</Label>
                <Input placeholder="cm" value={form.cintura} onChange={(e) => setForm({ ...form, cintura: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Quadril</Label>
                <Input placeholder="cm" value={form.quadril} onChange={(e) => setForm({ ...form, quadril: e.target.value })} />
              </div>
            </div>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl">Salvar Cliente</Button>
          </motion.form>
        )}

        {clientes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <User size={48} className="mx-auto mb-4 opacity-30" />
            <p>Nenhuma cliente cadastrada ainda</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {clientes.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{c.nome}</h3>
                  <p className="text-sm text-muted-foreground">{c.telefone} • {c.cidade}</p>
                  {(c.busto || c.cintura || c.quadril) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Medidas: B{c.busto} / C{c.cintura} / Q{c.quadril}
                    </p>
                  )}
                </div>
                <button onClick={() => remover(c.id)} className="text-destructive/50 hover:text-destructive transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
