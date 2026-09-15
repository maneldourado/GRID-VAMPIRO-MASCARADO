'use client';

import { useAppStore, ToolType, DrawShape, MarkerType, MARKER_ICONS, RollResult } from '@/app/store';
import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Text, Group, Image as KonvaImage, Rect, Arrow } from 'react-konva';
import Konva from 'konva';

const FERRAMENTAS: { id: ToolType; nome: string; icone: string }[] = [
  { id: 'selecionar', nome: 'Selecionar', icone: '➤' },
  { id: 'mover', nome: 'Mover', icone: '✥' },
  { id: 'desenhar', nome: 'Desenhar', icone: '✎' },
  { id: 'apagar', nome: 'Apagar', icone: '⊘' },
  { id: 'marcar', nome: 'Marcador', icone: '◉' },
  { id: 'texto', nome: 'Texto', icone: 'T' },
  { id: 'medir', nome: 'Medir', icone: '⟺' },
];

const SHAPES: { id: DrawShape; nome: string; icone: string }[] = [
  { id: 'livre', nome: 'Livre', icone: '〰' },
  { id: 'linha', nome: 'Linha', icone: '—' },
  { id: 'retangulo', nome: 'Retângulo', icone: '▭' },
  { id: 'circulo', nome: 'Círculo', icone: '◯' },
  { id: 'seta', nome: 'Seta', icone: '→' },
];

const MARKER_TYPES: { id: MarkerType; nome: string }[] = [
  { id: 'interesse', nome: 'Interesse' },
  { id: 'perigo', nome: 'Perigo' },
  { id: 'objetivo', nome: 'Objetivo' },
  { id: 'npc', nome: 'NPC' },
  { id: 'entrada', nome: 'Entrada' },
  { id: 'saida', nome: 'Saída' },
  { id: 'evidencia', nome: 'Evidência' },
  { id: 'local', nome: 'Local' },
];

const CORES = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899', '#ffffff', '#000000'];

const DADOS = [
  { l: 'd4', bg: 'bg-blue-950', border: 'border-blue-800', text: 'text-blue-300' },
  { l: 'd6', bg: 'bg-emerald-950', border: 'border-emerald-800', text: 'text-emerald-300' },
  { l: 'd8', bg: 'bg-yellow-950', border: 'border-yellow-800', text: 'text-yellow-300' },
  { l: 'd10', bg: 'bg-red-950', border: 'border-red-800', text: 'text-red-300' },
  { l: 'd12', bg: 'bg-purple-950', border: 'border-purple-800', text: 'text-purple-300' },
  { l: 'd20', bg: 'bg-zinc-900', border: 'border-zinc-700', text: 'text-zinc-300' },
];

