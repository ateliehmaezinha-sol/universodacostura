import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, History, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FabricInfo {
  nome: string;
  composicao: string;
  caimento: string;
  elasticidade: string;
  dificuldade: string;
  roupas: string;
  forro: string;
  agulha: string;
  linha: string;
  confianca?: string;
  observacoes?: string;
}

interface HistoryItem {
  id: string;
  data: string;
  thumbnail: string;
  info: FabricInfo;
}

const HISTORY_KEY = "atelie_fabric_history";

function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch { return []; }
}

function saveHistory(items: HistoryItem[]) {
  // Keep max 20 items, store small thumbnails
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 20)));
}

function resizeImage(base64: string, maxW = 120): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = maxW / img.width;
      canvas.width = maxW;
      canvas.height = img.height * ratio;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };
    img.src = base64;
  });
}

export default function Identificador() {
  const [imagem, setImagem] = useState<string | null>(null);
  const [resultado, setResultado] = useState<FabricInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<HistoryItem[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveHistory(historico); }, [historico]);

  const addToHistory = async (info: FabricInfo, imageBase64: string) => {
    const thumbnail = await resizeImage(imageBase64);
    const item: HistoryItem = {
      id: Date.now().toString(),
      data: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      thumbnail,
      info,
    };
    setHistorico(prev => [item, ...prev]);
  };

  const removeFromHistory = (id: string) => {
    setHistorico(prev => prev.filter(h => h.id !== id));
    toast.success("Removido do histórico");
  };

  const clearHistory = () => {
    setHistorico([]);
    toast.success("Histórico limpo");
  };

  const identificarTecido = async (imageBase64: string) => {
    setLoading(true);
    setResultado(null);
    try {
      const { data, error } = await supabase.functions.invoke("identify-fabric", {
        body: { imageBase64 },
      });
      if (error) throw new Error(error.message || "Erro ao identificar tecido");
      if (data?.error) throw new Error(data.error);

      const fabricInfo = data as FabricInfo;
      setResultado(fabricInfo);
      await addToHistory(fabricInfo, imageBase64);
      toast.success(`Tecido identificado: ${data.nome}`);
    } catch (err: any) {
      console.error("Erro:", err);
      toast.error(err.message || "Não foi possível identificar o tecido. Tente outra foto.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setImagem(base64);
        identificarTecido(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">📸 Identificador de Tecidos</h1>
        <p className="text-muted-foreground mb-8">Envie uma foto e descubra qual é o tecido com IA</p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

            {imagem ? (
              <div className="relative rounded-2xl overflow-hidden border border-border">
                <img src={imagem} alt="Tecido enviado" className="w-full h-64 object-cover" />
                <button
                  onClick={() => { setImagem(null); setResultado(null); }}
                  className="absolute top-3 right-3 bg-primary/80 text-primary-foreground rounded-full px-3 py-1 text-xs"
                >
                  Trocar foto
                </button>
                {loading && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-accent" size={36} />
                      <span className="text-sm font-medium text-foreground">Analisando tecido...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-64 rounded-2xl border-2 border-dashed border-border bg-card flex flex-col items-center justify-center gap-3 hover:border-accent transition-colors"
              >
                <Camera size={48} className="text-muted-foreground" />
                <span className="text-muted-foreground font-medium">Toque para enviar foto</span>
                <span className="text-xs text-muted-foreground">ou arraste uma imagem aqui</span>
              </button>
            )}

            {!imagem && (
              <Button onClick={() => fileRef.current?.click()} className="w-full h-12 bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl">
                <Upload size={18} className="mr-2" /> Selecionar Foto
              </Button>
            )}

            {imagem && !loading && (
              <Button onClick={() => identificarTecido(imagem)} className="w-full h-12 bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl">
                <Camera size={18} className="mr-2" /> Identificar Novamente
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center">
              🤖 Identificação por IA — quanto melhor a foto, mais preciso o resultado
            </p>
          </div>

          {resultado && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="bg-accent/10 rounded-2xl p-6 border border-accent/20">
                <p className="text-sm text-accent font-medium">Tecido identificado</p>
                <h3 className="text-3xl font-display font-bold mt-1">{resultado.nome}</h3>
                {resultado.confianca && (
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                    resultado.confianca === "Alta" ? "bg-green-500/20 text-green-400" :
                    resultado.confianca === "Média" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    Confiança: {resultado.confianca}
                  </span>
                )}
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <h4 className="font-display font-semibold mb-2">Características</h4>
                <p className="text-sm"><span className="text-muted-foreground">Composição:</span> {resultado.composicao}</p>
                <p className="text-sm"><span className="text-muted-foreground">Caimento:</span> {resultado.caimento}</p>
                <p className="text-sm"><span className="text-muted-foreground">Elasticidade:</span> {resultado.elasticidade}</p>
                <p className="text-sm"><span className="text-muted-foreground">Dificuldade:</span> {resultado.dificuldade}</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <h4 className="font-display font-semibold mb-2">Recomendações</h4>
                <p className="text-sm"><span className="text-muted-foreground">Roupas ideais:</span> {resultado.roupas}</p>
                <p className="text-sm"><span className="text-muted-foreground">Forro:</span> {resultado.forro}</p>
                <p className="text-sm"><span className="text-muted-foreground">Agulha:</span> {resultado.agulha}</p>
                <p className="text-sm"><span className="text-muted-foreground">Linha:</span> {resultado.linha}</p>
              </div>

              {resultado.observacoes && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h4 className="font-display font-semibold mb-2">💡 Observações</h4>
                  <p className="text-sm text-muted-foreground">{resultado.observacoes}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Histórico */}
        <div className="mt-10">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-lg font-display font-semibold text-foreground mb-4"
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
                  <p className="text-sm text-muted-foreground py-4">Nenhuma identificação ainda. Envie uma foto acima!</p>
                ) : (
                  <>
                    <div className="flex justify-end mb-3">
                      <Button variant="ghost" size="sm" onClick={clearHistory} className="text-destructive hover:text-destructive">
                        <Trash2 size={14} className="mr-1" /> Limpar histórico
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {historico.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-card border border-border rounded-xl overflow-hidden"
                        >
                          <button
                            onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                            className="w-full flex items-center gap-4 p-4 text-left hover:bg-accent/5 transition-colors"
                          >
                            <img src={item.thumbnail} alt={item.info.nome} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">{item.info.nome}</p>
                              <p className="text-xs text-muted-foreground">{item.data}</p>
                            </div>
                            {item.info.confianca && (
                              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                item.info.confianca === "Alta" ? "bg-green-500/20 text-green-400" :
                                item.info.confianca === "Média" ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-red-500/20 text-red-400"
                              }`}>
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
                                <div className="px-4 pb-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-border pt-3">
                                  <p><span className="text-muted-foreground">Composição:</span> {item.info.composicao}</p>
                                  <p><span className="text-muted-foreground">Caimento:</span> {item.info.caimento}</p>
                                  <p><span className="text-muted-foreground">Elasticidade:</span> {item.info.elasticidade}</p>
                                  <p><span className="text-muted-foreground">Dificuldade:</span> {item.info.dificuldade}</p>
                                  <p className="col-span-2"><span className="text-muted-foreground">Roupas:</span> {item.info.roupas}</p>
                                  <p><span className="text-muted-foreground">Agulha:</span> {item.info.agulha}</p>
                                  <p><span className="text-muted-foreground">Linha:</span> {item.info.linha}</p>
                                  {item.info.observacoes && (
                                    <p className="col-span-2 text-muted-foreground italic">{item.info.observacoes}</p>
                                  )}
                                  <div className="col-span-2 flex justify-end mt-1">
                                    <Button variant="ghost" size="sm" onClick={() => removeFromHistory(item.id)} className="text-destructive hover:text-destructive text-xs">
                                      <Trash2 size={12} className="mr-1" /> Remover
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AppLayout>
  );
}
