import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Camera, ChevronDown, ChevronUp, ImageIcon, Loader2, RefreshCw, Scissors, Shirt, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type CriadorMode = "fabric" | "garment";

const sugestoes = [
  "Vestido de festa longo drapeado",
  "Blazer feminino de alfaiataria",
  "Macacão pantalona elegante",
  "Saia midi evasê para trabalho",
  "Blusa ciganinha para verão",
  "Vestido de noiva sereia",
  "Conjunto evangélico saia e blusa",
  "Cropped com amarração frontal",
  "Calça pantalona de linho",
  "Jaleco profissional estilizado",
];

export default function Criador() {
  const [mode, setMode] = useState<CriadorMode>("fabric");
  const [imagem, setImagem] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [comando, setComando] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const gerarComFoto = async (imageBase64: string) => {
    setIsLoading(true);
    setResultado(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-clothing", {
        body: {
          prompt: mode === "garment"
            ? "Analise esta roupa pronta e crie a ficha técnica completa para reproduzi-la: tecidos, metragem, aviamentos e passo a passo"
            : "Analise este tecido e sugira de 4 a 6 peças de roupa ideais para confeccionar com ele",
          imageBase64,
          mode,
        },
      });

      if (error) {
        setResultado(`❌ ${error.message || "Erro ao gerar. Tente novamente."}`);
      } else if (data?.error) {
        setResultado(`❌ ${data.error}`);
      } else {
        setResultado(data.description);
      }
    } catch (err) {
      console.error(err);
      setResultado("❌ Erro ao responder, tente novamente");
    } finally {
      setIsLoading(false);
    }
  };

  const gerarComTexto = async () => {
    if (!comando.trim() || isLoading) return;
    setIsLoading(true);
    setResultado(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-clothing", {
        body: { prompt: comando },
      });

      if (error) {
        setResultado(`❌ ${error.message || "Erro ao gerar. Tente novamente."}`);
      } else if (data?.error) {
        setResultado(`❌ ${data.error}`);
      } else {
        setResultado(data.description);
      }
    } catch (err) {
      console.error(err);
      setResultado("❌ Erro ao responder, tente novamente");
    } finally {
      setIsLoading(false);
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
      gerarComFoto(base64);
    };
    reader.readAsDataURL(file);
  };

  const resetImage = () => {
    setImagem(null);
    setResultado(null);
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 text-3xl font-display font-bold">🎨 Criador de Roupa IA</h1>
        <p className="mb-6 text-muted-foreground">Envie uma foto e crie roupas com ficha técnica completa</p>

        {/* Tabs igual Identificador */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={mode === "fabric" ? "default" : "outline"}
            onClick={() => { setMode("fabric"); resetImage(); }}
            className="h-12 flex-1 rounded-xl"
          >
            <Scissors size={18} className="mr-2" />
            Foto do Tecido
          </Button>
          <Button
            variant={mode === "garment" ? "default" : "outline"}
            onClick={() => { setMode("garment"); resetImage(); }}
            className="h-12 flex-1 rounded-xl"
          >
            <Shirt size={18} className="mr-2" />
            Roupa Pronta
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Left: Upload area */}
          <div className="space-y-4">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />

            {imagem ? (
              <div className="relative overflow-hidden rounded-2xl border border-border">
                <img
                  src={imagem}
                  alt={mode === "garment" ? "Roupa enviada" : "Tecido enviado"}
                  className="h-64 w-full object-cover"
                />
                <button
                  onClick={resetImage}
                  className="absolute right-3 top-3 rounded-full bg-primary/80 px-3 py-1 text-xs text-primary-foreground"
                >
                  Trocar foto
                </button>

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-accent" size={36} />
                      <span className="text-sm font-medium text-foreground">
                        {mode === "garment" ? "Analisando roupa..." : "Analisando tecido e criando sugestões..."}
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
                {mode === "garment" ? (
                  <Shirt size={48} className="text-muted-foreground" />
                ) : (
                  <Camera size={48} className="text-muted-foreground" />
                )}
                <span className="font-medium text-muted-foreground">
                  {mode === "garment" ? "Envie foto da roupa pronta" : "Envie foto do tecido"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {mode === "garment"
                    ? "A IA cria ficha técnica para reproduzir a peça"
                    : "Toque para selecionar ou tirar uma foto"}
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

            {imagem && !isLoading && (
              <Button
                onClick={() => gerarComFoto(imagem)}
                className="h-12 w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <RefreshCw size={18} className="mr-2" /> Gerar Novamente
              </Button>
            )}

            <p className="text-center text-xs text-muted-foreground">
              🤖 {mode === "garment"
                ? "Envie foto de vestidos, blusas, blazer, calças e moda festa para reproduzir"
                : "Quanto melhor a foto do tecido, mais precisas serão as sugestões de roupas"}
            </p>

            {/* Text prompt section below */}
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Ou descreva a peça que deseja criar:</p>
              <Input
                placeholder="Ex: Vestido longo de festa com decote V..."
                value={comando}
                onChange={(e) => setComando(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && gerarComTexto()}
                disabled={isLoading}
                className="h-12 rounded-xl"
              />
              <div className="flex flex-wrap gap-2">
                {sugestoes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setComando(s)}
                    disabled={isLoading}
                    className="text-xs bg-card border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-accent transition-colors disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <Button
                onClick={gerarComTexto}
                disabled={!comando.trim() || isLoading}
                className="w-full h-12 bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl disabled:opacity-40"
              >
                {isLoading ? (
                  <><Loader2 size={18} className="mr-2 animate-spin" /> Gerando com IA...</>
                ) : (
                  <><Sparkles size={18} className="mr-2" /> Gerar Ficha Técnica</>
                )}
              </Button>
            </div>
          </div>

          {/* Right: Result */}
          <div>
            {isLoading && !resultado ? (
              <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <Loader2 size={48} className="text-accent animate-spin mb-4" />
                <p className="text-muted-foreground text-sm">Gerando ficha técnica com IA...</p>
                <p className="text-muted-foreground text-xs mt-1">Isso pode levar alguns segundos</p>
              </div>
            ) : resultado ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-2xl p-6 max-h-[70vh] overflow-y-auto"
              >
                <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-accent" />
                  Ficha Técnica
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{resultado}</ReactMarkdown>
                </div>
              </motion.div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <FileText size={48} className="text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-sm">Sua ficha técnica aparecerá aqui</p>
                <p className="text-muted-foreground text-xs mt-1">Envie foto ou descreva a peça para começar</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
