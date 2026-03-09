import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, DollarSign, Wallet, Trash2, Edit2, Calculator, X, Scissors, Search, Filter } from "lucide-react";

interface Aviamentos {
  linha: number;
  botoes: number;
  ziperes: number;
  elastico: number;
  entretela: number;
  bojo: number;
  outros: number;
}

interface Servico {
  id: string;
  cliente: string;
  tipo: string;
  modalidade: "mao_de_obra" | "material_proprio";
  valorCobrado: number;
  custoTecido: number;
  aviamentos: Aviamentos;
  data: string;
}

const initialAviamentos = {
  linha: "", botoes: "", ziperes: "", elastico: "", entretela: "", bojo: "", outros: ""
};

const initialForm = {
  cliente: "", tipo: "", valorCobrado: "", custoTecido: "", data: new Date().toISOString().split('T')[0]
};

export default function Financeiro() {
  const [servicos, setServicos] = useState<Servico[]>(() => {
    const s = localStorage.getItem("atelie_servicos_v2");
    if (s) return JSON.parse(s);
    // Migração de dados antigos para o novo formato
    const old = localStorage.getItem("atelie_servicos");
    if (old) {
      const parsed = JSON.parse(old);
      return parsed.map((o: any) => ({
        id: o.id,
        cliente: o.cliente,
        tipo: o.tipo,
        modalidade: o.custo > 0 ? "material_proprio" : "mao_de_obra",
        valorCobrado: o.valor,
        custoTecido: o.custo || 0,
        aviamentos: { linha: 0, botoes: 0, ziperes: 0, elastico: 0, entretela: 0, bojo: 0, outros: 0 },
        data: o.data
      }));
    }
    return [];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroMes, setFiltroMes] = useState("todos");

  const [modalidade, setModalidade] = useState<"mao_de_obra" | "material_proprio">("mao_de_obra");
  const [form, setForm] = useState(initialForm);
  const [aviamentos, setAviamentos] = useState<Record<string, string>>(initialAviamentos);

  useEffect(() => {
    localStorage.setItem("atelie_servicos_v2", JSON.stringify(servicos));
  }, [servicos]);

  const handleEdit = (s: Servico) => {
    setEditingId(s.id);
    setModalidade(s.modalidade);
    setForm({
      cliente: s.cliente,
      tipo: s.tipo,
      valorCobrado: s.valorCobrado.toString(),
      custoTecido: s.custoTecido.toString(),
      data: s.data || initialForm.data
    });
    setAviamentos({
      linha: s.aviamentos?.linha ? s.aviamentos.linha.toString() : "",
      botoes: s.aviamentos?.botoes ? s.aviamentos.botoes.toString() : "",
      ziperes: s.aviamentos?.ziperes ? s.aviamentos.ziperes.toString() : "",
      elastico: s.aviamentos?.elastico ? s.aviamentos.elastico.toString() : "",
      entretela: s.aviamentos?.entretela ? s.aviamentos.entretela.toString() : "",
      bojo: s.aviamentos?.bojo ? s.aviamentos.bojo.toString() : "",
      outros: s.aviamentos?.outros ? s.aviamentos.outros.toString() : "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço/cliente?")) {
      setServicos(servicos.filter(s => s.id !== id));
    }
  };

  const parseNumber = (val: string | number) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const num = parseFloat(val.toString().replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const getCustoTotal = () => {
    if (modalidade === "mao_de_obra") return 0;
    
    const custoTecido = parseNumber(form.custoTecido);
    const custoAv = Object.values(aviamentos).reduce((acc, val) => acc + parseNumber(val), 0);
    return custoTecido + custoAv;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAviamentos: Aviamentos = {
      linha: parseNumber(aviamentos.linha),
      botoes: parseNumber(aviamentos.botoes),
      ziperes: parseNumber(aviamentos.ziperes),
      elastico: parseNumber(aviamentos.elastico),
      entretela: parseNumber(aviamentos.entretela),
      bojo: parseNumber(aviamentos.bojo),
      outros: parseNumber(aviamentos.outros),
    };

    const newServico: Servico = {
      id: editingId || Date.now().toString(),
      cliente: form.cliente,
      tipo: form.tipo,
      modalidade,
      valorCobrado: parseNumber(form.valorCobrado),
      custoTecido: modalidade === "material_proprio" ? parseNumber(form.custoTecido) : 0,
      aviamentos: modalidade === "material_proprio" ? parsedAviamentos : {
        linha: 0, botoes: 0, ziperes: 0, elastico: 0, entretela: 0, bojo: 0, outros: 0
      },
      data: form.data,
    };

    if (editingId) {
      setServicos(servicos.map(s => s.id === editingId ? newServico : s));
    } else {
      setServicos([newServico, ...servicos]);
    }

    cancelForm();
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
    setAviamentos(initialAviamentos);
    setModalidade("mao_de_obra");
  };

  const calcTotalGeral = () => {
    return servicos.reduce((acc, s) => {
      const custoAv = Object.values(s.aviamentos || {}).reduce((a, b) => a + (b || 0), 0);
      const custo = s.custoTecido + custoAv;
      return {
        faturamento: acc.faturamento + s.valorCobrado,
        custos: acc.custos + custo,
      };
    }, { faturamento: 0, custos: 0 });
  };

  const { faturamento, custos } = calcTotalGeral();
  const lucro = faturamento - custos;

  const mesesDisponiveis = useMemo(() => {
    const set = new Set<string>();
    servicos.forEach(s => {
      if (s.data) {
        const [ano, mes] = s.data.split('-');
        set.add(`${ano}-${mes}`);
      }
    });
    return Array.from(set).sort().reverse();
  }, [servicos]);

  const servicosFiltrados = useMemo(() => {
    return servicos.filter(s => {
      const matchNome = filtroNome.trim() === "" || s.cliente.toLowerCase().includes(filtroNome.toLowerCase());
      const matchMes = filtroMes === "todos" || (s.data && s.data.startsWith(filtroMes));
      return matchNome && matchMes;
    });
  }, [servicos, filtroNome, filtroMes]);

  const stats = [
    { label: "Faturamento", value: faturamento, icon: DollarSign, color: "bg-accent/10 text-accent" },
    { label: "Custos Totais", value: custos, icon: Wallet, color: "bg-destructive/10 text-destructive" },
    { label: "Lucro Líquido", value: lucro, icon: TrendingUp, color: "bg-primary text-primary-foreground" },
  ];

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">💰 Controle Financeiro</h1>
            <p className="text-muted-foreground">Gerencie as finanças, custos e lucros do seu ateliê</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl w-full md:w-auto">
              <Plus size={18} className="mr-2" /> Novo Serviço
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className={`${s.color} rounded-2xl p-6 border border-border shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={18} />
                <span className="text-sm font-medium">{s.label}</span>
              </div>
              <p className="text-3xl font-display font-bold">{formatCurrency(s.value)}</p>
            </div>
          ))}
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
            <Card className="border-accent/20 shadow-md">
              <CardHeader className="bg-muted/30 border-b border-border pb-4 mb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {editingId ? <Edit2 size={20} className="text-accent" /> : <Calculator size={20} className="text-accent" />}
                    {editingId ? "Corrigir e Refazer Serviço" : "Calcular e Adicionar Serviço"}
                  </CardTitle>
                  <CardDescription>Preencha os detalhes para calcular seu lucro real sem prejuízos</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={cancelForm}>
                  <X size={20} />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Cliente</Label>
                      <Input placeholder="Ex: Maria Silva" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Peça / Serviço</Label>
                      <Input placeholder="Ex: Vestido de Festa" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Entrega / Registro</Label>
                      <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <Label className="text-base">Modalidade de Trabalho</Label>
                    <Tabs value={modalidade} onValueChange={(v: any) => setModalidade(v)} className="w-full">
                      <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 h-auto">
                        <TabsTrigger value="mao_de_obra" className="py-3">Tecido do Cliente (Apenas Mão de Obra)</TabsTrigger>
                        <TabsTrigger value="material_proprio" className="py-3">Tecido Próprio + Aviamentos</TabsTrigger>
                      </TabsList>

                      <div className="mt-6 p-4 rounded-xl bg-muted/20 border border-border">
                        <TabsContent value="mao_de_obra" className="mt-0">
                          <p className="text-sm text-muted-foreground mb-4">
                            Nesta modalidade, o cliente fornece o tecido e você cobra apenas pelo seu trabalho e experiência.
                          </p>
                          <div className="space-y-2 max-w-sm">
                            <Label className="text-accent font-semibold text-base">Valor Cobrado da Cliente (R$)</Label>
                            <Input type="number" step="0.01" min="0" placeholder="Ex: 150.00" value={form.valorCobrado} onChange={(e) => setForm({ ...form, valorCobrado: e.target.value })} required />
                          </div>
                        </TabsContent>

                        <TabsContent value="material_proprio" className="mt-0 space-y-6">
                          <p className="text-sm text-muted-foreground">
                            Informe todos os custos de materiais (tecido e aviamentos). O sistema vai somar tudo para que você possa colocar o valor final sem tomar prejuízo.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 p-5 border border-border rounded-xl bg-card shadow-sm">
                              <h4 className="font-medium flex items-center gap-2 text-primary">
                                <Scissors size={18} /> 
                                Custos de Material e Aviamentos
                              </h4>
                              
                              <div className="space-y-2">
                                <Label>Custo do Tecido Principal (R$)</Label>
                                <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.custoTecido} onChange={(e) => setForm({ ...form, custoTecido: e.target.value })} />
                              </div>

                              <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                  <Label>Linhas (R$)</Label>
                                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={aviamentos.linha} onChange={(e) => setAviamentos({ ...aviamentos, linha: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Botões (R$)</Label>
                                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={aviamentos.botoes} onChange={(e) => setAviamentos({ ...aviamentos, botoes: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Zíperes (R$)</Label>
                                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={aviamentos.ziperes} onChange={(e) => setAviamentos({ ...aviamentos, ziperes: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Elástico (R$)</Label>
                                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={aviamentos.elastico} onChange={(e) => setAviamentos({ ...aviamentos, elastico: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Entretelas (R$)</Label>
                                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={aviamentos.entretela} onChange={(e) => setAviamentos({ ...aviamentos, entretela: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Bojos (R$)</Label>
                                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={aviamentos.bojo} onChange={(e) => setAviamentos({ ...aviamentos, bojo: e.target.value })} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label>Outros Materiais (R$)</Label>
                                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={aviamentos.outros} onChange={(e) => setAviamentos({ ...aviamentos, outros: e.target.value })} />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="p-5 border border-primary/20 rounded-xl bg-primary/5 space-y-5 shadow-sm">
                                <div className="space-y-2">
                                  <Label className="text-primary font-semibold text-base">Valor Total a Cobrar da Cliente (R$)</Label>
                                  <p className="text-xs text-muted-foreground">Defina seu preço já considerando os gastos ao lado.</p>
                                  <Input type="number" step="0.01" min="0" placeholder="Ex: 350.00" value={form.valorCobrado} onChange={(e) => setForm({ ...form, valorCobrado: e.target.value })} required className="border-primary/30 h-12 text-lg" />
                                </div>
                                
                                <div className="pt-4 border-t border-primary/20">
                                  <h4 className="font-medium text-sm mb-3 text-primary">Resumo do Lucro</h4>
                                  <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Valor Cobrado:</span>
                                    <span className="font-medium">{formatCurrency(parseNumber(form.valorCobrado))}</span>
                                  </div>
                                  <div className="flex justify-between text-sm mb-2">
                                    <span className="text-destructive">- Custos de Materiais:</span>
                                    <span className="text-destructive font-medium">{formatCurrency(getCustoTotal())}</span>
                                  </div>
                                  <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-primary/20">
                                    <span className="text-primary">Lucro Real:</span>
                                    <span className={parseNumber(form.valorCobrado) - getCustoTotal() < 0 ? "text-destructive" : "text-primary"}>
                                      {formatCurrency(parseNumber(form.valorCobrado) - getCustoTotal())}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={cancelForm} className="w-full sm:w-auto">Cancelar</Button>
                    <Button type="submit" className="bg-accent text-accent-foreground hover:bg-gold-dark w-full sm:w-auto min-w-[200px]">
                      {editingId ? "Salvar Correção" : "Salvar Serviço"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {servicos.length > 0 ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-4 font-semibold whitespace-nowrap">Cliente</th>
                    <th className="text-left p-4 font-semibold whitespace-nowrap">Peça/Serviço</th>
                    <th className="text-center p-4 font-semibold whitespace-nowrap">Modalidade</th>
                    <th className="text-right p-4 font-semibold whitespace-nowrap">Cobrado</th>
                    <th className="text-right p-4 font-semibold whitespace-nowrap">Custos</th>
                    <th className="text-right p-4 font-semibold whitespace-nowrap">Lucro</th>
                    <th className="text-center p-4 font-semibold whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {servicos.map((s) => {
                    const custoAv = Object.values(s.aviamentos || {}).reduce((a, b) => a + (b || 0), 0);
                    const custoTotal = (s.custoTecido || 0) + custoAv;
                    const lucro = s.valorCobrado - custoTotal;

                    return (
                      <tr key={s.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-medium">{s.cliente}</td>
                        <td className="p-4 text-muted-foreground">{s.tipo}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${s.modalidade === "mao_de_obra" ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"}`}>
                            {s.modalidade === "mao_de_obra" ? "Mão de Obra" : "C/ Material"}
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap font-medium">{formatCurrency(s.valorCobrado)}</td>
                        <td className="p-4 text-right whitespace-nowrap text-destructive">{s.modalidade === 'mao_de_obra' ? '-' : formatCurrency(custoTotal)}</td>
                        <td className="p-4 text-right whitespace-nowrap font-bold text-primary">{formatCurrency(lucro)}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(s)} className="h-8 w-8 text-muted-foreground hover:text-accent" title="Corrigir e Refazer">
                              <Edit2 size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Excluir Cliente">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !showForm && (
            <div className="text-center p-12 border border-dashed border-border rounded-2xl bg-card/50">
              <Calculator size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum serviço registrado</h3>
              <p className="text-muted-foreground mb-6">Comece adicionando seus serviços para acompanhar seu lucro real sem prejuízos.</p>
              <Button onClick={() => setShowForm(true)} className="bg-accent text-accent-foreground hover:bg-gold-dark">
                <Plus size={18} className="mr-2" /> Adicionar Primeiro Serviço
              </Button>
            </div>
          )
        )}
      </motion.div>
    </AppLayout>
  );
}
