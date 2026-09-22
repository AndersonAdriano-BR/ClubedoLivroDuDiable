/*
  CLUBE DO LIVRO DU DIABLE — PAINT / Dom Quixote
  BETA FINAL v4 — Supabase Realtime
  Sem cronômetro de rodada. O único tempo visível é o breve destaque da ordem sorteada.
*/

const SUPABASE_URL = 'https://deltfsnecejvhallkuex.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_hCsy5bXtgIayWX54F1LN5w_oh6gCk4G';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const ROOM_NAME = 'dom-quixote';
const CHANNEL_NAME = `du-diable:${ROOM_NAME}`;
const MAX_PLAYERS = 10;
const TOTAL_ROUNDS = 5;
const SAVE_KEY = 'duDiableDomQuixoteMatchV4';
const CHAT_COLLAPSED_KEY = 'duDiableChatCollapsedV2';
const PLAYER_ID_KEY = 'duDiablePlayerId';
const PLAYER_JOIN_KEY = 'duDiablePlayerJoinedAt';
const PLAYER_NAME_KEY = 'clubReaderName';

const PLAYER_COLORS = [
  '#ff2bd6','#25a7ff','#27e05f','#ff8a1f','#6f62ff',
  '#ff3157','#b84dff','#b6ef3a','#1fe4d4','#ffe53b'
];

const PALETTE = [
  '#000000','#20252a','#4b535b','#7c8792','#b6c0ca','#f4f6f8',
  '#7a0014','#d70035','#ff3157','#ff6688','#ff2bd6','#9b37ff',
  '#5f39ff','#1565ff','#25a7ff','#1fe4d4','#00a4a4','#27e05f',
  '#8fe83a','#4b7626','#ffe53b','#ffcf33','#ff8a1f','#ff5b16',
  '#8f4a23','#c9824c','#efd0a9','#a66a5b','#7b4d79','#c25c9e',
  '#6e55b1','#4a62cf','#4b7f9e','#8ed9d7','#7ca06a','#a9bf76',
  '#f0b0c0','#ffd5df','#d9b8ff','#c9b4ff'
];

// 50 palavras simples, desenháveis. Codificadas apenas para não ficarem explícitas no arquivo.
const ENCODED_WORDS = [
  'Y2FzYQ==','YXJ2b3Jl','Z2F0bw==','Y2FjaG9ycm8=','Y2F2YWxv','cGF0bw==','cGVpeGU=','cGFzc2Fybw==','c2Fwbw==','bWFjYWNv',
  'bGVhbw==','ZWxlZmFudGU=','YmFsZQ==','dHViYXJhbw==','Ym9yYm9sZXRh','YWJlbGhh','Zmxvcg==','c29s','bHVh','ZXN0cmVsYQ==',
  'bnV2ZW0=','Y2h1dmE=','cmFpbw==','YXJjby1pcmlz','Zm9nbw==','Z2Vsbw==','bW9udGFuaGE=','cmlv','bWFy','aWxoYQ==',
  'YmFyY28=','bmF2aW8=','YXZpYW8=','Y2Fycm8=','YmljaWNsZXRh','dHJlbQ==','Zm9ndWV0ZQ==','cG9udGU=','ZXN0cmFkYQ==','amFuZWxh',
  'cG9ydGE=','Y2hhdmU=','Y2FtYQ==','bWVzYQ==','Y2FkZWlyYQ==','cmVsb2dpbw==','dGVsZWZvbmU=','bGl2cm8=','bGFwaXM=','Y2FuZXRh'
];

const storedName = localStorage.getItem(PLAYER_NAME_KEY) || sessionStorage.getItem(PLAYER_NAME_KEY) || '';
if (!storedName.trim()) window.location.href = 'index.html';

const playerName = storedName.trim().slice(0, 40);
localStorage.setItem(PLAYER_NAME_KEY, playerName);
sessionStorage.setItem(PLAYER_NAME_KEY, playerName);

const playerId = localStorage.getItem(PLAYER_ID_KEY) || crypto.randomUUID();
localStorage.setItem(PLAYER_ID_KEY, playerId);
const joinedAt = Number(localStorage.getItem(PLAYER_JOIN_KEY)) || Date.now();
localStorage.setItem(PLAYER_JOIN_KEY, String(joinedAt));

function colorFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i) | 0;
  return PLAYER_COLORS[Math.abs(hash) % PLAYER_COLORS.length];
}
const clientColor = colorFromId(playerId);

