"use client";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export default function WhatsAppFloat() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <a
      href="https://wa.me/213770000000?text=Salam%20Maskulino%2C%20j'ai%20une%20question%20sur%20une%20taille"
      target="_blank"
      aria-label="Discuter sur WhatsApp"
      className="fixed bottom-20 md:bottom-6 right-4 z-40 w-13 h-13 p-3.5 rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.5)] hover:scale-105 transition"
    >
      <MessageCircle size={22} />
    </a>
  );
}
