import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cliente, labelsMedidas, MedidasSobMedida } from "./types";
import CalculadoraTecido from "./CalculadoraTecido";

interface Props {
  cliente: Cliente;
  onRemove: (id: string) => void;
}

export default function ClienteCard({ cliente, onRemove }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  const medidasPreenchidas = Object.entries(cliente.medidas).filter(
    ([, val]) => val && val !== ""
  );

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-5 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-lg">{cliente.nome}</h3>
            {cliente.tipoMedida === "industrial" && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
                Tam. {cliente.tamanhoIndustrial}
              </span>
            )}
            {cliente.tipoMedida === "sob_medida" && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                Sob Medida
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {cliente.telefone}{cliente.telefone && cliente.cidade ? " • " : ""}{cliente.cidade}
          </p>
          {cliente.medidas.busto && (
            <p className="text-xs text-muted-foreground mt-1">
              B: {cliente.medidas.busto} / C: {cliente.medidas.cintura} / Q: {cliente.medidas.quadril}
              {cliente.medidas.comprimentoTotal ? ` / Alt: ${cliente.medidas.comprimentoTotal}cm` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCalc(!showCalc)}
            className="text-accent hover:text-accent"
            title="Calcular tecido"
          >
            <Calculator size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
          <button
            onClick={() => onRemove(cliente.id)}
            className="text-destructive/50 hover:text-destructive transition-colors p-2"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {expanded && medidasPreenchidas.length > 0 && (
        <div className="px-5 pb-5 border-t border-border pt-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Todas as Medidas (cm)
          </h4>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {medidasPreenchidas.map(([key, val]) => (
              <div key={key} className="bg-muted/50 rounded-lg px-3 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">{labelsMedidas[key as keyof MedidasSobMedida]}</p>
                <p className="font-semibold text-sm">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCalc && (
        <div className="border-t border-border">
          <CalculadoraTecido cliente={cliente} />
        </div>
      )}
    </div>
  );
}
