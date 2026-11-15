import { createFileRoute, Link } from "@tanstack/react-router";
import { Theater } from "@/components/theater";
import { getFilm } from "@/data/films";

export const Route = createFileRoute("/film/$slug")({
  component: FilmPage,
});

function FilmPage() {
  const { slug } = Route.useParams();
  const film = getFilm(slug);
  if (!film) {
    return (
      <main className="grid min-h-dvh place-items-center bg-void px-6 text-center">
        <div>
          <p className="font-display text-4xl text-bone">No está en cartelera</p>
          <Link to="/" className="mt-6 inline-flex h-11 items-center text-ash">
            Volver a la sala
          </Link>
        </div>
      </main>
    );
  }
  return <Theater film={film} />;
}
