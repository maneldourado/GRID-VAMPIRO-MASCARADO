import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ModuleType = 'home' | 'mesa' | 'ficha' | 'biblioteca' | 'cenario' | 'config';
export type ToolType = 'selecionar' | 'mover' | 'desenhar' | 'apagar' | 'marcar' | 'texto' | 'medir';
export type DrawShape = 'livre' | 'linha' | 'retangulo' | 'circulo' | 'seta';
export type MarkerType = 'interesse' | 'perigo' | 'objetivo' | 'npc' | 'entrada' | 'saida' | 'evidencia' | 'local';

export interface Atributos {
  forca: number; destreza: number; vigor: number;
  carisma: number; manipulacao: number; compostura: number;
  inteligencia: number; raciocinio: number; determinacao: number;
}

export interface Vantagem { nome: string; descricao: string; }
export interface Ritual { nome: string; nivel: number; descricao: string; }
export interface HistoricoItem { data: string; titulo: string; descricao: string; }

export interface Personagem {
  id: string;
  nome: string; cla: string; geracao: number; xp: number; conceito: string;
  cronica: string; idadeAparente: number; idadeReal: number; ocupacao: string;
  status: string; alcunha: string; citacao: string; avatarUrl: string | null;
  humanidade: number; desequilibrio: number; ressonancia: number; restauracao: number;
  atributos: Atributos;
  pericias: Record<string, number>;
  disciplinas: Record<string, number>;
  vantagens: Vantagem[];
  rituais: Ritual[];
  equipamentos: string[];
  historico: HistoricoItem[];
  notas: string;
}

export interface GridConfig { size: number; color: string; opacity: number; lineWidth: number; visivel: boolean; }
export interface Camera { x: number; y: number; zoom: number; }
export interface MapaData { id: string; nome: string; imageData: string | null; camera: Camera; gridConfig: GridConfig; }

export interface TokenData {
  id: string; nome: string; x: number; y: number; cor: string; size: number;
  visivel: boolean; bloqueado: boolean; mapaId: string;
  personagemId?: string;
}

export interface Drawing { id: string; shape: DrawShape; points: number[]; color: string; opacity: number; strokeWidth: number; mapaId: string; }
export interface Marker { id: string; x: number; y: number; tipo: MarkerType; cor: string; titulo: string; descricao: string; mapaId: string; }
export interface TextAnnotation { id: string; x: number; y: number; texto: string; fontSize: number; color: string; bold: boolean; mapaId: string; }
export interface RollResult { rolls: number[]; hungerRolls: number[]; sucessos: number; critico: boolean; falhaBestial: boolean; bagunçado: boolean; }
export interface ChatMessage { id: string; tipo: 'chat' | 'roll' | 'system'; autor: string; texto: string; cor: string; timestamp: number; roll?: RollResult; }

export interface Config {
  temaEscuro: boolean;
  mostrarGradeSempre: boolean;
  autoSalvarChat: boolean;
  volumeEfeitos: number;
  mostrarNomesTokens: boolean;
  escalaPadrao: number;
  tamanhoFonte: 'normal' | 'grande' | 'extra';
  corDestaque: string;
}

/* ============ INICIAIS ============ */

const PERICIAS_BASE = {
  Acrobacia: 2, 'Armas de Fogo': 1, 'Armas Brancas': 3, Atletismo: 3,
  Briga: 2, Computador: 2, Empatia: 3, Furtividade: 2,
  'Investigação': 4, 'Liderança': 3, Medicina: 2, Ocultismo: 3,
  'Percepção': 4, 'Persuasão': 4, 'Sobrevivência': 3, Tecnologia: 2,
};

