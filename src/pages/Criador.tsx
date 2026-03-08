import { useState, useRef } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Sparkles, Download } from "lucide-react";

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
  const [gerado, setGerado] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagem(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const gerar = () => {
    if (imagem && comando) setGerado(true);
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
                  onClick={() => { setImagem(null); setGerado(false); }}
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
                <span className="text-sm text-muted-foreground">Envie a foto do tecido</span>
              </button>
            )}

            <div className="space-y-2">
              <Input
                placeholder="Descreva o que quer criar..."
                value={comando}
                onChange={(e) => setComando(e.target.value)}
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

            <Button onClick={gerar} disabled={!imagem || !comando} className="w-full h-12 bg-accent text-accent-foreground hover:bg-gold-dark rounded-xl disabled:opacity-40">
              <Sparkles size={18} className="mr-2" /> Gerar Criação
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              💡 Geração de imagens com IA disponível ao conectar o Lovable Cloud
            </p>
          </div>

          {gerado && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-6 text-center">
                <Sparkles size={48} className="mx-auto mb-4 text-accent" />
                <h3 className="font-display text-xl font-semibold mb-2">Criação Pronta!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Com o Lovable Cloud ativo, imagens realistas seriam geradas aqui usando IA.
                </p>
                <p className="text-sm font-medium">{comando}</p>
                <Button className="mt-6 bg-primary text-primary-foreground rounded-xl">
                  <Download size={16} className="mr-2" /> Baixar Imagem
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
