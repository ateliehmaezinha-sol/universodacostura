import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";
import logoImg from "@/assets/logo-atelieh.png";

const YOUTUBE_URL = "https://www.youtube.com/@cursodecosturaexpressol";

export default function YoutubeCard() {
  const openChannel = (e: React.MouseEvent) => {
    e.preventDefault();
    // Garante abertura fora do iframe do preview (evita ERR_BLOCKED_BY_RESPONSE do YouTube)
    const win = window.open(YOUTUBE_URL, "_blank", "noopener,noreferrer");
    if (!win) {
      // Fallback: força navegação na janela top
      window.top!.location.href = YOUTUBE_URL;
    }
  };

  return (
    <Card className="p-6 flex flex-col items-center gap-4 card-hover max-w-sm">
      <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" onClick={openChannel}>
        <img
          src={logoImg}
          alt="Logo Atelieh Mãezinha"
          className="w-32 h-32 rounded-full object-cover hover:scale-105 transition-transform"
        />
      </a>
      <h3 className="font-display text-lg font-semibold text-center">
        Canal no YouTube
      </h3>
      <p className="text-sm text-muted-foreground text-center">
        Curso de Costura Estrelas de Sucesso Express
      </p>
      <Button className="gap-2" onClick={openChannel}>
        <Youtube className="h-4 w-4" />
        Acessar Canal
      </Button>
    </Card>
  );
}
