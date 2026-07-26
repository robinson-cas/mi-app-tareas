import * as LucideIcons from "lucide-react";
import { HelpCircle, type LucideIcon } from "lucide-react";

/** Resuelve un ícono de lucide-react a partir de su nombre (string) guardado en la DB. */
export function obtenerIcono(nombre: string): LucideIcon {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[nombre];
  return Icon || HelpCircle;
}
