import { useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { youtubeDescription, youtubePackage, type Film } from "@/data/films";

export function YoutubeSheet({ film, onClose }: { film: Film; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = youtubePackage(film);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-void text-bone" role="dialog" aria-label="Ficha de YouTube">
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs tracking-widest text-ash uppercase">Ficha de YouTube</p>
          <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center" aria-label="Cerrar">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <h2 className="mt-4 font-display text-4xl leading-none">{film.title}</h2>
        <p className="mt-3 text-sm text-ash">30:00 · 4K · animación 3D · sin diálogos</p>
        <h3 className="mt-8 text-xs tracking-widest text-ash uppercase">Título</h3>
        <p className="mt-2 text-lg leading-snug">{film.youtubeTitle}</p>
        <h3 className="mt-8 text-xs tracking-widest text-ash uppercase">Descripción</h3>
        <p className="mt-2 text-sm whitespace-pre-wrap text-bone">{youtubeDescription(film)}</p>
        <button
          type="button"
          onClick={copy}
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 bg-ember px-4 text-sm text-void"
        >
          {copied ? <Check size={16} strokeWidth={1.75} /> : <Copy size={16} strokeWidth={1.75} />}
          {copied ? "Copiado" : "Copiar título y descripción"}
        </button>
      </div>
    </div>
  );
}