const personagensIniciais: Personagem[] = [
  {
    id: 'pc1',
    nome: 'Kael Moreau', cla: 'Venture', geracao: 9, xp: 0, conceito: 'O Diplomata',
    cronica: 'A Corte de Ferro', idadeAparente: 28, idadeReal: 83, ocupacao: 'Diplomata',
    status: 'Ativo', alcunha: 'O Negociador',
    citacao: 'Poder não é o que você tem. É o que os outros acreditam que você tem.',
    avatarUrl: null,
    humanidade: 7, desequilibrio: 1, ressonancia: 3, restauracao: 5,
    atributos: { forca: 3, destreza: 2, vigor: 4, carisma: 4, manipulacao: 3, compostura: 3, inteligencia: 3, raciocinio: 2, determinacao: 3 },
    pericias: { ...PERICIAS_BASE },
    disciplinas: { 'Auspício': 2, 'Dominação': 1, Fortitude: 2, 'Presença': 2, 'Potência': 1 },
    vantagens: [
      { nome: 'Mente Blindada', descricao: 'Resiste a Dominação e efeitos de controle mental.' },
      { nome: 'Estilhaçar', descricao: 'Pode causar dano letal com ataques desarmados usando Vigor.' },
      { nome: 'Surto de Sangue', descricao: 'Ganha +3 dados de dano e +4 de Força por um curto período.' },
    ],
    rituais: [],
    equipamentos: ['Katana (personalizada)', 'Pistola (9mm)', 'Máscara de Disfarce', 'Roupas Formais', 'Veículo (Sedan Preto)'],
    historico: [
      { data: '10/09/2025', titulo: 'Criação do Personagem', descricao: 'Kael Moreau - Ventrue (G9)' },
      { data: '12/09/2025', titulo: 'Primeira Crônica', descricao: 'A Corte de Ferro' },
      { data: '15/09/2025', titulo: 'Ganhou a Disciplina Auspício', descricao: 'Mestre: Lucien Vale' },
      { data: '18/09/2025', titulo: 'Novo Aliado: Seraphine', descricao: 'Contato na cidade' },
    ],
    notas: '',
  },
  {
    id: 'pc2',
    nome: 'Lucien Vale', cla: 'Toreador', geracao: 10, xp: 5, conceito: 'O Artista',
    cronica: 'A Corte de Ferro', idadeAparente: 35, idadeReal: 120, ocupacao: 'Curador de Arte',
    status: 'Ativo', alcunha: 'A Musa',
    citacao: 'A beleza é eterna. A dor também.',
    avatarUrl: null,
    humanidade: 8, desequilibrio: 0, ressonancia: 2, restauracao: 6,
    atributos: { forca: 2, destreza: 3, vigor: 2, carisma: 5, manipulacao: 4, compostura: 3, inteligencia: 4, raciocinio: 3, determinacao: 2 },
    pericias: { ...PERICIAS_BASE, 'Persuasão': 5, 'Investigação': 3, 'Ocultismo': 4, Furtividade: 3 },
    disciplinas: { 'Auspício': 4, 'Celeridade': 3, 'Presença': 3, 'Rapidez': 1 },
    vantagens: [
      { nome: 'Olhar Arrebatador', descricao: 'Sua presença encanta e distrai.' },
      { nome: 'Sensibilidade Artística', descricao: 'Detecta emoções através da arte.' },
    ],
    rituais: [],
    equipamentos: ['Câmera Leica vintage', 'Flauta transversa', 'Cartão da Galeria Vale', 'Faca ornamental'],
    historico: [
      { data: '05/08/2025', titulo: 'Abraçado por Amadeus', descricao: 'Toreador ancião de Lisboa' },
      { data: '20/09/2025', titulo: 'Exposição no Elysium', descricao: 'Apresentou obras da corte' },
    ],
    notas: '',
  },
  {
    id: 'pc3',
    nome: 'Seraphine', cla: 'Brujah', geracao: 11, xp: 3, conceito: 'A Revolucionária',
    cronica: 'A Corte de Ferro', idadeAparente: 22, idadeReal: 45, ocupacao: 'Ativista',
    status: 'Ativo', alcunha: 'A Tempestade',
    citacao: 'Queimem os tronos. Nós somos o fogo.',
    avatarUrl: null,
    humanidade: 6, desequilibrio: 2, ressonancia: 4, restauracao: 3,
    atributos: { forca: 4, destreza: 4, vigor: 3, carisma: 3, manipulacao: 2, compostura: 2, inteligencia: 3, raciocinio: 3, determinacao: 5 },
    pericias: { ...PERICIAS_BASE, Briga: 5, 'Armas Brancas': 4, Atletismo: 5, 'Intimidação': 4 },
    disciplinas: { 'Celeridade': 3, 'Potência': 3, 'Presença': 2, 'Fortitude': 1 },
    vantagens: [
      { nome: 'Ímpeto Revolucionário', descricao: 'Ganha +2 dados em ações contra autoridades.' },
    ],
    rituais: [],
    equipamentos: ['Bastão retrátil', 'Jaqueta de couro', 'Moto', 'Cartazes de protesto'],
    historico: [
      { data: '12/07/2025', titulo: 'Abraçada no meio de um protesto', descricao: 'Pelo Brujah Marco' },
      { data: '28/09/2025', titulo: 'Atacou o Príncipe', descricao: 'Marcada pela Camarilla' },
    ],
    notas: '',
  },
  {
    id: 'pc4',
    nome: 'Darius', cla: 'Nosferatu', geracao: 9, xp: 10, conceito: 'O Informante',
    cronica: 'A Corte de Ferro', idadeAparente: 40, idadeReal: 210, ocupacao: 'Hacker',
    status: 'Ativo', alcunha: 'O Fantasma',
    citacao: 'Nada é secreto. Só mal escondido.',
    avatarUrl: null,
    humanidade: 5, desequilibrio: 3, ressonancia: 2, restauracao: 4,
    atributos: { forca: 4, destreza: 3, vigor: 3, carisma: 1, manipulacao: 4, compostura: 4, inteligencia: 5, raciocinio: 5, determinacao: 4 },
    pericias: { ...PERICIAS_BASE, Computador: 5, 'Investigação': 5, Furtividade: 5, Ocultismo: 4, Tecnologia: 5, 'Percepção': 5 },
    disciplinas: { 'Auspício': 3, 'Ofuscação': 5, 'Animalismo': 2, 'Potência': 2 },
    vantagens: [
      { nome: 'Rede de Espiões', descricao: 'Contatos em toda a cidade.' },
      { nome: 'Invisibilidade Noturna', descricao: 'Pode se ofuscar mesmo em movimento.' },
    ],
    rituais: [],
    equipamentos: ['Notebook criptografado', 'Drones modificados', 'Pendrive com segredos', 'Traje de camuflagem'],
    historico: [
      { data: '01/01/2025', titulo: 'Abraçado nos esgotos', descricao: 'Pelo Nosferatu Cleber' },
      { data: '25/09/2025', titulo: 'Hackeou a Camarilla', descricao: 'Ganhou 5 pontos de XP' },
    ],
    notas: '',
  },
];