const els = {
  playerCounter: document.getElementById('playerCounter'),
  roundStatus: document.getElementById('roundStatus'),
  lobbyView: document.getElementById('lobbyView'),
  lobbyPlayers: document.getElementById('lobbyPlayers'),
  startButton: document.getElementById('startButton'),
  startHint: document.getElementById('startHint'),
  rouletteView: document.getElementById('rouletteView'),
  rouletteWheel: document.getElementById('rouletteWheel'),
  rouletteLabels: document.getElementById('rouletteLabels'),
  rouletteResult: document.getElementById('rouletteResult'),
  rouletteOrder: document.getElementById('rouletteOrder'),
  rouletteOrderText: document.getElementById('rouletteOrderText'),
  sortearButton: document.getElementById('sortearButton'),
  gameView: document.getElementById('gameView'),
  chatShell: document.getElementById('chatShell'),
  chatToggle: document.getElementById('chatToggle'),
  chatMessages: document.getElementById('chatMessages'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  canvas: document.getElementById('drawingCanvas'),
  canvasWrap: document.getElementById('canvasWrap'),
  turnLabel: document.getElementById('turnLabel'),
  turnMessage: document.getElementById('turnMessage'),
  wordStrip: document.getElementById('wordStrip'),
  wordLabel: document.getElementById('wordLabel'),
  drawingTools: document.getElementById('drawingTools'),
  brushGroup: document.getElementById('brushGroup'),
  sizeGroup: document.getElementById('sizeGroup'),
  palette: document.getElementById('palette'),
  clearCanvasButton: document.getElementById('clearCanvasButton'),
  scoreList: document.getElementById('scoreList'),
  successOverlay: document.getElementById('successOverlay'),
  successName: document.getElementById('successName'),
  successWord: document.getElementById('successWord'),
  statusBanner: document.getElementById('statusBanner'),
  finishedView: document.getElementById('finishedView'),
  finalScore: document.getElementById('finalScore'),
  playAgainButton: document.getElementById('playAgainButton'),
  bookOverlay: document.getElementById('bookOverlay'),
  bookFrame: document.getElementById('bookFrame')
};

let state = {
  room: ROOM_NAME,
  matchId: null,
  players: [],
  phase: 'lobby',
  round: 0,
  turnOrder: [],
  turnPosition: -1,
  currentDrawerId: null,
  wordToken: null,
  lastWordToken: null,
  strokes: [],
  chatHistory: [],
  hostId: null,
  started: false,
  rouletteSpun: false,
  rouletteWinnerId: null,
  rouletteRevealUntil: 0
};

let channel = null;
let canvasCtx = null;
let drawing = false;
let lastPoint = null;
let currentColor = PALETTE[0];
let currentSize = 5;
let currentTool = 'pencil';
let pendingSegments = [];
let flushDrawTimer = null;
let wheelRotation = 0;
let handledGuessKey = null;
let restoredFromDisk = false;
let rouletteAnimationDone = false;
const seenStrokeIds = new Set();

function escapeHtml(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

function normalizeWord(value) {
  return String(value || '').trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
}

function decodeWords() {
  return ENCODED_WORDS.map(v => atob(v));
}
const WORD_POOL = decodeWords();

function tokenForWord(word) { return btoa(unescape(encodeURIComponent(word))); }
function wordFromToken(token) {
  if (!token) return null;
  try { return decodeURIComponent(escape(atob(token))); } catch (_) { return null; }
}

function cleanPlayer(raw) {
  return {
    id: String(raw.id),
    name: String(raw.name || 'Leitor').slice(0,40),
    color: raw.color || colorFromId(String(raw.id)),
    joinedAt: Number(raw.joinedAt) || Date.now(),
    score: Number(raw.score) || 0
  };
}

function sortedPlayers(players = state.players) {
  return [...players].sort((a,b) => a.name.localeCompare(b.name,'pt-BR',{sensitivity:'base'}) || a.id.localeCompare(b.id));
}

function chooseHostId(players = state.players) {
  if (!players.length) return null;
  const existing = players.find(p => p.id === state.hostId);
  if (existing) return existing.id;
  return [...players].sort((a,b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))[0].id;
}

function isHost() { return chooseHostId(state.players) === playerId; }
function isCurrentDrawer() { return state.phase === 'playing' && state.currentDrawerId === playerId; }

function presencePlayers() {
  const presence = channel?.presenceState?.() || {};
  const map = new Map();
  Object.values(presence).flat().forEach(item => {
    if (!item?.id || !item?.name) return;
    map.set(String(item.id), cleanPlayer(item));
  });
  return [...map.values()];
}

function localSave() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({savedAt:Date.now(),state,currentColor,currentSize,currentTool}));
  } catch (_) {}
}

function restoreLocalSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!raw?.state || raw.state.room !== ROOM_NAME) return false;
    if (Date.now() - Number(raw.savedAt || 0) > 24*60*60*1000) return false;
    state = {
      ...state,
      ...raw.state,
      players: Array.isArray(raw.state.players) ? raw.state.players.map(cleanPlayer) : [],
      turnOrder: Array.isArray(raw.state.turnOrder) ? raw.state.turnOrder.slice() : [],
      strokes: Array.isArray(raw.state.strokes) ? raw.state.strokes.slice(-5000) : [],
      chatHistory: Array.isArray(raw.state.chatHistory) ? raw.state.chatHistory.slice(-200) : []
    };
    if (state.wordToken) {
      // Apenas memória local; a palavra nunca é colocada no estado público enviado aos outros.
    }
    currentColor = raw.currentColor || currentColor;
    currentSize = Number(raw.currentSize) || currentSize;
    currentTool = raw.currentTool || currentTool;
    state.hostId = chooseHostId(state.players);
    restoredFromDisk = true;
    return true;
  } catch (_) { return false; }
}

