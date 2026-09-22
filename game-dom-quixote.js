
/*
  CLUBE DO LIVRO DU DIABLE — Dom Quixote
  BETA FINAL v2 — Supabase Realtime
  Sem cronômetro de rodada.
*/

const SUPABASE_URL = 'https://deltfsnecejvhallkuex.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_hCsy5bXtgIayWX54F1LN5w_oh6gCk4G';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const ROOM_NAME = 'dom-quixote';
const CHANNEL_NAME = `du-diable:${ROOM_NAME}`;
const MAX_PLAYERS = 10;
const TOTAL_ROUNDS = 5;
const SAVE_KEY = 'duDiableDomQuixoteMatchV3';
const CHAT_COLLAPSED_KEY = 'duDiableChatCollapsedV1';
const PLAYER_ID_KEY = 'duDiablePlayerId';
const PLAYER_JOIN_KEY = 'duDiablePlayerJoinedAt';
const PLAYER_NAME_KEY = 'clubReaderName';

const PLAYER_COLORS = [
  '#e81cdb','#1480d5','#10cd2c','#ce660c','#1717d2',
  '#cc153d','#801acc','#7fe619','#15e5d6','#e6e51a'
];

const PALETTE = [
  '#000000','#3b3b3b','#777777','#bfbfbf','#ffffff','#5d0303',
  '#cc153d','#ff1744','#ff4d8d','#e81cdb','#ff5af0','#801acc',
  '#1717d2','#1480d5','#15e5d6','#00a8a8','#10cd2c','#4de680',
  '#7fe619','#43741c','#f1f500','#e6e51a','#ffbd00','#ce660c',
  '#ff6b12','#ff9e3d','#9a5b2a','#cba150','#8b5e34','#754c24',
  '#f7d7c4','#c88a7d','#7f3f72','#b84d8f','#6a4f9b','#877ce8',
  '#4d5bd4','#2f8be7','#5c7f7f','#80e6e5','#4de680','#99e680',
  '#43741c','#7d8f26','#6b6f78','#f0f0f0','#ffd8e3','#d1b3ff'
];

// Termos codificados para não aparecerem como texto legível no arquivo-fonte.
const ENCODED_WORDS = ["Y2FzYQ==","YXJ2b3Jl","Z2F0bw==","Y2FjaG9ycm8=","Y2F2YWxv","cGF0bw==","cGVpeGU=","cGFzc2Fybw==","c2Fwbw==","bWFjYWNv","bGVhbw==","ZWxlZmFudGU=","YmFsZWlh","dHViYXJhbw==","Ym9yYm9sZXRh","YWJlbGhh","Zmxvcg==","c29s","bHVh","ZXN0cmVsYQ==","bnV2ZW0=","Y2h1dmE=","cmFpbw==","YXJjby1pcmlz","Zm9nbw==","Z2Vsbw==","bW9udGFuaGE=","cmlv","bWFy","aWxoYQ==","YmFyY28=","bmF2aW8=","YXZpYW8=","Y2Fycm8=","YmljaWNsZXRh","dHJlbQ==","Zm9ndWV0ZQ==","cG9udGU=","ZXN0cmFkYQ==","amFuZWxh","cG9ydGE=","Y2hhdmU=","Y2FtYQ==","bWVzYQ==","Y2FkZWlyYQ==","cmVsb2dpbw==","dGVsZWZvbmU=","Y29tcHV0YWRvcg==","bGl2cm8=","bGFwaXM=","Y2FuZXRh","bW9jaGlsYQ==","Z3VhcmRhLWNodXZh","b2N1bG9z","Y2hhcGV1","Y29yb2E=","ZXNwYWRh","ZXNjdWRv","Y2FzdGVsbw==","dG9ycmU=","cmVp","cmFpbmhh","cHJpbmNlc2E=","Y2F2YWxlaXJv","cGlyYXRh","ZmFudGFzbWE=","ZHJhZ2Fv","bW9uc3Rybw==","cm9ibw==","dGVzb3Vybw==","bWFwYQ==","YmF1","dmVsYQ==","Ym9sbw==","c29ydmV0ZQ==","cGl6emE=","bWFjYQ==","YmFuYW5h","YWJvYm9yYQ==","ZXNwZWxobw=="];

