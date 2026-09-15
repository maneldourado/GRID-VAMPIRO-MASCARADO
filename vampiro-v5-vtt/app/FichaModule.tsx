'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore, ATRIBUTOS_LABELS, GRUPOS_ATRIBUTOS } from '@/app/store';

/* ============ COMPONENTES AUXILIARES ============ */

function Dots({ valor, max = 5, onChange, tamanho = 'md' }: {
  valor: number; max?: number; onChange?: (v: number) => void; tamanho?: 'sm' | 'md' | 'xs';
}) {
  const size = tamanho === 'xs' ? 'w-2 h-2' : tamanho === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange?.(p === valor ? p - 1 : p)}
          className={`${size} rounded-full transition-all hover:scale-125 ${
            p <= valor
              ? 'bg-red-600'
              : 'bg-transparent border border-zinc-700'
          }`}
          style={p <= valor ? { boxShadow: '0 0 5px rgba(220,38,38,0.7)' } : {}}
        />
      ))}
    </div>
  );
}

function Modal({ titulo, children, onClose }: { titulo: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="rounded border p-5 w-96 shadow-2xl"
        style={{ background: '#0a0404', borderColor: 'rgba(153,27,27,0.5)' }}
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-bold text-red-500 mb-4 uppercase tracking-wider">{titulo}</h3>
        {children}
      </div>
    </div>
  );
}

/* ============ SEÇÕES DA SIDEBAR ============ */

const SECOES = [
  { id: 'identidade', nome: 'Ficha de Personagem', icone: '👤' },
  { id: 'atributos', nome: 'Atributos', icone: '⬡' },
  { id: 'pericias', nome: 'Habilidades', icone: '◎' },
  { id: 'disciplinas', nome: 'Disciplinas', icone: '👁' },
  { id: 'vantagens', nome: 'Vantagens', icone: '★' },
  { id: 'rituais', nome: 'Rituais', icone: '△' },
  { id: 'equipamentos', nome: 'Equipamentos', icone: '🧳' },
  { id: 'historico', nome: 'Histórico', icone: '📖' },
  { id: 'notas', nome: 'Notas', icone: '📝' },
];

/* ============ FICHA PRINCIPAL ============ */