function publicState() {
  return {
    room: state.room,
    matchId: state.matchId,
    players: state.players.map(p => ({...p})),
    phase: state.phase,
    round: state.round,
    turnOrder: state.turnOrder.slice(),
    turnPosition: state.turnPosition,
    currentDrawerId: state.currentDrawerId,
    wordToken: state.wordToken,
    lastWordToken: state.lastWordToken,
    hostId: chooseHostId(state.players),
    started: state.started,
    rouletteSpun: state.rouletteSpun,
    rouletteWinnerId: state.rouletteWinnerId,
    rouletteRevealUntil: state.rouletteRevealUntil,
    chatHistory: state.chatHistory.slice(-200)
  };
}

function snapshotState() {
  return {...publicState(), strokes:state.strokes.slice(-5000)};
}

async function broadcast(event,payload={}) {
  if (!channel) return;
  try { await channel.send({type:'broadcast',event,payload}); } catch (error) { console.error('Broadcast',event,error); }
}

async function publishState(includeStrokes=false) {
  state.hostId = chooseHostId(state.players);
  localSave();
  await broadcast(includeStrokes ? 'snapshot' : 'state', {state: includeStrokes ? snapshotState() : publicState()});
}

function setStatus(text) {
  els.statusBanner.textContent = text;
}

function showOnly(view) {
  els.lobbyView.classList.toggle('hidden',view!=='lobby');
  els.rouletteView.classList.toggle('hidden',view!=='roulette');
  els.gameView.classList.toggle('hidden',view!=='game');
  els.finishedView.classList.toggle('hidden',view!=='finished');
}

function renderPlayerCount() { els.playerCounter.textContent = `${state.players.length} de ${MAX_PLAYERS}`; }

function renderLobbyPlayers() {
  const list = sortedPlayers();
  els.lobbyPlayers.innerHTML = list.length ? list.map(p => `<div class="player-chip"><span class="player-dot" style="background:${p.color}"></span><span>${escapeHtml(p.name)}</span>${p.id===state.hostId?'<span style="margin-left:auto;font-size:8px;color:#f2cf69;text-transform:uppercase;letter-spacing:.1em">host</span>':''}</div>`).join('') : '<div class="player-chip">Aguardando leitores...</div>';
}

function renderScores() {
  const list = [...state.players].sort((a,b) => b.score - a.score || a.name.localeCompare(b.name,'pt-BR',{sensitivity:'base'}));
  els.scoreList.innerHTML = list.map(p => `<div class="score-row"><div class="score-main"><span class="turn-dot" style="background:${p.color}"></span><span class="score-name">${escapeHtml(p.name)}</span>${p.id===state.currentDrawerId?'<span class="turn-mark">pinta</span>':''}</div><span class="score-points">${p.score}</span></div>`).join('');
}

function renderFinalScores() {
  const list = [...state.players].sort((a,b) => b.score - a.score || a.name.localeCompare(b.name,'pt-BR',{sensitivity:'base'}));
  els.finalScore.innerHTML = list.map((p,i) => `<div class="score-row"><div class="score-main"><span class="turn-dot" style="background:${p.color}"></span><span class="score-name">${i+1}. ${escapeHtml(p.name)}</span></div><span class="score-points">${p.score}</span></div>`).join('');
}

