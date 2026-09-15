'use client';

import { useState } from 'react';
import { useAppStore } from '@/app/store';

interface Livro {
  id: string;
  titulo: string;
  subtitulo: string;
  autor: string;
  paginas: number;
  ano: number;
  categoria: 'core' | 'suplemento' | 'cronica';
  cor: string;
  icone: string;
  descricao: string;
  pdfUrl?: string;
}

const LIVROS: Livro[] = [
  { id: 'v5-core', titulo: 'Vampiro: A Máscara', subtitulo: 'Edição de 5ª Edição — Livro Básico', autor: 'Paradox Interactive', paginas: 428, ano: 2018, categoria: 'core', cor: '#991b1b', icone: '🌹', descricao: 'O livro básico de Vampiro: A Máscara 5ª Edição. Regras completas de criação de personagem, disciplinas, Humanidade, Fome e a Besta.', pdfUrl: '/pdfs/vampiro-v5-core.pdf' },
  { id: 'v5-camarilla', titulo: 'A Camarilla', subtitulo: 'Suplemento de Facção', autor: 'Paradox Interactive', paginas: 154, ano: 2019, categoria: 'suplemento', cor: '#7f1d1d', icone: '👑', descricao: 'Detalhes sobre a Camarilla na 5ª Edição — os clãs que a compõem, suas estruturas políticas e como jogar dentro da Torre de Marfim.', pdfUrl: '/pdfs/vampiro-v5-camarilla.pdf' },
  { id: 'v5-anarch', titulo: 'Os Anarquistas', subtitulo: 'Suplemento de Facção', autor: 'Paradox Interactive', paginas: 148, ano: 2019, categoria: 'suplemento', cor: '#7f1d1d', icone: '🔥', descricao: 'O Movimento Anarquista em detalhes. Brujah, Gangrel, Ministry e os Caitiff que rejeitam a Camarilla.', pdfUrl: '/pdfs/vampiro-v5-anarch.pdf' },
  { id: 'v5-chicago', titulo: 'Chicago by Night', subtitulo: 'Crônica Ambientada em Chicago', autor: 'Paradox Interactive', paginas: 300, ano: 2019, categoria: 'cronica', cor: '#7f1d1d', icone: '🏙️', descricao: 'A clássica crônica de Chicago atualizada para V5. Dezenas de NPCs, intrigas políticas e ganchos de história.', pdfUrl: '/pdfs/vampiro-v5-chicago.pdf' },
  { id: 'v5-blood', titulo: 'Sangue e Poder', subtitulo: 'Suplemento de Disciplinas', autor: 'Paradox Interactive', paginas: 132, ano: 2020, categoria: 'suplemento', cor: '#7f1d1d', icone: '🩸', descricao: 'Novos poderes de sangue, rituais de Taumaturgia, disciplinas alternativas e regras opcionais.', pdfUrl: '/pdfs/vampiro-v5-blood.pdf' },
  { id: 'v5-fall', titulo: 'A Queda de Londres', subtitulo: 'Crônica Ambientada em Londres', autor: 'Paradox Interactive', paginas: 260, ano: 2020, categoria: 'cronica', cor: '#7f1d1d', icone: '🎭', descricao: 'O caos da queda da Camarilla em Londres. Uma crônica sombria sobre o fim de uma era.', pdfUrl: '/pdfs/vampiro-v5-london.pdf' },
  { id: 'v5-players', titulo: 'Guia do Jogador', subtitulo: 'Suplemento para Jogadores', autor: 'Paradox Interactive', paginas: 180, ano: 2021, categoria: 'suplemento', cor: '#7f1d1d', icone: '🎲', descricao: 'Dicas, opções de personagem, novas vantagens e orientações para jogadores veteranos e novatos.', pdfUrl: '/pdfs/vampiro-v5-players.pdf' },
  { id: 'v5-second', titulo: 'Segunda Inquisição', subtitulo: 'Suplemento Antagonistas', autor: 'Paradox Interactive', paginas: 176, ano: 2020, categoria: 'suplemento', cor: '#7f1d1d', icone: '⚔️', descricao: 'A ameaça mortal da Segunda Inquisição. Como usar caçadores, tecnologia e fé contra os vampiros.', pdfUrl: '/pdfs/vampiro-v5-inquisition.pdf' },
  { id: 'v5-bloodlines', titulo: 'Bloodlines: The Hidden', subtitulo: 'Suplemento de Linhagens', autor: 'Paradox Interactive', paginas: 120, ano: 2021, categoria: 'suplemento', cor: '#7f1d1d', icone: '🦇', descricao: 'Linhagens raras e esquecidas. Nagaraja, Salubri, Gargoyles e outras criaturas únicas.', pdfUrl: '/pdfs/vampiro-v5-bloodlines.pdf' },
  { id: 'v5-chronicle', titulo: 'Guia do Narrador', subtitulo: 'Como Conduzir uma Crônica', autor: 'Paradox Interactive', paginas: 224, ano: 2020, categoria: 'core', cor: '#7f1d1d', icone: '📖', descricao: 'Ferramentas para o Narrador — estrutura de crônicas, ganchos de história, ritmo e tom.', pdfUrl: '/pdfs/vampiro-v5-chronicle.pdf' },
];

