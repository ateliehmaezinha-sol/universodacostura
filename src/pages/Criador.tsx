import { useState, useRef } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Sparkles, Download, Loader2, RefreshCw, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sugestoes = [
  "Crie um vestido elegante drapeado para festa",
  "Crie uma blusa ciganinha para o verão",
  "Crie um conjunto saia e blusa evangélico",
  "Crie uma saia midi evasê elegante",
  "Crie um blazer feminino de alfaiataria",
];

export default function Criador() {
  const [imagem, setImagem] = useState<string | null>(null);
  const [comando, setComando] = useState("");
  const [gerando, setGerando] = useState(false);
  const [imagemGerada, setImagemGerada] = useState<string | null>(null);
  const [descricao, setDescricao] = useState<string | null>(null);
  const [telefoneWhatsApp, setTelefoneWhatsApp] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagem(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const gerar = async () => {
    if (!comando) {
      toast.error("Descreva o que deseja criar");
      return;
    }

    setGerando(true);
    setImagemGerada(null);
    setDescricao(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-clothing", {
        body: {
          fabricImageBase64: imagem || undefined,
          prompt: comando,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Erro ao gerar imagem. Tente novamente.");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.imageUrl) {
        setImagemGerada(data.imageUrl);
        setDescricao(data.description || null);
        toast.success("Criação gerada com sucesso!");
      } else {
        toast.error("Não foi possível gerar a imagem. Tente reformular o pedido.");
      }
    } catch (err) {
      console.error("Erro:", err);
      toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  const baixarImagem = () => {
    if (!imagemGerada) return;
    const link = document.createElement("a");
    link.href = imagemGerada;
    link.download = `criacao-${Date.now()}.png`;
    link.click();
  };

  const enviarWhatsApp = () => {
    if (!telefoneWhatsApp) {
      toast.error("Digite o número do WhatsApp do cliente");
      return;
    }
    // Clean phone number
    const numero = telefoneWhatsApp.replace(/\D/g, "");
    const numeroFormatado = numero.startsWith("55") ? numero : `55${numero}`;
    
    // First download the image so user has it ready to attach
    baixarImagem();

    const mensagem = encodeURIComponent(
      `✨ Olha a criação que fiz para você!\n\n👗 ${comando}\n\n📎 A imagem da peça está em anexo. O que achou?`
    );
    
    window.open(`https://wa.me/${numeroFormatado}?text=${mensagem}`, "_blank");
    toast.success("WhatsApp aberto! Anexe a imagem baixada na conversa.");
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">🎨 Criador de Roupa</h1>
        <p className="text-muted-foreground mb-8">Envie a foto do tecido e descreva o que deseja criar</p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

            {imagem ? (
              <div className="relative rounded-2xl overflow-hidden border border-border">
                <img src={imagem} alt="Tecido" className="w-full h-48 object-cover" />
                <button
                  onClick={() => { setImagem(null); setImagemGerada(null); }}
                  className="absolute top-3 right-3 bg-primary/80 text-primary-foreground rounded-full px-3 py-1 text-xs"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-48 rounded-2xl border-2 border-dashed border-border bg-card flex flex-col items-center justify-center gap-2 hover:border-accent transition-colors"
              >
                <Camera size={40} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Envie a foto do tecido (opcional)</span>
              </button>
            )}

            <div className="space-y-2">
              <Input
                placeholder="Descreva o que quer criar..."
                value={comando}
                onChange={(e) => setComando(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !gerando && gerar()}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {sugestoes.map((s) => (
                <button
                  key={s}
                  onClick={() => setComando(s)}
                  className="text-xs bg-card border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            <Button
              onClick={gerar}
              disabled={!comando || gerando}
              className="w-full h-12 bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl disabled:opacity-40"
            >
              {gerando ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" /> Gerando com IA...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" /> Gerar Criação
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              ✨ Geração de imagens com IA — descreva a roupa e veja a magia acontecer
            </p>
          </div>

          <div>
            {gerando && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[300px]"
              >
                <Loader2 size={48} className="animate-spin text-accent mb-4" />
                <p className="text-muted-foreground text-sm">Criando sua peça com IA...</p>
                <p className="text-muted-foreground text-xs mt-1">Isso pode levar alguns segundos</p>
              </motion.div>
            )}

            {!gerando && imagemGerada && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <img
                    src={imagemGerada}
                    alt="Criação gerada por IA"
                    className="w-full object-contain max-h-[500px]"
                  />
                  <div className="p-4 space-y-3">
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                      <Sparkles size={18} className="text-accent" />
                      Criação Pronta!
                    </h3>
                    <p className="text-sm font-medium text-primary">{comando}</p>
                    {descricao && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{descricao}</p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button onClick={baixarImagem} className="flex-1 bg-primary text-primary-foreground rounded-xl">
                        <Download size={16} className="mr-2" /> Baixar Imagem
                      </Button>
                      <Button
                        onClick={gerar}
                        variant="outline"
                        className="rounded-xl"
                      >
                        <RefreshCw size={16} className="mr-2" /> Gerar Outra
                      </Button>
                    </div>
                    
                    {/* WhatsApp */}
                    <div className="border-t border-border pt-3 mt-1">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <MessageCircle size={12} /> Enviar para o cliente via WhatsApp
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="(11) 99999-9999"
                          value={telefoneWhatsApp}
                          onChange={(e) => setTelefoneWhatsApp(e.target.value)}
                          className="h-9 rounded-lg text-sm flex-1"
                        />
                        <Button
                          onClick={enviarWhatsApp}
                          disabled={!telefoneWhatsApp}
                          className="h-9 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs px-3 disabled:opacity-40"
                        >
                          <MessageCircle size={14} className="mr-1" /> Enviar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {!gerando && !imagemGerada && (
              <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <Sparkles size={48} className="text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-sm">Sua criação aparecerá aqui</p>
                <p className="text-muted-foreground text-xs mt-1">Descreva a peça e clique em "Gerar Criação"</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