const gridPadrao: GridConfig = { size: 50, color: '#2a2a2a', opacity: 1, lineWidth: 1, visivel: true };
const cameraPadrao: Camera = { x: 0, y: 0, zoom: 100 };

const mapasIniciais: MapaData[] = [
  { id: 'm1', nome: 'Distrito - Noite', imageData: null, camera: { ...cameraPadrao }, gridConfig: { ...gridPadrao } },
  { id: 'm2', nome: 'Clube - Interior', imageData: null, camera: { ...cameraPadrao }, gridConfig: { ...gridPadrao } },
  { id: 'm3', nome: 'Rua - Dia', imageData: null, camera: { ...cameraPadrao }, gridConfig: { ...gridPadrao } },
];

const tokensIniciais: TokenData[] = [
  { id: 't1', nome: 'Kael', x: 200, y: 200, cor: '#dc2626', size: 50, visivel: true, bloqueado: false, mapaId: 'm1', personagemId: 'pc1' },
  { id: 't2', nome: 'Lucien', x: 350, y: 250, cor: '#3b82f6', size: 50, visivel: true, bloqueado: false, mapaId: 'm1', personagemId: 'pc2' },
  { id: 't3', nome: 'Seraphine', x: 500, y: 200, cor: '#ec4899', size: 50, visivel: true, bloqueado: false, mapaId: 'm1', personagemId: 'pc3' },
  { id: 't4', nome: 'Darius', x: 300, y: 400, cor: '#a855f7', size: 50, visivel: true, bloqueado: false, mapaId: 'm1', personagemId: 'pc4' },
];

const chatInicial: ChatMessage[] = [
  { id: 'c1', tipo: 'chat', autor: 'Kael Moreau', texto: 'Vamos pelo corredor da direita.', cor: 'text-red-500', timestamp: Date.now() },
  { id: 'c2', tipo: 'chat', autor: 'Lucien Vale', texto: 'Tudo limpo por aqui.', cor: 'text-blue-400', timestamp: Date.now() },
];

const configInicial: Config = {
  temaEscuro: true,
  mostrarGradeSempre: true,
  autoSalvarChat: true,
  volumeEfeitos: 60,
  mostrarNomesTokens: true,
  escalaPadrao: 1.5,
  tamanhoFonte: 'normal',
  corDestaque: '#dc2626',
};

