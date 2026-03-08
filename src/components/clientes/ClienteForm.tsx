import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cliente,
  MedidasSobMedida,
  medidasVazias,
  labelsMedidas,
  tamanhosIndustriais,
  medidasIndustriais,
} from "./types";

interface Props {
  onSave: (cliente: Cliente) => void;
  onCancel: () => void;
}

export default function ClienteForm({ onSave, onCancel }: Props) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [tipoMedida, setTipoMedida] = useState<"sob_medida" | "industrial">("sob_medida");
  const [tamanhoIndustrial, setTamanhoIndustrial] = useState("40");
  const [medidas, setMedidas] = useState<MedidasSobMedida>({ ...medidasVazias });

  const updateMedida = (key: keyof MedidasSobMedida, value: string) => {
    setMedidas((prev) => ({ ...prev, [key]: value }));
  };

  const handleTamanhoChange = (tam: string) => {
    setTamanhoIndustrial(tam);
    if (medidasIndustriais[tam]) {
      setMedidas({ ...medidasIndustriais[tam] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cliente: Cliente = {
      id: Date.now().toString(),
      nome,
      telefone,
      cidade,
      tipoMedida,
      tamanhoIndustrial: tipoMedida === "industrial" ? tamanhoIndustrial : "",
      medidas,
      historico: [],
    };
    onSave(cliente);
  };

  const medidasPrincipais: (keyof MedidasSobMedida)[] = [
    "busto", "cintura", "quadril", "comprimentoTotal",
  ];

  const medidasTronco: (keyof MedidasSobMedida)[] = [
    "ombroAOmbro", "larguraCostas", "comprimentoFrente", "comprimentoCostas",
    "alturaBusto", "distanciaBustos",
  ];

  const medidasBracos: (keyof MedidasSobMedida)[] = [
    "circunferenciaBraco", "comprimentoBraco", "circunferenciaPunho",
  ];

  const medidasInferiores: (keyof MedidasSobMedida)[] = [
    "comprimentoSaia", "comprimentoCalca", "circunferenciaCoxa",
  ];

  const renderMedidasGroup = (title: string, keys: (keyof MedidasSobMedida)[]) => (
    <div className="space-y-3">
      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h5>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {keys.map((key) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs">{labelsMedidas[key]}</Label>
            <Input
              placeholder="cm"
              type="number"
              step="0.5"
              value={medidas[key]}
              onChange={(e) => updateMedida(key, e.target.value)}
              className="h-9 rounded-lg text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-5"
    >
      {/* Dados pessoais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input placeholder="Nome da cliente" value={nome} onChange={(e) => setNome(e.target.value)} required className="rounded-lg" />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="rounded-lg" />
        </div>
        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} className="rounded-lg" />
        </div>
      </div>

      {/* Tipo de medida */}
      <Tabs value={tipoMedida} onValueChange={(v) => setTipoMedida(v as "sob_medida" | "industrial")} className="w-full">
        <TabsList className="w-full grid grid-cols-2 rounded-xl">
          <TabsTrigger value="sob_medida" className="rounded-lg">✂️ Sob Medida</TabsTrigger>
          <TabsTrigger value="industrial" className="rounded-lg">📏 Tamanho Padrão (34-52)</TabsTrigger>
        </TabsList>

        <TabsContent value="industrial" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Tamanho Industrial</Label>
            <Select value={tamanhoIndustrial} onValueChange={handleTamanhoChange}>
              <SelectTrigger className="w-full rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tamanhosIndustriais.map((tam) => (
                  <SelectItem key={tam} value={tam}>Tamanho {tam}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Medidas padrão do tamanho {tamanhoIndustrial}:</p>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              {Object.entries(medidas).map(([key, val]) =>
                val ? (
                  <span key={key} className="bg-background rounded-lg px-2 py-1 text-center">
                    <span className="text-muted-foreground">{labelsMedidas[key as keyof MedidasSobMedida]}:</span>{" "}
                    <span className="font-semibold text-foreground">{val}</span>
                  </span>
                ) : null
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sob_medida" className="mt-4 space-y-5">
          {renderMedidasGroup("📐 Medidas Principais", medidasPrincipais)}
          {renderMedidasGroup("👕 Tronco", medidasTronco)}
          {renderMedidasGroup("💪 Braços", medidasBracos)}
          {renderMedidasGroup("👗 Parte Inferior", medidasInferiores)}
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl">
          Salvar Cliente
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
          Cancelar
        </Button>
      </div>
    </motion.form>
  );
}