function renderChatHistory() {
  els.chatMessages.innerHTML = '';
  state.chatHistory.slice(-200).forEach(appendChatElement);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

function appendChatElement(message) {
  const row = document.createElement('div');
  row.className = `chat-message${message.correct ? ' correct' : ''}`;
  row.innerHTML = `<span class="chat-name" style="color:${escapeHtml(message.color || '#fff')}">${escapeHtml(message.player || 'Leitor')}</span><span class="chat-text">: ${escapeHtml(message.text || '')}</span>`;
  els.chatMessages.appendChild(row);
}

function setChatCollapsed(collapsed) {
  const value = Boolean(collapsed);
  els.chatShell.classList.toggle('is-collapsed',value);
  els.chatToggle.setAttribute('aria-expanded',String(!value));
  els.chatToggle.title = value ? 'Abrir conversa' : 'Recolher conversa';
  els.chatToggle.textContent = value ? '‹' : '›';
  try { localStorage.setItem(CHAT_COLLAPSED_KEY,value?'1':'0'); } catch (_) {}
}

function restoreChatCollapsed() {
  try { setChatCollapsed(localStorage.getItem(CHAT_COLLAPSED_KEY)==='1'); } catch (_) { setChatCollapsed(false); }
}

function buildRouletteLabels(players) {
  els.rouletteLabels.innerHTML = '';
  const count = players.length;
  if (!count) return;
  const radius = Math.min(168, Math.max(118, 118 + count * 5));
  const segment = 360/count;
  players.forEach((player,index) => {
    const angle = index*segment - 90;
    const label = document.createElement('div');
    label.className = 'wheel-label';
    label.dataset.playerId = player.id;
    label.textContent = player.name;
    label.style.transform = `translate(-50%,-50%) rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle}deg)`;
    label.style.borderColor = player.color;
    els.rouletteLabels.appendChild(label);
  });
}

function clearWinnerHighlight() {
  els.rouletteLabels.querySelectorAll('.wheel-label').forEach(el=>el.classList.remove('winner'));
}

function highlightWinner(id) {
  clearWinnerHighlight();
  const el = els.rouletteLabels.querySelector(`[data-player-id="${CSS.escape(id)}"]`);
  if (el) el.classList.add('winner');
}

function runRouletteSpin(firstIndex) {
  rouletteAnimationDone = false;
  clearWinnerHighlight();
  const players = sortedPlayers();
  const count = players.length || 1;
  const segment = 360 / count;
  const target = -(firstIndex * segment);
  const turns = 10 + Math.floor(Math.random()*3);
  wheelRotation = turns*360 + target;
  els.rouletteWheel.classList.remove('is-spinning');
  els.rouletteWheel.style.transform = 'rotate(0deg)';
  void els.rouletteWheel.offsetWidth;
  els.rouletteWheel.classList.add('is-spinning');
  els.rouletteWheel.style.transform = `rotate(${wheelRotation}deg)`;
  els.sortearButton.disabled = true;
  const onEnd = () => {
    els.rouletteWheel.removeEventListener('transitionend',onEnd);
    rouletteAnimationDone = true;
    highlightWinner(state.rouletteWinnerId);
    showRouletteResult();
  };
  els.rouletteWheel.addEventListener('transitionend',onEnd,{once:true});
}

function showRouletteResult() {
  const winner = state.players.find(p=>p.id===state.rouletteWinnerId);
  const orderNames = state.turnOrder.map(id=>state.players.find(p=>p.id===id)?.name).filter(Boolean);
  els.rouletteResult.innerHTML = winner ? `<strong>${escapeHtml(winner.name)}</strong> começa a sequência.` : 'Sorteio concluído.';
  els.rouletteOrderText.textContent = orderNames.join('  →  ');
  els.rouletteOrder.classList.remove('hidden');
  if (winner) highlightWinner(winner.id);
}

function scheduleRouletteEnd() {
  const remaining = Math.max(0, Number(state.rouletteRevealUntil || 0) - Date.now());
  window.setTimeout(async () => {
    if (isHost() && state.phase === 'roulette' && state.rouletteSpun) await hostStartTurn();
  }, remaining);
}

function mergePresenceIntoLobby() {
  const list = presencePlayers().slice(0,MAX_PLAYERS);
  const old = new Map(state.players.map(p=>[p.id,p]));
  state.players = list.map(p=>({...p,score:old.get(p.id)?.score || 0}));
  state.hostId = chooseHostId(state.players);
  renderState();
  localSave();
}

function removeLeftPlayer(id) {
  if (!id) return;
  const wasDrawer = state.currentDrawerId === id;
  state.players = state.players.filter(p=>p.id!==id);
  state.turnOrder = state.turnOrder.filter(x=>x!==id);
  state.hostId = chooseHostId(state.players);
  renderState();
  if (wasDrawer && isHost() && state.phase === 'playing') {
    hostAdvanceTurn();
  } else if (isHost()) {
    publishState();
  }
}

function renderState() {
  state.hostId = chooseHostId(state.players);
  renderLobbyPlayers();
  renderScores();
  renderChatHistory();
  renderPlayerCount();

  if (state.phase === 'lobby' || !state.started) {
    showOnly('lobby');
    els.roundStatus.textContent = 'Lobby';
    els.startButton.disabled = !state.players.length || state.players.length > MAX_PLAYERS;
    els.startHint.textContent = `${state.players.length}/${MAX_PLAYERS} leitores. Qualquer leitor pode pressionar Start.`;
    return;
  }

  if (state.phase === 'roulette') {
    showOnly('roulette');
    els.roundStatus.textContent = 'Sorteio';
    buildRouletteLabels(sortedPlayers());
    els.sortearButton.disabled = Boolean(state.rouletteSpun);
    if (state.rouletteSpun) showRouletteResult();
    else { clearWinnerHighlight(); els.rouletteResult.textContent='Clique em Sortear para começar.'; els.rouletteOrder.classList.add('hidden'); }
    return;
  }

  if (state.phase === 'playing') {
    showOnly('game');
    els.roundStatus.textContent = `Rodada ${state.round} de ${TOTAL_ROUNDS}`;
    requestAnimationFrame(syncCanvasFromState);
    updateTurnUI();
    return;
  }

  if (state.phase === 'finished') {
    showOnly('finished');
    els.roundStatus.textContent = 'Fim';
    renderFinalScores();
  }
}

function applyState(nextState,{fromSnapshot=false}={}) {
  if (!nextState) return;
  state = {
    ...state,
    ...nextState,
    players:Array.isArray(nextState.players)?nextState.players.map(cleanPlayer):state.players,
    turnOrder:Array.isArray(nextState.turnOrder)?nextState.turnOrder.slice():state.turnOrder,
    strokes:fromSnapshot && Array.isArray(nextState.strokes)?nextState.strokes.slice(-5000):state.strokes,
    chatHistory:Array.isArray(nextState.chatHistory)?nextState.chatHistory.slice(-200):state.chatHistory
  };
  state.hostId = chooseHostId(state.players);
  if (state.phase === 'playing' && state.wordToken) {
    // O navegador só usa a palavra localmente; observadores não a exibem.
    state.secretWord = wordFromToken(state.wordToken);
  }
  if (fromSnapshot) {
    seenStrokeIds.clear();
    state.strokes.forEach(s=>seenStrokeIds.add(s.id));
  }
  localSave();
  renderState();
}

function updateTurnUI() {
  const drawer = state.players.find(p=>p.id===state.currentDrawerId);
  const mine = state.currentDrawerId === playerId;
  els.gameView.classList.toggle('is-observer',!mine);
  if (mine) {
    els.turnLabel.textContent = `SUA VEZ · RODADA ${state.round}/${TOTAL_ROUNDS}`;
    els.turnMessage.textContent = 'Área de pintura.';
    els.wordStrip.classList.add('is-drawer');
    els.wordLabel.textContent = `Sua palavra: ${state.secretWord || '—'}`;
    setStatus('Você está pintando. O desenho é visível para a sala.');
  } else {
    els.turnLabel.textContent = drawer ? `VEZ DE ${drawer.name.toUpperCase()} · RODADA ${state.round}/${TOTAL_ROUNDS}` : 'SINCRONIZANDO';
    els.turnMessage.textContent = drawer ? `Observe ${drawer.name}.` : 'Reconectando à sala.';
    els.wordStrip.classList.remove('is-drawer');
    els.wordLabel.textContent = 'A palavra está escondida.';
    setStatus(drawer ? `${drawer.name} está pintando.` : 'Recebendo o estado da sala.');
  }
}

function drawStroke(stroke) {
  if (!canvasCtx || !stroke) return;
  const rect = els.canvas.getBoundingClientRect();
  const x1 = stroke.x1*rect.width, y1 = stroke.y1*rect.height;
  const x2 = stroke.x2*rect.width, y2 = stroke.y2*rect.height;
  canvasCtx.save();
  canvasCtx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out':'source-over';
  canvasCtx.globalAlpha = stroke.tool === 'chalk' ? .72 : stroke.tool === 'marker' ? .9 : 1;
  canvasCtx.strokeStyle = stroke.tool === 'eraser' ? '#000' : stroke.color;
  canvasCtx.lineWidth = stroke.tool === 'marker' ? stroke.size*1.65 : stroke.tool === 'chalk' ? stroke.size*1.3 : stroke.size;
  canvasCtx.lineCap='round';canvasCtx.lineJoin='round';
  canvasCtx.beginPath();canvasCtx.moveTo(x1,y1);canvasCtx.lineTo(x2,y2);canvasCtx.stroke();canvasCtx.restore();
}

function syncCanvasFromState() {
  if (!canvasCtx) return;
  const rect = els.canvasWrap.getBoundingClientRect();
  if (rect.width<=0 || rect.height<=0) return;
  const ratio = Math.min(window.devicePixelRatio || 1,2);
  canvasCtx.save();canvasCtx.setTransform(1,0,0,1,0,0);canvasCtx.clearRect(0,0,els.canvas.width,els.canvas.height);canvasCtx.restore();
  canvasCtx.setTransform(ratio,0,0,ratio,0,0);canvasCtx.fillStyle='#f7f7f4';canvasCtx.fillRect(0,0,rect.width,rect.height);
  state.strokes.forEach(drawStroke);
}

function resizeCanvas() {
  const rect = els.canvasWrap.getBoundingClientRect();
  if (rect.width<=0 || rect.height<=0) return;
  const ratio=Math.min(window.devicePixelRatio || 1,2);
  els.canvas.width=Math.floor(rect.width*ratio);els.canvas.height=Math.floor(rect.height*ratio);
  canvasCtx.setTransform(ratio,0,0,ratio,0,0);canvasCtx.lineCap='round';canvasCtx.lineJoin='round';
  syncCanvasFromState();
}

function canvasPoint(event){const rect=els.canvas.getBoundingClientRect();return {x:(event.clientX-rect.left)/rect.width,y:(event.clientY-rect.top)/rect.height};}

function beginStroke(event){
  if(!isCurrentDrawer()) return;
  drawing=true;els.canvas.setPointerCapture?.(event.pointerId);lastPoint=canvasPoint(event);
  const stroke={id:crypto.randomUUID(),x1:lastPoint.x,y1:lastPoint.y,x2:lastPoint.x,y2:lastPoint.y,color:currentColor,size:currentSize,tool:currentTool,senderId:playerId};
  state.strokes.push(stroke);seenStrokeIds.add(stroke.id);drawStroke(stroke);pendingSegments.push(stroke);queueDrawFlush();
}

function continueStroke(event){
  if(!drawing||!isCurrentDrawer()) return;
  const point=canvasPoint(event);const stroke={id:crypto.randomUUID(),x1:lastPoint.x,y1:lastPoint.y,x2:point.x,y2:point.y,color:currentColor,size:currentSize,tool:currentTool,senderId:playerId};
  state.strokes.push(stroke);seenStrokeIds.add(stroke.id);drawStroke(stroke);pendingSegments.push(stroke);lastPoint=point;queueDrawFlush();
  if(state.strokes.length>5000) state.strokes.splice(0,state.strokes.length-5000);
}

function endStroke(){drawing=false;lastPoint=null;flushDrawQueue();localSave();}
function queueDrawFlush(){if(flushDrawTimer)return;flushDrawTimer=window.setTimeout(flushDrawQueue,20);}
async function flushDrawQueue(){if(flushDrawTimer){clearTimeout(flushDrawTimer);flushDrawTimer=null}if(!pendingSegments.length)return;const batch=pendingSegments.splice(0,16);await broadcast('draw-batch',{strokes:batch});if(pendingSegments.length)queueDrawFlush();}

function clearCanvas(){
  if(!canvasCtx)return;const rect=els.canvasWrap.getBoundingClientRect();if(rect.width<=0)return;const ratio=Math.min(window.devicePixelRatio||1,2);
  canvasCtx.save();canvasCtx.setTransform(1,0,0,1,0,0);canvasCtx.clearRect(0,0,els.canvas.width,els.canvas.height);canvasCtx.restore();
  canvasCtx.setTransform(ratio,0,0,ratio,0,0);canvasCtx.fillStyle='#f7f7f4';canvasCtx.fillRect(0,0,rect.width,rect.height);
}

function setTool(tool){currentTool=tool;document.querySelectorAll('.tool-button').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));localSave();}
function setSize(size){currentSize=Number(size);document.querySelectorAll('.size-button').forEach(b=>b.classList.toggle('active',b.dataset.size===String(size)));localSave();}
function setColor(color){currentColor=color;document.querySelectorAll('.color-swatch').forEach(b=>b.classList.toggle('active',b.dataset.color===color));localSave();}
function buildPalette(){els.palette.innerHTML=PALETTE.map(c=>`<button class="color-swatch${c===currentColor?' active':''}" data-color="${c}" style="background:${c}" title="${c}" aria-label="Cor ${c}"></button>`).join('');}