const storedName = localStorage.getItem(PLAYER_NAME_KEY) || sessionStorage.getItem(PLAYER_NAME_KEY) || '';
if (!storedName.trim()) {
  window.location.href = 'index.html';
}

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
  chatPanel: document.getElementById('chatPanel'),
  chatToggle: document.getElementById('chatToggle'),
  chatMessages: document.getElementById('chatMessages'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  canvas: document.getElementById('drawingCanvas'),
  canvasWrap: document.getElementById('canvasWrap'),
  canvasLockOverlay: document.getElementById('canvasLockOverlay'),
  turnLabel: document.getElementById('turnLabel'),
  turnMessage: document.getElementById('turnMessage'),
  wordStrip: document.getElementById('wordStrip'),
  wordLabel: document.getElementById('wordLabel'),
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
  players: [],
  phase: 'lobby',
  round: 0,
  turnOrder: [],
  turnPosition: -1,
  currentDrawerId: null,
  secretWord: null,
  lastWord: null,
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
let hostTurnTimeout = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function normalizeWord(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function decodeWordPool() {
  try {
    return ENCODED_WORDS.map(value => atob(value));
  } catch (error) {
    console.error('Falha ao decodificar banco de palavras:', error);
    return [];
  }
}

const WORD_POOL = decodeWordPool();

function cleanPlayer(raw) {
  return {
    id: String(raw.id),
    name: String(raw.name || 'Leitor').slice(0, 40),
    color: raw.color || colorFromId(String(raw.id)),
    joinedAt: Number(raw.joinedAt) || Date.now(),
    score: Number(raw.score) || 0
  };
}

function sortedPlayers(players = state.players) {
  return [...players].sort((a,b) =>
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity:'base' }) ||
    a.id.localeCompare(b.id)
  );
}

function chooseHostId(players = state.players) {
  if (!players.length) return null;
  const existing = players.find(p => p.id === state.hostId);
  if (existing) return existing.id;
  return [...players].sort((a,b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))[0].id;
}

function isHost() {
  return chooseHostId(state.players) === playerId;
}

function presencePlayers() {
  const presence = channel?.presenceState?.() || {};
  const map = new Map();
  Object.values(presence).flat().forEach(item => {
    if (!item?.id || !item?.name) return;
    map.set(String(item.id), {
      id: String(item.id),
      name: String(item.name).slice(0,40),
      color: item.color || colorFromId(String(item.id)),
      joinedAt: Number(item.joinedAt) || Date.now(),
      score: 0
    });
  });
  return [...map.values()];
}

function privateLocalSave() {
  const payload = {
    savedAt: Date.now(),
    state: state,
    currentColor,
    currentSize,
    currentTool
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Não foi possível salvar o estado local:', error);
  }
}

function restoreLocalSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!raw?.state) return false;
    if (Date.now() - Number(raw.savedAt || 0) > 24 * 60 * 60 * 1000) return false;
    if (raw.state.room !== ROOM_NAME) return false;
    state = {
      ...state,
      ...raw.state,
      players: Array.isArray(raw.state.players) ? raw.state.players.map(cleanPlayer) : [],
      turnOrder: Array.isArray(raw.state.turnOrder) ? raw.state.turnOrder.slice() : [],
      strokes: Array.isArray(raw.state.strokes) ? raw.state.strokes.slice(-3000) : [],
      chatHistory: Array.isArray(raw.state.chatHistory) ? raw.state.chatHistory.slice(-120) : []
    };
    currentColor = raw.currentColor || currentColor;
    currentSize = Number(raw.currentSize) || currentSize;
    currentTool = raw.currentTool || currentTool;
    state.hostId = chooseHostId(state.players);
    restoredFromDisk = true;
    return true;
  } catch (error) {
    console.warn('Save local inválido:', error);
    return false;
  }
}

function publicState() {
  return {
    ...state,
    players: state.players.map(p => ({...p})),
    strokes: state.strokes.slice(-3000),
    chatHistory: state.chatHistory.slice(-120)
  };
}

async function broadcast(event, payload={}) {
  if (!channel) return false;
  try {
    const result = await channel.send({ type:'broadcast', event, payload });
    return result?.status === 'ok' || result === undefined;
  } catch (error) {
    console.error('Broadcast', event, error);
    return false;
  }
}

async function publishState() {
  state.hostId = chooseHostId(state.players);
  privateLocalSave();
  await broadcast('state', { state: publicState() });
}

function setStatus(text, kind='') {
  els.statusBanner.textContent = text;
  els.statusBanner.className = `status-banner${kind ? ' '+kind : ''}`;
}

function renderChatHistory() {
  els.chatMessages.innerHTML = '';
  state.chatHistory.slice(-120).forEach(message => appendChatElement(message));
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
}

function appendChatElement(message) {
  const row = document.createElement('div');
  row.className = `chat-message${message.correct ? ' correct' : ''}`;
  row.innerHTML =
    `<span class="chat-name" style="color:${message.color}">${escapeHtml(message.player)}</span>` +
    `<span class="chat-text">: ${escapeHtml(message.text)}</span>`;
  els.chatMessages.appendChild(row);
}

