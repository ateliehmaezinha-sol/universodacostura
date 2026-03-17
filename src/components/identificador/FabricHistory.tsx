import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { History, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { HistoryItem } from "./types";

interface Props {
  historico: HistoryItem[];
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

const confidenceStyles: Record<string, string> = {
  Alta: "bg-primary/15 text-primary border-primary/20",
  Média: "bg-accent/15 text-accent border-accent/20",
  Baixa: "bg-destructive/15 text-destructive border-destructive/20",
};

export default function FabricHistory({ historico, showHistory, setShowHistory, onRemove, onClear }: Props) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  return (
    <div className="mt-10">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="mb-4 flex items-center gap-2 text-lg font-display font-semibold text-foreground"
      >
        <History size={20} className="text-accent" />
        Histórico de Identificações ({historico.length})
        {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {historico.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Nenhuma identificação ainda. Envie uma foto acima!</p>
            ) : (
              <>
                <div className="mb-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:text-destructive">
                    <Trash2 size={14} className="mr-1" /> Limpar histórico
                  </Button>
                </div>
                <div className="space-y-3">
                  {historico.map((item) => {
                    const confidenceClass = confidenceStyles[item.info.confianca || ""] || "bg-muted text-muted-foreground border-border";

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="overflow-hidden rounded-xl border border-border bg-card"
                      >
                        <button
                          onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                          className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-accent/5"
                        >
                          <img src={item.thumbnail} alt={item.info.nome} className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-foreground">{item.info.nome}</p>
                            <p className="text-xs text-muted-foreground">{item.data}</p>
                          </div>
                          {item.info.confianca && (
                            <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-xs ${confidenceClass}`}>
                              {item.info.confianca}
                            </span>
                          )}
                          {expandedItem === item.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                        </button>

                        <AnimatePresence>
                          {expandedItem === item.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border px-4 pb-4 pt-3 text-sm">
                                <p><span className="text-muted-foreground">Composição:</span> {item.info.composicao}</p>
                                <p><span className="text-muted-foreground">Caimento:</span> {item.info.caimento}</p>
                                <p><span className="text-muted-foreground">Elasticidade:</span> {item.info.elasticidade}</p>
                                <p><span className="text-muted-foreground">Dificuldade:</span> {item.info.dificuldade}</p>
                                <p className="col-span-2"><span className="text-muted-foreground">Roupas:</span> {item.info.roupas}</p>
                                <p><span className="text-muted-foreground">Agulha:</span> {item.info.agulha}</p>
                                <p><span className="text-muted-foreground">Linha:</span> {item.info.linha}</p>
                                {item.info.observacoes && (
                                  <p className="col-span-2 italic text-muted-foreground">{item.info.observacoes}</p>
                                )}
                                <div className="col-span-2 mt-1 flex justify-end">
                                  <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)} className="text-destructive hover:text-destructive text-xs">
                                    <Trash2 size={12} className="mr-1" /> Remover
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
