import { motion } from "framer-motion";
import { FabricInfo } from "./types";

interface Props {
  resultado: FabricInfo;
}

const confidenceStyles: Record<string, string> = {
  Alta: "bg-primary/15 text-primary border-primary/20",
  Média: "bg-accent/15 text-accent border-accent/20",
  Baixa: "bg-destructive/15 text-destructive border-destructive/20",
};

export default function FabricResult({ resultado }: Props) {
  const confidenceClass = confidenceStyles[resultado.confianca || ""] || "bg-muted text-muted-foreground border-border";

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="rounded-2xl border border-accent/20 bg-accent/10 p-6">
        <p className="text-sm font-medium text-accent">Tecido identificado</p>
        <h3 className="mt-1 text-3xl font-display font-bold">{resultado.nome}</h3>
        {resultado.confianca && (
          <span className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs ${confidenceClass}`}>
            Confiança: {resultado.confianca}
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h4 className="mb-2 font-display font-semibold">Características</h4>
        <p className="text-sm"><span className="text-muted-foreground">Composição:</span> {resultado.composicao}</p>
        <p className="text-sm"><span className="text-muted-foreground">Caimento:</span> {resultado.caimento}</p>
        <p className="text-sm"><span className="text-muted-foreground">Elasticidade:</span> {resultado.elasticidade}</p>
        <p className="text-sm"><span className="text-muted-foreground">Dificuldade:</span> {resultado.dificuldade}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h4 className="mb-2 font-display font-semibold">Recomendações</h4>
        <p className="text-sm"><span className="text-muted-foreground">Roupas ideais:</span> {resultado.roupas}</p>
        <p className="text-sm"><span className="text-muted-foreground">Forro:</span> {resultado.forro}</p>
        <p className="text-sm"><span className="text-muted-foreground">Agulha:</span> {resultado.agulha}</p>
        <p className="text-sm"><span className="text-muted-foreground">Linha:</span> {resultado.linha}</p>
      </div>

      {resultado.observacoes && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h4 className="mb-2 font-display font-semibold">💡 Observações</h4>
          <p className="text-sm text-muted-foreground">{resultado.observacoes}</p>
        </div>
      )}
    </motion.div>
  );
}