async function sendChat(text){await broadcast('chat',{senderId:playerId,player:playerName,text:text.slice(0,200),color:clientColor});}
function addChatMessage(message){if(!message?.text)return;state.chatHistory=[...state.chatHistory,message].slice(-200);appendChatElement(message);els.chatMessages.scrollTop=els.chatMessages.scrollHeight;localSave();}

function showSuccess(name,word){els.successName.textContent=name;els.successWord.textContent=word;els.successOverlay.classList.remove('hidden');}
function hideSuccess(){els.successOverlay.classList.add('hidden');}

function nextWord(){
  const previous=state.lastWordToken ? wordFromToken(state.lastWordToken) : null;
  const candidates=WORD_POOL.filter(w=>normalizeWord(w)!==normalizeWord(previous));
  return candidates[Math.floor(Math.random()*candidates.length)] || WORD_POOL[0] || 'casa';
}

async function hostStartGame(){
  if(!isHost()||state.phase!=='lobby'||state.started)return;
  const roster=sortedPlayers(presencePlayers().slice(0,MAX_PLAYERS));
  if(!roster.length)return;
  state={...state,matchId:crypto.randomUUID(),started:true,phase:'roulette',round:1,turnPosition:-1,turnOrder:[],currentDrawerId:null,wordToken:null,lastWordToken:null,strokes:[],rouletteSpun:false,rouletteWinnerId:null,rouletteRevealUntil:0,players:roster.map(cleanPlayer)};
  wheelRotation=0;els.rouletteWheel.classList.remove('is-spinning');els.rouletteWheel.style.transform='rotate(0deg)';
  clearCanvas();hideSuccess();localSave();renderState();await publishState(true);
}

