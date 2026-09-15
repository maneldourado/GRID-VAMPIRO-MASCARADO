'use client';

import { useAppStore } from '@/app/store';

export default function ConfigModule() {
  const { setActiveModule, config, setConfig, personagens, mapas, tokens, chat } = useAppStore();

  return (
    <div className="h-screen flex flex-col overflow-hidden font-[family-name:var(--font-inter)] text-zinc-100" style={{ background: '#050202' }}>

      <header className="h-12 flex items-center justify-between shrink-0 z-30 border-b"
        style={{ background: 'linear-gradient(180deg, #0a0404 0%, #070202 100%)', borderColor: 'rgba(127,29,29,0.35)' }}>
        <div className="flex items-center h-full">
          <div className="flex items-center px-4 h-full border-r" style={{ borderColor: 'rgba(127,29,29,0.35)' }}>
            <span className="font-[family-name:var(--font-cinzel)] text-3xl font-black leading-none"
              style={{ color: '#991b1b', textShadow: '0 0 12px rgba(153,27,27,0.5)' }}>V</span>
            <span className="font-[family-name:var(--font-cinzel)] text-xl font-black leading-none mt-1" style={{ color: '#dc2626' }}>5</span>
          </div>
          <nav className="flex items-center h-full text-[11px] font-medium">
            <button onClick={() => setActiveModule('mesa')} className="flex items-center gap-1.5 px-4 h-full text-zinc-500 hover:text-white transition-colors"><span>▦</span> Mesa</button>
            <button onClick={() => setActiveModule('ficha')} className="flex items-center gap-1.5 px-4 h-full text-zinc-500 hover:text-white transition-colors"><span>👤</span> Fichas</button>
            <button onClick={() => setActiveModule('biblioteca')} className="flex items-center gap-1.5 px-4 h-full text-zinc-500 hover:text-white transition-colors"><span>▦</span> Biblioteca</button>
            <button onClick={() => setActiveModule('cenario')} className="flex items-center gap-1.5 px-4 h-full text-zinc-500 hover:text-white transition-colors"><span>⚔</span> Cenário</button>
            <button onClick={() => setActiveModule('config')} className="flex items-center gap-1.5 px-4 h-full text-red-500 border-b-2 border-red-600"><span>⚙</span> Configurações</button>
          </nav>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-[family-name:var(--font-cinzel)] text-zinc-100 font-bold tracking-wider mb-2">Configurações</h1>
            <p className="text-sm text-zinc-500 mb-8">Ajuste o comportamento do sistema, aparência e parâmetros de jogo</p>

            {/* Estatísticas */}
            <section className="mb-6 rounded-sm border p-5"
              style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
              <h2 className="text-sm font-[family-name:var(--font-cinzel)] text-red-600 font-bold tracking-wider uppercase mb-4 flex items-center gap-2">
                <span>📊</span> Estatísticas do Sistema
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Fichas', valor: personagens.length, icone: '👤', cor: 'text-red-500' },
                  { label: 'Mapas', valor: mapas.length, icone: '🗺️', cor: 'text-blue-500' },
                  { label: 'Tokens', valor: tokens.length, icone: '🎭', cor: 'text-pink-500' },
                  { label: 'Mensagens', valor: chat.length, icone: '💬', cor: 'text-yellow-500' },
                ].map((s) => (
                  <div key={s.label} className="rounded-sm p-3 border text-center" style={{ background: 'rgba(20,5,5,0.5)', borderColor: 'rgba(127,29,29,0.3)' }}>
                    <div className="text-2xl mb-1">{s.icone}</div>
                    <div className={`text-2xl font-bold ${s.cor}`}>{s.valor}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Aparência */}
            <section className="mb-6 rounded-sm border p-5"
              style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
              <h2 className="text-sm font-[family-name:var(--font-cinzel)] text-red-600 font-bold tracking-wider uppercase mb-4 flex items-center gap-2">
                <span>🎨</span> Aparência
              </h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-sm border cursor-pointer hover:bg-red-950/20 transition-colors"
                  style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
                  <div>
                    <p className="text-sm text-zinc-200">Tema Escuro</p>
                    <p className="text-[11px] text-zinc-500">Fundo escuro com acentos vermelhos (recomendado)</p>
                  </div>
                  <input type="checkbox" checked={config.temaEscuro}
                    onChange={(e) => setConfig({ temaEscuro: e.target.checked })}
                    className="w-5 h-5 accent-red-700" />
                </label>
                <label className="flex items-center justify-between p-3 rounded-sm border cursor-pointer hover:bg-red-950/20 transition-colors"
                  style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
                  <div>
                    <p className="text-sm text-zinc-200">Mostrar Nomes nos Tokens</p>
                    <p className="text-[11px] text-zinc-500">Exibe o nome do personagem abaixo do token</p>
                  </div>
                  <input type="checkbox" checked={config.mostrarNomesTokens}
                    onChange={(e) => setConfig({ mostrarNomesTokens: e.target.checked })}
                    className="w-5 h-5 accent-red-700" />
                </label>
                <label className="flex items-center justify-between p-3 rounded-sm border cursor-pointer hover:bg-red-950/20 transition-colors"
                  style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
                  <div>
                    <p className="text-sm text-zinc-200">Mostrar Grade Sempre</p>
                    <p className="text-[11px] text-zinc-500">Mantém o grid visível mesmo sem mapa carregado</p>
                  </div>
                  <input type="checkbox" checked={config.mostrarGradeSempre}
                    onChange={(e) => setConfig({ mostrarGradeSempre: e.target.checked })}
                    className="w-5 h-5 accent-red-700" />
                </label>
              </div>
            </section>

            {/* Jogo */}
            <section className="mb-6 rounded-sm border p-5"
              style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
              <h2 className="text-sm font-[family-name:var(--font-cinzel)] text-red-600 font-bold tracking-wider uppercase mb-4 flex items-center gap-2">
                <span>🎲</span> Regras de Jogo
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm text-zinc-200">Escala Padrão</p>
                      <p className="text-[11px] text-zinc-500">Metros por quadrado no grid</p>
                    </div>
                    <span className="text-sm text-red-500 font-bold">{config.escalaPadrao.toFixed(1)} m</span>
                  </div>
                  <input type="range" min="0.5" max="5" step="0.1" value={config.escalaPadrao}
                    onChange={(e) => setConfig({ escalaPadrao: parseFloat(e.target.value) })}
                    className="w-full accent-red-700" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm text-zinc-200">Volume dos Efeitos</p>
                      <p className="text-[11px] text-zinc-500">Som ao rolar dados, mover tokens, etc.</p>
                    </div>
                    <span className="text-sm text-red-500 font-bold">{config.volumeEfeitos}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={config.volumeEfeitos}
                    onChange={(e) => setConfig({ volumeEfeitos: parseInt(e.target.value) })}
                    className="w-full accent-red-700" />
                </div>

                <label className="flex items-center justify-between p-3 rounded-sm border cursor-pointer hover:bg-red-950/20 transition-colors"
                  style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
                  <div>
                    <p className="text-sm text-zinc-200">Salvar Chat Automaticamente</p>
                    <p className="text-[11px] text-zinc-500">Mantém as últimas 100 mensagens entre sessões</p>
                  </div>
                  <input type="checkbox" checked={config.autoSalvarChat}
                    onChange={(e) => setConfig({ autoSalvarChat: e.target.checked })}
                    className="w-5 h-5 accent-red-700" />
                </label>
              </div>
            </section>

            {/* Dados */}
            <section className="mb-6 rounded-sm border p-5"
              style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
              <h2 className="text-sm font-[family-name:var(--font-cinzel)] text-red-600 font-bold tracking-wider uppercase mb-4 flex items-center gap-2">
                <span>💾</span> Dados & Backup
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-3 rounded-sm text-sm text-zinc-300 hover:text-white border transition-colors text-left"
                  style={{ borderColor: 'rgba(127,29,29,0.4)', background: 'rgba(20,5,5,0.5)' }}
                  onClick={() => {
                    const data = JSON.stringify(useAppStore.getState(), null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `vampiro-v5-backup-${Date.now()}.json`; a.click();
                  }}>
                  <p className="font-semibold">📥 Exportar Backup</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Salvar todos os dados em JSON</p>
                </button>
                <button className="px-4 py-3 rounded-sm text-sm text-zinc-300 hover:text-white border transition-colors text-left"
                  style={{ borderColor: 'rgba(127,29,29,0.4)', background: 'rgba(20,5,5,0.5)' }}
                  onClick={() => {
                    if (confirm('⚠️ Isso apagará TODOS os dados (fichas, mapas, tokens, chat). Continuar?')) {
                      localStorage.removeItem('vampiro-v5-store');
                      location.reload();
                    }
                  }}>
                  <p className="font-semibold text-red-400">🗑️ Resetar Sistema</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Apagar todos os dados salvos</p>
                </button>
              </div>
            </section>

            {/* Sobre */}
            <section className="rounded-sm border p-5 text-center"
              style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
              <div className="text-3xl mb-2 font-[family-name:var(--font-cinzel)] font-black text-red-700 tracking-widest">V5</div>
              <p className="text-xs text-zinc-500">Vampiro: A Máscara — Mesa & Ficha</p>
              <p className="text-[10px] text-zinc-700 mt-1">Versão 1.0.0 — Sistema de VTT para V5</p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}