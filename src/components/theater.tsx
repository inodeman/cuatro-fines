import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import {
  FIN_AT,
  OPEN_END,
  RUNTIME,
  TITLE_END,
  chapterAt,
  clock,
  stillIndex,
  stillSeconds,
  type Film,
} from "@/data/films";
import { startScore, type Score } from "@/lib/score";
import { YoutubeSheet } from "@/components/youtube-sheet";

const OPEN_SPAN = OPEN_END - TITLE_END;

export function Theater({ film }: { film: Film }) {
  const tRef = useRef(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sheet, setSheet] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scoreRef = useRef<Score | null>(null);

  const phase = t < TITLE_END ? "title" : t < OPEN_END ? "open" : t >= FIN_AT ? "fin" : "still";
  const index = stillIndex(t);
  const plate = film.plates[index];
  const chapter = chapterAt(film, t);
  const ended = t >= RUNTIME;

  useEffect(() => {
    const previous = document.title;
    document.title = `${film.title} — CUATRO FINES`;
    return () => {
      document.title = previous;
    };
  }, [film.title]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      tRef.current = Math.min(RUNTIME, tRef.current + dt);
      acc += dt;
      if (acc >= 0.2 || tRef.current >= RUNTIME) {
        acc = 0;
        setT(tRef.current);
      }
      if (tRef.current >= RUNTIME) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    const score = startScore(film.rootHz);
    scoreRef.current = score;
    void score.resume();
    return () => {
      if (scoreRef.current === score) scoreRef.current = null;
      void score.stop();
    };
  }, [playing, film.rootHz]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (phase !== "open") {
      video.pause();
      return;
    }
    const local = Math.max(0, tRef.current - TITLE_END);
    const apply = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      const rate = duration / OPEN_SPAN;
      video.playbackRate = rate;
      const target = Math.min(duration - 0.05, local * rate);
      if (Math.abs(video.currentTime - target) > 0.5) video.currentTime = target;
    };
    if (video.readyState >= 1) apply();
    else video.addEventListener("loadedmetadata", apply, { once: true });
    if (playing) void video.play().catch(() => undefined);
    else video.pause();
  }, [phase, playing, t]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (sheet) return;
      if (event.key === " ") {
        event.preventDefault();
        if (tRef.current >= RUNTIME) {
          tRef.current = 0;
          setT(0);
          setPlaying(true);
          return;
        }
        setPlaying((value) => !value);
      }
      if (event.key === "ArrowRight") seek(tRef.current + 15);
      if (event.key === "ArrowLeft") seek(tRef.current - 15);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  function seek(next: number) {
    const value = Math.min(RUNTIME, Math.max(0, next));
    tRef.current = value;
    setT(value);
    if (value >= RUNTIME) setPlaying(false);
  }

  function replay() {
    tRef.current = 0;
    setT(0);
    setPlaying(true);
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-void text-bone">
      <div className="absolute inset-0">
        {phase === "still" || phase === "fin" ? (
          <img
            key={`${film.slug}-${index}`}
            src={plate.src}
            alt={plate.caption}
            className={`h-full w-full object-cover ${index % 2 === 0 ? "plate-drift" : "plate-drift-alt"}`}
            style={{
              animationDuration: `${stillSeconds(index)}s`,
              animationPlayState: playing ? "running" : "paused",
            }}
          />
        ) : (
          <img src={film.poster} alt="" className="h-full w-full object-cover opacity-40" />
        )}
        <video
          ref={videoRef}
          src={film.video}
          muted
          playsInline
          preload="auto"
          className={phase === "open" ? "absolute inset-0 h-full w-full object-cover" : "hidden"}
        />
        <div className="scrim-full pointer-events-none absolute inset-0" />
      </div>

      {phase === "title" ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
          <div>
            <p className="text-xs tracking-widest text-ash uppercase">{film.numeral}</p>
            <h1 className="mt-3 font-display text-6xl leading-none sm:text-8xl">{film.title}</h1>
            <p className="mt-4 text-sm text-ash italic">{film.logline}</p>
          </div>
        </div>
      ) : null}

      {phase === "fin" ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-void/55 text-center">
          <div>
            <p className="font-display text-7xl">Fin</p>
            <p className="mt-3 text-sm tracking-widest text-ash uppercase">{film.title}</p>
          </div>
        </div>
      ) : null}

      <header className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 px-4 pt-4">
        <Link to="/" className="inline-flex h-11 items-center text-xs tracking-widest text-bone uppercase">
          Sala
        </Link>
        <p className="pt-3 text-right text-xs tracking-widest text-ash uppercase">
          {film.numeral} · {film.title}
        </p>
      </header>

      <div className="absolute inset-x-0 bottom-0 px-4 pt-10 pb-4">
        <p className="font-display text-2xl leading-none italic">{chapter.title}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-ash tabular-nums">
          <span className="w-10">{clock(t)}</span>
          <input
            aria-label="Tiempo de la película"
            className="w-full"
            type="range"
            min={0}
            max={RUNTIME}
            step={1}
            value={Math.min(RUNTIME, Math.floor(t))}
            onChange={(event) => seek(Number(event.target.value))}
          />
          <span className="w-10 text-right">30:00</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {ended ? (
            <button type="button" onClick={replay} className="inline-flex h-11 items-center gap-2 bg-ember px-4 text-sm text-void">
              <Play size={16} strokeWidth={1.75} />
              Volver a proyectar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (tRef.current >= RUNTIME) replay();
                else setPlaying((value) => !value);
              }}
              className="inline-flex h-11 items-center gap-2 bg-bone px-4 text-sm text-void"
            >
              {playing ? <Pause size={16} strokeWidth={1.75} /> : <Play size={16} strokeWidth={1.75} />}
              {playing ? "Pausa" : "Proyectar"}
            </button>
          )}
          <button type="button" onClick={() => setSheet(true)} className="inline-flex h-11 items-center px-3 text-sm text-bone">
            Ficha YouTube
          </button>
        </div>
      </div>
      {sheet ? <YoutubeSheet film={film} onClose={() => setSheet(false)} /> : null}
    </main>
  );
}
