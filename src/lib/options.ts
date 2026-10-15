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

export const label = (list: { value: string; label: string }[], v?: string | null) =>
  list.find((x) => x.value === v)?.label ?? (v || "—");
