import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import qrcodeImg from "@/assets/qrcode-personalizado.jpg";

export default function QRCodeCard() {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = "qrcode-unicost-ia.jpg";
    link.href = qrcodeImg;
    link.click();
  };

  return (
    <Card className="p-6 flex flex-col items-center gap-4 card-hover">
      <h3 className="font-display text-lg font-semibold">QR Code do App</h3>
      <p className="text-sm text-muted-foreground text-center">
        Escaneie para acessar o UniCost IA
      </p>
      <img src={qrcodeImg} alt="QR Code UniCost IA" className="w-56 h-56 rounded-lg object-contain" />
      <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
        <Download className="h-4 w-4" />
        Baixar QR Code
      </Button>
    </Card>
  );
}
