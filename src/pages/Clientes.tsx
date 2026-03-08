import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { Cliente } from "@/components/clientes/types";
import ClienteForm from "@/components/clientes/ClienteForm";
import ClienteCard from "@/components/clientes/ClienteCard";

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    try {
      const saved = localStorage.getItem("atelie_clientes_v2");
      if (saved) return JSON.parse(saved);
      // Migrar dados antigos se existirem
      const old = localStorage.getItem("atelie_clientes");
      if (old) {
        const oldClientes = JSON.parse(old);
        const migrated = oldClientes.map((c: any) => ({
          ...c,
          tipoMedida: "sob_medida",
          tamanhoIndustrial: "",
          medidas: {
            busto: c.busto || "",
            cintura: c.cintura || "",
            quadril: c.quadril || "",
            ombroAOmbro: "",
            comprimentoFrente: "",
            comprimentoCostas: "",
            larguraCostas: "",
            alturaBusto: "",
            distanciaBustos: "",
            circunferenciaBraco: "",
            comprimentoBraco: "",
            circunferenciaPunho: "",
            comprimentoSaia: "",
            comprimentoCalca: "",
            circunferenciaCoxa: "",
            comprimentoTotal: "",
          },
          historico: c.historico || [],
        }));
        localStorage.setItem("atelie_clientes_v2", JSON.stringify(migrated));
        return migrated;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [showForm, setShowForm] = useState(false);

  const salvar = (list: Cliente[]) => {
    setClientes(list);
    localStorage.setItem("atelie_clientes_v2", JSON.stringify(list));
  };

  const addCliente = (cliente: Cliente) => {
    salvar([...clientes, cliente]);
    setShowForm(false);
  };

  const remover = (id: string) => salvar(clientes.filter((c) => c.id !== id));

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">👥 Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus clientes e medidas completas</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl"
          >
            <Plus size={18} className="mr-2" /> Nova Cliente
          </Button>
        </div>

        {showForm && (
          <ClienteForm onSave={addCliente} onCancel={() => setShowForm(false)} />
        )}

        {clientes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <User size={48} className="mx-auto mb-4 opacity-30" />
            <p>Nenhuma cliente cadastrada ainda</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {clientes.map((c) => (
              <ClienteCard key={c.id} cliente={c} onRemove={remover} />
            ))}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
