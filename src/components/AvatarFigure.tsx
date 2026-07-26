"use client";

import type { CosmeticoCatalogo, SlotCosmetico } from "@/types";
import { obtenerIcono } from "@/lib/iconos";
import { RAREZA_CONFIG } from "@/lib/rareza";

interface AvatarFigureProps {
  equipados: Partial<Record<SlotCosmetico, CosmeticoCatalogo>>;
}

function SlotBadge({
  cosmetico,
  clase,
}: {
  cosmetico: CosmeticoCatalogo | undefined;
  clase: string;
}) {
  if (!cosmetico) {
    return (
      <div
        className={`absolute ${clase} w-9 h-9 rounded-full border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center z-20`}
      />
    );
  }
  const config = RAREZA_CONFIG[cosmetico.rareza];
  const Icon = obtenerIcono(cosmetico.icono_lucide);
  return (
    <div
      title={`${cosmetico.nombre} · ${config.label}`}
      className={`absolute ${clase} w-9 h-9 rounded-full border-2 bg-white shadow-sm flex items-center justify-center z-20 ${
        cosmetico.rareza === "legendario" ? "animate-pulse" : ""
      }`}
      style={{ borderColor: config.color, boxShadow: `0 0 10px 1px ${config.color}66` }}
    >
      <Icon size={17} style={{ color: config.color }} strokeWidth={2} />
    </div>
  );
}

export default function AvatarFigure({ equipados }: AvatarFigureProps) {
  const aura = equipados.aura;
  const auraColor = aura ? RAREZA_CONFIG[aura.rareza].color : undefined;

  return (
    <div className="relative w-40 h-52 shrink-0 mx-auto">
      {aura && auraColor && (
        <div
          className={`absolute inset-0 rounded-full blur-2xl pointer-events-none ${
            aura.rareza === "legendario" ? "animate-pulse" : ""
          }`}
          style={{ backgroundColor: auraColor, opacity: 0.3 }}
        />
      )}

      <svg viewBox="0 0 100 140" className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-36 z-10">
        <circle cx="50" cy="22" r="14" fill="#334155" />
        <rect x="32" y="40" width="36" height="46" rx="14" fill="#334155" />
        <rect x="18" y="44" width="10" height="34" rx="5" fill="#334155" />
        <rect x="72" y="44" width="10" height="34" rx="5" fill="#334155" />
        <rect x="34" y="86" width="14" height="34" rx="6" fill="#334155" />
        <rect x="52" y="86" width="14" height="34" rx="6" fill="#334155" />
      </svg>

      {/* cabeza: arriba de la figura */}
      <SlotBadge cosmetico={equipados.cabeza} clase="-top-3 left-1/2 -translate-x-1/2" />
      {/* espalda: hombro derecho */}
      <SlotBadge cosmetico={equipados.espalda} clase="top-14 -right-3" />
      {/* arma: mano izquierda */}
      <SlotBadge cosmetico={equipados.arma} clase="top-24 -left-3" />
      {/* aura: indicador debajo de la figura (el efecto real es el glow de fondo) */}
      <SlotBadge cosmetico={equipados.aura} clase="-bottom-3 left-1/2 -translate-x-1/2" />
    </div>
  );
}