async function hostSpinRoulette(){
  if(!isHost()||state.phase!=='roulette'||state.rouletteSpun)return;
  const alphabetical=sortedPlayers();if(!alphabetical.length)return;
  const firstIndex=Math.floor(Math.random()*alphabetical.length);
  state.rouletteSpun=true;state.rouletteWinnerId=alphabetical[firstIndex].id;state.turnOrder=[...alphabetical.slice(firstIndex),...alphabetical.slice(0,firstIndex)].map(p=>p.id);state.turnPosition=0;state.currentDrawerId=state.turnOrder[0];state.rouletteRevealUntil=Date.now()+5000;
  localSave();renderState();
  await broadcast('roulette-spin',{matchId:state.matchId,firstIndex,winnerId:state.rouletteWinnerId,turnOrder:state.turnOrder,revealUntil:state.rouletteRevealUntil});
  await publishState(false);
  scheduleRouletteEnd();
}

async function hostStartTurn(){
  if(!isHost()||!state.started||state.phase!=='roulette')return;
  if(!state.turnOrder.length){state.turnOrder=sortedPlayers().map(p=>p.id);state.turnPosition=0;}
  state.phase='playing';state.currentDrawerId=state.turnOrder[state.turnPosition]||state.turnOrder[0];
  const word=nextWord();state.lastWordToken=state.wordToken;state.wordToken=tokenForWord(word);state.strokes=[];handledGuessKey=null;
  state.secretWord=word;seenStrokeIds.clear();clearCanvas();hideSuccess();localSave();renderState();
  const drawer=state.players.find(p=>p.id===state.currentDrawerId);
  await broadcast('turn',{matchId:state.matchId,drawerId:state.currentDrawerId,drawer,round:state.round,turnPosition:state.turnPosition,wordToken:state.wordToken});
  await publishState(false);
}

