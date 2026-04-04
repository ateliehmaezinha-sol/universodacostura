import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5500000000000"; // Replace with actual number
const MESSAGE = "Olá, quero saber mais sobre o curso de costura";

export default function WhatsAppButton() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle size={28} className="text-white" />
    </a>
  );
}
