export interface Area {
  id_area: string;
  nombre: string;
  color: string;
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
