import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";
import logoImg from "@/assets/logo-atelieh.png";

const YOUTUBE_URL = "https://www.youtube.com/@cursodecosturaexpressol";

export default function YoutubeCard() {
  return (
    <Card className="p-6 flex flex-col items-center gap-4 card-hover max-w-sm">
      <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
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
      <Button asChild className="gap-2">
        <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
          <Youtube className="h-4 w-4" />
          Acessar Canal
        </a>
      </Button>
    </Card>
  );
}
