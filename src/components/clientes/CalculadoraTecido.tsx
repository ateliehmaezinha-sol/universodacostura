import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Cliente, labelsMedidas, MedidasSobMedida } from "./types";

const sugestoesPecas = [
  "Vestido longo evasê com saia fluida",
  "Vestido curto justo tubinho",
  "Blazer feminino de alfaiataria",
  "Saia midi evasê",
  "Calça pantalona",
  "Blusa ciganinha com manga bufante",
  "Conjunto saia e blusa evangélico",
  "Macacão longo",
];

interface Props {
  cliente: Cliente;
}

export default function CalculadoraTecido({ cliente }: Props) {
  const [peca, setPeca] = useState("");
  const [calculando, setCalculando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  const calcular = async () => {
    if (!peca) {
      toast.error("Descreva a peça que deseja confeccionar");
      return;
    }

    setCalculando(true);
    setResultado(null);

    try {
      const medidasTexto = Object.entries(cliente.medidas)
        .filter(([, val]) => val && val !== "")
        .map(([key, val]) => `${labelsMedidas[key as keyof MedidasSobMedida]}: ${val}cm`)
        .join(", ");

      const tipoInfo =
        cliente.tipoMedida === "industrial"
          ? `Tamanho industrial ${cliente.tamanhoIndustrial}`
          : "Sob medida (medidas exclusivas)";

      const { data, error } = await supabase.functions.invoke("calculate-fabric", {
        body: {
          medidas: medidasTexto,
          tipoMedida: tipoInfo,
          peca,
          nomeCliente: cliente.nome,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Erro ao calcular. Tente novamente.");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.resultado) {
        setResultado(data.resultado);
        toast.success("Cálculo realizado com sucesso!");
      }
    } catch (err) {
      console.error("Erro:", err);
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setCalculando(false);
    }
  };

  return (
    <div className="p-5 space-y-4">
      <h4 className="font-display font-semibold text-sm flex items-center gap-2">
        <Sparkles size={16} className="text-accent" />
        Calculadora de Tecido com IA
      </h4>

      <div className="space-y-2">
        <Label className="text-xs">Descreva a peça que deseja confeccionar</Label>
        <Input
          placeholder="Ex: Vestido longo evasê com saia fluida"
          value={peca}
          onChange={(e) => setPeca(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !calculando && calcular()}
          className="h-10 rounded-lg text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sugestoesPecas.map((s) => (
          <button
            key={s}
            onClick={() => setPeca(s)}
            className="text-[10px] bg-muted/50 border border-border rounded-full px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      <Button
        onClick={calcular}
        disabled={!peca || calculando}
        className="w-full bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl disabled:opacity-40"
      >
        {calculando ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" /> Calculando com IA...
          </>
        ) : (
          <>
            <Sparkles size={16} className="mr-2" /> Calcular Tecido
          </>
        )}
      </Button>

      {resultado && (
        <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-2">
          <h5 className="font-semibold text-sm flex items-center gap-2">
            <Sparkles size={14} className="text-accent" /> Resultado
          </h5>
          <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
            {resultado}
          </div>
        </div>
      )}
    </div>
  );
}
