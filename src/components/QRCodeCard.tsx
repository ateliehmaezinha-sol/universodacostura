import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const APP_URL = "https://universodacostura.lovable.app";

export default function QRCodeCard() {
  const handleDownload = () => {
    const svg = document.getElementById("qrcode-unicost");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx?.drawImage(img, 0, 0, 512, 512);
      const link = document.createElement("a");
      link.download = "qrcode-unicost-ia.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Card className="p-6 flex flex-col items-center gap-4 card-hover">
      <h3 className="font-display text-lg font-semibold">QR Code do App</h3>
      <p className="text-sm text-muted-foreground text-center">
        Escaneie para acessar o UniCost IA
      </p>
      <div className="bg-white p-4 rounded-lg">
        <QRCodeSVG
          id="qrcode-unicost"
          value={APP_URL}
          size={200}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          imageSettings={{
            src: "",
            height: 0,
            width: 0,
            excavate: false,
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground break-all text-center">{APP_URL}</p>
      <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
        <Download className="h-4 w-4" />
        Baixar QR Code
      </Button>
    </Card>
  );
}
