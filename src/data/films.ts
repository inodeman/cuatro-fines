export const RUNTIME = 30 * 60;
export const TITLE_END = 12;
export const OPEN_END = 60;
export const FIN_AT = 1788;

/** Still-plate starts, in seconds. Durations: 346, 346, 346, 345, 345. */
export const STILLS = [60, 406, 752, 1098, 1443] as const;

const STILL_ENDS = [406, 752, 1098, 1443, 1788] as const;

export type Plate = { src: string; caption: string };

export type Chapter = { t: number; title: string };

export type Film = {
  slug: string;
  numeral: string;
  title: string;
  element: string;
  logline: string;
  synopsis: string;
  rootHz: number;
  poster: string;
  video: string;
  plates: Plate[];
  chapters: Chapter[];
  youtubeTitle: string;
  tags: string;
};

export function stillIndex(t: number) {
  let i = 0;
  for (let k = 0; k < STILLS.length; k++) if (t >= STILLS[k]) i = k;
  return i;
}

export function stillSeconds(i: number) {
  return STILL_ENDS[i] - STILLS[i];
}

export function stamp(t: number) {
  const s = Math.max(0, Math.floor(t));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function clock(t: number) {
  const s = Math.max(0, Math.floor(t));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function chapterAt(film: Film, t: number) {
  let current = film.chapters[0];
  for (const chapter of film.chapters) {
    if (t >= chapter.t) current = chapter;
  }
  return current;
}

export function youtubeDescription(film: Film) {
  const chapters = film.chapters
    .map((chapter) => `${stamp(chapter.t)} ${chapter.title}`)
    .join("\n");
  return `${film.logline}

${film.synopsis}

Capítulos
${chapters}

CUATRO FINES es una antología de cuatro películas de media hora. Animación 3D, sin diálogos: ceniza, marea, tierra y silencio.

Máster: 3840×2160 · 24 fps · 30:00 · estéreo.

Una película de InodeAi.

${film.tags}`;
}

export function youtubePackage(film: Film) {
  return `${film.youtubeTitle}\n\n${youtubeDescription(film)}`;
}

const shared =
  "#CuatroFines #Apocalipsis #ApocalipsisSombrío #Cine3D #Animación3D #PelículaCompleta #CienciaFicción #Postapocalíptico #Cine #ArteDigital #InodeAi #30Minutos #4K";

export const FILMS: Film[] = [
  {
    slug: "ceniza",
    numeral: "I",
    title: "Ceniza",
    element: "Fuego que ya fue",
    logline: "La ciudad dejó de arder. La ceniza no.",
    synopsis:
      "Una avenida sin nombres, un farol con una última brasa, una habitación donde los muebles son dunas. Alguien camina. Nadie espera. CENIZA es el invierno que sigue al incendio: treinta minutos de una metrópoli enterrada, contada en planos 3D y sin una sola palabra.",
    rootHz: 73.42,
    poster: "/films/ceniza/01.jpg",
    video: "/films/ceniza/open.mp4",
    plates: [
      { src: "/films/ceniza/01.jpg", caption: "La avenida sin nombres" },
      { src: "/films/ceniza/02.jpg", caption: "El último farol" },
      { src: "/films/ceniza/03.jpg", caption: "La habitación" },
      { src: "/films/ceniza/04.jpg", caption: "La ciudad bajo la duna" },
      { src: "/films/ceniza/05.jpg", caption: "Lo que queda" },
    ],
    chapters: [
      { t: 0, title: "Prólogo: el cielo que cayó" },
      { t: 60, title: "La avenida sin nombres" },
      { t: 406, title: "El último farol" },
      { t: 752, title: "La habitación" },
      { t: 1098, title: "La ciudad bajo la duna" },
      { t: 1443, title: "Lo que queda" },
      { t: 1788, title: "Fin" },
    ],
    youtubeTitle:
      "CENIZA (película completa) | Apocalipsis de ceniza en 3D | 30 minutos",
    tags: `#CENIZA ${shared}`,
  },
  {
    slug: "marea",
    numeral: "II",
    title: "Marea negra",
    element: "El agua que se quedó",
    logline: "El mar subió una noche y decidió no volver.",
    synopsis:
      "El agua llega al tercer piso y se queda quieta, oscura, con brillo de aceite. Una barca vacía, una plaza hundida, una catedral donde los bancos rezan bajo la superficie. MAREA NEGRA es la ciudad costera después de la última ola.",
    rootHz: 55,
    poster: "/films/marea/01.jpg",
    video: "/films/marea/open.mp4",
    plates: [
      { src: "/films/marea/01.jpg", caption: "La primera noche" },
      { src: "/films/marea/02.jpg", caption: "La barca vacía" },
      { src: "/films/marea/03.jpg", caption: "Bajo el agua" },
      { src: "/films/marea/04.jpg", caption: "La nave" },
      { src: "/films/marea/05.jpg", caption: "Marea quieta" },
    ],
    chapters: [
      { t: 0, title: "Prólogo: la ola que no retrocedió" },
      { t: 60, title: "La primera noche" },
      { t: 406, title: "La barca vacía" },
      { t: 752, title: "Bajo el agua" },
      { t: 1098, title: "La nave" },
      { t: 1443, title: "Marea quieta" },
      { t: 1788, title: "Fin" },
    ],
    youtubeTitle:
      "MAREA NEGRA (película completa) | La ciudad ahogada en 3D | 30 minutos",
    tags: `#MareaNegra ${shared}`,
  },
  {
    slug: "tierra",
    numeral: "III",
    title: "Tierra muerta",
    element: "La cosecha que no llegó",
    logline: "El campo se rindió. Después no quedó nada que sembrar.",
    synopsis:
      "Trigo seco, un silo con luz y sin grano, una carretera recta hacia ninguna mesa. TIERRA MUERTA mira el hambre sin música de guerra: polvo, una cocina vacía y, al final, una semilla que no promete nada.",
    rootHz: 82.41,
    poster: "/films/tierra/01.jpg",
    video: "/films/tierra/open.mp4",
    plates: [
      { src: "/films/tierra/01.jpg", caption: "El campo que se rindió" },
      { src: "/films/tierra/02.jpg", caption: "El silo" },
      { src: "/films/tierra/03.jpg", caption: "La carretera" },
      { src: "/films/tierra/04.jpg", caption: "La mesa sin pan" },
      { src: "/films/tierra/05.jpg", caption: "La semilla" },
    ],
    chapters: [
      { t: 0, title: "Prólogo: la cosecha ausente" },
      { t: 60, title: "El campo que se rindió" },
      { t: 406, title: "El silo" },
      { t: 752, title: "La carretera" },
      { t: 1098, title: "La mesa sin pan" },
      { t: 1443, title: "La semilla" },
      { t: 1788, title: "Fin" },
    ],
    youtubeTitle:
      "TIERRA MUERTA (película completa) | Apocalipsis de hambre en 3D | 30 minutos",
    tags: `#TierraMuerta ${shared}`,
  },
  {
    slug: "senal",
    numeral: "IV",
    title: "Sin señal",
    element: "El silencio",
    logline: "Cuando murió la última frecuencia, el mundo se quedó sin testigos.",
    synopsis:
      "La torre ya no parpadea. La cabina marca cero. Un radio en el concreto no contesta, y las máquinas duermen en una sala que nadie reinicia. SIN SEÑAL cierra la antología: el apocalipsis no es el ruido. Es que nadie lo oye.",
    rootHz: 43.65,
    poster: "/films/senal/01.jpg",
    video: "/films/senal/open.mp4",
    plates: [
      { src: "/films/senal/01.jpg", caption: "La torre" },
      { src: "/films/senal/02.jpg", caption: "La cabina" },
      { src: "/films/senal/03.jpg", caption: "Nadie al otro lado" },
      { src: "/films/senal/04.jpg", caption: "La sala dormida" },
      { src: "/films/senal/05.jpg", caption: "El hemisferio oscuro" },
    ],
    chapters: [
      { t: 0, title: "Prólogo: frecuencia muerta" },
      { t: 60, title: "La torre" },
      { t: 406, title: "La cabina" },
      { t: 752, title: "Nadie al otro lado" },
      { t: 1098, title: "La sala dormida" },
      { t: 1443, title: "El hemisferio oscuro" },
      { t: 1788, title: "Fin" },
    ],
    youtubeTitle:
      "SIN SEÑAL (película completa) | El silencio del mundo en 3D | 30 minutos",
    tags: `#SinSeñal ${shared}`,
  },
];

export function getFilm(slug: string) {
  return FILMS.find((film) => film.slug === slug);
}
