'use client';

import { useAppStore } from '@/app/store';

export default function HomeModule() {
  const setActiveModule = useAppStore((s) => s.setActiveModule);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100 p-8">
      
      <h1 
        className="text-7xl md:text-8xl font-bold text-red-700 tracking-widest mb-2"
        style={{ fontFamily: 'var(--font-cinzel), serif' }}
      >
        VAMPIRO
      </h1>

      <h2 
        className="text-2xl md:text-3xl text-red-800 tracking-[0.4em] mb-12"
        style={{ fontFamily: 'var(--font-cinzel), serif' }}
      >
        A MÁSCARA V5
      </h2>

      <p className="text-zinc-500 mb-16 italic text-center max-w-md text-lg">
        "A máscara é um presente. E também uma prisão."
      </p>

      <div className="flex flex-col sm:flex-row gap-6">
        <button
          onClick={() => setActiveModule('mesa')}
          className="px-10 py-4 bg-red-900 hover:bg-red-800 text-white rounded-lg font-semibold transition-all hover:scale-105"
        >
          Entrar no mapa (Grid)
        </button>
        <button
          onClick={() => setActiveModule('ficha')}
          className="px-10 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-all hover:scale-105"
        >
          Criar Ficha
        </button>
      </div>
    </div>
  );
}