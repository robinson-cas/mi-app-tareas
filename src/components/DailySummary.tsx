interface DailySummaryProps {
  puntosHoy: number;
  puntosMeta: number;
  habitosCompletados: number;
  habitosTotal: number;
}

export default function DailySummary({
  puntosHoy,
  puntosMeta,
  habitosCompletados,
  habitosTotal,
}: DailySummaryProps) {
  const porcentaje = puntosMeta > 0 ? Math.round((puntosHoy / puntosMeta) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Resumen del Día
      </h2>
      <div className="grid grid-cols-3 gap-6 items-center">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">
            {puntosHoy}
            <span className="text-gray-300 text-xl font-normal"> / {puntosMeta}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Puntos Hoy</p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-500">Progreso</span>
            <span className="font-bold text-blue-600">{porcentaje}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">
            {habitosCompletados}
            <span className="text-gray-300 text-xl font-normal"> / {habitosTotal}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Hábitos Hechos</p>
        </div>
      </div>
    </div>
  );
}