function renderLobbyPlayers() {
  const sorted = sortedPlayers();
  els.lobbyPlayers.innerHTML = sorted.length
    ? sorted.map(player => `
      <div class="player-chip">
        <span class="player-dot" style="background:${player.color}"></span>
        <span>${escapeHtml(player.name)}</span>
        ${player.id === state.hostId ? '<span style="margin-left:auto;font-size:9px;text-transform:uppercase;color:#8c6a20;letter-spacing:.08em">Host</span>' : ''}
      </div>`).join('')
    : '<div class="player-chip">Aguardando jogadores...</div>';
}

function renderScores() {
  const sorted = [...state.players].sort((a,b) =>
    b.score - a.score || a.name.localeCompare(b.name,'pt-BR',{sensitivity:'base'})
  );
  els.scoreList.innerHTML = sorted.map(player => `
    <div class="score-row">
      <div class="score-main">
        <span class="turn-dot" style="background:${player.color}"></span>
        <span class="score-name">${escapeHtml(player.name)}</span>
        ${player.id === state.currentDrawerId ? '<span class="turn-mark">desenha</span>' : ''}
      </div>
      <span class="score-points">${player.score}</span>
    </div>
  `).join('');
}

function renderFinalScores() {
  const sorted = [...state.players].sort((a,b) =>
    b.score - a.score || a.name.localeCompare(b.name,'pt-BR',{sensitivity:'base'})
  );
  els.finalScore.innerHTML = sorted.map((player,index)=>`
    <div class="score-row">
      <div class="score-main">
        <span class="turn-dot" style="background:${player.color}"></span>
        <span class="score-name">${index+1}. ${escapeHtml(player.name)}</span>
      </div>
      <span class="score-points">${player.score} pontos</span>
    </div>
  `).join('');
}

function showOnly(view) {
  els.lobbyView.classList.toggle('hidden', view !== 'lobby');
  els.rouletteView.classList.toggle('hidden', view !== 'roulette');
  els.gameView.classList.toggle('hidden', view !== 'game');
  els.finishedView.classList.toggle('hidden', view !== 'finished');
}

function renderPlayerCount() {
  els.playerCounter.textContent = `${state.players.length} de ${MAX_PLAYERS}`;
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
    els.startButton.disabled = state.players.length === 0;
    els.startHint.textContent = `${state.players.length}/${MAX_PLAYERS} jogadores. Qualquer jogador pode pressionar Start.`;
    return;
  }

  if (state.phase === 'roulette') {
    showOnly('roulette');
    els.roundStatus.textContent = `Rodada ${state.round} de ${TOTAL_ROUNDS}`;
    buildRouletteLabels(sortedPlayers());
    els.sortearButton.disabled = state.rouletteSpun;
    if (state.rouletteSpun) {
      showRouletteResult();
    } else {
      els.rouletteResult.textContent = 'Clique em Sortear para começar.';
      els.rouletteOrder.classList.add('hidden');
    }
    return;
  }

  if (state.phase === 'playing') {
    showOnly('game');
    els.roundStatus.textContent = `Rodada ${state.round} de ${TOTAL_ROUNDS}`;
    syncCanvasFromState();
    updateTurnUI();
    return;
  }

  if (state.phase === 'finished') {
    showOnly('finished');
    els.roundStatus.textContent = 'Fim';
    renderFinalScores();
  }
}

function applyState(nextState) {
  if (!nextState) return;
  state = {
    ...state,
    ...nextState,
    players: Array.isArray(nextState.players) ? nextState.players.map(cleanPlayer) : state.players,
    strokes: Array.isArray(nextState.strokes) ? nextState.strokes.slice(-3000) : state.strokes,
    chatHistory: Array.isArray(nextState.chatHistory) ? nextState.chatHistory.slice(-120) : state.chatHistory,
    turnOrder: Array.isArray(nextState.turnOrder) ? nextState.turnOrder.slice() : state.turnOrder
  };
  state.hostId = chooseHostId(state.players);
  privateLocalSave();
  renderState();
}

function mergePresenceIntoLobby() {
  const current = presencePlayers().slice(0, MAX_PLAYERS);
  const oldById = new Map(state.players.map(p => [p.id,p]));
  state.players = current.map(p => ({ ...p, score: oldById.get(p.id)?.score || 0 }));
  state.hostId = chooseHostId(state.players);
  renderState();
  privateLocalSave();
}

function removeLeftPlayer(id) {
  if (!id) return;
  if (state.phase === 'lobby') {
    state.players = state.players.filter(p => p.id !== id);
  } else if (state.started) {
    const wasDrawer = state.currentDrawerId === id;
    state.players = state.players.filter(p => p.id !== id);
    state.turnOrder = state.turnOrder.filter(playerId => playerId !== id);
    if (wasDrawer && isHost()) {
      hostAdvanceTurn();
      return;
    }
    if (state.currentDrawerId === id) state.currentDrawerId = state.turnOrder[0] || null;
  }
  state.hostId = chooseHostId(state.players);
  renderState();
  if (isHost()) publishState();
}