export default function MesaModule() {
  const store = useAppStore();
  const {
    personagem: p, personagens, setActiveModule, setPersonagem, setAtributo, setPericia, setDisciplina,
    setPersonagemAtivo,
    mapas, mapaAtivoId, setMapaAtivo, updateMapaImage, addMapa,
    updateMapaCamera, updateMapaGrid,
    activeTool, setActiveTool,
    drawShape, setDrawShape, drawColor, setDrawColor, drawStrokeWidth, setDrawStrokeWidth,
    markerType, setMarkerType,
    layersVisiveis, toggleLayer, layersBloqueadas,
    tokens, updateToken, addToken, deleteToken, duplicateToken,
    selectedTokenId, setSelectedTokenId, clearSelection,
    drawings, addDrawing, removeDrawing,
    markers, addMarker, removeMarker,
    texts, addText, updateText, removeText,
    selectedObjectId, setSelectedObjectId,
    medida, setMedida,
    chat, addChatMessage,
    undo, redo,
  } = store;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [chatInput, setChatInput] = useState('');
  const [diceInput, setDiceInput] = useState('1d10 + 2');
  const [hungerDice, setHungerDice] = useState(2);
  const [fichaTab, setFichaTab] = useState<'Atributos' | 'Habilidades' | 'Disciplinas' | 'Virtudes' | 'Relações'>('Atributos');

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'token' | 'drawing' | 'marker' | 'text'; id: string } | null>(null);
  const [hoveredToken, setHoveredToken] = useState<{ id: string; x: number; y: number } | null>(null);
  const [editingText, setEditingText] = useState<{ id: string; texto: string } | null>(null);
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [showNomes, setShowNomes] = useState(true);

  const atributos = p.atributos ?? {
    forca: 0, destreza: 0, vigor: 0,
    carisma: 0, manipulacao: 0, compostura: 0,
    inteligencia: 0, raciocinio: 0, determinacao: 0,
  };
  const pericias = p.pericias ?? {};
  const disciplinas = p.disciplinas ?? {};

  const mapaAtivo = mapas.find((m) => m.id === mapaAtivoId);
  const camera = mapaAtivo?.camera ?? { x: 0, y: 0, zoom: 100 };
  const gridConfig = mapaAtivo?.gridConfig ?? { size: 50, color: '#2a2a2a', opacity: 1, lineWidth: 1, visivel: true };
  const gridSize = gridConfig.size;

  const tokensDoMapa = tokens.filter((t) => t.mapaId === mapaAtivoId);
  const drawingsDoMapa = drawings.filter((d) => d.mapaId === mapaAtivoId);
  const markersDoMapa = markers.filter((m) => m.mapaId === mapaAtivoId);
  const textsDoMapa = texts.filter((t) => t.mapaId === mapaAtivoId);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!mapaAtivo?.imageData) { setMapImage(null); setImageSize({ width: 0, height: 0 }); return; }
    const img = new window.Image();
    img.src = mapaAtivo.imageData;
    img.onload = () => {
      setMapImage(img);
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      if (containerSize.width > 0 && containerSize.height > 0) {
        const padding = 40;
        const zoomX = ((containerSize.width - padding) / img.naturalWidth) * 100;
        const zoomY = ((containerSize.height - padding) / img.naturalHeight) * 100;
        const newZoom = Math.max(25, Math.min(300, Math.min(zoomX, zoomY)));
        updateMapaCamera(mapaAtivoId, {
          zoom: Math.round(newZoom),
          x: (containerSize.width - img.naturalWidth * (newZoom / 100)) / 2,
          y: (containerSize.height - img.naturalHeight * (newZoom / 100)) / 2,
        });
        const gridIdeal = Math.max(25, Math.round(img.naturalWidth / 40));
        if (gridIdeal >= 25 && gridIdeal <= 120) updateMapaGrid(mapaAtivoId, { size: gridIdeal });
      }
    };
  }, [mapaAtivo?.imageData, containerSize.width, containerSize.height, mapaAtivoId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
        if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); return; }
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTokenId) deleteToken(selectedTokenId);
        else if (selectedObjectId) {
          if (selectedObjectId.startsWith('d')) removeDrawing(selectedObjectId);
          else if (selectedObjectId.startsWith('mk')) removeMarker(selectedObjectId);
          else if (selectedObjectId.startsWith('tx')) removeText(selectedObjectId);
        }
        return;
      }
      if (e.key === 'Escape') { clearSelection(); setContextMenu(null); return; }
      switch (e.key.toLowerCase()) {
        case 'v': setActiveTool('selecionar'); break;
        case 'h': setActiveTool('mover'); break;
        case 'd': setActiveTool('desenhar'); break;
        case 'm': setActiveTool('marcar'); break;
        case 't': setActiveTool('texto'); break;
        case 'r': setActiveTool('medir'); break;
        case 'x': setActiveTool('apagar'); break;
        case '+': case '=': updateMapaCamera(mapaAtivoId, { zoom: Math.min(300, camera.zoom + 10) }); break;
        case '-': updateMapaCamera(mapaAtivoId, { zoom: Math.max(25, camera.zoom - 10) }); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedTokenId, selectedObjectId, camera.zoom, mapaAtivoId, undo, redo]);

  useEffect(() => {
    const h = () => setContextMenu(null);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, []);

  const getPointer = () => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pointer = stage.getPointerPosition();
    if (!pointer) return { x: 0, y: 0 };
    return stage.getAbsoluteTransform().copy().invert().point(pointer);
  };
  const updateCamera = (patch: Partial<typeof camera>) => updateMapaCamera(mapaAtivoId, patch);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const oldZoom = camera.zoom;
    const newZoom = Math.max(25, Math.min(300, oldZoom + (e.evt.deltaY < 0 ? 5 : -5)));
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) { updateCamera({ zoom: newZoom }); return; }
    const mp = { x: (pointer.x - camera.x) / (oldZoom / 100), y: (pointer.y - camera.y) / (oldZoom / 100) };
    updateCamera({ zoom: newZoom, x: pointer.x - mp.x * (newZoom / 100), y: pointer.y - mp.y * (newZoom / 100) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateMapaImage(mapaAtivoId, reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPersonagem({ avatarUrl: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (layersBloqueadas.anotacoes && ['desenhar', 'marcar', 'texto'].includes(activeTool)) return;
    const { x, y } = getPointer();
    if (activeTool === 'desenhar') { setIsDrawing(true); setStartPoint({ x, y }); setCurrentLine([x, y, x, y]); }
    else if (activeTool === 'marcar') { addMarker({ x, y, tipo: markerType, cor: drawColor, titulo: '', descricao: '', mapaId: mapaAtivoId }); }
    else if (activeTool === 'texto') { addText({ x, y, texto: 'Novo texto', fontSize: 16, color: drawColor, bold: false, mapaId: mapaAtivoId }); }
    else if (activeTool === 'medir') { setMedida({ x1: x, y1: y, x2: x, y2: y }); }
    else if (activeTool === 'selecionar' && e.target === e.target.getStage()) { clearSelection(); }
  };

  const handleMouseMove = () => {
    const { x, y } = getPointer();
    if (activeTool === 'desenhar' && isDrawing && startPoint) {
      if (drawShape === 'livre') setCurrentLine((prev) => [...prev, x, y]);
      else setCurrentLine([startPoint.x, startPoint.y, x, y]);
    } else if (activeTool === 'medir' && medida) { setMedida({ ...medida, x2: x, y2: y }); }
  };

  const handleMouseUp = () => {
    if (activeTool === 'desenhar' && isDrawing && currentLine.length >= 4) {
      addDrawing({ shape: drawShape, points: currentLine, color: drawColor, opacity: 1, strokeWidth: drawStrokeWidth, mapaId: mapaAtivoId });
    }
    setIsDrawing(false); setCurrentLine([]); setStartPoint(null);
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current; if (!stage) return;
    const pointer = stage.getPointerPosition(); if (!pointer) return;
    let type: any = null; let id = '';
    if (e.target.attrs['data-token-id']) { type = 'token'; id = e.target.attrs['data-token-id']; }
    else if (e.target.attrs['data-drawing-id']) { type = 'drawing'; id = e.target.attrs['data-drawing-id']; }
    else if (e.target.attrs['data-marker-id']) { type = 'marker'; id = e.target.attrs['data-marker-id']; }
    else if (e.target.attrs['data-text-id']) { type = 'text'; id = e.target.attrs['data-text-id']; }
    if (type) setContextMenu({ x: pointer.x, y: pointer.y, type, id });
  };

  const rolarV5 = () => {
    const match = diceInput.match(/(\d+)d10/i);
    if (!match) {
      addChatMessage({ id: Date.now().toString(), tipo: 'system', autor: 'Sistema', texto: '❌ Use formato Nd10', cor: 'text-yellow-500', timestamp: Date.now() });
      return;
    }
    const totalDice = parseInt(match[1]);
    const hungerCount = Math.min(hungerDice, totalDice);
    const normalCount = totalDice - hungerCount;
    const rolls: number[] = []; const hungerRolls: number[] = [];
    for (let i = 0; i < normalCount; i++) rolls.push(Math.floor(Math.random() * 10) + 1);
    for (let i = 0; i < hungerCount; i++) hungerRolls.push(Math.floor(Math.random() * 10) + 1);
    let sucessos = 0, pares10 = 0, dezH = 0;
    rolls.forEach((r) => { if (r === 10) { sucessos += 2; pares10++; } else if (r >= 6) sucessos += 1; });
    hungerRolls.forEach((r) => { if (r === 10) { sucessos += 2; pares10++; dezH++; } else if (r >= 6) sucessos += 1; });
    const critico = pares10 >= 2;
    const bagunçado = critico && dezH > 0;
    const falhaBestial = sucessos === 0 && hungerRolls.includes(1);
    const resultado: RollResult = { rolls, hungerRolls, sucessos, critico, falhaBestial, bagunçado };
    addChatMessage({ id: Date.now().toString(), tipo: 'roll', autor: p.nome, texto: '', cor: 'text-red-400', timestamp: Date.now(), roll: resultado });
  };

  const enviarChat = () => {
    if (!chatInput.trim()) return;
    addChatMessage({ id: Date.now().toString(), tipo: 'chat', autor: p.nome, texto: chatInput, cor: 'text-red-500', timestamp: Date.now() });
    setChatInput('');
  };

  const renderGrid = () => {
    if (!layersVisiveis.grid || !gridConfig.visivel) return null;
    const lines = [];
    const hasImage = imageSize.width > 0;
    const width = hasImage ? imageSize.width : containerSize.width;
    const height = hasImage ? imageSize.height : containerSize.height;
    const offsetX = hasImage ? 0 : -40 * gridSize;
    const offsetY = hasImage ? 0 : -40 * gridSize;
    const cols = Math.ceil(width / gridSize);
    const rows = Math.ceil(height / gridSize);
    for (let i = 0; i <= cols; i++) {
      lines.push(<Line key={`v${i}`} points={[i * gridSize, offsetY, i * gridSize, offsetY + height + (hasImage ? 0 : 80 * gridSize)]} stroke={gridConfig.color} strokeWidth={gridConfig.lineWidth} opacity={gridConfig.opacity} listening={false} />);
    }
    for (let i = 0; i <= rows; i++) {
      lines.push(<Line key={`h${i}`} points={[offsetX, i * gridSize, offsetX + width + (hasImage ? 0 : 80 * gridSize), i * gridSize]} stroke={gridConfig.color} strokeWidth={gridConfig.lineWidth} opacity={gridConfig.opacity} listening={false} />);
    }
    return lines;
  };

  const fitToScreen = () => {
    if (imageSize.width > 0) {
      const padding = 40;
      const zoomX = ((containerSize.width - padding) / imageSize.width) * 100;
      const zoomY = ((containerSize.height - padding) / imageSize.height) * 100;
      const newZoom = Math.max(25, Math.min(300, Math.min(zoomX, zoomY)));
      updateMapaCamera(mapaAtivoId, {
        zoom: Math.round(newZoom),
        x: (containerSize.width - imageSize.width * (newZoom / 100)) / 2,
        y: (containerSize.height - imageSize.height * (newZoom / 100)) / 2,
      });
    } else { updateMapaCamera(mapaAtivoId, { zoom: 100, x: 0, y: 0 }); }
  };

  const cursorClass =
    activeTool === 'mover' ? 'cursor-grab active:cursor-grabbing' :
    activeTool === 'selecionar' ? 'cursor-default' :
    activeTool === 'desenhar' ? 'cursor-crosshair' :
    activeTool === 'texto' ? 'cursor-text' :
    activeTool === 'medir' ? 'cursor-crosshair' : 'cursor-pointer';

  const distanciaMedida = medida ? Math.sqrt(Math.pow(medida.x2 - medida.x1, 2) + Math.pow(medida.y2 - medida.y1, 2)) : 0;
  const quadrados = Math.round(distanciaMedida / gridSize);
  const metros = Math.round(quadrados * 1.5 * 10) / 10;
  const tokenHover = hoveredToken ? tokens.find((t) => t.id === hoveredToken.id) : null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-[family-name:var(--font-inter)] text-zinc-100"
      style={{ background: '#050202' }}>

      {/* ============ TOPBAR ============ */}
      <header className="h-12 flex items-center justify-between shrink-0 z-30 border-b"
        style={{ background: 'linear-gradient(180deg, #0a0404 0%, #070202 100%)', borderColor: 'rgba(127,29,29,0.35)' }}>

        <div className="flex items-center h-full">
          <div className="flex items-center px-4 h-full border-r" style={{ borderColor: 'rgba(127,29,29,0.35)' }}>
            <span className="font-[family-name:var(--font-cinzel)] text-3xl font-black leading-none"
              style={{ color: '#991b1b', textShadow: '0 0 12px rgba(153,27,27,0.5)' }}>V</span>
            <span className="font-[family-name:var(--font-cinzel)] text-xl font-black leading-none mt-1" style={{ color: '#dc2626' }}>5</span>
          </div>

          <nav className="flex items-center h-full text-[11px] font-medium">
            <button onClick={() => setActiveModule('mesa')}
              className="flex items-center gap-1.5 px-4 h-full text-red-500 border-b-2 border-red-600">
              <span className="text-[13px]">▦</span> Mesa
            </button>
            <button onClick={() => setActiveModule('ficha')}
              className="flex items-center gap-1.5 px-4 h-full text-zinc-500 hover:text-white transition-colors">
              <span className="text-[13px]">👤</span> Fichas
            </button>
            <button onClick={() => setActiveModule('biblioteca')}
              className="flex items-center gap-1.5 px-4 h-full text-zinc-500 hover:text-white transition-colors">
              <span className="text-[13px]">▦</span> Biblioteca
            </button>
            <button onClick={() => setActiveModule('cenario')}
              className="flex items-center gap-1.5 px-4 h-full text-zinc-500 hover:text-white transition-colors">
              <span className="text-[13px]">⚔</span> Cenário
            </button>
            <button onClick={() => setActiveModule('config')}
              className="flex items-center gap-1.5 px-4 h-full text-zinc-500 hover:text-white transition-colors">
              <span className="text-[13px]">⚙</span> Configurações
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4 pr-4">
          <span className="text-zinc-600 text-[11px]">Mesa: Noite em Seattle</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]"></span>
            <span className="text-green-500 text-[11px] font-medium">Online</span>
          </div>
          <button onClick={() => setActiveModule('home')} className="text-zinc-600 hover:text-white text-sm">⏸</button>
          <button className="text-zinc-600 hover:text-white text-sm">⋯</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ============ SIDEBAR ESQUERDA ============ */}
        <aside className="w-56 flex flex-col shrink-0 overflow-y-auto border-r"
          style={{ background: '#080404', borderColor: 'rgba(127,29,29,0.35)' }}>

          <div className="p-3">
            <h3 className="text-[10px] uppercase text-red-800 font-bold mb-2.5 tracking-[0.15em]">Ferramentas</h3>
            <div className="flex flex-col gap-0.5 text-[11px]">
              {FERRAMENTAS.map((f) => {
                const ativo = activeTool === f.id;
                return (
                  <button key={f.id} onClick={() => setActiveTool(f.id)}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-sm text-left transition-all ${ativo ? 'text-red-400 font-semibold' : 'text-zinc-500 hover:text-zinc-200'}`}
                    style={ativo ? { background: 'rgba(127,29,29,0.25)', boxShadow: 'inset 2px 0 0 #dc2626' } : {}}>
                    <span className="w-4 text-center text-[13px]">{f.icone}</span>
                    <span>{f.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeTool === 'desenhar' && (
            <div className="p-3 border-t" style={{ borderColor: 'rgba(127,29,29,0.25)' }}>
              <h3 className="text-[10px] uppercase text-red-700 font-bold mb-2 tracking-[0.15em]">Forma</h3>
              <div className="grid grid-cols-5 gap-1 mb-2">
                {SHAPES.map((s) => (
                  <button key={s.id} onClick={() => setDrawShape(s.id)} title={s.nome}
                    className={`aspect-square rounded-sm text-sm ${drawShape === s.id ? 'bg-red-900/60 text-white' : 'bg-zinc-900/60 text-zinc-500 hover:bg-zinc-800'}`}>{s.icone}</button>
                ))}
              </div>
              <div className="grid grid-cols-8 gap-1 mb-2">
                {CORES.map((c) => (
                  <button key={c} onClick={() => setDrawColor(c)}
                    className={`w-4 h-4 rounded-full border ${drawColor === c ? 'border-white' : 'border-transparent'}`}
                    style={{ background: c }} />
                ))}
              </div>
              <input type="range" min="1" max="12" value={drawStrokeWidth}
                onChange={(e) => setDrawStrokeWidth(parseInt(e.target.value))} className="w-full accent-red-700" />
            </div>
          )}

          {activeTool === 'marcar' && (
            <div className="p-3 border-t" style={{ borderColor: 'rgba(127,29,29,0.25)' }}>
              <h3 className="text-[10px] uppercase text-red-700 font-bold mb-2 tracking-[0.15em]">Marcador</h3>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                {MARKER_TYPES.map((m) => (
                  <button key={m.id} onClick={() => setMarkerType(m.id)}
                    className={`px-2 py-1 rounded-sm text-left flex items-center gap-1 ${markerType === m.id ? 'bg-red-900/60 text-white' : 'bg-zinc-900/60 text-zinc-500 hover:bg-zinc-800'}`}>
                    <span>{MARKER_ICONS[m.id]}</span> {m.nome}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 border-t" style={{ borderColor: 'rgba(127,29,29,0.25)' }}>
            <h3 className="text-[10px] uppercase text-red-800 font-bold mb-2.5 tracking-[0.15em]">Camadas</h3>
            <div className="flex flex-col gap-1.5 text-[11px]">
              {(['grid', 'mapa', 'tokens', 'anotacoes'] as const).map((k) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-zinc-500 capitalize">{k === 'anotacoes' ? 'Anotações' : k}</span>
                  <button onClick={() => toggleLayer(k)} className={`text-sm ${layersVisiveis[k] ? 'text-zinc-400' : 'text-zinc-700'}`}>
                    {layersVisiveis[k] ? '👁' : '👁‍🗨'}
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Nomes</span>
                <button onClick={() => setShowNomes(!showNomes)} className={`text-sm ${showNomes ? 'text-zinc-400' : 'text-zinc-700'}`}>
                  {showNomes ? '👁' : '👁‍🗨'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 border-t" style={{ borderColor: 'rgba(127,29,29,0.25)' }}>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[10px] uppercase text-red-800 font-bold tracking-[0.15em]">Mapas</h3>
              <button onClick={() => { const n = prompt('Nome:'); if (n) addMapa(n, null); }} className="text-red-700 hover:text-red-500 text-sm">+</button>
            </div>
            <div className="flex flex-col gap-1.5">
              {mapas.map((m) => {
                const ativo = mapaAtivoId === m.id;
                return (
                  <button key={m.id} onClick={() => setMapaAtivo(m.id)}
                    className={`flex items-center gap-2 p-1.5 rounded-sm text-left transition-all ${ativo ? '' : 'hover:bg-zinc-900/40'}`}
                    style={ativo ? { background: 'rgba(127,29,29,0.2)', boxShadow: 'inset 2px 0 0 #991b1b' } : {}}>
                    <div className={`w-10 h-10 rounded-sm shrink-0 border ${m.imageData ? 'bg-cover bg-center' : 'bg-zinc-900 border-zinc-800'}`}
                      style={m.imageData ? { backgroundImage: `url(${m.imageData})` } : {}} />
                    <div className="min-w-0 flex-1">
                      <div className={`text-[11px] font-medium truncate ${ativo ? 'text-white' : 'text-zinc-400'}`}>{m.nome}</div>
                      {ativo && <div className="text-[9px] text-red-600">Ativo</div>}
                    </div>
                  </button>
                );
              })}
              <button onClick={() => { const n = prompt('Nome:'); if (n) addMapa(n, null); }}
                className="text-[10px] text-zinc-600 hover:text-red-500 text-left mt-1">+ Adicionar Mapa</button>
            </div>
          </div>
        </aside>

        {/* ============ CENTRO (GRID) ============ */}
        <main ref={containerRef} className={`flex-1 relative overflow-hidden ${cursorClass}`}
          style={{ background: 'radial-gradient(ellipse at center, #1a0808 0%, #050202 100%)' }}>

          <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-1 pointer-events-auto">
              <button className="p-1.5 rounded-sm text-zinc-500 hover:text-white hover:bg-black/60 transition-colors">☰</button>
              <button onClick={() => toggleLayer('mapa')} className="p-1.5 rounded-sm text-zinc-500 hover:text-white hover:bg-black/60 transition-colors">👁</button>
              <button className="p-1.5 rounded-sm text-zinc-500 hover:text-white hover:bg-black/60 transition-colors">⚙</button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm pointer-events-auto border"
              style={{ background: 'rgba(8,4,4,0.9)', borderColor: 'rgba(127,29,29,0.4)', backdropFilter: 'blur(8px)' }}>
              <span className="text-zinc-600 text-[11px]">Mapa:</span>
              <span className="text-zinc-200 text-[11px] font-medium">{mapaAtivo?.nome}</span>
              <span className="text-zinc-700 text-[10px]">▾</span>
            </div>

            <div className="flex items-center gap-1 pointer-events-auto">
              <button className="p-1.5 rounded-sm text-zinc-500 hover:text-white hover:bg-black/60 transition-colors">🔍</button>
              <div className="flex items-center gap-1 px-2 py-1 rounded-sm border"
                style={{ background: 'rgba(8,4,4,0.9)', borderColor: 'rgba(127,29,29,0.4)' }}>
                <button onClick={() => updateCamera({ zoom: camera.zoom - 10 })} className="text-zinc-500 hover:text-white px-0.5 text-xs">−</button>
                <span className="text-zinc-300 w-11 text-center font-mono text-[10px]">{camera.zoom}%</span>
                <button onClick={() => updateCamera({ zoom: camera.zoom + 10 })} className="text-zinc-500 hover:text-white px-0.5 text-xs">+</button>
              </div>
              <button onClick={fitToScreen} className="p-1.5 rounded-sm text-zinc-500 hover:text-white hover:bg-black/60 transition-colors">⛶</button>
              <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-sm text-zinc-500 hover:text-yellow-500 hover:bg-black/60 transition-colors" title="Carregar mapa">📁</button>
              <button className="p-1.5 rounded-sm text-zinc-500 hover:text-white hover:bg-black/60 transition-colors">⋯</button>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileUpload} className="hidden" />
            </div>
          </div>

          {!mapImage && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center px-12 py-8 rounded-lg border-2 border-dashed" style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
                <div className="text-red-900 text-4xl mb-3">▦</div>
                <p className="text-zinc-600 text-xs mb-2">Nenhum mapa carregado</p>
                <button onClick={() => fileInputRef.current?.click()} className="pointer-events-auto text-[10px] text-red-600 hover:text-red-400 mt-2 underline">
                  Clique aqui para escolher um PNG ou JPG
                </button>
              </div>
            </div>
          )}

          {activeTool === 'medir' && medida && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-sm px-4 py-1.5 text-xs z-20 border shadow-lg"
              style={{ background: 'rgba(127,29,29,0.95)', borderColor: '#991b1b' }}>
              📏 <span className="font-bold text-white">{quadrados} quadrados</span> ≈ <span className="text-white">{metros}m</span>
            </div>
          )}

          {mounted && containerSize.width > 0 && (
            <Stage ref={stageRef} width={containerSize.width} height={containerSize.height}
              x={camera.x} y={camera.y} scaleX={camera.zoom / 100} scaleY={camera.zoom / 100}
              draggable={activeTool === 'mover'}
              onDragEnd={(e) => { if (activeTool === 'mover') updateCamera({ x: e.target.x(), y: e.target.y() }); }}
              onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp} onContextMenu={handleContextMenu}>

              {layersVisiveis.mapa && mapImage && <Layer listening={false}><KonvaImage image={mapImage} /></Layer>}
              <Layer listening={false}>{renderGrid()}</Layer>

              {layersVisiveis.anotacoes && (
                <Layer>
                  {drawingsDoMapa.map((d) => {
                    const isSel = selectedObjectId === d.id;
                    if (d.shape === 'retangulo') { const [x1, y1, x2, y2] = d.points; return <Rect key={d.id} x={Math.min(x1, x2)} y={Math.min(y1, y2)} width={Math.abs(x2 - x1)} height={Math.abs(y2 - y1)} stroke={isSel ? '#fbbf24' : d.color} strokeWidth={d.strokeWidth} opacity={d.opacity} data-drawing-id={d.id} hitStrokeWidth={10} />; }
                    if (d.shape === 'circulo') { const [x1, y1, x2, y2] = d.points; return <Circle key={d.id} x={x1} y={y1} radius={Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))} stroke={isSel ? '#fbbf24' : d.color} strokeWidth={d.strokeWidth} opacity={d.opacity} data-drawing-id={d.id} hitStrokeWidth={10} />; }
                    if (d.shape === 'seta') { const [x1, y1, x2, y2] = d.points; return <Arrow key={d.id} points={[x1, y1, x2, y2]} stroke={isSel ? '#fbbf24' : d.color} fill={d.color} strokeWidth={d.strokeWidth} opacity={d.opacity} pointerLength={12} pointerWidth={10} data-drawing-id={d.id} hitStrokeWidth={10} />; }
                    return <Line key={d.id} points={d.points} stroke={isSel ? '#fbbf24' : d.color} strokeWidth={d.strokeWidth} tension={d.shape === 'livre' ? 0.5 : 0} lineCap="round" lineJoin="round" opacity={d.opacity} data-drawing-id={d.id} hitStrokeWidth={10} />;
                  })}

                  {isDrawing && currentLine.length >= 4 && (() => {
                    const c = { stroke: drawColor, strokeWidth: drawStrokeWidth, opacity: 0.7, listening: false };
                    if (drawShape === 'retangulo') { const [x1, y1, x2, y2] = currentLine; return <Rect x={Math.min(x1, x2)} y={Math.min(y1, y2)} width={Math.abs(x2 - x1)} height={Math.abs(y2 - y1)} {...c} />; }
                    if (drawShape === 'circulo') { const [x1, y1, x2, y2] = currentLine; return <Circle x={x1} y={y1} radius={Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))} {...c} />; }
                    if (drawShape === 'seta') return <Arrow points={currentLine} fill={drawColor} pointerLength={12} pointerWidth={10} {...c} />;
                    return <Line points={currentLine} tension={drawShape === 'livre' ? 0.5 : 0} lineCap="round" {...c} />;
                  })()}

                  {markersDoMapa.map((m) => (
                    <Group key={m.id} x={m.x} y={m.y} data-marker-id={m.id}>
                      <Circle radius={14} fill={m.cor} stroke={selectedObjectId === m.id ? '#fbbf24' : 'white'} strokeWidth={2} opacity={0.95} data-marker-id={m.id} />
                      <Text text={MARKER_ICONS[m.tipo]} fontSize={14} fill="white" align="center" width={28} offsetX={14} offsetY={7} listening={false} />
                    </Group>
                  ))}

                  {textsDoMapa.map((t) => (
                    <Text key={t.id} x={t.x} y={t.y} text={t.texto} fontSize={t.fontSize} fill={t.color} fontStyle={t.bold ? 'bold' : 'normal'}
                      stroke={selectedObjectId === t.id ? '#fbbf24' : undefined} strokeWidth={selectedObjectId === t.id ? 1 : 0}
                      data-text-id={t.id} draggable={activeTool === 'selecionar'}
                      onDragEnd={(e) => updateText(t.id, { x: e.target.x(), y: e.target.y() })}
                      onClick={() => setSelectedObjectId(t.id)} />
                  ))}

                  {medida && activeTool === 'medir' && (
                    <>
                      <Line points={[medida.x1, medida.y1, medida.x2, medida.y2]} stroke="#fbbf24" strokeWidth={2} dash={[8, 4]} listening={false} />
                      <Circle x={medida.x1} y={medida.y1} radius={5} fill="#fbbf24" listening={false} />
                      <Circle x={medida.x2} y={medida.y2} radius={5} fill="#fbbf24" listening={false} />
                    </>
                  )}
                </Layer>
              )}

              {layersVisiveis.tokens && (
                <Layer>
                  {tokensDoMapa.filter((t) => t.visivel).map((t) => {
                    const isSel = selectedTokenId === t.id;
                    const r = t.size / 2.5;
                    const pc = t.personagemId ? personagens.find((x) => x.id === t.personagemId) : null;
                    return (
                      <Group key={t.id} x={t.x} y={t.y}
                        draggable={!t.bloqueado && !layersBloqueadas.tokens && (activeTool === 'selecionar' || activeTool === 'mover')}
                        onClick={() => activeTool === 'selecionar' && setSelectedTokenId(t.id)}
                        onDblClick={() => {
                          if (t.personagemId) {
                            setPersonagemAtivo(t.personagemId);
                            setActiveModule('ficha');
                          }
                        }}
                        onMouseEnter={() => setHoveredToken({ id: t.id, x: t.x, y: t.y })}
                        onMouseLeave={() => setHoveredToken(null)}
                        onDragEnd={(e) => {
                          const nx = Math.round(e.target.x() / gridSize) * gridSize;
                          const ny = Math.round(e.target.y() / gridSize) * gridSize;
                          updateToken(t.id, { x: nx, y: ny });
                        }}>
                        {isSel && <Circle radius={r + 7} stroke="#dc2626" strokeWidth={2} dash={[6, 4]} listening={false} />}
                        <Circle radius={r + 2} fill="transparent" stroke="#1a0606" strokeWidth={3} listening={false} />
                        <Circle radius={r} fill={t.cor} stroke={isSel ? '#dc2626' : '#7f1d1d'} strokeWidth={2.5} data-token-id={t.id} />
                        <Circle radius={r - 3} fill="transparent" stroke="rgba(255,255,255,0.15)" strokeWidth={1} listening={false} />
                        <Text text={pc ? pc.nome.substring(0, 2).toUpperCase() : t.nome.substring(0, 2).toUpperCase()}
                          fontSize={12} fontStyle="bold" fill="white"
                          align="center" width={r * 2} offsetX={r} offsetY={4} listening={false} />
                        {showNomes && (
                          <Text text={pc ? pc.nome.split(' ')[0] : t.nome.split(' ')[0]} fontSize={10} fill="#d4d4d8" align="center"
                            width={100} offsetX={50} offsetY={-r - 18} listening={false} />
                        )}
                      </Group>
                    );
                  })}
                </Layer>
              )}
            </Stage>
          )}

          {tokenHover && (() => {
            const t = tokens.find((x) => x.id === tokenHover.id);
            if (!t) return null;
            const pc = t.personagemId ? personagens.find((x) => x.id === t.personagemId) : null;

            if (!pc) {
              return (
                <div className="absolute pointer-events-none rounded-sm p-3 text-xs z-30 shadow-2xl w-52 border"
                  style={{ left: tokenHover.x + 40, top: tokenHover.y - 20, background: 'rgba(8,4,4,0.97)', borderColor: 'rgba(153,27,27,0.6)', backdropFilter: 'blur(8px)' }}>
                  <p className="text-white font-bold text-sm uppercase tracking-wider">{t.nome}</p>
                  <p className="text-zinc-600 text-[10px] italic mt-1">Token sem ficha vinculada</p>
                </div>
              );
            }

            const vit = 7;
            const fome = pc.desequilibrio ?? 0;
            const fv = 5 + (pc.atributos?.determinacao ?? 0);
            const disciplinasArr = Object.entries(pc.disciplinas ?? {}).filter(([_, v]) => v > 0);

            return (
              <div className="absolute pointer-events-none rounded-sm z-30 shadow-2xl w-72 border overflow-hidden"
                style={{ left: tokenHover.x + 40, top: tokenHover.y - 20, background: 'rgba(8,4,4,0.98)', borderColor: 'rgba(153,27,27,0.7)', backdropFilter: 'blur(10px)' }}>

                <div className="flex gap-2 p-2.5 border-b" style={{ borderColor: 'rgba(127,29,29,0.4)', background: 'rgba(127,29,29,0.1)' }}>
                  <div className="w-12 h-14 rounded-sm overflow-hidden border shrink-0"
                    style={{ borderColor: 'rgba(153,27,27,0.6)', background: 'linear-gradient(135deg, #1a0808 0%, #0a0404 100%)' }}>
                    {pc.avatarUrl ? (
                      <img src={pc.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-red-900 font-[family-name:var(--font-cinzel)] text-xl font-black">{pc.nome.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm uppercase tracking-wider truncate">{pc.nome}</p>
                    <p className="text-red-500 text-[10px]">🌹 {pc.cla} • Geração {pc.geracao}</p>
                    <p className="text-zinc-500 text-[9px] mt-0.5 truncate">{pc.conceito}</p>
                  </div>
                </div>

                <div className="p-2.5 space-y-2">
                  <div>
                    <div className="flex justify-between text-[9px] mb-1"><span className="text-zinc-500 uppercase tracking-widest">Vitalidade</span><span className="text-white font-bold">{vit}/7</span></div>
                    <div className="flex gap-0.5">{Array.from({ length: 7 }).map((_, i) => <div key={i} className={`flex-1 h-2 rounded-sm ${i < vit ? 'bg-red-700' : 'bg-zinc-900 border border-zinc-800'}`} />)}</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] mb-1"><span className="text-zinc-500 uppercase tracking-widest">F. de Vontade</span><span className="text-white font-bold">{fv}</span></div>
                    <div className="flex gap-0.5">{Array.from({ length: 10 }).map((_, i) => <div key={i} className={`flex-1 h-2 rounded-sm ${i < fv ? 'bg-blue-800' : 'bg-zinc-900 border border-zinc-800'}`} />)}</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] mb-1"><span className="text-zinc-500 uppercase tracking-widest">Fome</span><span className="text-orange-500 font-bold">{fome}/5</span></div>
                    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className={`flex-1 h-2 rounded-sm ${i < fome ? 'bg-orange-700' : 'bg-zinc-900 border border-zinc-800'}`} />)}</div>
                  </div>

                  <div className="pt-1.5 border-t" style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Atributos</p>
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      {[
                        ['FOR', pc.atributos?.forca ?? 0],
                        ['DES', pc.atributos?.destreza ?? 0],
                        ['VIG', pc.atributos?.vigor ?? 0],
                        ['CAR', pc.atributos?.carisma ?? 0],
                        ['MAN', pc.atributos?.manipulacao ?? 0],
                        ['INT', pc.atributos?.inteligencia ?? 0],
                      ].map(([label, v]) => (
                        <div key={label as string} className="flex items-center justify-between bg-red-950/30 rounded-sm px-1.5 py-0.5 border border-red-950/50">
                          <span className="text-zinc-500 text-[9px]">{label}</span>
                          <span className="text-white font-bold text-[10px]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {disciplinasArr.length > 0 && (
                    <div className="pt-1.5 border-t" style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
                      <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Disciplinas</p>
                      <div className="flex flex-wrap gap-1">
                        {disciplinasArr.slice(0, 5).map(([nome, nivel]) => (
                          <span key={nome} className="text-[9px] px-1.5 py-0.5 rounded-sm bg-red-950/60 border border-red-900/60 text-red-300">
                            {nome} <span className="text-red-500 font-bold">●{nivel}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-1.5 border-t flex items-center justify-between" style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Humanidade</span>
                    <div className="flex gap-0.5">{Array.from({ length: 10 }).map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (pc.humanidade ?? 0) ? 'bg-red-600' : 'bg-zinc-800'}`} />)}</div>
                    <span className="text-red-500 text-[10px] font-bold">{pc.humanidade}</span>
                  </div>
                </div>

                <div className="px-2.5 py-1.5 border-t flex items-center justify-between text-[9px]"
                  style={{ borderColor: 'rgba(127,29,29,0.4)', background: 'rgba(127,29,29,0.1)' }}>
                  <span className="text-zinc-600 italic">Duplo-clique para abrir ficha</span>
                </div>
              </div>
            );
          })()}

          <div className="absolute bottom-3 left-3 flex items-end gap-3 z-20">
            <div className="w-14 h-14 flex items-center justify-center relative">
              <div className="absolute top-0 text-[9px] text-red-700 font-bold">N</div>
              <div className="absolute bottom-0 text-[9px] text-zinc-600">S</div>
              <div className="absolute left-0 text-[9px] text-zinc-600">W</div>
              <div className="absolute right-0 text-[9px] text-zinc-600">E</div>
              <div className="w-9 h-9 rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(127,29,29,0.5)' }}>
                <div className="w-0.5 h-3 bg-red-700 rounded-full"></div>
              </div>
            </div>
            <div className="rounded-sm px-2 py-1 text-[10px] text-zinc-500 border"
              style={{ background: 'rgba(8,4,4,0.85)', borderColor: 'rgba(127,29,29,0.35)' }}>
              1 quadrado = 1.5 m
            </div>
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 rounded-sm p-1.5 border"
            style={{ background: 'rgba(8,4,4,0.9)', borderColor: 'rgba(127,29,29,0.4)', backdropFilter: 'blur(8px)' }}>
            {mapas.slice(0, 5).map((m) => (
              <button key={m.id} onClick={() => setMapaAtivo(m.id)} title={m.nome}
                className={`w-11 h-11 rounded-sm border-2 overflow-hidden transition-all ${mapaAtivoId === m.id ? 'border-red-700' : 'border-transparent hover:border-zinc-700'} bg-cover bg-center bg-zinc-900`}
                style={m.imageData ? { backgroundImage: `url(${m.imageData})` } : {}} />
            ))}
            <button onClick={() => { const n = prompt('Nome:'); if (n) addMapa(n, null); }}
              className="w-11 h-11 rounded-sm flex items-center justify-center text-zinc-600 hover:text-white border border-zinc-800 hover:border-red-700 transition-colors">+</button>
          </div>
        </main>

        {/* ============ COLUNA DIREITA (FICHA) ============ */}
        <aside className="w-80 flex flex-col shrink-0 overflow-y-auto border-l"
          style={{ background: '#080404', borderColor: 'rgba(127,29,29,0.35)' }}>

          <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
            <div className="flex items-center gap-2">
              <span className="text-red-600 text-sm">◆</span>
              <h3 className="text-red-600 font-bold text-[11px] uppercase tracking-[0.15em]">Ficha de Personagem</h3>
            </div>
            <div className="flex gap-2 text-zinc-600 text-xs">
              <button onClick={() => setActiveModule('ficha')} className="hover:text-white">✎</button>
              <button className="hover:text-white">⎘</button>
              <button className="hover:text-white">🗑</button>
              <button className="hover:text-white">⋯</button>
            </div>
          </div>

          <div className="p-3 border-b" style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
            <div className="flex gap-3">
              <div className="relative shrink-0 group">
                <div className="w-20 h-24 rounded-sm overflow-hidden border relative"
                  style={{ borderColor: 'rgba(127,29,29,0.6)', background: 'linear-gradient(135deg, #1a0808 0%, #0a0404 50%, #2a0808 100%)' }}>
                  {p.avatarUrl ? (
                    <img src={p.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-red-900 font-[family-name:var(--font-cinzel)] text-2xl font-black">
                        {(p.nome || 'K').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                  <button onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex-col gap-0.5 text-white text-[9px] font-bold">
                    <span className="text-lg">📷</span>
                    <span>Alterar</span>
                  </button>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-white font-[family-name:var(--font-cinzel)] font-bold text-base leading-tight tracking-wider uppercase">{p.nome}</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-red-600 text-[10px]">🌹</span>
                  <span className="text-red-600 text-[11px] font-medium">{p.cla}</span>
                </div>
                <div className="mt-1.5 text-[10px] text-zinc-500 space-y-0.5 leading-relaxed">
                  <p>Geração <span className="text-zinc-300">{p.geracao}</span> <span className="text-zinc-800">|</span> XP <span className="text-zinc-300">{p.xp}</span></p>
                  <p className="truncate">Conceito: <span className="text-zinc-400">{p.conceito}</span></p>
                  <p className="truncate">Crônica: <span className="text-zinc-400">{p.cronica}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex border-b text-[10px] overflow-x-auto" style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
            {(['Atributos', 'Habilidades', 'Disciplinas', 'Virtudes', 'Relações'] as const).map((tab) => (
              <button key={tab} onClick={() => setFichaTab(tab)}
                className={`px-2.5 py-2 whitespace-nowrap transition-colors border-b-2 ${fichaTab === tab ? 'text-red-400 font-semibold border-red-600' : 'text-zinc-600 hover:text-zinc-300 border-transparent'}`}
                style={fichaTab === tab ? { background: 'rgba(127,29,29,0.15)' } : {}}>{tab}</button>
            ))}
          </div>

          <div className="p-3 flex-1 overflow-y-auto">
            {fichaTab === 'Atributos' && (
              <div className="space-y-3">
                {[
                  { g: 'Físicos', a: [['forca', 'Força'], ['destreza', 'Destreza'], ['vigor', 'Vigor']] as const },
                  { g: 'Sociais', a: [['carisma', 'Carisma'], ['manipulacao', 'Manipulação'], ['compostura', 'Compostura']] as const },
                  { g: 'Mentais', a: [['inteligencia', 'Inteligência'], ['raciocinio', 'Raciocínio'], ['determinacao', 'Determinação']] as const },
                ].map((grp) => (
                  <div key={grp.g}>
                    <h5 className="text-[9px] uppercase text-red-700 font-bold mb-1.5 tracking-[0.2em]">{grp.g}</h5>
                    {grp.a.map(([k, n]) => (
                      <div key={k} className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-400 w-20">{n}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((pt) => (
                            <button key={pt} onClick={() => setAtributo(k as any, pt === atributos[k as keyof typeof atributos] ? pt - 1 : pt)}
                              className={`w-3 h-3 rounded-full transition-all hover:scale-125 ${pt <= atributos[k as keyof typeof atributos] ? 'bg-red-700' : 'bg-zinc-900 border border-zinc-800'}`}
                              style={pt <= atributos[k as keyof typeof atributos] ? { boxShadow: '0 0 4px rgba(153,27,27,0.8)' } : {}} />
                          ))}
                        </div>
                        <span className="text-xs text-zinc-500 w-4 text-right font-mono">{atributos[k as keyof typeof atributos]}</span>
                      </div>
                    ))}
                  </div>
                ))}

                <div className="grid grid-cols-3 gap-2 pt-3 border-t" style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center border-2"
                      style={{ borderColor: 'rgba(127,29,29,0.6)', background: 'radial-gradient(circle, #1a0606 0%, #0a0404 100%)' }}>
                      <span className="text-zinc-500 text-[11px] font-mono">—/—</span>
                    </div>
                    <p className="text-[9px] text-zinc-600 uppercase mt-1.5 tracking-widest">Saúde</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white font-bold text-base border-2"
                      style={{ borderColor: 'rgba(127,29,29,0.6)', background: 'radial-gradient(circle, #1a0606 0%, #0a0404 100%)' }}>
                      {p.desequilibrio ?? 0}
                    </div>
                    <p className="text-[9px] text-zinc-600 uppercase mt-1.5 tracking-widest">Fúria</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white font-bold text-base border-2"
                      style={{ borderColor: '#991b1b', background: 'radial-gradient(circle, #2a0808 0%, #0a0404 100%)', boxShadow: '0 0 12px rgba(153,27,27,0.4)' }}>
                      {p.humanidade}
                    </div>
                    <p className="text-[9px] text-zinc-600 uppercase mt-1.5 tracking-widest">Humanidade</p>
                  </div>
                </div>
              </div>
            )}

            {fichaTab === 'Habilidades' && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {Object.entries(pericias).map(([n, v]) => (
                  <div key={n} className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 truncate pr-1">{n}</span>
                    <div className="flex gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((pt) => (
                        <button key={pt} onClick={() => setPericia(n, pt === v ? pt - 1 : pt)}
                          className={`w-1.5 h-1.5 rounded-full transition-all hover:scale-125 ${pt <= v ? 'bg-red-700' : 'bg-zinc-900'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-600 w-3 text-right font-mono">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {fichaTab === 'Disciplinas' && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(disciplinas).map(([n, v]) => (
                  <div key={n} className="flex items-center gap-2 rounded-sm p-1.5 border" style={{ background: 'rgba(127,29,29,0.08)', borderColor: 'rgba(127,29,29,0.3)' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] shrink-0 border"
                      style={{ background: 'rgba(127,29,29,0.3)', borderColor: 'rgba(153,27,27,0.5)', color: '#dc2626' }}>✦</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-zinc-300 truncate">{n}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((pt) => (
                          <button key={pt} onClick={() => setDisciplina(n, pt === v ? pt - 1 : pt)}
                            className={`w-1.5 h-1.5 rounded-full transition-all hover:scale-125 ${pt <= v ? 'bg-red-700' : 'bg-zinc-900'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-red-500 font-bold">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {fichaTab === 'Virtudes' && (
              <div className="space-y-3 text-xs text-zinc-400">
                <div><p className="text-red-600 font-semibold mb-1.5 text-[10px] uppercase tracking-[0.15em]">Convicções</p><p className="text-zinc-500">• Nunca abandonar um aliado</p><p className="text-zinc-500">• Palavra é contrato</p></div>
                <div><p className="text-red-600 font-semibold mb-1.5 text-[10px] uppercase tracking-[0.15em]">Ambição</p><p className="text-zinc-500">Unificar as cortes de Seattle</p></div>
                <div><p className="text-red-600 font-semibold mb-1.5 text-[10px] uppercase tracking-[0.15em]">Clã</p><p className="text-zinc-500">{p.cla} — Poder, Controle, Tradição</p></div>
              </div>
            )}

            {fichaTab === 'Relações' && (
              <div className="space-y-2 text-xs text-zinc-400">
                <div className="rounded-sm p-2 border" style={{ background: 'rgba(127,29,29,0.08)', borderColor: 'rgba(127,29,29,0.3)' }}>
                  <p className="text-white text-[11px] font-medium">Lucien Vale</p>
                  <p className="text-[10px] text-zinc-500">Mentor • Aliado</p>
                </div>
                <div className="rounded-sm p-2 border" style={{ background: 'rgba(127,29,29,0.08)', borderColor: 'rgba(127,29,29,0.3)' }}>
                  <p className="text-white text-[11px] font-medium">Seraphine</p>
                  <p className="text-[10px] text-zinc-500">Contato • Aliado</p>
                </div>
                <div className="rounded-sm p-2 border" style={{ background: 'rgba(127,29,29,0.08)', borderColor: 'rgba(127,29,29,0.3)' }}>
                  <p className="text-white text-[11px] font-medium">Darius</p>
                  <p className="text-[10px] text-zinc-500">Aliado • Nosferatu</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ============ BARRA INFERIOR ============ */}
      <footer className="h-32 flex shrink-0 z-20 border-t" style={{ background: '#070303', borderColor: 'rgba(127,29,29,0.4)' }}>
        <div className="w-52 shrink-0 flex flex-col items-center justify-center px-2 border-r relative overflow-hidden"
          style={{ borderColor: 'rgba(127,29,29,0.3)', background: 'linear-gradient(180deg, #0a0404 0%, #150505 100%)' }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 100%, rgba(153,27,27,0.5) 0%, transparent 60%)' }}></div>
          <p className="relative font-[family-name:var(--font-cinzel)] font-black text-lg tracking-wider leading-none" style={{ color: '#991b1b', textShadow: '0 0 15px rgba(153,27,27,0.6)' }}>VAMPIRE</p>
          <p className="relative text-zinc-600 text-[7px] tracking-[0.5em] mt-1">THE MASQUERADE</p>
          <p className="relative font-[family-name:var(--font-cinzel)] font-black text-2xl tracking-widest mt-0.5" style={{ color: '#7f1d1d' }}>V5</p>
        </div>

        <div className="w-48 shrink-0 p-3 flex items-center border-r" style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
          <p className="text-[10px] italic leading-snug font-serif" style={{ color: '#7f1d1d' }}>
            "A máscara é um presente.<br />E também uma prisão."
          </p>
        </div>

        <div className="w-64 shrink-0 p-2.5 border-r overflow-x-auto" style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
          <h4 className="text-[9px] uppercase text-red-800 font-bold mb-2 tracking-[0.2em]">Tokens</h4>
          <div className="flex gap-2">
            {tokensDoMapa.map((t) => {
              const pc = t.personagemId ? personagens.find((x) => x.id === t.personagemId) : null;
              return (
                <button key={t.id} onClick={() => { setActiveTool('selecionar'); setSelectedTokenId(t.id); }} className="text-center shrink-0 group">
                  <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold transition-all overflow-hidden ${selectedTokenId === t.id ? 'border-red-600 ring-2 ring-red-900/50' : 'border-red-950/70 group-hover:border-red-700'}`}
                    style={{ backgroundColor: t.cor, opacity: t.visivel ? 1 : 0.4, boxShadow: selectedTokenId === t.id ? '0 0 10px rgba(153,27,27,0.6)' : 'none' }}>
                    {pc?.avatarUrl ? <img src={pc.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span>{t.nome.substring(0, 2).toUpperCase()}</span>}
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-1 truncate w-14">{t.nome}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-w-0 p-2.5 flex flex-col border-r" style={{ borderColor: 'rgba(127,29,29,0.3)' }}>
          <h4 className="text-[9px] uppercase text-red-800 font-bold mb-1.5 tracking-[0.2em]">Chat</h4>
          <div className="flex-1 text-[10px] space-y-0.5 overflow-y-auto mb-1.5 pr-1">
            {chat.slice(-8).map((m) => (
              <div key={m.id}>
                {m.tipo === 'roll' && m.roll ? (
                  <div className="rounded-sm pl-2 py-0.5 border-l-2" style={{ background: 'rgba(127,29,29,0.15)', borderColor: '#991b1b' }}>
                    <p className="text-red-400 font-bold text-[10px]">🎲 {m.autor.split(' ')[0]} • {m.roll.rolls.length + m.roll.hungerRolls.length}d10</p>
                    <p className="text-white text-[10px]">
                      <span className="font-bold">{m.roll.sucessos}</span> sucesso{m.roll.sucessos !== 1 ? 's' : ''}
                      {m.roll.critico && <span className="text-yellow-400 ml-1.5 font-bold">⚡ CRÍTICO</span>}
                      {m.roll.falhaBestial && <span className="text-red-600 ml-1.5 font-bold">🐺 FALHA BESTIAL</span>}
                    </p>
                  </div>
                ) : (
                  <p className="leading-tight">
                    <span className={`${m.cor} font-bold`}>{m.autor.split(' ')[0]}:</span>{' '}
                    <span className="text-zinc-400">{m.texto}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enviarChat()}
              placeholder="Digite uma mensagem..."
              className="flex-1 rounded-sm px-2 py-1 text-[10px] text-white focus:outline-none border"
              style={{ background: 'rgba(20,10,10,0.6)', borderColor: 'rgba(127,29,29,0.4)' }} />
            <button onClick={enviarChat} className="px-2 rounded-sm text-white text-[10px] border transition-colors hover:bg-red-900/60"
              style={{ background: 'rgba(127,29,29,0.4)', borderColor: 'rgba(153,27,27,0.5)' }}>➤</button>
          </div>
        </div>

        <div className="w-72 shrink-0 p-2.5">
          <h4 className="text-[9px] uppercase text-red-800 font-bold mb-2 tracking-[0.2em]">Rolagem de Dados</h4>
          <div className="flex items-center gap-1 mb-2">
            {DADOS.map((d) => (
              <button key={d.l} onClick={() => setDiceInput(d.l === 'd10' ? '1d10' : `1${d.l}`)}
                className={`w-7 h-7 rounded-full border-2 ${d.bg} ${d.border} ${d.text} flex items-center justify-center text-[9px] font-bold hover:scale-110 transition-transform`}>{d.l}</button>
            ))}
          </div>
          <div className="flex gap-1 mb-1.5">
            <input type="text" value={diceInput} onChange={(e) => setDiceInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && rolarV5()}
              className="flex-1 rounded-sm px-2 py-1.5 text-[11px] text-white focus:outline-none border text-center font-mono"
              style={{ background: 'rgba(20,10,10,0.6)', borderColor: 'rgba(127,29,29,0.4)' }} />
            <button onClick={rolarV5} className="px-3 py-1.5 rounded-sm text-[10px] text-white font-bold border transition-colors"
              style={{ background: 'rgba(153,27,27,0.8)', borderColor: '#991b1b' }}>Rolar</button>
          </div>
          <label className="flex items-center gap-2 text-[9px] text-zinc-600">
            <span className="whitespace-nowrap">Fome</span>
            <input type="range" min="0" max="5" value={hungerDice}
              onChange={(e) => setHungerDice(parseInt(e.target.value))} className="flex-1 accent-orange-700" />
            <span className="text-orange-600 font-bold w-3 text-right">{hungerDice}</span>
          </label>
        </div>
      </footer>

      {contextMenu && (
        <div className="fixed rounded-sm shadow-2xl py-1 z-50 w-48 border"
          style={{ left: contextMenu.x, top: contextMenu.y, background: '#0a0404', borderColor: 'rgba(127,29,29,0.5)' }}
          onClick={(e) => e.stopPropagation()}>
          {(contextMenu.type === 'token' ? [
            { label: 'Editar', action: () => setEditingToken(contextMenu.id) },
            { label: 'Duplicar', action: () => duplicateToken(contextMenu.id) },
            { label: 'Centralizar câmera', action: () => { const t = tokens.find((x) => x.id === contextMenu.id); if (t) updateCamera({ x: -t.x * (camera.zoom / 100) + containerSize.width / 2, y: -t.y * (camera.zoom / 100) + containerSize.height / 2 }); }},
            { label: 'Mostrar/Esconder', action: () => { const t = tokens.find((x) => x.id === contextMenu.id); if (t) updateToken(t.id, { visivel: !t.visivel }); }},
            { label: 'Bloquear', action: () => { const t = tokens.find((x) => x.id === contextMenu.id); if (t) updateToken(t.id, { bloqueado: !t.bloqueado }); }},
            { label: 'Excluir', action: () => deleteToken(contextMenu.id), danger: true },
          ] : contextMenu.type === 'drawing' ? [
            { label: 'Excluir desenho', action: () => removeDrawing(contextMenu.id), danger: true },
          ] : contextMenu.type === 'marker' ? [
            { label: 'Excluir', action: () => removeMarker(contextMenu.id), danger: true },
          ] : [
            { label: 'Editar', action: () => { const t = texts.find((x) => x.id === contextMenu.id); if (t) setEditingText({ id: t.id, texto: t.texto }); }},
            { label: 'Excluir', action: () => removeText(contextMenu.id), danger: true },
          ]).map((item) => (
            <button key={item.label} onClick={() => { item.action(); setContextMenu(null); }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-red-950/40 ${(item as any).danger ? 'text-red-400' : 'text-zinc-300'}`}>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {editingText && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setEditingText(null)}>
          <div className="rounded-sm p-4 w-96 border" style={{ background: '#0a0404', borderColor: 'rgba(127,29,29,0.5)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-red-500 mb-3">Editar Texto</h3>
            <textarea value={editingText.texto} onChange={(e) => setEditingText({ ...editingText, texto: e.target.value })}
              className="w-full rounded-sm p-2 text-sm text-white resize-none h-24 focus:outline-none border"
              style={{ background: 'rgba(20,10,10,0.6)', borderColor: 'rgba(127,29,29,0.4)' }} />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setEditingText(null)} className="px-3 py-1 text-xs text-zinc-400 hover:text-white">Cancelar</button>
              <button onClick={() => { updateText(editingText.id, { texto: editingText.texto }); setEditingText(null); }}
                className="px-3 py-1 text-xs rounded-sm text-white" style={{ background: 'rgba(153,27,27,0.8)' }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {editingToken && (() => {
        const t = tokens.find((x) => x.id === editingToken);
        if (!t) return null;
        return (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setEditingToken(null)}>
            <div className="rounded-sm p-4 w-96 border" style={{ background: '#0a0404', borderColor: 'rgba(127,29,29,0.5)' }} onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-bold text-red-500 mb-3">Editar Token</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Nome</label>
                  <input type="text" value={t.nome} onChange={(e) => updateToken(t.id, { nome: e.target.value })}
                    className="w-full rounded-sm px-2 py-1 text-sm text-white border focus:outline-none"
                    style={{ background: 'rgba(20,10,10,0.6)', borderColor: 'rgba(127,29,29,0.4)' }} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Cor</label>
                  <div className="flex gap-1">
                    {CORES.map((c) => (
                      <button key={c} onClick={() => updateToken(t.id, { cor: c })}
                        className={`w-6 h-6 rounded-full border-2 ${t.cor === c ? 'border-white' : 'border-transparent'}`}
                        style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setEditingToken(null)} className="px-3 py-1 text-xs text-zinc-400 hover:text-white">Fechar</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}