const MARKER_ICONS: Record<MarkerType, string> = {
  interesse: '★', perigo: '⚠', objetivo: '◎', npc: '☺',
  entrada: '⬅', saida: '➡', evidencia: '🔍', local: '⌂',
};
export { MARKER_ICONS };

export const ATRIBUTOS_LABELS: Record<keyof Atributos, string> = {
  forca: 'Força', destreza: 'Destreza', vigor: 'Vigor',
  carisma: 'Carisma', manipulacao: 'Manipulação', compostura: 'Compostura',
  inteligencia: 'Inteligência', raciocinio: 'Raciocínio', determinacao: 'Determinação',
};

export const GRUPOS_ATRIBUTOS: Record<string, (keyof Atributos)[]> = {
  'Físicos': ['forca', 'destreza', 'vigor'],
  'Sociais': ['carisma', 'manipulacao', 'compostura'],
  'Mentais': ['inteligencia', 'raciocinio', 'determinacao'],
};

/* ============ STORE ============ */

interface AppState {
  activeModule: ModuleType;
  setActiveModule: (m: ModuleType) => void;

  personagens: Personagem[];
  personagemAtivoId: string;
  personagem: Personagem;
  setPersonagem: (p: Partial<Personagem>) => void;
  setPersonagemAtivo: (id: string) => void;
  addPersonagem: (nome?: string, cla?: string) => string;
  removePersonagem: (id: string) => void;

  setAtributo: (k: keyof Atributos, v: number) => void;
  setPericia: (k: string, v: number) => void;
  setDisciplina: (k: string, v: number) => void;
  addVantagem: (v: Vantagem) => void;
  updateVantagem: (i: number, v: Vantagem) => void;
  removeVantagem: (i: number) => void;
  addRitual: (r: Ritual) => void;
  removeRitual: (i: number) => void;
  addEquipamento: (e: string) => void;
  removeEquipamento: (i: number) => void;
  addHistorico: (h: HistoricoItem) => void;
  removeHistorico: (i: number) => void;
  setNotas: (n: string) => void;

  mapas: MapaData[];
  mapaAtivoId: string;
  setMapaAtivo: (id: string) => void;
  addMapa: (nome: string, imageData: string | null) => void;
  updateMapaImage: (id: string, imageData: string | null) => void;
  deleteMapa: (id: string) => void;
  renameMapa: (id: string, nome: string) => void;
  duplicateMapa: (id: string) => void;
  updateMapaCamera: (id: string, camera: Partial<Camera>) => void;
  updateMapaGrid: (id: string, grid: Partial<GridConfig>) => void;

  activeTool: ToolType;
  setActiveTool: (t: ToolType) => void;
  drawShape: DrawShape; setDrawShape: (s: DrawShape) => void;
  drawColor: string; setDrawColor: (c: string) => void;
  drawStrokeWidth: number; setDrawStrokeWidth: (w: number) => void;
  markerType: MarkerType; setMarkerType: (t: MarkerType) => void;

  layersVisiveis: { grid: boolean; mapa: boolean; tokens: boolean; anotacoes: boolean };
  toggleLayer: (l: keyof AppState['layersVisiveis']) => void;
  layersBloqueadas: { tokens: boolean; anotacoes: boolean };
  toggleLayerLock: (l: 'tokens' | 'anotacoes') => void;

  tokens: TokenData[];
  updateTokenPosition: (id: string, x: number, y: number) => void;
  updateToken: (id: string, patch: Partial<TokenData>) => void;
  addToken: (t: Omit<TokenData, 'id'>) => void;
  deleteToken: (id: string) => void;
  duplicateToken: (id: string) => void;
  selectedTokenId: string | null;
  setSelectedTokenId: (id: string | null) => void;

  drawings: Drawing[];
  addDrawing: (d: Omit<Drawing, 'id'>) => void;
  updateDrawing: (id: string, patch: Partial<Drawing>) => void;
  removeDrawing: (id: string) => void;
  markers: Marker[];
  addMarker: (m: Omit<Marker, 'id'>) => void;
  updateMarker: (id: string, patch: Partial<Marker>) => void;
  removeMarker: (id: string) => void;
  texts: TextAnnotation[];
  addText: (t: Omit<TextAnnotation, 'id'>) => void;
  updateText: (id: string, patch: Partial<TextAnnotation>) => void;
  removeText: (id: string) => void;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;