function buildRouletteLabels(players) {
  els.rouletteLabels.innerHTML = '';
  if (!players.length) return;
  const radius = Math.min(165, 38 + players.length * 10);
  players.forEach((player,index) => {
    const angle = (360 / players.length) * index - 90;
    const label = document.createElement('div');
    label.className = 'wheel-label';
    label.textContent = player.name;
    label.style.transform = `rotate(${angle}deg) translate(0,-${radius}px) rotate(${-angle}deg) translateX(-58px)`;
    els.rouletteLabels.appendChild(label);
  });
}

function runRouletteSpin(firstIndex) {
  const players = sortedPlayers();
  buildRouletteLabels(players);
  const count = players.length || 1;
  const segment = 360 / count;
  const target = -(firstIndex * segment + segment/2);
  const turns = 5 + Math.floor(Math.random() * 2);
  wheelRotation += turns * 360 + target;
  els.rouletteWheel.classList.remove('is-spinning');
  void els.rouletteWheel.offsetWidth;
  els.rouletteWheel.classList.add('is-spinning');
  els.rouletteWheel.style.transform = `rotate(${wheelRotation}deg)`;
  els.sortearButton.disabled = true;
}

function showRouletteResult() {
  const winner = state.players.find(p => p.id === state.rouletteWinnerId);
  const orderNames = state.turnOrder.map(id => state.players.find(p => p.id === id)?.name).filter(Boolean);
  els.rouletteResult.textContent = winner ? `${winner.name} começa.` : 'Sorteio concluído.';
  els.rouletteOrderText.textContent = orderNames.join('  →  ');
  els.rouletteOrder.classList.remove('hidden');
}

function scheduleRouletteEnd() {
  if (!state.rouletteRevealUntil) return;
  const remaining = Math.max(0, state.rouletteRevealUntil - Date.now());
  if (hostTurnTimeout) clearTimeout(hostTurnTimeout);
  hostTurnTimeout = setTimeout(() => {
    if (isHost() && state.phase === 'roulette' && state.rouletteSpun) hostStartTurn();
  }, remaining);
}

async function hostStartGame() {
  if (!isHost() || state.phase !== 'lobby' || state.started) return;
  const roster = sortedPlayers(state.players);
  if (!roster.length) return;

  const firstIndex = Math.floor(Math.random() * roster.length);
  const order = [...roster.slice(firstIndex), ...roster.slice(0,firstIndex)];
  state = {
    ...state,
    started:true,
    phase:'roulette',
    round:1,
    turnPosition:0,
    turnOrder:order.map(p=>p.id),
    currentDrawerId:order[0].id,
    secretWord:null,
    lastWord:null,
    strokes:[],
    rouletteSpun:false,
    rouletteWinnerId:null,
    rouletteRevealUntil:0
  };
  handledGuessKey = null;
  clearCanvas();
  renderState();
  await publishState();
}

async function hostSpinRoulette() {
  if (!isHost() || state.phase !== 'roulette' || state.rouletteSpun) return;
  const alphabetical = sortedPlayers(state.players);
  if (!alphabetical.length) return;
  const firstIndex = Math.floor(Math.random() * alphabetical.length);
  const winnerId = alphabetical[firstIndex].id;
  const order = [...alphabetical.slice(firstIndex), ...alphabetical.slice(0,firstIndex)];

  state.rouletteSpun = true;
  state.rouletteWinnerId = winnerId;
  state.turnOrder = order.map(p => p.id);
  state.turnPosition = 0;
  state.currentDrawerId = state.turnOrder[0];
  state.rouletteRevealUntil = Date.now() + 5000;

  privateLocalSave();
  renderState();
  runRouletteSpin(firstIndex);
  await broadcast('roulette-spin', {
    firstIndex,
    winnerId,
    turnOrder: state.turnOrder,
    revealUntil: state.rouletteRevealUntil
  });
  await publishState();
  scheduleRouletteEnd();
}

function nextWord() {
  if (!WORD_POOL.length) return 'casa';
  const previous = normalizeWord(state.lastWord);
  const candidates = WORD_POOL.filter(word => normalizeWord(word) !== previous);
  const choice = candidates[Math.floor(Math.random() * candidates.length)] || WORD_POOL[0];
  state.lastWord = choice;
  return choice;
}

async function hostStartTurn() {
  if (!isHost() || !state.started) return;
  if (!state.turnOrder.length) return;

  if (state.round > TOTAL_ROUNDS) {
    await finishGame();
    return;
  }

  state.phase = 'playing';
  state.currentDrawerId = state.turnOrder[state.turnPosition] || state.turnOrder[0];
  state.secretWord = nextWord();
  state.strokes = [];
  handledGuessKey = null;
  clearCanvas();
  hideSuccess();

  privateLocalSave();
  renderState();

  await publishState();
  await broadcast('turn', {
    drawerId: state.currentDrawerId,
    round: state.round,
    turnPosition: state.turnPosition
  });
}

