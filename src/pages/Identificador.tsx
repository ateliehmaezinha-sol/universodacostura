import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import FabricResult from "@/components/identificador/FabricResult";
import FabricHistory from "@/components/identificador/FabricHistory";
import { FabricInfo, HistoryItem } from "@/components/identificador/types";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Camera, ChevronDown, ChevronUp, ImageIcon, Loader2, RefreshCw, Scissors, Shirt } from "lucide-react";
import { toast } from "sonner";

const HISTORY_KEY = "atelie_fabric_history";
type IdentifyMode = "fabric" | "garment";

function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
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
  const [mode, setMode] = useState<IdentifyMode>("fabric");
  const [feedbackText, setFeedbackText] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveHistory(historico);
  }, [historico]);

  const addToHistory = async (info: FabricInfo, imageBase64: string) => {
    const thumbnail = await resizeImage(imageBase64);
    const item: HistoryItem = {
      id: Date.now().toString(),
      data: new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      thumbnail,
      info,
    };

    setHistorico((prev) => [item, ...prev]);
  };

  const identificarTecido = async (imageBase64: string, userFeedback?: string) => {
    setLoading(true);
    setResultado(null);
    setShowFeedback(false);

    try {
      const { data, error } = await supabase.functions.invoke("identify-fabric", {
        body: { imageBase64, mode, userFeedback },
      });

      if (error) throw new Error(error.message || "Erro ao identificar tecido");
      if (data?.error) throw new Error(data.error);

      const fabricInfo = data as FabricInfo;
      setResultado(fabricInfo);
      await addToHistory(fabricInfo, imageBase64);
      setFeedbackText("");
      toast.success(`Tecido identificado: ${fabricInfo.nome}`);
    } catch (err: any) {
      console.error("Erro:", err);
      toast.error(err.message || "Não foi possível identificar o tecido. Tente outra foto.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
  };

  const resetImage = () => {
    setImagem(null);
    setResultado(null);
    setShowFeedback(false);
    setFeedbackText("");
  };

  const handleRedoWithFeedback = () => {
    if (!imagem) return;
    if (!feedbackText.trim()) {
      toast.error("Digite o nome do tecido correto ou sua observação");
      return;
    }

    identificarTecido(imagem, feedbackText.trim());
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 text-3xl font-display font-bold">📸 Identificador de Tecidos</h1>
        <p className="mb-6 text-muted-foreground">Envie uma foto e descubra qual é o tecido com IA</p>

        <div className="mb-6 flex gap-2">
          <Button
            variant={mode === "fabric" ? "default" : "outline"}
            onClick={() => {
              setMode("fabric");
              resetImage();
            }}
            className="h-12 flex-1 rounded-xl"
          >
            <Scissors size={18} className="mr-2" />
            Foto do Tecido
          </Button>
          <Button
            variant={mode === "garment" ? "default" : "outline"}
            onClick={() => {
              setMode("garment");
              resetImage();
            }}
            className="h-12 flex-1 rounded-xl"
          >
            <Shirt size={18} className="mr-2" />
            Roupa Pronta
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />

            {imagem ? (
              <div className="relative overflow-hidden rounded-2xl border border-border">
                <img
                  src={imagem}
                  alt={mode === "garment" ? "Roupa enviada para identificação" : "Tecido enviado para identificação"}
                  className="h-64 w-full object-cover"
                />
                <button
                  onClick={resetImage}
                  className="absolute right-3 top-3 rounded-full bg-primary/80 px-3 py-1 text-xs text-primary-foreground"
                >
                  Trocar foto
                </button>

                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-accent" size={36} />
                      <span className="text-sm font-medium text-foreground">
                        {mode === "garment" ? "Analisando roupa..." : "Analisando tecido..."}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card transition-colors hover:border-accent"
              >
                {mode === "garment" ? <Shirt size={48} className="text-muted-foreground" /> : <Camera size={48} className="text-muted-foreground" />}
                <span className="font-medium text-muted-foreground">
                  {mode === "garment" ? "Envie foto da roupa pronta" : "Envie foto do tecido"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {mode === "garment" ? "Vestidos, blusas, blazer, calças e moda festa" : "Toque para selecionar ou tirar uma foto"}
                </span>
              </button>
            )}

            {!imagem && (
              <div className="flex gap-2">
                <Button onClick={() => cameraRef.current?.click()} className="h-12 flex-1 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
                  <Camera size={18} className="mr-2" /> Tirar Foto
                </Button>
                <Button onClick={() => fileRef.current?.click()} variant="outline" className="h-12 flex-1 rounded-xl">
                  <ImageIcon size={18} className="mr-2" /> Galeria
                </Button>
              </div>
            )}

            {imagem && !loading && (
              <div className="space-y-3">
                <Button onClick={() => identificarTecido(imagem)} className="h-12 w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
                  <RefreshCw size={18} className="mr-2" /> Analisar Novamente
                </Button>

                {resultado && (
                  <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <button
                      onClick={() => setShowFeedback(!showFeedback)}
                      className="flex w-full items-center justify-between text-sm font-medium text-foreground"
                    >
                      <span>🤔 Resultado incorreto? Corrija aqui</span>
                      {showFeedback ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    <AnimatePresence>
                      {showFeedback && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 pt-2">
                            <p className="text-xs text-muted-foreground">
                              Informe o nome correto do tecido ou uma observação para a IA refazer a análise com mais precisão.
                            </p>
                            <input
                              type="text"
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              placeholder="Ex: Bengaline, crepe, malha de forro, helanquinha..."
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                              onKeyDown={(e) => e.key === "Enter" && handleRedoWithFeedback()}
                            />
                            <Button
                              onClick={handleRedoWithFeedback}
                              variant="outline"
                              className="w-full"
                              disabled={!feedbackText.trim()}
                            >
                              <RefreshCw size={14} className="mr-2" /> Refazer Análise com Correção
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground">
              🤖 {mode === "garment"
                ? "A IA analisa vestidos, blusas, blazer, calças e outras peças do vestuário feminino"
                : "Quanto melhor a foto do tecido, mais preciso tende a ser o resultado"}
            </p>
          </div>

          {resultado && <FabricResult resultado={resultado} />}
        </div>

        <FabricHistory
          historico={historico}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          onRemove={(id) => {
            setHistorico((prev) => prev.filter((item) => item.id !== id));
            toast.success("Removido do histórico");
          }}
          onClear={() => {
            setHistorico([]);
            toast.success("Histórico limpo");
          }}
        />
      </motion.div>
    </AppLayout>
  );
}