  medida: { x1: number; y1: number; x2: number; y2: number } | null;
  setMedida: (m: AppState['medida']) => void;

  chat: ChatMessage[];
  addChatMessage: (m: ChatMessage) => void;
  clearChat: () => void;

  history: { past: any[]; future: any[] };
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  clipboard: any | null;
  setClipboard: (c: any) => void;

  clearSelection: () => void;

  // Config
  config: Config;
  setConfig: (patch: Partial<Config>) => void;

  // Biblioteca
  livrosAbertos: string[];
  toggleLivroAberto: (id: string) => void;
}

function snapshot(s: AppState) {
  return {
    tokens: JSON.parse(JSON.stringify(s.tokens)),
    drawings: JSON.parse(JSON.stringify(s.drawings)),
    markers: JSON.parse(JSON.stringify(s.markers)),
    texts: JSON.parse(JSON.stringify(s.texts)),
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeModule: 'home',
      setActiveModule: (m) => set({ activeModule: m }),

      personagens: personagensIniciais,
      personagemAtivoId: 'pc1',
      personagem: personagensIniciais[0],
      setPersonagem: (patch) => set((s) => {
        const updated = { ...s.personagem, ...patch };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),
      setPersonagemAtivo: (id) => set((s) => {
        const p = s.personagens.find((x) => x.id === id);
        return p ? { personagemAtivoId: id, personagem: p } : s;
      }),
      addPersonagem: (nome = 'Novo Personagem', cla = 'Caitiff') => {
        const novo: Personagem = {
          id: `pc${Date.now()}`,
          nome, cla, geracao: 13, xp: 0, conceito: '', cronica: '',
          idadeAparente: 20, idadeReal: 20, ocupacao: '', status: 'Ativo', alcunha: '',
          citacao: '', avatarUrl: null,
          humanidade: 7, desequilibrio: 0, ressonancia: 0, restauracao: 5,
          atributos: { forca: 1, destreza: 1, vigor: 1, carisma: 1, manipulacao: 1, compostura: 1, inteligencia: 1, raciocinio: 1, determinacao: 1 },
          pericias: { Acrobacia: 0, 'Armas de Fogo': 0, 'Armas Brancas': 0, Atletismo: 0, Briga: 0, Computador: 0, Empatia: 0, Furtividade: 0, 'Investigação': 0, 'Liderança': 0, Medicina: 0, Ocultismo: 0, 'Percepção': 0, 'Persuasão': 0, 'Sobrevivência': 0, Tecnologia: 0 },
          disciplinas: {},
          vantagens: [], rituais: [], equipamentos: [], historico: [], notas: '',
        };
        set((s) => ({ personagens: [...s.personagens, novo], personagemAtivoId: novo.id, personagem: novo }));
        return novo.id;
      },
      removePersonagem: (id) => set((s) => {
        if (s.personagens.length <= 1) return s;
        const novos = s.personagens.filter((p) => p.id !== id);
        const ativoMudou = s.personagemAtivoId === id;
        return {
          personagens: novos,
          personagemAtivoId: ativoMudou ? novos[0].id : s.personagemAtivoId,
          personagem: ativoMudou ? novos[0] : s.personagem,
          tokens: s.tokens.filter((t) => t.personagemId !== id),
        };
      }),

      setAtributo: (k, v) => set((s) => {
        const updated = { ...s.personagem, atributos: { ...s.personagem.atributos, [k]: Math.max(0, Math.min(5, v)) } };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),
      setPericia: (k, v) => set((s) => {
        const updated = { ...s.personagem, pericias: { ...s.personagem.pericias, [k]: Math.max(0, Math.min(5, v)) } };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),
      setDisciplina: (k, v) => set((s) => {
        const updated = { ...s.personagem, disciplinas: { ...s.personagem.disciplinas, [k]: Math.max(0, Math.min(5, v)) } };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),
      addVantagem: (v) => set((s) => {
        const updated = { ...s.personagem, vantagens: [...s.personagem.vantagens, v] };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),
      updateVantagem: (i, v) => set((s) => {
        const updated = { ...s.personagem, vantagens: s.personagem.vantagens.map((x, idx) => idx === i ? v : x) };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),
      removeVantagem: (i) => set((s) => {
        const updated = { ...s.personagem, vantagens: s.personagem.vantagens.filter((_, idx) => idx !== i) };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),
      addRitual: (r) => set((s) => {
        const updated = { ...s.personagem, rituais: [...s.personagem.rituais, r] };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),
      removeRitual: (i) => set((s) => {
        const updated = { ...s.personagem, rituais: s.personagem.rituais.filter((_, idx) => idx !== i) };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),
      addEquipamento: (e) => set((s) => {
        const updated = { ...s.personagem, equipamentos: [...s.personagem.equipamentos, e] };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),
      removeEquipamento: (i) => set((s) => {
        const updated = { ...s.personagem, equipamentos: s.personagem.equipamentos.filter((_, idx) => idx !== i) };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),
      addHistorico: (h) => set((s) => {
        const updated = { ...s.personagem, historico: [...s.personagem.historico, h] };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),
      removeHistorico: (i) => set((s) => {
        const updated = { ...s.personagem, historico: s.personagem.historico.filter((_, idx) => idx !== i) };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),
      setNotas: (n) => set((s) => {
        const updated = { ...s.personagem, notas: n };
        return { personagem: updated, personagens: s.personagens.map((p) => (p.id === updated.id ? updated : p)) };
      }),

      mapas: mapasIniciais,
      mapaAtivoId: 'm1',
      setMapaAtivo: (id) => set({ mapaAtivoId: id, selectedTokenId: null, selectedObjectId: null }),
      addMapa: (nome, imageData) => set((s) => {
        const novo: MapaData = { id: `m${Date.now()}`, nome, imageData, camera: { ...cameraPadrao }, gridConfig: { ...gridPadrao } };
        return { mapas: [...s.mapas, novo], mapaAtivoId: novo.id };
      }),
      updateMapaImage: (id, imageData) => set((s) => ({ mapas: s.mapas.map((m) => (m.id === id ? { ...m, imageData } : m)) })),
      deleteMapa: (id) => set((s) => {
        if (s.mapas.length <= 1) return s;
        const novos = s.mapas.filter((m) => m.id !== id);
        return {
          mapas: novos,
          mapaAtivoId: s.mapaAtivoId === id ? novos[0].id : s.mapaAtivoId,
          tokens: s.tokens.filter((t) => t.mapaId !== id),
          drawings: s.drawings.filter((d) => d.mapaId !== id),
          markers: s.markers.filter((m) => m.mapaId !== id),
          texts: s.texts.filter((t) => t.mapaId !== id),
        };
      }),
      renameMapa: (id, nome) => set((s) => ({ mapas: s.mapas.map((m) => (m.id === id ? { ...m, nome } : m)) })),
      duplicateMapa: (id) => set((s) => {
        const orig = s.mapas.find((m) => m.id === id);
        if (!orig) return s;
        return { mapas: [...s.mapas, { ...orig, id: `m${Date.now()}`, nome: `${orig.nome} (cópia)` }] };
      }),
      updateMapaCamera: (id, camera) => set((s) => ({ mapas: s.mapas.map((m) => (m.id === id ? { ...m, camera: { ...m.camera, ...camera } } : m)) })),
      updateMapaGrid: (id, grid) => set((s) => ({ mapas: s.mapas.map((m) => (m.id === id ? { ...m, gridConfig: { ...m.gridConfig, ...grid } } : m)) })),

      activeTool: 'selecionar',
      setActiveTool: (t) => set({ activeTool: t, selectedTokenId: null, selectedObjectId: null, medida: null }),
      drawShape: 'livre', setDrawShape: (s) => set({ drawShape: s }),
      drawColor: '#ef4444', setDrawColor: (c) => set({ drawColor: c }),
      drawStrokeWidth: 3, setDrawStrokeWidth: (w) => set({ drawStrokeWidth: w }),
      markerType: 'interesse', setMarkerType: (t) => set({ markerType: t }),

      layersVisiveis: { grid: true, mapa: true, tokens: true, anotacoes: true },
      toggleLayer: (l) => set((s) => ({ layersVisiveis: { ...s.layersVisiveis, [l]: !s.layersVisiveis[l] } })),
      layersBloqueadas: { tokens: false, anotacoes: false },
      toggleLayerLock: (l) => set((s) => ({ layersBloqueadas: { ...s.layersBloqueadas, [l]: !s.layersBloqueadas[l] } })),

      tokens: tokensIniciais,
      updateTokenPosition: (id, x, y) => set((s) => ({ tokens: s.tokens.map((t) => (t.id === id ? { ...t, x, y } : t)) })),
      updateToken: (id, patch) => set((s) => ({ tokens: s.tokens.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      addToken: (t) => set((s) => { get().pushHistory(); return { tokens: [...s.tokens, { ...t, id: `t${Date.now()}` }] }; }),
      deleteToken: (id) => set((s) => { get().pushHistory(); return { tokens: s.tokens.filter((t) => t.id !== id), selectedTokenId: null }; }),
      duplicateToken: (id) => set((s) => {
        const orig = s.tokens.find((t) => t.id === id);
        if (!orig) return s;
        get().pushHistory();
        return { tokens: [...s.tokens, { ...orig, id: `t${Date.now()}`, x: orig.x + 50, y: orig.y + 50 }] };
      }),
      selectedTokenId: null,
      setSelectedTokenId: (id) => set({ selectedTokenId: id, selectedObjectId: null }),
      clearSelection: () => set({ selectedTokenId: null, selectedObjectId: null }),

      drawings: [],
      addDrawing: (d) => set((s) => { get().pushHistory(); return { drawings: [...s.drawings, { ...d, id: `d${Date.now()}` }] }; }),
      updateDrawing: (id, patch) => set((s) => ({ drawings: s.drawings.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
      removeDrawing: (id) => set((s) => { get().pushHistory(); return { drawings: s.drawings.filter((d) => d.id !== id) }; }),
      markers: [],
      addMarker: (m) => set((s) => { get().pushHistory(); return { markers: [...s.markers, { ...m, id: `mk${Date.now()}` }] }; }),
      updateMarker: (id, patch) => set((s) => ({ markers: s.markers.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      removeMarker: (id) => set((s) => { get().pushHistory(); return { markers: s.markers.filter((m) => m.id !== id) }; }),
      texts: [],
      addText: (t) => set((s) => { get().pushHistory(); return { texts: [...s.texts, { ...t, id: `tx${Date.now()}` }] }; }),
      updateText: (id, patch) => set((s) => ({ texts: s.texts.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeText: (id) => set((s) => { get().pushHistory(); return { texts: s.texts.filter((t) => t.id !== id) }; }),
      selectedObjectId: null,
      setSelectedObjectId: (id) => set({ selectedObjectId: id, selectedTokenId: null }),

      medida: null,
      setMedida: (m) => set({ medida: m }),

      chat: chatInicial,
      addChatMessage: (m) => set((s) => ({ chat: [...s.chat, m] })),
      clearChat: () => set({ chat: [] }),

      history: { past: [], future: [] },
      pushHistory: () => set((s) => ({ history: { past: [...s.history.past.slice(-30), snapshot(s)], future: [] } })),
      undo: () => set((s) => {
        if (s.history.past.length === 0) return s;
        const prev = s.history.past[s.history.past.length - 1];
        return { ...prev, history: { past: s.history.past.slice(0, -1), future: [snapshot(s), ...s.history.future.slice(0, 30)] } };
      }),
      redo: () => set((s) => {
        if (s.history.future.length === 0) return s;
        const next = s.history.future[0];
        return { ...next, history: { past: [...s.history.past, snapshot(s)], future: s.history.future.slice(1) } };
      }),

      clipboard: null,
      setClipboard: (c) => set({ clipboard: c }),

      // Config
      config: configInicial,
      setConfig: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),

      // Biblioteca
      livrosAbertos: [],
      toggleLivroAberto: (id) => set((s) => ({
        livrosAbertos: s.livrosAbertos.includes(id)
          ? s.livrosAbertos.filter((x) => x !== id)
          : [...s.livrosAbertos, id],
      })),
    }),
    {
      name: 'vampiro-v5-store',
      version: 4,
      migrate: (persisted: any, version) => {
        if (version < 4) return undefined as any;
        return persisted;
      },
      partialize: (state) => ({
        personagens: state.personagens,
        personagemAtivoId: state.personagemAtivoId,
        personagem: state.personagem,
        mapas: state.mapas,
        mapaAtivoId: state.mapaAtivoId,
        tokens: state.tokens,
        drawings: state.drawings,
        markers: state.markers,
        texts: state.texts,
        chat: state.chat.slice(-100),
        layersVisiveis: state.layersVisiveis,
        layersBloqueadas: state.layersBloqueadas,
        config: state.config,
        livrosAbertos: state.livrosAbertos,
      }),
    }
  )
);