async function hostAdvanceTurn() {
  if (!isHost() || !state.started || state.phase === 'finished') return;

  const activeOrder = state.turnOrder.filter(id => state.players.some(p => p.id === id));
  state.turnOrder = activeOrder;
  if (!state.turnOrder.length) return;

  const nextPosition = state.turnPosition + 1;
  if (nextPosition >= state.turnOrder.length) {
    if (state.round >= TOTAL_ROUNDS) {
      await finishGame();
      return;
    }
    state.round += 1;
    state.turnPosition = 0;
  } else {
    state.turnPosition = nextPosition;
  }

  await hostStartTurn();
}

async function finishGame() {
  state.phase = 'finished';
  state.currentDrawerId = null;
  state.secretWord = null;
  state.started = true;
  privateLocalSave();
  renderState();
  await publishState();
  await broadcast('finished', { players: state.players });
}

async function hostResetGame() {
  if (!isHost()) return;
  state.started = false;
  state.phase = 'lobby';
  state.round = 0;
  state.turnPosition = -1;
  state.turnOrder = [];
  state.currentDrawerId = null;
  state.secretWord = null;
  state.lastWord = null;
  state.strokes = [];
  state.chatHistory = [];
  state.rouletteSpun = false;
  state.rouletteWinnerId = null;
  state.rouletteRevealUntil = 0;
  state.players = presencePlayers().slice(0,MAX_PLAYERS).map(cleanPlayer).map(p => ({...p,score:0}));
  handledGuessKey = null;
  clearCanvas();
  hideSuccess();
  renderState();
  await publishState();
}

function showSuccess(name, word) {
  els.successName.textContent = name;
  els.successWord.textContent = word;
  els.successOverlay.classList.remove('hidden');
}

function hideSuccess() {
  els.successOverlay.classList.add('hidden');
}

function updateTurnUI() {
  const drawer = state.players.find(p => p.id === state.currentDrawerId);
  const mine = drawer?.id === playerId;
  if (mine) {
    els.turnLabel.textContent = `SUA VEZ · RODADA ${state.round}/${TOTAL_ROUNDS}`;
    els.turnMessage.textContent = 'Desenhe sem entregar a palavra.';
    els.wordStrip.classList.add('is-drawer');
    els.wordLabel.textContent = `Sua palavra: ${state.secretWord || '—'}`;
    els.canvasLockOverlay.classList.add('hidden');
    setStatus('Você está desenhando. O restante da sala só vê o desenho.', 'info');
  } else {
    els.turnLabel.textContent = `VEZ DE ${drawer ? drawer.name.toUpperCase() : 'OUTRO JOGADOR'}`;
    els.turnMessage.textContent = 'Descubram a palavra pelo desenho e pelo chat.';
    els.wordStrip.classList.remove('is-drawer');
    els.wordLabel.textContent = 'A palavra está oculta.';
    els.canvasLockOverlay.classList.remove('hidden');
    setStatus(drawer ? `${drawer.name} está desenhando.` : 'Aguardando o próximo desenhista.', '');
  }
  renderScores();
}

function addChatMessage(message) {
  if (!message?.text) return;
  state.chatHistory = [...state.chatHistory, message].slice(-120);
  appendChatElement(message);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  privateLocalSave();
}

async function handleGuessResult(message) {
  if (!isHost() || state.phase !== 'playing' || !state.secretWord) return;
  const sender = state.players.find(p => p.id === message.senderId);
  if (!sender || sender.id === state.currentDrawerId) return;

  const guess = normalizeWord(message.text);
  const answer = normalizeWord(state.secretWord);
  const guessKey = `${state.round}:${state.turnPosition}`;
  if (guess !== answer || handledGuessKey === guessKey) return;

  handledGuessKey = guessKey;
  state.players = state.players.map(p => p.id === sender.id ? {...p, score:p.score + 10} : p);
  await broadcast('round-end', { winnerId: sender.id, winnerName: sender.name, word: state.secretWord });
  await publishState();

  setTimeout(async () => {
    if (isHost()) await hostAdvanceTurn();
  }, 1200);
}

function renderRoundEnd(payload) {
  showSuccess(payload.winnerName, payload.word);
  const message = {
    player: payload.winnerName,
    text: `acertou "${payload.word}"`,
    color: state.players.find(p=>p.id===payload.winnerId)?.color || '#1f6c3e',
    correct:true
  };
  addChatMessage(message);
}

