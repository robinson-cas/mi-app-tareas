import type { Area, CosmeticoCatalogo, NivelArea, NivelInfo, Rareza } from "@/types";

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Recompensa variable por hábito completado, independiente de habito.puntos. */
export function rolarRecompensa(): { oro: number; xp: number } {
  return { oro: randomInt(10, 50), xp: randomInt(15, 30) };
}

const TABLA_RAREZA: { rareza: Rareza; peso: number }[] = [
  { rareza: "comun", peso: 70 },
  { rareza: "raro", peso: 20 },
  { rareza: "epico", peso: 9 },
  { rareza: "legendario", peso: 1 },
];

export function rolarRarezaCofre(): Rareza {
  const roll = Math.random() * 100;
  let acumulado = 0;
  for (const { rareza, peso } of TABLA_RAREZA) {
    acumulado += peso;
    if (roll < acumulado) return rareza;
  }
  return "comun";
}

/** XP acumulada necesaria para HABER alcanzado `nivel`. Nivel 1 = 0 xp. */
export function umbralXp(nivel: number): number {
  return (100 * nivel * (nivel - 1)) / 2;
}

export function calcularNivel(xpTotal: number): NivelInfo {
  const xp = Math.max(0, xpTotal);
  let nivel = 1;
  while (umbralXp(nivel + 1) <= xp) nivel++;

  const xpBase = umbralXp(nivel);
  const xpNecesariaProximoNivel = umbralXp(nivel + 1) - xpBase;
  const xpEnNivelActual = xp - xpBase;
  const progresoPct =
    xpNecesariaProximoNivel > 0
      ? Math.min(100, Math.floor((xpEnNivelActual / xpNecesariaProximoNivel) * 100))
      : 100;

  return { nivel, xpEnNivelActual, xpNecesariaProximoNivel, progresoPct };
}

/**
 * Deriva NivelArea[] a partir de las áreas, el mapeo histórico hábito->área
 * (SIN filtrar por estado_activo, para no perder XP de hábitos desactivados)
 * y los registros históricos completados (con su xp_ganado).
 */
export function construirNivelesPorArea(
  areas: Area[],
  habitosHistoricos: { id_habito: string; id_area: string }[],
  registrosHistoricos: { id_habito: string; xp_ganado: number }[]
): NivelArea[] {
  const areaPorHabito: Record<string, string> = {};
  habitosHistoricos.forEach((h) => {
    areaPorHabito[h.id_habito] = h.id_area;
  });

  const xpPorArea: Record<string, number> = {};
  registrosHistoricos.forEach((r) => {
    const areaId = areaPorHabito[r.id_habito];
    if (areaId) {
      xpPorArea[areaId] = (xpPorArea[areaId] || 0) + (r.xp_ganado || 0);
    }
  });

  return areas.map((a) => {
    const xpTotal = xpPorArea[a.id_area] || 0;
    return { id_area: a.id_area, nombre: a.nombre, color: a.color, abreviatura: a.abreviatura, xp_total: xpTotal, ...calcularNivel(xpTotal) };
  });
}

/** Nivel de personaje global = promedio (piso) de los niveles de los pilares. */
export function calcularNivelGlobal(nivelesPilares: number[]): number {
  if (nivelesPilares.length === 0) return 1;
  const promedio = nivelesPilares.reduce((s, n) => s + n, 0) / nivelesPilares.length;
  return Math.floor(promedio);
}

const ORO_FALLBACK_POR_RAREZA: Record<Rareza, number> = {
  comun: 20,
  raro: 60,
  epico: 150,
  legendario: 400,
};

export type ResultadoCofre =
  | { tipo: "cosmetico"; cosmetico: CosmeticoCatalogo }
  | { tipo: "oro"; cantidad: number };

/** Evaluado al ABRIR el cofre, contra el inventario en ese momento (no al crearlo). */
export function elegirCosmeticoParaCofre(
  rareza: Rareza,
  catalogoCompleto: CosmeticoCatalogo[],
  idsCosmeticosPoseidos: Set<string>
): ResultadoCofre {
  const candidatos = catalogoCompleto.filter(
    (c) => c.rareza === rareza && !idsCosmeticosPoseidos.has(c.id_cosmetico)
  );
  if (candidatos.length === 0) {
    return { tipo: "oro", cantidad: ORO_FALLBACK_POR_RAREZA[rareza] };
  }
  return { tipo: "cosmetico", cosmetico: candidatos[randomInt(0, candidatos.length - 1)] };
}
