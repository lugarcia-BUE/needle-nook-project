export const TECHNIQUES = [
  { value: "crochet", label: "Crochet" },
  { value: "dos_agujas", label: "Dos agujas" },
  { value: "otra", label: "Otra técnica" },
];
export const DIFFICULTIES = [
  { value: "principiante", label: "Principiante" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];
export const STATUSES = [
  { value: "activo", label: "En curso" },
  { value: "pausado", label: "Pausado" },
  { value: "terminado", label: "Terminado" },
  { value: "archivado", label: "Archivado" },
];
export const EXPERIENCE = [
  { value: "principiante", label: "Estoy empezando" },
  { value: "intermedio", label: "Tengo experiencia" },
  { value: "avanzado", label: "Tejo hace mucho" },
];
export const SECTION_PRESETS = [
  "Espalda",
  "Delantero",
  "Manga izquierda",
  "Manga derecha",
  "Cuello",
  "Puños",
  "Terminaciones",
];

export const MATERIAL_KINDS = [
  { value: "hilado", label: "Hilado / Lana" },
  { value: "aguja", label: "Aguja" },
  { value: "accesorio", label: "Accesorio" },
];

export const NEEDLE_TYPES = [
  { value: "crochet", label: "Crochet" },
  { value: "rectas", label: "Dos agujas rectas" },
  { value: "circulares", label: "Circulares" },
  { value: "intercambiables", label: "Circulares intercambiables" },
  { value: "doble_punta", label: "Doble punta" },
  { value: "tunecino", label: "Tunecino" },
  { value: "otra", label: "Otra" },
];

export const YARN_WEIGHTS = [
  { value: "lace", label: "Lace (0 - Muy fino)" },
  { value: "fingering", label: "Fingering / Super Fine (1)" },
  { value: "sport", label: "Sport / Fine (2)" },
  { value: "dk", label: "DK / Light Worsted (3)" },
  { value: "worsted", label: "Worsted / Aran (4 - Medio)" },
  { value: "bulky", label: "Bulky / Chunky (5)" },
  { value: "super_bulky", label: "Super Bulky (6)" },
  { value: "jumbo", label: "Jumbo (7)" },
];

export const label = (list: { value: string; label: string }[], v?: string | null) =>
  list.find((x) => x.value === v)?.label ?? (v || "—");