function setupCanvas() {
  canvasCtx = els.canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  els.canvas.addEventListener('pointerdown', beginStroke);
  els.canvas.addEventListener('pointermove', continueStroke);
  window.addEventListener('pointerup', endStroke);
}

function resizeCanvas() {
  const rect = els.canvasWrap.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  els.canvas.width = Math.floor(rect.width * ratio);
  els.canvas.height = Math.floor(rect.height * ratio);
  canvasCtx.setTransform(ratio,0,0,ratio,0,0);
  canvasCtx.lineCap = 'round';
  canvasCtx.lineJoin = 'round';
  canvasCtx.fillStyle = '#ffffff';
  canvasCtx.fillRect(0,0,rect.width,rect.height);
  syncCanvasFromState();
}

function canvasPoint(event) {
  const rect = els.canvas.getBoundingClientRect();
  return {
    x:(event.clientX - rect.left) / rect.width,
    y:(event.clientY - rect.top) / rect.height
  };
}

function beginStroke(event) {
  if (!isCurrentDrawer()) return;
  drawing = true;
  els.canvas.setPointerCapture?.(event.pointerId);
  lastPoint = canvasPoint(event);
  const first = {
    id:crypto.randomUUID(),
    x1:lastPoint.x,y1:lastPoint.y,x2:lastPoint.x,y2:lastPoint.y,
    color:currentColor,size:currentSize,tool:currentTool,senderId:playerId
  };
  state.strokes.push(first);
  drawStroke(first);
  pendingSegments.push(first);
  scheduleDrawFlush();
}

function continueStroke(event) {
  if (!drawing || !isCurrentDrawer()) return;
  const point = canvasPoint(event);
  const stroke = {
    id:crypto.randomUUID(),
    x1:lastPoint.x,y1:lastPoint.y,x2:point.x,y2:point.y,
    color:currentColor,size:currentSize,tool:currentTool,senderId:playerId
  };
  drawStroke(stroke);
  state.strokes.push(stroke);
  if (state.strokes.length > 3000) state.strokes.splice(0, state.strokes.length - 3000);
  pendingSegments.push(stroke);
  lastPoint = point;
  scheduleDrawFlush();
}

function endStroke() {
  drawing = false;
  lastPoint = null;
  flushDrawQueue();
  privateLocalSave();
}

function scheduleDrawFlush() {
  if (flushDrawTimer) return;
  flushDrawTimer = setTimeout(flushDrawQueue, 25);
}

async function flushDrawQueue() {
  if (flushDrawTimer) {
    clearTimeout(flushDrawTimer);
    flushDrawTimer = null;
  }
  if (!pendingSegments.length) return;
  const batch = pendingSegments.splice(0, 30);
  await broadcast('draw-batch', { strokes:batch });
  if (pendingSegments.length) scheduleDrawFlush();
  privateLocalSave();
}

function drawStroke(stroke) {
  const rect = els.canvas.getBoundingClientRect();
  const x1 = stroke.x1 * rect.width, y1 = stroke.y1 * rect.height;
  const x2 = stroke.x2 * rect.width, y2 = stroke.y2 * rect.height;
  canvasCtx.save();
  canvasCtx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
  canvasCtx.globalAlpha = stroke.tool === 'chalk' ? 0.72 : stroke.tool === 'marker' ? 0.88 : 1;
  canvasCtx.strokeStyle = stroke.tool === 'eraser' ? 'rgba(0,0,0,1)' : stroke.color;
  canvasCtx.lineWidth = stroke.tool === 'marker' ? stroke.size * 1.7 : stroke.tool === 'chalk' ? stroke.size * 1.35 : stroke.size;
  if (stroke.tool === 'chalk') canvasCtx.shadowBlur = 2;
  canvasCtx.beginPath();
  canvasCtx.moveTo(x1,y1);
  canvasCtx.lineTo(x2,y2);
  canvasCtx.stroke();
  canvasCtx.restore();
}

function syncCanvasFromState() {
  if (!canvasCtx) return;
  const rect = els.canvasWrap.getBoundingClientRect();
  canvasCtx.save();
  canvasCtx.setTransform(1,0,0,1,0,0);
  canvasCtx.clearRect(0,0,els.canvas.width,els.canvas.height);
  canvasCtx.restore();
  canvasCtx.fillStyle = '#ffffff';
  canvasCtx.fillRect(0,0,rect.width,rect.height);
  (state.strokes || []).forEach(drawStroke);
}

