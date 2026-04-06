import { useState, useRef } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, FileText, Loader2, Camera, ImageIcon, Shirt } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type TabMode = "texto" | "foto";

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
  const [tab, setTab] = useState<TabMode>("texto");
  const [comando, setComando] = useState("");
  const [resultado, setResultado] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagem, setImagem] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const gerar = async (prompt?: string) => {
    const finalPrompt = prompt || comando;
    if (!finalPrompt.trim() || isLoading) return;
    setIsLoading(true);
    setResultado(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-clothing", {
        body: { prompt: finalPrompt },
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

  const gerarComFoto = async (imageBase64: string) => {
    setIsLoading(true);
    setResultado(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-clothing", {
        body: { prompt: "Crie sugestões de roupas que podem ser feitas com este tecido da foto", imageBase64 },
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

  const resetFoto = () => {
    setImagem(null);
    setResultado(null);
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">🎨 Criador de Roupa IA</h1>
        <p className="text-muted-foreground mb-6">
          Descreva a peça ou envie foto do tecido para receber ficha técnica completa
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === "texto" ? "default" : "outline"}
            onClick={() => { setTab("texto"); setResultado(null); }}
            className="h-12 flex-1 rounded-xl"
          >
            <Sparkles size={18} className="mr-2" />
            Descrever Peça
          </Button>
          <Button
            variant={tab === "foto" ? "default" : "outline"}
            onClick={() => { setTab("foto"); setResultado(null); setComando(""); }}
            className="h-12 flex-1 rounded-xl"
          >
            <Camera size={18} className="mr-2" />
            Foto do Tecido
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {tab === "texto" ? (
              <>
                <Input
                  placeholder="Ex: Vestido longo de festa com decote V..."
                  value={comando}
                  onChange={(e) => setComando(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && gerar()}
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
                  onClick={() => gerar()}
                  disabled={!comando.trim() || isLoading}
                  className="w-full h-12 bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl disabled:opacity-40"
                >
                  {isLoading ? (
                    <><Loader2 size={18} className="mr-2 animate-spin" /> Gerando com IA...</>
                  ) : (
                    <><Sparkles size={18} className="mr-2" /> Gerar Ficha Técnica</>
                  )}
                </Button>
              </>
            ) : (
              <>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />

                {imagem ? (
                  <div className="relative overflow-hidden rounded-2xl border border-border">
                    <img src={imagem} alt="Tecido para criar roupa" className="h-64 w-full object-cover" />
                    <button
                      onClick={resetFoto}
                      className="absolute right-3 top-3 rounded-full bg-primary/80 px-3 py-1 text-xs text-primary-foreground"
                    >
                      Trocar foto
                    </button>
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="animate-spin text-accent" size={36} />
                          <span className="text-sm font-medium text-foreground">Analisando tecido e criando sugestões...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card transition-colors hover:border-accent"
                  >
                    <Shirt size={48} className="text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">Envie foto do tecido</span>
                    <span className="text-xs text-muted-foreground">A IA vai sugerir roupas que você pode criar</span>
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
                    className="w-full h-12 bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl"
                  >
                    <Sparkles size={18} className="mr-2" /> Gerar Novamente
                  </Button>
                )}

                <p className="text-center text-xs text-muted-foreground">
                  🤖 Envie uma foto clara do tecido para melhores resultados
                </p>
              </>
            )}
          </div>

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
                <p className="text-muted-foreground text-xs mt-1">
                  {tab === "texto" ? "Descreva a peça ou escolha uma sugestão" : "Envie foto do tecido para começar"}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
