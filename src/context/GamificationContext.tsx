"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import RewardToastContainer from "@/components/RewardToastContainer";

export type ToastEvento =
  | { id: string; tipo: "recompensa"; xp: number; oro: number; color: string }
  | { id: string; tipo: "subida_nivel"; pilar: string; nivel: number; color: string }
  | { id: string; tipo: "cofre" };

// Omit no distribuye sobre uniones por defecto (keyof de una unión es la
// intersección de sus claves) — este helper sí distribuye, preservando cada
// variante del discriminated union sin el campo "id".
type SinId<T> = T extends { id: string } ? Omit<T, "id"> : never;
export type ToastEventoInput = SinId<ToastEvento>;

interface GamificationContextValue {
  toastQueue: ToastEvento[];
  enqueueToast: (evento: ToastEventoInput) => void;
  dismissToast: (id: string) => void;
  cofresPendientesCount: number;
  refreshCofres: () => Promise<void>;
  nuevoHabitoModalAbierto: boolean;
  abrirNuevoHabitoModal: () => void;
  cerrarNuevoHabitoModal: () => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

export function useGamificacion(): GamificationContextValue {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error("useGamificacion debe usarse dentro de GamificationProvider");
  }
  return ctx;
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `toast-${idCounter}`;
}

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [toastQueue, setToastQueue] = useState<ToastEvento[]>([]);
  const [cofresPendientesCount, setCofresPendientesCount] = useState(0);
  const [nuevoHabitoModalAbierto, setNuevoHabitoModalAbierto] = useState(false);

  const enqueueToast = useCallback((evento: ToastEventoInput) => {
    setToastQueue((prev) => [...prev, { ...evento, id: nextId() } as ToastEvento]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToastQueue((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshCofres = useCallback(async () => {
    const { count } = await supabase
      .from("cofres")
      .select("id_cofre", { count: "exact", head: true })
      .eq("reclamado", false);
    setCofresPendientesCount(count || 0);
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        toastQueue,
        enqueueToast,
        dismissToast,
        cofresPendientesCount,
        refreshCofres,
        nuevoHabitoModalAbierto,
        abrirNuevoHabitoModal: () => setNuevoHabitoModalAbierto(true),
        cerrarNuevoHabitoModal: () => setNuevoHabitoModalAbierto(false),
      }}
    >
      {children}
      <RewardToastContainer eventos={toastQueue} onDismiss={dismissToast} />
    </GamificationContext.Provider>
  );
}