function clearCanvas() {
  if (!canvasCtx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = els.canvasWrap.getBoundingClientRect();
  canvasCtx.save();
  canvasCtx.setTransform(1,0,0,1,0,0);
  canvasCtx.clearRect(0,0,els.canvas.width,els.canvas.height);
  canvasCtx.restore();
  canvasCtx.setTransform(ratio,0,0,ratio,0,0);
  canvasCtx.fillStyle = '#ffffff';
  canvasCtx.fillRect(0,0,rect.width,rect.height);
}

function isCurrentDrawer() {
  return state.phase === 'playing' && state.currentDrawerId === playerId;
}

function setTool(tool) {
  currentTool = tool;
  document.querySelectorAll('.tool-button').forEach(button => button.classList.toggle('active', button.dataset.tool === tool));
  privateLocalSave();
}

function setSize(size) {
  currentSize = Number(size);
  document.querySelectorAll('.size-button').forEach(button => button.classList.toggle('active', button.dataset.size === String(size)));
  privateLocalSave();
}

function setColor(color) {
  currentColor = color;
  document.querySelectorAll('.color-swatch').forEach(button => button.classList.toggle('active', button.dataset.color === color));
  privateLocalSave();
}

function buildPalette() {
  els.palette.innerHTML = PALETTE.map(color =>
    `<button class="color-swatch${color===currentColor?' active':''}" type="button" style="background:${color}" data-color="${color}" aria-label="Cor ${color}"></button>`
  ).join('');
  els.palette.addEventListener('click', event => {
    const button = event.target.closest('.color-swatch');
    if (button) setColor(button.dataset.color);
  });
}

async function sendChat(text) {
  await broadcast('chat', {
    senderId:playerId,
    player:playerName,
    text:text.slice(0,200),
    color:clientColor
  });
}

function setChatCollapsed(collapsed) {
  const value = Boolean(collapsed);
  els.chatPanel.classList.toggle('is-collapsed', value);
  els.chatToggle.setAttribute('aria-expanded', String(!value));
  els.chatToggle.title = value ? 'Abrir chat' : 'Recolher chat';
  els.chatToggle.textContent = value ? '‹' : '›';
  try { localStorage.setItem(CHAT_COLLAPSED_KEY, value ? '1' : '0'); } catch (_) {}
}

function restoreChatCollapsed() {
  try {
    setChatCollapsed(localStorage.getItem(CHAT_COLLAPSED_KEY) === '1');
  } catch (_) {
    setChatCollapsed(false);
  }
}

function toggleBookOverlay(force) {
  const open = force ?? els.bookOverlay.classList.contains('hidden');
  els.bookOverlay.classList.toggle('hidden', !open);
  els.bookOverlay.setAttribute('aria-hidden', String(!open));
  if (open) els.bookFrame.focus({preventScroll:true});
}

async function handleBroadcast(event,payload) {
  switch(event) {
    case 'state':
      applyState(payload.state);
      if (state.phase === 'roulette' && state.rouletteSpun) {
        showRouletteResult();
        scheduleRouletteEnd();
      }
      break;
    case 'roulette-spin':
      state.phase = 'roulette';
      state.started = true;
      state.rouletteSpun = true;
      state.rouletteWinnerId = payload.winnerId;
      state.turnOrder = payload.turnOrder || state.turnOrder;
      state.rouletteRevealUntil = Number(payload.revealUntil) || Date.now();
      state.turnPosition = 0;
      privateLocalSave();
      showOnly('roulette');
      buildRouletteLabels(sortedPlayers());
      runRouletteSpin(Number(payload.firstIndex) || 0);
      scheduleRouletteEnd();
      break;
    case 'start-request':
      if (isHost()) await hostStartGame();
      break;
    case 'roulette-spin-request':
      if (isHost()) await hostSpinRoulette();
      break;
    case 'turn':
      hideSuccess();
      state.phase = 'playing';
      state.started = true;
      state.currentDrawerId = payload.drawerId;
      state.round = payload.round;
      state.turnPosition = payload.turnPosition;
      state.rouletteSpun = true;
      state.strokes = [];
      privateLocalSave();
      showOnly('game');
      clearCanvas();
      updateTurnUI();
      break;
    case 'chat': {
      const message = {
        player:payload.player,
        text:payload.text,
        color:payload.color,
        senderId:payload.senderId
      };
      addChatMessage(message);
      if (isHost()) await handleGuessResult(message);
      break;
    }
    case 'draw-batch':
      (payload.strokes || []).forEach(stroke => {
        if (stroke?.senderId === playerId) return;
        state.strokes.push(stroke);
        drawStroke(stroke);
      });
      if (state.strokes.length > 3000) state.strokes.splice(0, state.strokes.length-3000);
      privateLocalSave();
      break;
    case 'clear':
      state.strokes = [];
      clearCanvas();
      privateLocalSave();
      break;
    case 'round-end':
      renderRoundEnd(payload);
      break;
    case 'finished':
      hideSuccess();
      state.phase = 'finished';
      state.started = true;
      if (Array.isArray(payload.players)) state.players = payload.players.map(cleanPlayer);
      privateLocalSave();
      renderState();
      break;
    case 'reset-request':
      if (isHost()) await hostResetGame();
      break;
    case 'state-request':
      if (isHost()) await publishState();
      break;
  }
}

async function connectSupabase() {
  setStatus('Conectando à sala online...', 'info');

  channel = supabaseClient.channel(CHANNEL_NAME, {
    config: {
      presence: { key: playerId },
      broadcast: { self:true, ack:true }
    }
  });

  channel
    .on('presence', {event:'sync'}, async () => {
      if (state.phase === 'lobby' || !state.started) {
        mergePresenceIntoLobby();
      } else {
        renderPlayerCount();
        renderScores();
      }
      if (isHost()) await publishState();
    })
    .on('presence', {event:'join'}, async () => {
      if (state.phase === 'lobby' || !state.started) {
        mergePresenceIntoLobby();
        if (isHost()) await publishState();
      }
    })
    .on('presence', {event:'leave'}, async ({key, leftPresences}) => {
      const leftIds = (leftPresences || []).map(item => item?.id).filter(Boolean).map(String);
      if (leftIds.length) {
        leftIds.forEach(removeLeftPlayer);
      } else if (key) {
        const fallback = String(key);
        if (state.players.some(p => p.id === fallback)) removeLeftPlayer(fallback);
      }
    })
    .on('broadcast', {event:'state'}, ({payload}) => handleBroadcast('state',payload))
    .on('broadcast', {event:'roulette-spin'}, ({payload}) => handleBroadcast('roulette-spin',payload))
    .on('broadcast', {event:'start-request'}, ({payload}) => handleBroadcast('start-request',payload))
    .on('broadcast', {event:'roulette-spin-request'}, ({payload}) => handleBroadcast('roulette-spin-request',payload))
    .on('broadcast', {event:'turn'}, ({payload}) => handleBroadcast('turn',payload))
    .on('broadcast', {event:'chat'}, ({payload}) => handleBroadcast('chat',payload))
    .on('broadcast', {event:'draw-batch'}, ({payload}) => handleBroadcast('draw-batch',payload))
    .on('broadcast', {event:'clear'}, ({payload}) => handleBroadcast('clear',payload))
    .on('broadcast', {event:'round-end'}, ({payload}) => handleBroadcast('round-end',payload))
    .on('broadcast', {event:'finished'}, ({payload}) => handleBroadcast('finished',payload))
    .on('broadcast', {event:'reset-request'}, ({payload}) => handleBroadcast('reset-request',payload))
    .on('broadcast', {event:'state-request'}, ({payload}) => handleBroadcast('state-request',payload))
    .subscribe(async (status,error) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          id:playerId,
          name:playerName,
          color:clientColor,
          joinedAt
        });
        renderState();
        setStatus('Online. Sala conectada ao Supabase Realtime.', 'success');
        if (isHost() && restoredFromDisk && state.started) {
          await publishState();
        } else {
          await broadcast('state-request', {from:playerId});
        }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('Supabase Realtime:', status, error);
        setStatus('Não foi possível conectar à sala online. Verifique o Realtime no Supabase.', 'warn');
      }
    });
}