export default function FichaModule() {
  const {
    personagem: p,
    setPersonagem, setAtributo, setPericia, setDisciplina,
    addVantagem, removeVantagem, updateVantagem,
    addRitual, removeRitual,
    addEquipamento, removeEquipamento,
    addHistorico, removeHistorico,
    setNotas,
    setActiveModule,
  } = useAppStore();

  /* Fallbacks */
  const atributos = p.atributos ?? {
    forca: 0, destreza: 0, vigor: 0,
    carisma: 0, manipulacao: 0, compostura: 0,
    inteligencia: 0, raciocinio: 0, determinacao: 0,
  };
  const pericias = p.pericias ?? {};
  const disciplinas = p.disciplinas ?? {};
  const vantagens = p.vantagens ?? [];
  const rituais = p.rituais ?? [];
  const equipamentos = p.equipamentos ?? [];
  const historico = p.historico ?? [];
  const notas = p.notas ?? '';

  const [secaoAtiva, setSecaoAtiva] = useState('identidade');
  const [novoEquip, setNovoEquip] = useState('');

  const [modalDisciplina, setModalDisciplina] = useState<{ nome: string; nivel: number } | null>(null);
  const [modalVantagem, setModalVantagem] = useState<{ idx: number | null; nome: string; descricao: string } | null>(null);
  const [modalRitual, setModalRitual] = useState<{ nome: string; nivel: number; descricao: string } | null>(null);
  const [modalHistorico, setModalHistorico] = useState<{ data: string; titulo: string; descricao: string } | null>(null);

  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const scrollTo = (id: string) => {
    setSecaoAtiva(id);
    refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const main = document.getElementById('ficha-scroll');
    if (!main) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSecaoAtiva(e.target.id)),
      { root: main, threshold: 0.25 }
    );
    SECOES.forEach((s) => { const el = refs.current[s.id]; if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  /* Upload de avatar */
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPersonagem({ avatarUrl: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden font-[family-name:var(--font-inter)] text-zinc-200"
      style={{
        background: 'linear-gradient(135deg, #0a0202 0%, #1a0505 40%, #0a0202 100%)',
      }}>

      {/* ===== TOPBAR ===== */}
      <header className="h-14 flex items-center justify-between shrink-0 z-30 border-b px-5 relative"
        style={{
          background: 'linear-gradient(180deg, #0a0404 0%, #080202 100%)',
          borderColor: 'rgba(127,29,29,0.4)',
        }}>
        <div className="flex items-center gap-4">
          {/* V5 Logo */}
          <div className="flex items-baseline gap-0.5">
            <span className="font-[family-name:var(--font-cinzel)] text-3xl font-black leading-none"
              style={{ color: '#991b1b', textShadow: '0 0 10px rgba(153,27,27,0.7)' }}>V</span>
            <span className="font-[family-name:var(--font-cinzel)] text-xl font-black leading-none"
              style={{ color: '#dc2626' }}>5</span>
          </div>

          {/* Título */}
          <h1 className="text-lg font-[family-name:var(--font-cinzel)] text-zinc-100 font-semibold tracking-wide">
            Editor de Ficha
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de Crônica */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs"
            style={{ borderColor: 'rgba(127,29,29,0.4)', background: 'rgba(20,10,10,0.6)' }}>
            <span className="text-zinc-500">Crônica:</span>
            <span className="text-zinc-200">{p.cronica}</span>
          </div>

          <button className="p-1.5 rounded-sm text-zinc-500 hover:text-white transition-colors" title="Usuários">👥</button>
          <button className="p-1.5 rounded-sm text-zinc-500 hover:text-white transition-colors" title="Config">⚙</button>
          <button onClick={() => setActiveModule('home')} className="p-1.5 rounded-sm text-zinc-500 hover:text-red-500 transition-colors" title="Fechar">✕</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ===== SIDEBAR ESQUERDA ===== */}
        <aside className="w-56 shrink-0 overflow-y-auto border-r relative"
          style={{
            background: 'linear-gradient(180deg, #0a0404 0%, #080202 100%)',
            borderColor: 'rgba(127,29,29,0.3)',
          }}>
          <nav className="py-3">
            {SECOES.map((s) => {
              const ativo = secaoAtiva === s.id;
              return (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all relative ${
                    ativo ? 'text-red-400 font-medium' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  style={ativo ? {
                    background: 'linear-gradient(90deg, rgba(127,29,29,0.3) 0%, rgba(127,29,29,0.05) 100%)',
                    boxShadow: 'inset 3px 0 0 #dc2626',
                  } : {}}>
                  <span className="text-base w-5 text-center">{s.icone}</span>
                  <span>{s.nome}</span>
                </button>
              );
            })}
          </nav>

          {/* Citação decorativa no rodapé */}
          <div className="absolute bottom-4 left-0 right-0 px-4 text-center">
            <p className="text-[9px] italic leading-tight font-serif"
              style={{ color: '#4a0f0f' }}>
              "A noite é um oceano,<br/>e nós somos seus filhos."
            </p>
            <div className="mt-3 flex items-center justify-center">
              <span className="font-[family-name:var(--font-cinzel)] text-3xl font-black"
                style={{ color: '#5a1010', textShadow: '0 0 10px rgba(90,16,16,0.5)' }}>V</span>
            </div>
          </div>
        </aside>

        {/* ===== CONTEÚDO PRINCIPAL ===== */}
        <main id="ficha-scroll" className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.85fr)] gap-3 max-w-[1700px] mx-auto">

            {/* ============ COLUNA 1 ============ */}
            <div className="space-y-3">

              {/* ===== IDENTIDADE ===== */}
              <div id="identidade" ref={(el) => { refs.current['identidade'] = el; }}
                className="rounded border relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #0d0505 0%, #150808 50%, #0a0303 100%)',
                  borderColor: 'rgba(127,29,29,0.4)',
                }}>
                {/* Linha vermelha no topo */}
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, transparent, #991b1b, transparent)' }}></div>

                <div className="p-4 flex gap-4">
                  {/* ===== PORTRAIT / AVATAR ===== */}
                  <div className="relative shrink-0 group">
                    <div className="w-28 h-36 rounded-sm overflow-hidden relative border-2"
                      style={{
                        borderColor: '#991b1b',
                        boxShadow: '0 0 20px rgba(153,27,27,0.5), inset 0 0 20px rgba(0,0,0,0.8)',
                      }}>
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: 'radial-gradient(circle, #2a0808 0%, #0a0303 100%)' }}>
                          <span className="text-red-900 font-[family-name:var(--font-cinzel)] text-4xl font-black">K</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>

                      {/* Botão de upload (aparece no hover) */}
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold flex-col gap-1">
                        <span className="text-2xl">📷</span>
                        <span>Alterar foto</span>
                      </button>
                    </div>

                    {/* Cantos ornamentais */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: '#dc2626' }}></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: '#dc2626' }}></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: '#dc2626' }}></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: '#dc2626' }}></div>

                    <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </div>

                  {/* ===== INFO ===== */}
                  <div className="flex-1 min-w-0">
                    <input value={p.nome} onChange={(e) => setPersonagem({ nome: e.target.value })}
                      className="text-2xl font-[family-name:var(--font-cinzel)] text-zinc-100 font-bold bg-transparent border-b border-transparent hover:border-red-900/50 focus:border-red-700 focus:outline-none w-full tracking-wide" />

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-red-600 text-sm">🌹</span>
                      <input value={p.cla} onChange={(e) => setPersonagem({ cla: e.target.value })}
                        className="text-red-500 text-sm bg-transparent border-b border-transparent hover:border-red-900/50 focus:border-red-700 focus:outline-none font-medium" />
                    </div>

                    <div className="mt-2 text-xs text-zinc-400 space-y-1">
                      <p className="flex items-center gap-1">
                        Geração <input type="number" value={p.geracao} onChange={(e) => setPersonagem({ geracao: parseInt(e.target.value) || 0 })}
                          className="w-10 bg-zinc-900/50 border border-red-900/30 rounded px-1 text-zinc-200 text-center" />
                        <span className="text-zinc-700 mx-1">|</span>
                        XP <input type="number" value={p.xp} onChange={(e) => setPersonagem({ xp: parseInt(e.target.value) || 0 })}
                          className="w-10 bg-zinc-900/50 border border-red-900/30 rounded px-1 text-zinc-200 text-center" />
                      </p>
                      <p>Conceito: <input value={p.conceito} onChange={(e) => setPersonagem({ conceito: e.target.value })}
                        className="bg-zinc-900/50 border border-red-900/30 rounded px-1 text-zinc-300 w-40" /></p>
                      <p>Crônica: <input value={p.cronica} onChange={(e) => setPersonagem({ cronica: e.target.value })}
                        className="bg-zinc-900/50 border border-red-900/30 rounded px-1 text-zinc-300 w-40" /></p>
                    </div>
                  </div>

                  {/* ===== DETALHES (coluna direita) ===== */}
                  <div className="w-40 shrink-0 text-[10px] space-y-1.5 border-l pl-3"
                    style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
                    {([
                      ['Idade Aparente', 'idadeAparente'],
                      ['Idade Real', 'idadeReal'],
                      ['Ocupação', 'ocupacao'],
                      ['Status', 'status'],
                      ['Alcunha', 'alcunha'],
                    ] as [string, 'idadeAparente' | 'idadeReal' | 'ocupacao' | 'status' | 'alcunha'][]).map(([label, key]) => (
                      <div key={key} className="flex justify-between items-center gap-2">
                        <span className="text-zinc-600 whitespace-nowrap">{label}:</span>
                        <input value={String(p[key] ?? '')} onChange={(e) => {
                          const v = typeof p[key] === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
                          setPersonagem({ [key]: v } as any);
                        }}
                          className="text-zinc-300 bg-transparent border-b border-transparent hover:border-red-900/50 focus:border-red-700 focus:outline-none text-right w-20" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Citação */}
                <div className="px-4 pb-3">
                  <p className="text-[10px] italic font-serif border-t pt-2 text-center"
                    style={{ color: '#7f1d1d', borderColor: 'rgba(127,29,29,0.3)' }}>
                    "Poder não é o que você tem. É o que os outros acreditam que você tem."
                  </p>
                </div>
              </div>

              {/* ===== ATRIBUTOS ===== */}
              <div id="atributos" ref={(el) => { refs.current['atributos'] = el; }}
                className="rounded border p-4"
                style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-600 text-sm">⬡</span>
                  <h3 className="text-sm font-[family-name:var(--font-cinzel)] text-zinc-200 font-bold tracking-wider uppercase">Atributos</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
                  {([
                    ['forca', 'Força'], ['carisma', 'Carisma'],
                    ['destreza', 'Destreza'], ['manipulacao', 'Manipulação'],
                    ['vigor', 'Vigor'], ['inteligencia', 'Inteligência'],
                  ] as [keyof typeof atributos, string][]).map(([k, nome]) => (
                    <div key={k} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-zinc-400 w-20">{nome}</span>
                      <Dots valor={atributos[k]} onChange={(v) => setAtributo(k, v)} />
                      <span className="text-xs text-zinc-500 w-4 text-right font-mono">{atributos[k]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ===== PERÍCIAS ===== */}
              <div id="pericias" ref={(el) => { refs.current['pericias'] = el; }}
                className="rounded border p-4"
                style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-600 text-sm">◎</span>
                  <h3 className="text-sm font-[family-name:var(--font-cinzel)] text-zinc-200 font-bold tracking-wider uppercase">Perícias</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
                  {Object.entries(pericias).map(([nome, valor]) => (
                    <div key={nome} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-zinc-400 truncate">{nome}</span>
                      <Dots valor={valor} onChange={(v) => setPericia(nome, v)} tamanho="sm" />
                      <span className="text-[10px] text-zinc-600 w-3 text-right font-mono">{valor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ===== DISCIPLINAS ===== */}
              <div id="disciplinas" ref={(el) => { refs.current['disciplinas'] = el; }}
                className="rounded border p-4"
                style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-600 text-sm">👁</span>
                  <h3 className="text-sm font-[family-name:var(--font-cinzel)] text-zinc-200 font-bold tracking-wider uppercase">Disciplinas</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(disciplinas).map(([nome, valor]) => (
                    <div key={nome} className="group flex items-center gap-2 rounded p-2 border transition-colors"
                      style={{ background: 'rgba(20,5,5,0.5)', borderColor: 'rgba(127,29,29,0.3)' }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'radial-gradient(circle, #2a0808 0%, #0a0303 100%)', border: '1px solid #991b1b' }}>
                        <span className="text-red-500 text-xs">🩸</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-zinc-300 truncate">{nome}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((pt) => (
                            <button key={pt} onClick={() => setDisciplina(nome, pt === valor ? pt - 1 : pt)}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${pt <= valor ? 'bg-red-600' : 'bg-zinc-800'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-red-500 font-bold">{valor}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setModalDisciplina({ nome: '', nivel: 1 })}
                  className="w-full text-[10px] text-zinc-500 hover:text-red-500 border border-zinc-800 hover:border-red-900 rounded py-1.5 mt-2 transition-colors">
                  + Adicionar Disciplina
                </button>
              </div>
            </div>

            {/* ============ COLUNA 2 ============ */}
            <div className="space-y-3">

              {/* VANTAGENS */}
              <div id="vantagens" ref={(el) => { refs.current['vantagens'] = el; }}
                className="rounded border p-4"
                style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-600 text-sm">★</span>
                  <h3 className="text-sm font-[family-name:var(--font-cinzel)] text-zinc-200 font-bold tracking-wider uppercase">Vantagens</h3>
                </div>
                <div className="space-y-2">
                  {vantagens.map((v, i) => (
                    <div key={i} className="group flex gap-3 rounded p-2 border transition-colors"
                      style={{ background: 'rgba(20,5,5,0.5)', borderColor: 'rgba(127,29,29,0.3)' }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'radial-gradient(circle, #2a0808 0%, #0a0303 100%)', border: '1px solid #991b1b' }}>
                        <span className="text-red-500 text-lg">✧</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-200">{v.nome}</p>
                        <p className="text-[10px] text-zinc-500 leading-snug mt-0.5">{v.descricao}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                        <button onClick={() => setModalVantagem({ idx: i, nome: v.nome, descricao: v.descricao })}
                          className="text-zinc-500 hover:text-white text-xs">✎</button>
                        <button onClick={() => removeVantagem(i)}
                          className="text-zinc-500 hover:text-red-500 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setModalVantagem({ idx: null, nome: '', descricao: '' })}
                  className="w-full text-[10px] text-zinc-500 hover:text-red-500 border border-zinc-800 hover:border-red-900 rounded py-1.5 mt-3 transition-colors">
                  + Adicionar Vantagem
                </button>
              </div>

              {/* RITUAIS */}
              <div id="rituais" ref={(el) => { refs.current['rituais'] = el; }}
                className="rounded border p-4"
                style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-600 text-sm">△</span>
                  <h3 className="text-sm font-[family-name:var(--font-cinzel)] text-zinc-200 font-bold tracking-wider uppercase">Rituais</h3>
                </div>
                {rituais.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 text-center py-6 italic">Nenhum ritual aprendido ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {rituais.map((r, i) => (
                      <div key={i} className="group flex gap-3 rounded p-2 border"
                        style={{ background: 'rgba(20,5,5,0.5)', borderColor: 'rgba(127,29,29,0.3)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: 'radial-gradient(circle, #2a0828 0%, #0a030a 100%)', border: '1px solid #7f1d7f' }}>
                          <span className="text-purple-400 text-xs font-bold">{r.nivel}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-zinc-200">{r.nome}</p>
                          <p className="text-[10px] text-zinc-500">{r.descricao}</p>
                        </div>
                        <button onClick={() => removeRitual(i)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => setModalRitual({ nome: '', nivel: 1, descricao: '' })}
                  className="w-full text-[10px] text-zinc-500 hover:text-red-500 border border-zinc-800 hover:border-red-900 rounded py-1.5 mt-3 transition-colors">
                  + Adicionar Ritual
                </button>
              </div>

              {/* EQUIPAMENTOS */}
              <div id="equipamentos" ref={(el) => { refs.current['equipamentos'] = el; }}
                className="rounded border p-4"
                style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-600 text-sm">🧳</span>
                  <h3 className="text-sm font-[family-name:var(--font-cinzel)] text-zinc-200 font-bold tracking-wider uppercase">Equipamentos</h3>
                </div>
                <ul className="space-y-1.5">
                  {equipamentos.map((eq, i) => (
                    <li key={i} className="group flex items-center gap-2 text-[11px] text-zinc-400 hover:bg-red-950/20 rounded px-1 py-0.5">
                      <span className="text-zinc-600">✎</span>
                      <span className="flex-1">{eq}</span>
                      <button onClick={() => removeEquipamento(i)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 text-[10px]">✕</button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-1 mt-3">
                  <input type="text" value={novoEquip} onChange={(e) => setNovoEquip(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && novoEquip.trim()) { addEquipamento(novoEquip.trim()); setNovoEquip(''); } }}
                    placeholder="Novo equipamento..."
                    className="flex-1 rounded border px-2 py-1 text-[10px] text-white focus:outline-none focus:border-red-700"
                    style={{ background: 'rgba(20,5,5,0.5)', borderColor: 'rgba(127,29,29,0.3)' }} />
                  <button onClick={() => { if (novoEquip.trim()) { addEquipamento(novoEquip.trim()); setNovoEquip(''); } }}
                    className="px-2 text-[10px] rounded border transition-colors"
                    style={{ background: 'rgba(127,29,29,0.3)', borderColor: 'rgba(153,27,27,0.5)', color: '#fca5a5' }}>+</button>
                </div>
              </div>
            </div>

            {/* ============ COLUNA 3 ============ */}
            <div className="space-y-3">

              {/* ===== CLÃ ===== */}
              <div className="rounded border p-4 text-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1a0505 0%, #0d0303 100%)',
                  borderColor: 'rgba(153,27,27,0.6)',
                  boxShadow: '0 0 30px rgba(153,27,27,0.15), inset 0 0 30px rgba(153,27,27,0.1)',
                }}>
                <div className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(153,27,27,0.4) 0%, transparent 60%)' }}></div>

                <div className="relative">
                  {/* Logo do clã */}
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center"
                    style={{ background: 'radial-gradient(circle, #2a0808 0%, #0a0303 100%)', border: '2px solid #991b1b', boxShadow: '0 0 20px rgba(153,27,27,0.5)' }}>
                    <span className="text-red-500 text-4xl">🌹</span>
                  </div>
                  <h3 className="text-2xl font-[family-name:var(--font-cinzel)] text-zinc-100 font-bold tracking-widest uppercase">{p.cla}</h3>
                  <p className="text-xs text-red-500 mt-1 mb-3 tracking-wider">Poder · Controle · Tradição</p>
                  <p className="text-[10px] text-zinc-500 italic font-serif leading-snug">
                    "A nobreza não é um título,<br/>é uma responsabilidade."
                  </p>
                </div>
              </div>

              {/* ===== STATUS / HUMANIDADE ===== */}
              <div className="rounded border p-4 space-y-3"
                style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-600 text-sm">❤</span>
                  <h3 className="text-xs font-[family-name:var(--font-cinzel)] text-zinc-200 font-bold tracking-wider uppercase">Humanidade</h3>
                </div>

                {([
                  { label: 'Humanidade', key: 'humanidade' as const, cor: 'bg-red-600', textColor: 'text-red-500' },
                  { label: 'Desequilíbrio', key: 'desequilibrio' as const, cor: 'bg-red-800', textColor: 'text-red-700' },
                  { label: 'Ressonância da Besta', key: 'ressonancia' as const, cor: 'bg-orange-700', textColor: 'text-orange-500' },
                ]).map((item) => {
                  const valor = (p as any)[item.key] ?? 0;
                  return (
                    <div key={item.key} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-zinc-400 flex-1">{item.label}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((pt) => (
                          <button key={pt} onClick={() => setPersonagem({ [item.key]: pt === valor ? pt - 1 : pt } as any)}
                            className={`w-2.5 h-2.5 rounded-full transition-all hover:scale-125 ${pt <= valor ? item.cor : 'bg-zinc-800 border border-zinc-700'}`} />
                        ))}
                      </div>
                      <span className={`text-xs font-bold ${item.textColor} w-4 text-right`}>{valor}</span>
                    </div>
                  );
                })}

                {/* Restauração */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
                  <span className="text-[11px] text-red-500 flex-1">Restauração</span>
                  <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden max-w-[140px]">
                    <div className="h-full bg-gradient-to-r from-red-900 via-red-700 to-red-500 rounded-full transition-all"
                      style={{ width: `${(((p as any).restauracao ?? 0) / 10) * 100}%` }}></div>
                  </div>
                  <span className="text-xs text-red-500 font-bold">/10</span>
                </div>
              </div>

              {/* ===== HISTÓRICO ===== */}
              <div id="historico" ref={(el) => { refs.current['historico'] = el; }}
                className="rounded border p-4"
                style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-600 text-sm">📖</span>
                  <h3 className="text-sm font-[family-name:var(--font-cinzel)] text-zinc-200 font-bold tracking-wider uppercase">Histórico</h3>
                </div>
                <div className="space-y-2.5">
                  {historico.map((h, i) => (
                    <div key={i} className="group flex gap-2 items-start">
                      <span className="text-red-700 text-xs mt-0.5">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-zinc-300 leading-tight">{h.titulo}</p>
                        {h.descricao && <p className="text-[10px] text-zinc-600 leading-tight">{h.descricao}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] text-zinc-700 whitespace-nowrap">{h.data}</span>
                        <button onClick={() => removeHistorico(i)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 text-[10px]">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setModalHistorico({ data: new Date().toLocaleDateString('pt-BR'), titulo: '', descricao: '' })}
                  className="w-full text-[10px] text-zinc-500 hover:text-red-500 border border-zinc-800 hover:border-red-900 rounded py-1.5 mt-3 transition-colors">
                  + Adicionar Registro
                </button>
              </div>

              {/* ===== NOTAS ===== */}
              <div id="notas" ref={(el) => { refs.current['notas'] = el; }}
                className="rounded border p-4"
                style={{ background: 'linear-gradient(135deg, #0d0505 0%, #100606 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-600 text-sm">📝</span>
                  <h3 className="text-sm font-[family-name:var(--font-cinzel)] text-zinc-200 font-bold tracking-wider uppercase">Notas</h3>
                </div>
                <textarea value={notas} onChange={(e) => setNotas(e.target.value)}
                  placeholder="Adicione anotações sobre o personagem..."
                  className="w-full h-24 rounded border p-2 text-[11px] text-zinc-300 resize-none focus:outline-none focus:border-red-700"
                  style={{ background: 'rgba(20,5,5,0.5)', borderColor: 'rgba(127,29,29,0.3)' }} />
                <div className="flex items-center justify-between mt-2 text-zinc-600">
                  <div className="flex gap-3 text-[11px]">
                    <button className="hover:text-white font-bold">B</button>
                    <button className="hover:text-white italic">I</button>
                    <button className="hover:text-white underline">U</button>
                    <button className="hover:text-white">☰</button>
                    <button className="hover:text-white">≡</button>
                  </div>
                  <button className="hover:text-white text-xs">💾</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ===== BARRA INFERIOR ===== */}
      <footer className="h-14 flex items-center justify-between px-4 shrink-0 border-t"
        style={{ background: 'linear-gradient(180deg, #0a0404 0%, #050202 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-[11px] text-zinc-400 hover:text-white border rounded transition-colors"
            style={{ borderColor: 'rgba(127,29,29,0.3)', background: 'rgba(20,5,5,0.5)' }}>
            Indicadores Rápidos
          </button>
          <button className="px-4 py-2 text-[11px] text-zinc-400 hover:text-white border rounded transition-colors flex items-center gap-2"
            style={{ borderColor: 'rgba(127,29,29,0.3)', background: 'rgba(20,5,5,0.5)' }}>
            <span className="text-red-500">🎲</span> Dados de Dano
          </button>
          <button className="px-4 py-2 text-[11px] text-zinc-400 hover:text-white border rounded transition-colors flex items-center gap-2"
            style={{ borderColor: 'rgba(127,29,29,0.3)', background: 'rgba(20,5,5,0.5)' }}>
            <span className="text-red-500">◆</span> Teste de Atributo
          </button>
          <button className="px-4 py-2 text-[11px] text-zinc-400 hover:text-white border rounded transition-colors flex items-center gap-2"
            style={{ borderColor: 'rgba(127,29,29,0.3)', background: 'rgba(20,5,5,0.5)' }}>
            <span className="text-red-500">⚔</span> Teste de Perícia
          </button>
          <button className="px-4 py-2 text-[11px] text-zinc-400 hover:text-white border rounded transition-colors flex items-center gap-2"
            style={{ borderColor: 'rgba(127,29,29,0.3)', background: 'rgba(20,5,5,0.5)' }}>
            <span className="text-red-500">🎲</span> Rolar Dados
          </button>
        </div>
        <button className="px-6 py-2 rounded text-xs text-white font-bold flex items-center gap-2 transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)', boxShadow: '0 0 15px rgba(153,27,27,0.5)' }}>
          💾 Salvar Ficha
        </button>
      </footer>

      {/* ===== MODAIS ===== */}
      {modalDisciplina && (
        <Modal titulo="Nova Disciplina" onClose={() => setModalDisciplina(null)}>
          <label className="text-xs text-zinc-400 block mb-1">Nome</label>
          <input value={modalDisciplina.nome} onChange={(e) => setModalDisciplina({ ...modalDisciplina, nome: e.target.value })}
            placeholder="Ex: Auspício, Celeridade..."
            className="w-full bg-zinc-900 border border-red-900/30 rounded px-2 py-1 text-sm text-white mb-3 focus:outline-none focus:border-red-700" />
          <label className="text-xs text-zinc-400 block mb-1">Nível: {modalDisciplina.nivel}</label>
          <input type="range" min="1" max="5" value={modalDisciplina.nivel}
            onChange={(e) => setModalDisciplina({ ...modalDisciplina, nivel: parseInt(e.target.value) })} className="w-full accent-red-700" />
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setModalDisciplina(null)} className="px-3 py-1 text-xs text-zinc-400 hover:text-white">Cancelar</button>
            <button onClick={() => { if (modalDisciplina.nome.trim()) { setDisciplina(modalDisciplina.nome, modalDisciplina.nivel); setModalDisciplina(null); } }}
              className="px-3 py-1 text-xs bg-red-800 hover:bg-red-700 rounded text-white">Salvar</button>
          </div>
        </Modal>
      )}

      {modalVantagem && (
        <Modal titulo={modalVantagem.idx !== null ? 'Editar Vantagem' : 'Nova Vantagem'} onClose={() => setModalVantagem(null)}>
          <label className="text-xs text-zinc-400 block mb-1">Nome</label>
          <input value={modalVantagem.nome} onChange={(e) => setModalVantagem({ ...modalVantagem, nome: e.target.value })}
            className="w-full bg-zinc-900 border border-red-900/30 rounded px-2 py-1 text-sm text-white mb-3 focus:outline-none focus:border-red-700" />
          <label className="text-xs text-zinc-400 block mb-1">Descrição</label>
          <textarea value={modalVantagem.descricao} onChange={(e) => setModalVantagem({ ...modalVantagem, descricao: e.target.value })}
            className="w-full bg-zinc-900 border border-red-900/30 rounded p-2 text-sm text-white resize-none h-24 focus:outline-none focus:border-red-700" />
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setModalVantagem(null)} className="px-3 py-1 text-xs text-zinc-400 hover:text-white">Cancelar</button>
            <button onClick={() => {
              if (!modalVantagem.nome.trim()) return;
              if (modalVantagem.idx !== null) updateVantagem(modalVantagem.idx, { nome: modalVantagem.nome, descricao: modalVantagem.descricao });
              else addVantagem({ nome: modalVantagem.nome, descricao: modalVantagem.descricao });
              setModalVantagem(null);
            }} className="px-3 py-1 text-xs bg-red-800 hover:bg-red-700 rounded text-white">Salvar</button>
          </div>
        </Modal>
      )}

      {modalRitual && (
        <Modal titulo="Novo Ritual" onClose={() => setModalRitual(null)}>
          <label className="text-xs text-zinc-400 block mb-1">Nome</label>
          <input value={modalRitual.nome} onChange={(e) => setModalRitual({ ...modalRitual, nome: e.target.value })}
            className="w-full bg-zinc-900 border border-red-900/30 rounded px-2 py-1 text-sm text-white mb-3 focus:outline-none focus:border-red-700" />
          <label className="text-xs text-zinc-400 block mb-1">Nível: {modalRitual.nivel}</label>
          <input type="range" min="1" max="5" value={modalRitual.nivel}
            onChange={(e) => setModalRitual({ ...modalRitual, nivel: parseInt(e.target.value) })} className="w-full accent-red-700 mb-3" />
          <label className="text-xs text-zinc-400 block mb-1">Descrição</label>
          <textarea value={modalRitual.descricao} onChange={(e) => setModalRitual({ ...modalRitual, descricao: e.target.value })}
            className="w-full bg-zinc-900 border border-red-900/30 rounded p-2 text-sm text-white resize-none h-20 focus:outline-none focus:border-red-700" />
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setModalRitual(null)} className="px-3 py-1 text-xs text-zinc-400 hover:text-white">Cancelar</button>
            <button onClick={() => { if (modalRitual.nome.trim()) { addRitual(modalRitual); setModalRitual(null); } }}
              className="px-3 py-1 text-xs bg-red-800 hover:bg-red-700 rounded text-white">Salvar</button>
          </div>
        </Modal>
      )}

      {modalHistorico && (
        <Modal titulo="Novo Registro no Histórico" onClose={() => setModalHistorico(null)}>
          <label className="text-xs text-zinc-400 block mb-1">Título</label>
          <input value={modalHistorico.titulo} onChange={(e) => setModalHistorico({ ...modalHistorico, titulo: e.target.value })}
            placeholder="Ex: Novo Aliado: Seraphine"
            className="w-full bg-zinc-900 border border-red-900/30 rounded px-2 py-1 text-sm text-white mb-3 focus:outline-none focus:border-red-700" />
          <label className="text-xs text-zinc-400 block mb-1">Descrição</label>
          <textarea value={modalHistorico.descricao} onChange={(e) => setModalHistorico({ ...modalHistorico, descricao: e.target.value })}
            className="w-full bg-zinc-900 border border-red-900/30 rounded p-2 text-sm text-white resize-none h-20 focus:outline-none focus:border-red-700 mb-3" />
          <label className="text-xs text-zinc-400 block mb-1">Data</label>
          <input value={modalHistorico.data} onChange={(e) => setModalHistorico({ ...modalHistorico, data: e.target.value })}
            className="w-full bg-zinc-900 border border-red-900/30 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-red-700" />
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setModalHistorico(null)} className="px-3 py-1 text-xs text-zinc-400 hover:text-white">Cancelar</button>
            <button onClick={() => { if (modalHistorico.titulo.trim()) { addHistorico(modalHistorico); setModalHistorico(null); } }}
              className="px-3 py-1 text-xs bg-red-800 hover:bg-red-700 rounded text-white">Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}