async function hostAdvanceTurn(){
  if(!isHost()||!state.started||state.phase!=='playing')return;
  state.turnOrder=state.turnOrder.filter(id=>state.players.some(p=>p.id===id));
  if(!state.turnOrder.length){await finishGame();return;}
  const next=state.turnPosition+1;
  if(next>=state.turnOrder.length){
    if(state.round>=TOTAL_ROUNDS){await finishGame();return;}
    state.round+=1;state.turnPosition=0;
  }else state.turnPosition=next;
  await hostStartTurn();
}

async function finishGame(){
  state.phase='finished';state.currentDrawerId=null;state.wordToken=null;state.secretWord=null;state.started=true;localSave();renderState();await publishState(true);await broadcast('finished',{matchId:state.matchId,players:state.players});}

async function hostResetGame(){
  if(!isHost())return;
  const roster=sortedPlayers(presencePlayers().slice(0,MAX_PLAYERS));
  state={room:ROOM_NAME,matchId:null,players:roster.map(p=>({...p,score:0})),phase:'lobby',round:0,turnOrder:[],turnPosition:-1,currentDrawerId:null,wordToken:null,lastWordToken:null,strokes:[],chatHistory:[],hostId:null,started:false,rouletteSpun:false,rouletteWinnerId:null,rouletteRevealUntil:0};
  handledGuessKey=null;seenStrokeIds.clear();clearCanvas();hideSuccess();localSave();renderState();await publishState(true);
}

async function handleGuessResult(message){
  if(!isHost()||state.phase!=='playing')return;
  const sender=state.players.find(p=>p.id===message.senderId);if(!sender||sender.id===state.currentDrawerId)return;
  const answer=normalizeWord(state.secretWord || wordFromToken(state.wordToken));const guess=normalizeWord(message.text);const key=`${state.matchId}:${state.round}:${state.turnPosition}`;
  if(!answer||guess!==answer||handledGuessKey===key)return;
  handledGuessKey=key;state.players=state.players.map(p=>p.id===sender.id?{...p,score:p.score+10}:p);
  await broadcast('round-end',{winnerId:sender.id,winnerName:sender.name,word:answer});
  await hostAdvanceTurn();
}

async function handleBroadcast(event,payload){
  switch(event){
    case 'state':
      applyState(payload.state);
      break;
    case 'snapshot':
      applyState(payload.state,{fromSnapshot:true});
      break;
    case 'start-request':
      if(isHost()) await hostStartGame();
      break;
    case 'roulette-spin-request':
      if(isHost()) await hostSpinRoulette();
      break;
    case 'roulette-spin':
      if(payload.matchId && state.matchId && payload.matchId!==state.matchId)return;
      state.phase='roulette';state.started=true;state.rouletteSpun=true;state.rouletteWinnerId=payload.winnerId;state.turnOrder=payload.turnOrder||[];state.turnPosition=0;state.currentDrawerId=state.turnOrder[0]||null;state.rouletteRevealUntil=Number(payload.revealUntil)||Date.now();
      localSave();renderState();runRouletteSpin(Number(payload.firstIndex)||0);scheduleRouletteEnd();
      break;
    case 'turn':
      if(payload.matchId && state.matchId && payload.matchId!==state.matchId)return;
      hideSuccess();state.phase='playing';state.started=true;state.matchId=payload.matchId||state.matchId;state.currentDrawerId=payload.drawerId;state.round=payload.round;state.turnPosition=payload.turnPosition;state.rouletteSpun=true;state.wordToken=payload.wordToken||state.wordToken;state.secretWord=wordFromToken(state.wordToken);state.strokes=[];seenStrokeIds.clear();localSave();showOnly('game');clearCanvas();updateTurnUI();renderScores();
      break;
    case 'chat': {
      const message={player:payload.player,text:payload.text,color:payload.color,senderId:payload.senderId};
      addChatMessage(message);
      if(isHost()) await handleGuessResult(message);
      break;
    }
    case 'draw-batch':
      (payload.strokes||[]).forEach(stroke=>{if(!stroke?.id||seenStrokeIds.has(stroke.id))return;seenStrokeIds.add(stroke.id);state.strokes.push(stroke);drawStroke(stroke);});
      if(state.strokes.length>5000) state.strokes.splice(0,state.strokes.length-5000);localSave();
      break;
    case 'clear':
      state.strokes=[];seenStrokeIds.clear();clearCanvas();localSave();
      break;
    case 'round-end':
      showSuccess(payload.winnerName,payload.word);
      addChatMessage({player:payload.winnerName,text:`acertou "${payload.word}"`,color:state.players.find(p=>p.id===payload.winnerId)?.color||'#7fe8aa',correct:true});
      break;
    case 'finished':
      hideSuccess();state.phase='finished';state.started=true;if(Array.isArray(payload.players))state.players=payload.players.map(cleanPlayer);state.currentDrawerId=null;localSave();renderState();
      break;
    case 'reset-request':
      if(isHost()) await hostResetGame();
      break;
    case 'state-request':
      if(isHost()) await publishState(true);
      break;
  }
}

