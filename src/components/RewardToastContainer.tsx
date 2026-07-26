"use client";

import RewardToast from "@/components/RewardToast";
import type { ToastEvento } from "@/context/GamificationContext";

interface RewardToastContainerProps {
  eventos: ToastEvento[];
  onDismiss: (id: string) => void;
}

export default function RewardToastContainer({ eventos, onDismiss }: RewardToastContainerProps) {
  const activo = eventos[0];
  if (!activo) return null;

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 max-w-xs">
      <RewardToast key={activo.id} evento={activo} onDismiss={() => onDismiss(activo.id)} />
    </div>
  );
}
