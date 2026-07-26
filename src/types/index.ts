export interface Area {
  id_area: string;
  nombre: string;
  color: string;
  abreviatura: string;
}

export interface Habito {
  id_habito: string;
  id_area: string;
  nombre: string;
  puntos: number;
  estado_activo: boolean;
  areas?: Area;
  dias_habito?: { num_dia: number }[];
}

export interface HabitoHoy {
  id_habito: string;
  nombre: string;
  puntos: number;
  id_area: string;
  area_nombre: string;
  area_color: string;
  completado: boolean;
  id_registro: string | null;
}

export interface RendimientoArea {
  nombre: string;
  color: string;
  puntos_ganados: number;
  puntos_meta: number;
}

// --- Gamificación RPG ---

export type Rareza = "comun" | "raro" | "epico" | "legendario";
export type SlotCosmetico = "aura" | "cabeza" | "arma" | "espalda";
export type OrigenCofre = "nivel" | "dia_completo";
export type OrigenInventario = "cofre" | "tienda";
export type RecompensaCofreTipo = "cosmetico" | "oro";

export interface CosmeticoCatalogo {
  id_cosmetico: string;
  nombre: string;
  slot: SlotCosmetico;
  rareza: Rareza;
  icono_lucide: string;
  precio_oro: number | null;
}

export interface InventarioItem {
  id_inventario: string;
  id_cosmetico: string;
  slot: SlotCosmetico;
  origen: OrigenInventario;
  oro_pagado: number | null;
  equipado: boolean;
  obtenido_en: string;
  cosmeticos_catalogo?: CosmeticoCatalogo;
}

export interface Cofre {
  id_cofre: string;
  origen: OrigenCofre;
  id_area: string | null;
  nivel_alcanzado: number | null;
  fecha: string | null;
  rareza: Rareza;
  reclamado: boolean;
  abierto_en: string | null;
  recompensa_tipo: RecompensaCofreTipo | null;
  id_cosmetico_otorgado: string | null;
  oro_otorgado: number | null;
  creado_en: string;
}

export interface Cupon {
  id_cupon: string;
  nombre: string;
  costo_oro: number;
  activo: boolean;
  creado_en: string;
}

export interface CanjeCupon {
  id_canje: string;
  id_cupon: string | null;
  nombre_cupon_snapshot: string;
  costo_oro_pagado: number;
  canjeado_en: string;
}

export interface NivelInfo {
  nivel: number;
  xpEnNivelActual: number;
  xpNecesariaProximoNivel: number;
  progresoPct: number;
}

export interface NivelArea extends NivelInfo {
  id_area: string;
  nombre: string;
  color: string;
  abreviatura: string;
  xp_total: number;
}

export interface PerfilJugador {
  nivel_global: number;
  oro_balance: number;
  pilares: NivelArea[];
}
