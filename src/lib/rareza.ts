import type { Rareza } from "@/types";

export interface RarezaConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  ring: string;
  text: string;
}

export const RAREZA_CONFIG: Record<Rareza, RarezaConfig> = {
  comun: {
    label: "Común",
    color: "#9ca3af",
    bg: "bg-gray-100",
    border: "border-gray-300",
    ring: "ring-gray-300",
    text: "text-gray-600",
  },
  raro: {
    label: "Raro",
    color: "#3b82f6",
    bg: "bg-blue-50",
    border: "border-blue-400",
    ring: "ring-blue-400",
    text: "text-blue-600",
  },
  epico: {
    label: "Épico",
    color: "#a855f7",
    bg: "bg-purple-50",
    border: "border-purple-400",
    ring: "ring-purple-400",
    text: "text-purple-600",
  },
  legendario: {
    label: "Legendario",
    color: "#f59e0b",
    bg: "bg-amber-50",
    border: "border-amber-400",
    ring: "ring-amber-400",
    text: "text-amber-600",
  },
};