async function connectSupabase(){
  setStatus('Conectando à sala...');
  channel=supabaseClient.channel(CHANNEL_NAME,{config:{presence:{key:playerId},broadcast:{self:true,ack:true}}});
  channel
    .on('presence',{event:'sync'},async()=>{
      if(state.phase==='lobby'||!state.started){mergePresenceIntoLobby();}
      renderPlayerCount();renderScores();
      if(isHost()&&(state.phase==='lobby'||!state.started)) await publishState(true);
    })
    .on('presence',{event:'join'},async()=>{if(state.phase==='lobby'||!state.started){mergePresenceIntoLobby();if(isHost())await publishState(true);}})
    .on('presence',{event:'leave'},async({key,leftPresences})=>{const ids=(leftPresences||[]).map(x=>x?.id).filter(Boolean).map(String);if(ids.length)ids.forEach(removeLeftPlayer);else if(key)removeLeftPlayer(String(key));})
    .on('broadcast',{event:'state'},({payload})=>handleBroadcast('state',payload))
    .on('broadcast',{event:'snapshot'},({payload})=>handleBroadcast('snapshot',payload))
    .on('broadcast',{event:'start-request'},({payload})=>handleBroadcast('start-request',payload))
    .on('broadcast',{event:'roulette-spin-request'},({payload})=>handleBroadcast('roulette-spin-request',payload))
    .on('broadcast',{event:'roulette-spin'},({payload})=>handleBroadcast('roulette-spin',payload))
    .on('broadcast',{event:'turn'},({payload})=>handleBroadcast('turn',payload))
    .on('broadcast',{event:'chat'},({payload})=>handleBroadcast('chat',payload))
    .on('broadcast',{event:'draw-batch'},({payload})=>handleBroadcast('draw-batch',payload))
    .on('broadcast',{event:'clear'},({payload})=>handleBroadcast('clear',payload))
    .on('broadcast',{event:'round-end'},({payload})=>handleBroadcast('round-end',payload))
    .on('broadcast',{event:'finished'},({payload})=>handleBroadcast('finished',payload))
    .on('broadcast',{event:'reset-request'},({payload})=>handleBroadcast('reset-request',payload))
    .on('broadcast',{event:'state-request'},({payload})=>handleBroadcast('state-request',payload))
    .subscribe(async(status,error)=>{
      if(status==='SUBSCRIBED'){
        await channel.track({id:playerId,name:playerName,color:clientColor,joinedAt});
        renderState();setStatus('Sala conectada.');
        if(isHost()&&restoredFromDisk&&state.started) await publishState(true); else await broadcast('state-request',{from:playerId});
      }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){
        console.error('Supabase Realtime:',status,error);setStatus('Sem conexão com a sala.');
      }
    });
}

els.chatToggle.addEventListener('click',()=>setChatCollapsed(!els.chatShell.classList.contains('is-collapsed')));
els.startButton.addEventListener('click',()=>broadcast('start-request',{senderId:playerId}));
els.sortearButton.addEventListener('click',()=>broadcast('roulette-spin-request',{senderId:playerId}));
els.brushGroup.addEventListener('click',e=>{const b=e.target.closest('[data-tool]');if(b)setTool(b.dataset.tool)});
els.sizeGroup.addEventListener('click',e=>{const b=e.target.closest('[data-size]');if(b)setSize(b.dataset.size)});
els.palette.addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(b)setColor(b.dataset.color)});
els.clearCanvasButton.addEventListener('click',async()=>{if(!isCurrentDrawer())return;state.strokes=[];seenStrokeIds.clear();clearCanvas();await broadcast('clear',{senderId:playerId});localSave();setStatus('Quadro limpo.');});
els.chatForm.addEventListener('submit',async e=>{e.preventDefault();const text=els.chatInput.value.trim();if(!text)return;els.chatInput.value='';await sendChat(text);els.chatInput.focus();});
els.playAgainButton.addEventListener('click',()=>broadcast('reset-request',{senderId:playerId}));

window.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();const open=!els.bookOverlay.classList.contains('hidden');els.bookOverlay.classList.toggle('hidden',open);els.bookOverlay.setAttribute('aria-hidden',String(open));if(!open)els.bookFrame.focus({preventScroll:true});}});
window.addEventListener('message',e=>{if(e.data?.type==='closeBookOverlay'){els.bookOverlay.classList.add('hidden');els.bookOverlay.setAttribute('aria-hidden','true');}});
window.addEventListener('resize',resizeCanvas);
window.addEventListener('pointerup',endStroke);
window.addEventListener('beforeunload',()=>{try{channel?.untrack()}catch(_){} localSave();});

function setupCanvas(){
  canvasCtx=els.canvas.getContext('2d');
  els.canvas.addEventListener('pointerdown',beginStroke);
  els.canvas.addEventListener('pointermove',continueStroke);
}

buildPalette();
restoreChatCollapsed();
restoreLocalSave();
setupCanvas();
renderState();
connectSupabase();
