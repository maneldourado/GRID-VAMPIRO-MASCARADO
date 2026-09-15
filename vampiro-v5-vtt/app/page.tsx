'use client';

import { useAppStore } from '@/app/store';
import HomeModule from '@/app/HomeModule';
import MesaModule from '@/app/MesaModule';
import FichaModule from '@/app/FichaModule';
import BibliotecaModule from '@/app/BibliotecaModule';
import ConfigModule from '@/app/ConfigModule';

export default function App() {
  const activeModule = useAppStore((s) => s.activeModule);

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950">
      {activeModule === 'home' && <HomeModule />}
      {activeModule === 'mesa' && <MesaModule />}
      {activeModule === 'ficha' && <FichaModule />}
      {activeModule === 'biblioteca' && <BibliotecaModule />}
      {activeModule === 'cenario' && (
        <div className="flex items-center justify-center h-screen text-zinc-500">
          <div className="text-center">
            <p className="text-4xl mb-4">⚔</p>
            <p className="text-lg">Cenário — Em breve</p>
            <button
              onClick={() => useAppStore.getState().setActiveModule('home')}
              className="mt-4 px-4 py-2 rounded bg-red-900 hover:bg-red-800 text-white text-sm"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
      {activeModule === 'config' && <ConfigModule />}
    </div>
  );
}