els.chatToggle.addEventListener('click', () => {
  const collapsed = els.chatPanel.classList.contains('is-collapsed');
  setChatCollapsed(!collapsed);
});

els.startButton.addEventListener('click', async () => {
  await broadcast('start-request', {senderId:playerId});
});

els.sortearButton.addEventListener('click', async () => {
  await broadcast('roulette-spin-request', {senderId:playerId});
});

els.brushGroup.addEventListener('click', event => {
  const button = event.target.closest('[data-tool]');
  if (button) setTool(button.dataset.tool);
});

els.sizeGroup.addEventListener('click', event => {
  const button = event.target.closest('[data-size]');
  if (button) setSize(button.dataset.size);
});

els.clearCanvasButton.addEventListener('click', async () => {
  if (!isCurrentDrawer()) return;
  state.strokes = [];
  clearCanvas();
  await broadcast('clear', {senderId:playerId});
  privateLocalSave();
  setStatus('Quadro limpo.', 'info');
});

els.chatForm.addEventListener('submit', async event => {
  event.preventDefault();
  const text = els.chatInput.value.trim();
  if (!text) return;
  els.chatInput.value = '';
  await sendChat(text);
  els.chatInput.focus();
});

els.playAgainButton.addEventListener('click', async () => {
  await broadcast('reset-request', {senderId:playerId});
});

window.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    toggleBookOverlay();
  }
});

window.addEventListener('message', event => {
  if (event.data?.type === 'closeBookOverlay') toggleBookOverlay(false);
});

buildPalette();
restoreChatCollapsed();
restoreLocalSave();
setupCanvas();
renderState();
connectSupabase();