const CATEGORIAS = [
  { id: 'todos', nome: 'Todos os Livros', icone: '📚' },
  { id: 'core', nome: 'Livros Básicos', icone: '🌹' },
  { id: 'suplemento', nome: 'Suplementos', icone: '📕' },
  { id: 'cronica', nome: 'Crônicas', icone: '🎭' },
];

export default function BibliotecaModule() {
  const { setActiveModule } = useAppStore();
  const [categoria, setCategoria] = useState('todos');
  const [busca, setBusca] = useState('');
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);

  const livrosFiltrados = LIVROS.filter((l) => {
    if (categoria !== 'todos' && l.categoria !== categoria) return false;
    if (busca && !l.titulo.toLowerCase().includes(busca.toLowerCase()) && !l.descricao.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

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
            <button onClick={() => setActiveModule('biblioteca')} className="flex items-center gap-1.5 px-4 h-full text-red-500 border-b-2 border-red-600"><span>▦</span> Biblioteca</button>
            <button onClick={() => setActiveModule('cenario')} className="flex items-center gap-1.5 px-4 h-full text-zinc-500 hover:text-white transition-colors"><span>⚔</span> Cenário</button>
            <button onClick={() => setActiveModule('config')} className="flex items-center gap-1.5 px-4 h-full text-zinc-500 hover:text-white transition-colors"><span>⚙</span> Configurações</button>
          </nav>
        </div>
        <div className="flex items-center gap-4 pr-4 text-xs">
          <span className="text-zinc-600">{LIVROS.length} livros na biblioteca</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 shrink-0 overflow-y-auto border-r p-3" style={{ background: '#080404', borderColor: 'rgba(127,29,29,0.3)' }}>
          <h3 className="text-[10px] uppercase text-red-800 font-bold mb-3 tracking-[0.15em]">Categorias</h3>
          <nav className="flex flex-col gap-0.5">
            {CATEGORIAS.map((c) => (
              <button key={c.id} onClick={() => setCategoria(c.id)}
                className={`flex items-center gap-3 px-2.5 py-2 rounded-sm text-[11px] text-left transition-all ${categoria === c.id ? 'text-red-400 font-semibold' : 'text-zinc-500 hover:text-zinc-200'}`}
                style={categoria === c.id ? { background: 'rgba(127,29,29,0.25)', boxShadow: 'inset 2px 0 0 #dc2626' } : {}}>
                <span>{c.icone}</span> {c.nome}
              </button>
            ))}
          </nav>
          <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
            <p className="text-[10px] text-zinc-600 italic leading-relaxed">
              Todos os livros oficiais de Vampiro: A Máscara V5 disponíveis para consulta.
            </p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex gap-3 items-center">
            <div className="flex-1 relative">
              <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar livros, suplementos, crônicas..."
                className="w-full rounded-sm px-4 py-2.5 text-sm text-white border focus:outline-none"
                style={{ background: 'rgba(20,5,5,0.6)', borderColor: 'rgba(127,29,29,0.4)' }} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600">🔍</span>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-[family-name:var(--font-cinzel)] text-zinc-100 font-bold tracking-wider">Biblioteca</h1>
            <span className="text-xs text-zinc-600">{livrosFiltrados.length} resultado{livrosFiltrados.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {livrosFiltrados.map((livro) => (
              <button key={livro.id} onClick={() => setLivroSelecionado(livro)}
                className="group rounded-sm overflow-hidden border transition-all hover:scale-[1.02] text-left"
                style={{ background: 'linear-gradient(135deg, #0d0505 0%, #1a0808 100%)', borderColor: 'rgba(127,29,29,0.4)' }}>
                <div className="aspect-[3/4] relative overflow-hidden flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${livro.cor} 0%, #0a0202 100%)` }}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)' }}></div>
                  <div className="relative text-center px-4">
                    <div className="text-6xl mb-3">{livro.icone}</div>
                    <p className="font-[family-name:var(--font-cinzel)] text-sm text-white font-bold tracking-wider leading-tight">{livro.titulo}</p>
                    <p className="text-[9px] text-red-300 mt-1">{livro.subtitulo}</p>
                  </div>
                  <div className="absolute top-2 right-2 text-[9px] text-zinc-500 bg-black/60 px-1.5 py-0.5 rounded-sm">{livro.ano}</div>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-white truncate">{livro.titulo}</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{livro.paginas} páginas</p>
                  <p className="text-[10px] text-zinc-600 mt-1 leading-tight line-clamp-2">{livro.descricao}</p>
                </div>
              </button>
            ))}
          </div>

          {livrosFiltrados.length === 0 && (
            <div className="text-center py-16 text-zinc-600">
              <p className="text-5xl mb-3">📚</p>
              <p>Nenhum livro encontrado com esses critérios</p>
            </div>
          )}
        </main>
      </div>

      {livroSelecionado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setLivroSelecionado(null)}>
          <div className="rounded border max-w-2xl w-full flex gap-5 p-6"
            style={{ background: '#0a0404', borderColor: 'rgba(153,27,27,0.5)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-40 h-56 rounded-sm shrink-0 flex items-center justify-center relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${livroSelecionado.cor} 0%, #0a0202 100%)` }}>
              <div className="text-center">
                <div className="text-5xl mb-2">{livroSelecionado.icone}</div>
                <p className="font-[family-name:var(--font-cinzel)] text-xs text-white font-bold tracking-wider px-2">{livroSelecionado.titulo}</p>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-[family-name:var(--font-cinzel)] text-white font-bold tracking-wide">{livroSelecionado.titulo}</h2>
              <p className="text-sm text-red-500 mt-1">{livroSelecionado.subtitulo}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-zinc-500">Autor:</span> <span className="text-zinc-300">{livroSelecionado.autor}</span></div>
                <div><span className="text-zinc-500">Ano:</span> <span className="text-zinc-300">{livroSelecionado.ano}</span></div>
                <div><span className="text-zinc-500">Páginas:</span> <span className="text-zinc-300">{livroSelecionado.paginas}</span></div>
                <div><span className="text-zinc-500">Categoria:</span> <span className="text-zinc-300 capitalize">{livroSelecionado.categoria}</span></div>
              </div>
              <p className="text-xs text-zinc-400 mt-4 leading-relaxed">{livroSelecionado.descricao}</p>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => {
                    const url = livroSelecionado.pdfUrl;
                    if (url) window.open(url, '_blank');
                    else alert('PDF ainda não disponível. Coloque o arquivo em /public/pdfs/ com o nome: ' + livroSelecionado.id + '.pdf');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-sm text-sm font-bold text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)', boxShadow: '0 0 15px rgba(153,27,27,0.5)' }}>
                  📖 Abrir Livro
                </button>
                <button onClick={() => setLivroSelecionado(null)}
                  className="px-4 py-2.5 rounded-sm text-sm text-zinc-400 hover:text-white border transition-colors"
                  style={{ borderColor: 'rgba(127,29,29,0.4)' }}>
                  Fechar
                </button>
              </div>
            </div>a
          </div>
        </div>
      )}
    </div>
  );
}