import { useState, useRef } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

const tecidosDB: Record<string, { composicao: string; caimento: string; elasticidade: string; dificuldade: string; roupas: string; forro: string; agulha: string; linha: string }> = {
  "Crepe": { composicao: "100% Poliéster", caimento: "Fluido", elasticidade: "Baixa", dificuldade: "Fácil", roupas: "Vestidos, blusas, saias", forro: "Dispensável na maioria", agulha: "Ponta fina 70/80", linha: "Poliéster" },
  "Viscose": { composicao: "Fibra natural regenerada", caimento: "Muito fluido", elasticidade: "Baixa", dificuldade: "Médio", roupas: "Vestidos, camisas", forro: "Opcional", agulha: "Universal 70/80", linha: "Poliéster" },
  "Cetim": { composicao: "Poliéster/Seda", caimento: "Fluido e brilhante", elasticidade: "Baixa", dificuldade: "Avançado", roupas: "Festas, lingerie", forro: "Dispensável", agulha: "Microtex 60/70", linha: "Poliéster fina" },
  "Malha": { composicao: "Algodão/Elastano", caimento: "Justo ao corpo", elasticidade: "Alta", dificuldade: "Fácil", roupas: "Camisetas, vestidos casuais", forro: "Dispensável", agulha: "Ponta bola 70/80", linha: "Poliéster texturizada" },
};

export default function Identificador() {
  const [imagem, setImagem] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagem(reader.result as string);
        // Simulated identification
        const nomes = Object.keys(tecidosDB);
        const random = nomes[Math.floor(Math.random() * nomes.length)];
        setResultado(random);
      };
      reader.readAsDataURL(file);
    }
  };

  const info = resultado ? tecidosDB[resultado] : null;

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">📸 Identificador de Tecidos</h1>
        <p className="text-muted-foreground mb-8">Envie uma foto e descubra qual é o tecido</p>

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

            <p className="text-xs text-muted-foreground text-center">
              💡 Para resultados futuros com IA, conecte o Lovable Cloud
            </p>
          </div>

          {info && resultado && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="bg-accent/10 rounded-2xl p-6 border border-accent/20">
                <p className="text-sm text-accent font-medium">Tecido identificado</p>
                <h3 className="text-3xl font-display font-bold mt-1">{resultado}</h3>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <h4 className="font-display font-semibold mb-2">Características</h4>
                <p className="text-sm"><span className="text-muted-foreground">Composição:</span> {info.composicao}</p>
                <p className="text-sm"><span className="text-muted-foreground">Caimento:</span> {info.caimento}</p>
                <p className="text-sm"><span className="text-muted-foreground">Elasticidade:</span> {info.elasticidade}</p>
                <p className="text-sm"><span className="text-muted-foreground">Dificuldade:</span> {info.dificuldade}</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <h4 className="font-display font-semibold mb-2">Recomendações</h4>
                <p className="text-sm"><span className="text-muted-foreground">Roupas ideais:</span> {info.roupas}</p>
                <p className="text-sm"><span className="text-muted-foreground">Forro:</span> {info.forro}</p>
                <p className="text-sm"><span className="text-muted-foreground">Agulha:</span> {info.agulha}</p>
                <p className="text-sm"><span className="text-muted-foreground">Linha:</span> {info.linha}</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
