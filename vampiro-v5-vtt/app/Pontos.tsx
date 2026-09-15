'use client';

interface PontosProps {
  valor: number;
  max?: number;
  onChange?: (valor: number) => void;
  readOnly?: boolean;
}

export default function Pontos({ valor, max = 5, onChange, readOnly = false }: PontosProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          disabled={readOnly}
          onClick={() => onChange?.(p === valor ? p - 1 : p)}
          className={`w-3 h-3 rounded-full border transition-all ${
            p <= valor
              ? 'bg-red-600 border-red-500 shadow-[0_0_4px_rgba(220,38,38,0.6)]'
              : 'bg-transparent border-zinc-700'
          } ${!readOnly && 'hover:border-red-500 cursor-pointer'}`}
        />
      ))}
    </div>
  );
}