import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { FILMS, getFilm } from "@/data/films";
import { YoutubeSheet } from "@/components/youtube-sheet";

export function Lobby() {
  const [sheet, setSheet] = useState<string | null>(null);
  const open = sheet ? getFilm(sheet) : undefined;

  return (
    <main className="min-h-dvh bg-void text-bone">
      <header className="mx-auto max-w-5xl px-5 pt-10 pb-6">
        <p className="text-xs tracking-widest text-ash uppercase">Antología · cuatro películas · 30:00</p>
        <h1 className="mt-3 font-display text-6xl leading-none sm:text-8xl">Cuatro fines</h1>
        <p className="mt-4 max-w-md text-base text-ash">
          Un apocalipsis sombrío, contado despacio. Ceniza, marea, tierra y silencio. Entra a la sala: cada filme dura media hora.
        </p>
      </header>
      <section className="mx-auto grid max-w-5xl gap-px bg-night sm:grid-cols-2">
        {FILMS.map((film) => (
          <article key={film.slug} className="bg-void">
            <Link to="/film/$slug" params={{ slug: film.slug }} className="block">
              <img src={film.poster} alt="" className="aspect-video w-full object-cover" />
              <div className="px-4 pt-4">
                <p className="text-xs tracking-widest text-ash uppercase">
                  {film.numeral} · {film.element} · 30:00
                </p>
                <h2 className="mt-1 font-display text-4xl leading-none">{film.title}</h2>
                <p className="mt-2 text-sm text-ash">{film.logline}</p>
              </div>
            </Link>
            <div className="flex items-center gap-2 px-4 py-4">
              <Link
                to="/film/$slug"
                params={{ slug: film.slug }}
                className="inline-flex h-11 items-center bg-bone px-4 text-sm text-void"
              >
                Proyectar
              </Link>
              <button
                type="button"
                onClick={() => setSheet(film.slug)}
                className="inline-flex h-11 items-center px-3 text-sm text-ash"
              >
                Ficha YouTube
              </button>
            </div>
          </article>
        ))}
      </section>
      <footer className="mx-auto max-w-5xl px-5 py-8 text-sm text-ash">
        Sin diálogos. Animación 3D. Máster 4K de treinta minutos por película, listo para subir.
      </footer>
      {open ? <YoutubeSheet film={open} onClose={() => setSheet(null)} /> : null}
    </main>
  );
}
