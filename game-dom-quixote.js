/*
  Clube do Livro Du Diable — Dom Quixote
  Multiplayer via Supabase Realtime.
  A publishable key is intentionally used in the browser. Do NOT put a sb_secret key here.
*/

const SUPABASE_URL = 'https://deltfsnecejvhallkuex.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_hCsy5bXtgIayWX54F1LN5w_oh6gCk4G';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const ROOM_NAME = 'dom-quixote';
const CHANNEL_NAME = `du-diable:${ROOM_NAME}`;
const MAX_PLAYERS = 10;
const TOTAL_ROUNDS = 5;
const PLAYER_COLORS = ['#9b6572','#547c72','#897157','#6e6d9b','#9a7a9f','#64869b','#9a684b','#6d8c5b','#8b617f','#72818f'];
const PALETTE = ['#2e292b','#5c4b4b','#857474','#b68f8f','#d79ca5','#e6b7bd','#f0c7b4','#d99a74','#b97852','#e3bd8a','#c9b36d','#a98a49','#7d8d61','#99ad80','#c1cdae','#6d9290','#8aaeb0','#9dc2c7','#6f839f','#8997b8','#8176a6','#a596c0','#cda5c2','#d3c1d1','#f2e7d6','#fffaf1'];
const WORDS = [
  'cavalo','castelo','espada','moinho','dragao','livro','coroa','princesa','cavaleiro','flor',
  'lua','sol','ponte','casa','arvore','janela','chave','navio','tesouro','mapa',
  'fantasma','rei','rainha','gigante','robo','gato','cachorro','peixe','passaro','montanha',
  'rio','chuva','nuvem','fogo','vela','relogio','porta','coracao','oculos','chapéu',
  'telefone','bicicleta','pirata','monstro','sapo','abobora','espelho','cesta','torre','coro'
];

const storedName = localStorage.getItem('clubReaderName') || sessionStorage.getItem('clubReaderName') || '';
if (!storedName.trim()) {
  window.location.href = 'index.html';
}
const playerName = storedName.trim().slice(0, 40);
localStorage.setItem('clubReaderName', playerName);
sessionStorage.setItem('clubReaderName', playerName);

const clientId = crypto.randomUUID();
const joinedAt = Date.now();
const clientColor = PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];

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
  gameView: document.getElementById('gameView'),
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
  turnPosition: -1,
  turnOrder: [],
  currentDrawerId: null,
  word: null,
  strokes: [],
  hostId: null,
  started: false,
  lastWord: null,
  roundLocked: false
};

let channel = null;
let canvasCtx = null;
let drawing = false;
let lastPoint = null;
let currentColor = PALETTE[0];
let currentSize = 3;
let currentTool = 'pencil';
let wheelRotation = 0;
let handledGuessKey = null;

function escapeHtml(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

function normalizeWord(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function makePlayerRecord(raw) {
  return {
    id: raw.id,
    name: raw.name,
    color: raw.color,
    joinedAt: Number(raw.joinedAt) || Date.now(),
    score: 0
  };
}

function getSortedPlayers(players = state.players) {
  return [...players].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }) || a.id.localeCompare(b.id));
}

function getHostId(players = state.players) {
  if (!players.length) return null;
  const current = players.find(player => player.id === state.hostId);
  if (current) return current.id;
  return [...players].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))[0].id;
}

function isHost() {
  return getHostId() === clientId;
}

function getPresencePlayers() {
  const presence = channel?.presenceState?.() || {};
  const map = new Map();
  Object.values(presence).flat().forEach(item => {
    if (!item?.id || !item?.name) return;
    map.set(item.id, {
      id: item.id,
      name: String(item.name).slice(0, 40),
      color: item.color || PLAYER_COLORS[map.size % PLAYER_COLORS.length],
      joinedAt: Number(item.joinedAt) || Date.now()
    });
  });
  return [...map.values()];
}

function mergePresenceIntoState() {
  const presencePlayers = getPresencePlayers();
  if (!presencePlayers.length) return;

  const oldById = new Map(state.players.map(player => [player.id, player]));
  state.players = presencePlayers.slice(0, MAX_PLAYERS).map(player => ({
    ...player,
    score: oldById.get(player.id)?.score || 0
  }));

  if (clientId !== state.currentDrawerId) state.word = null;
  state.hostId = getHostId(state.players);
  renderPlayers();
  renderScores();
  els.playerCounter.textContent = `${state.players.length} de ${MAX_PLAYERS}`;

  if (!state.started || state.phase === 'lobby') {
    setLobbyHint(`${state.players.length}/${MAX_PLAYERS} jogadores. Qualquer jogador pode pressionar Start.`);
  }
}

function publicState() {
  const { word, ...safeState } = state;
  return {
    ...safeState,
    players: state.players.map(player => ({ ...player })),
    strokes: state.strokes.slice(-350)
  };
}

async function broadcast(event, payload) {
  if (!channel) return;
  await channel.send({ type: 'broadcast', event, payload });
}

async function publishState() {
  state.hostId = getHostId(state.players);
  await broadcast('state', { state: publicState() });
}

function setLobbyHint(text) {
  els.startHint.textContent = text;
}

function renderPlayers() {
  const sorted = getSortedPlayers();
  els.lobbyPlayers.innerHTML = sorted.length
    ? sorted.map((player, index) => `<div class="player-chip"><span class="player-dot" style="background:${player.color}"></span><span>${escapeHtml(player.name)}</span>${player.id === state.hostId ? '<span style="margin-left:auto;font-size:9px;text-transform:uppercase;color:#a07939;letter-spacing:.08em">Host</span>' : ''}</div>`).join('')
    : '<div class="player-chip">Aguardando jogadores...</div>';
}

function renderScores() {
  const sorted = [...state.players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  els.scoreList.innerHTML = sorted.map(player => `<div class="score-row"><div class="score-main"><span class="turn-dot" style="background:${player.color}"></span><span class="score-name">${escapeHtml(player.name)}</span></div><span class="score-points">${player.score}</span></div>`).join('');
}

function renderFinalScores(players) {
  const sorted = [...players].sort((a,b) => b.score - a.score || a.name.localeCompare(b.name, 'pt-BR', { sensitivity:'base' }));
  els.finalScore.innerHTML = sorted.map((player, index) => `<div class="score-row"><div class="score-main"><span class="turn-dot" style="background:${player.color}"></span><span class="score-name">${index + 1}. ${escapeHtml(player.name)}</span></div><span class="score-points">${player.score} pontos</span></div>`).join('');
}

function showOnly(view) {
  els.lobbyView.classList.toggle('hidden', view !== 'lobby');
  els.rouletteView.classList.toggle('hidden', view !== 'roulette');
  els.gameView.classList.toggle('hidden', view !== 'game');
  els.finishedView.classList.toggle('hidden', view !== 'finished');
}

function applyState(nextState) {
  if (!nextState) return;
  const incomingPlayers = Array.isArray(nextState.players) ? nextState.players : [];
  const localPresence = getPresencePlayers();
  const localById = new Map(localPresence.map(p => [p.id, p]));

  state = {
    ...state,
    ...nextState,
    players: incomingPlayers.map(player => ({
      ...player,
      name: player.name || localById.get(player.id)?.name || 'Leitor',
      color: player.color || localById.get(player.id)?.color || PLAYER_COLORS[0],
      joinedAt: player.joinedAt || localById.get(player.id)?.joinedAt || Date.now(),
      score: Number(player.score) || 0
    })),
    strokes: Array.isArray(nextState.strokes) ? nextState.strokes : [],
    roundLocked: Boolean(nextState.roundLocked)
  };

  state.hostId = getHostId(state.players);
  renderPlayers();
  renderScores();
  els.playerCounter.textContent = `${state.players.length} de ${MAX_PLAYERS}`;

  if (!state.started || state.phase === 'lobby') {
    showOnly('lobby');
    els.roundStatus.textContent = 'Lobby';
    els.startButton.disabled = false;
    return;
  }

  if (state.phase === 'roulette') {
    showOnly('roulette');
    els.roundStatus.textContent = `Rodada ${state.round} de ${TOTAL_ROUNDS}`;
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
    renderFinalScores(state.players);
  }
}

function runRoulette(players, firstIndex, firstPlayerId) {
  showOnly('roulette');
  els.roundStatus.textContent = `Rodada ${state.round || 1} de ${TOTAL_ROUNDS}`;
  els.rouletteLabels.innerHTML = '';
  const count = players.length;
  if (!count) return;

  players.forEach((player, index) => {
    const angle = (360 / count) * index - 90;
    const label = document.createElement('div');
    label.className = 'wheel-label';
    label.textContent = player.name;
    label.style.transform = `rotate(${angle}deg) translate(0,-${Math.min(145, 30 + count * 10)}px) rotate(${-angle}deg) translateX(-52px)`;
    els.rouletteLabels.appendChild(label);
  });

  const segment = 360 / count;
  const targetAngle = 360 - (firstIndex * segment + segment / 2);
  const turns = 5 + Math.floor(Math.random() * 2);
  wheelRotation += turns * 360 + targetAngle;
  els.rouletteWheel.style.transform = 'rotate(0deg)';
  requestAnimationFrame(() => {
    els.rouletteWheel.classList.add('is-spinning');
    els.rouletteWheel.style.transform = `rotate(${wheelRotation}deg)`;
  });
  els.rouletteResult.textContent = 'Sorteando...';
}

async function hostStartGame() {
  if (!isHost() || state.players.length < 1 || state.started) return;

  const alphabetical = getSortedPlayers(state.players);
  const firstIndex = Math.floor(Math.random() * alphabetical.length);
  const turnOrder = [...alphabetical.slice(firstIndex), ...alphabetical.slice(0, firstIndex)].map(player => player.id);

  state = {
    ...state,
    started: true,
    phase: 'roulette',
    round: 1,
    turnPosition: 0,
    turnOrder,
    currentDrawerId: turnOrder[0],
    word: null,
    strokes: [],
    roundLocked: false,
    hostId: clientId
  };
  handledGuessKey = null;
  clearCanvas();
  await publishState();
  await broadcast('roulette', { players: alphabetical, firstIndex, firstPlayerId: turnOrder[0] });

}

function pickWord() {
  const candidates = WORDS.filter(word => normalizeWord(word) !== normalizeWord(state.lastWord));
  const choice = candidates[Math.floor(Math.random() * candidates.length)] || WORDS[0];
  state.lastWord = choice;
  return choice;
}

async function hostStartTurn() {
  if (!isHost() || !state.started) return;
  if (!state.turnOrder.length) return;

  if (state.turnPosition >= state.turnOrder.length) {
    state.round += 1;
    state.turnPosition = 0;
  }

  if (state.round > TOTAL_ROUNDS) {
    state.phase = 'finished';
    state.currentDrawerId = null;
    state.word = null;
    await publishState();
    await broadcast('finished', { players: state.players });
    return;
  }

  const drawerId = state.turnOrder[state.turnPosition];
  if (!state.players.some(player => player.id === drawerId)) {
    state.turnOrder = state.turnOrder.filter(id => state.players.some(player => player.id === id));
    if (!state.turnOrder.length) return;
    state.turnPosition = Math.min(state.turnPosition, state.turnOrder.length - 1);
  }

  state.currentDrawerId = state.turnOrder[state.turnPosition];
  state.word = pickWord();
  state.phase = 'playing';
  state.strokes = [];
  state.roundLocked = false;
  handledGuessKey = null;
  clearCanvas();

  await publishState();
  await broadcast('turn', {
    drawerId: state.currentDrawerId,
    round: state.round,
    turnPosition: state.turnPosition
  });
  await broadcast('drawer-word', { targetId: state.currentDrawerId, word: state.word });
}

async function hostAdvanceTurn() {
  if (!isHost()) return;
  if (!state.started) return;

  const activeIds = new Set(state.players.map(player => player.id));
  state.turnOrder = state.turnOrder.filter(id => activeIds.has(id));
  if (!state.turnOrder.length) return;

  const nextPosition = Math.min(state.turnPosition + 1, state.turnOrder.length);
  if (nextPosition >= state.turnOrder.length) {
    if (state.round >= TOTAL_ROUNDS) {
      state.phase = 'finished';
      state.currentDrawerId = null;
      state.word = null;
      await publishState();
      await broadcast('finished', { players: state.players });
      return;
    }
    state.round += 1;
    state.turnPosition = 0;
  } else {
    state.turnPosition = nextPosition;
  }

  state.phase = 'playing';
  state.currentDrawerId = state.turnOrder[state.turnPosition];
  state.strokes = [];
  state.word = pickWord();
  state.roundLocked = false;
  handledGuessKey = null;
  clearCanvas();
  await publishState();
  await broadcast('turn', {
    drawerId: state.currentDrawerId,
    round: state.round,
    turnPosition: state.turnPosition
  });
  await broadcast('drawer-word', { targetId: state.currentDrawerId, word: state.word });
}

async function hostResetGame() {
  if (!isHost()) return;
  state.started = false;
  state.phase = 'lobby';
  state.round = 0;
  state.turnPosition = -1;
  state.turnOrder = [];
  state.currentDrawerId = null;
  state.word = null;
  state.strokes = [];
  state.roundLocked = false;
  state.lastWord = null;
  state.roundLocked = false;
  state.players = state.players.map(player => ({ ...player, score: 0 }));
  handledGuessKey = null;
  clearCanvas();
  await publishState();
}

async function hostProcessChat(payload) {
  const sender = state.players.find(player => player.id === payload.senderId);
  if (!sender) return;

  const text = String(payload.text || '').slice(0, 200);
  if (!text.trim()) return;

  if (state.phase === 'playing' && !state.roundLocked && sender.id !== state.currentDrawerId) {
    const guess = normalizeWord(text);
    const answer = normalizeWord(state.word);
    const guessKey = `${state.round}:${state.turnPosition}:${sender.id}`;

    if (guess === answer && handledGuessKey !== guessKey) {
      handledGuessKey = guessKey;
      const updatedPlayers = state.players.map(player => player.id === sender.id ? { ...player, score: player.score + 10 } : player);
      state.players = updatedPlayers;
      state.roundLocked = true;
      await broadcast('roundEnd', { playerName: sender.name, word: state.word });
      await publishState();
      if (isHost()) await hostAdvanceTurn();
    }
  }
}

function updateTurnUI() {
  const drawer = state.players.find(player => player.id === state.currentDrawerId);
  const mine = drawer && drawer.id === clientId;
  if (mine) {
    els.turnLabel.textContent = `SUA VEZ · RODADA ${state.round}/${TOTAL_ROUNDS}`;
    els.turnMessage.textContent = 'Desenhe sem entregar a palavra.';
    els.wordStrip.classList.add('is-drawer');
    els.wordLabel.textContent = `Sua palavra: ${state.word || '—'}`;
    els.canvasLockOverlay.classList.add('hidden');
  } else {
    els.turnLabel.textContent = `VEZ DE ${drawer ? drawer.name.toUpperCase() : 'OUTRO JOGADOR'}`;
    els.turnMessage.textContent = 'Descubram a palavra pelo desenho e pelo chat.';
    els.wordStrip.classList.remove('is-drawer');
    els.wordLabel.textContent = 'A palavra está oculta.';
    els.canvasLockOverlay.classList.toggle('hidden', false);
  }
}

function addChatMessage(player, text, color) {
  const row = document.createElement('div');
  row.className = 'chat-message';
  row.innerHTML = `<span class="chat-name" style="color:${color}">${escapeHtml(player)}</span><span class="chat-text">: ${escapeHtml(text)}</span>`;
  els.chatMessages.appendChild(row);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
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
  const logicalWidth = rect.width;
  const logicalHeight = rect.height;
  const oldCanvas = els.canvas;
  const snapshot = oldCanvas.width && oldCanvas.height ? oldCanvas.toDataURL() : null;
  oldCanvas.width = Math.floor(logicalWidth * ratio);
  oldCanvas.height = Math.floor(logicalHeight * ratio);
  canvasCtx.setTransform(ratio,0,0,ratio,0,0);
  canvasCtx.lineCap = 'round';
  canvasCtx.lineJoin = 'round';
  canvasCtx.fillStyle = '#fffdfa';
  canvasCtx.fillRect(0,0,logicalWidth,logicalHeight);
  if (snapshot) {
    const image = new Image();
    image.onload = () => canvasCtx.drawImage(image,0,0,logicalWidth,logicalHeight);
    image.src = snapshot;
  }
  syncCanvasFromState();
}

function beginStroke(event) {
  if (!isCurrentDrawer()) return;
  drawing = true;
  els.canvas.setPointerCapture?.(event.pointerId);
  lastPoint = canvasPoint(event);
}

function continueStroke(event) {
  if (!drawing || !isCurrentDrawer()) return;
  const point = canvasPoint(event);
  const stroke = {
    id: crypto.randomUUID(),
    x1:lastPoint.x, y1:lastPoint.y, x2:point.x, y2:point.y,
    color:currentColor, size:currentSize, tool:currentTool,
    senderId: clientId
  };
  drawStroke(stroke);
  state.strokes.push(stroke);
  broadcast('draw', { stroke });
  lastPoint = point;
}

function endStroke() { drawing = false; lastPoint = null; }

function canvasPoint(event) {
  const rect = els.canvas.getBoundingClientRect();
  return { x:(event.clientX - rect.left) / rect.width, y:(event.clientY - rect.top) / rect.height };
}

function drawStroke(stroke) {
  const rect = els.canvas.getBoundingClientRect();
  const x1 = stroke.x1 * rect.width, y1 = stroke.y1 * rect.height;
  const x2 = stroke.x2 * rect.width, y2 = stroke.y2 * rect.height;
  canvasCtx.save();
  canvasCtx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
  canvasCtx.globalAlpha = stroke.tool === 'chalk' ? 0.58 : stroke.tool === 'marker' ? 0.82 : 1;
  canvasCtx.strokeStyle = stroke.tool === 'eraser' ? 'rgba(0,0,0,1)' : stroke.color;
  canvasCtx.lineWidth = stroke.tool === 'marker' ? stroke.size * 1.6 : stroke.tool === 'chalk' ? stroke.size * 1.25 : stroke.size;
  if (stroke.tool === 'chalk') canvasCtx.shadowBlur = 2;
  canvasCtx.beginPath();
  canvasCtx.moveTo(x1,y1); canvasCtx.lineTo(x2,y2); canvasCtx.stroke();
  canvasCtx.restore();
}

function clearCanvas() {
  if (!canvasCtx) return;
  const rect = els.canvasWrap.getBoundingClientRect();
  canvasCtx.save();
  canvasCtx.setTransform(1,0,0,1,0,0);
  canvasCtx.clearRect(0,0,els.canvas.width,els.canvas.height);
  canvasCtx.restore();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvasCtx.setTransform(ratio,0,0,ratio,0,0);
  canvasCtx.fillStyle = '#fffdfa';
  canvasCtx.fillRect(0,0,rect.width,rect.height);
}

function syncCanvasFromState() {
  if (!canvasCtx) return;
  clearCanvas();
  (state.strokes || []).forEach(drawStroke);
}

function isCurrentDrawer() {
  return state.phase === 'playing' && !state.roundLocked && state.currentDrawerId === clientId;
}

function setTool(tool) {
  currentTool = tool;
  document.querySelectorAll('.tool-button').forEach(button => button.classList.toggle('active', button.dataset.tool === tool));
}
function setSize(size) {
  currentSize = Number(size);
  document.querySelectorAll('.size-button').forEach(button => button.classList.toggle('active', button.dataset.size === String(size)));
}
function setColor(color) {
  currentColor = color;
  document.querySelectorAll('.color-swatch').forEach(button => button.classList.toggle('active', button.dataset.color === color));
}
function buildPalette() {
  els.palette.innerHTML = PALETTE.map(color => `<button class="color-swatch${color===currentColor?' active':''}" type="button" style="background:${color}" data-color="${color}" aria-label="Cor ${color}"></button>`).join('');
  els.palette.addEventListener('click', event => {
    const button = event.target.closest('.color-swatch');
    if (button) setColor(button.dataset.color);
  });
}

async function sendChat(text) {
  await broadcast('chat', { senderId: clientId, player: playerName, text: text.slice(0,200), color: clientColor });
}

function showSuccess(name, word) {
  els.successName.textContent = name;
  els.successWord.textContent = word;
  els.successOverlay.classList.remove('hidden');
}

function toggleBookOverlay(force) {
  const open = force ?? els.bookOverlay.classList.contains('hidden');
  els.bookOverlay.classList.toggle('hidden', !open);
  els.bookOverlay.setAttribute('aria-hidden', String(!open));
  if (open) els.bookFrame.focus({ preventScroll:true });
}

async function handleBroadcast(event, payload) {
  switch (event) {
    case 'state':
      applyState(payload.state);
      break;
    case 'roulette':
      runRoulette(payload.players, payload.firstIndex, payload.firstPlayerId);
      break;
    case 'turn':
      state.currentDrawerId = payload.drawerId;
      state.round = payload.round;
      state.turnPosition = payload.turnPosition;
      state.word = payload.drawerId === clientId ? state.word : null;
      state.phase = 'playing';
      els.successOverlay.classList.add('hidden');
      showOnly('game');
      updateTurnUI();
      break;
    case 'drawer-word':
      if (payload.targetId === clientId) {
        state.word = String(payload.word || '');
        updateTurnUI();
      }
      break;
    case 'chat':
      addChatMessage(payload.player, payload.text, payload.color);
      if (isHost()) await hostProcessChat(payload);
      break;
    case 'draw':
      if (payload.stroke?.senderId !== clientId) {
        state.strokes.push(payload.stroke);
        drawStroke(payload.stroke);
      }
      break;
    case 'clear':
      state.strokes = [];
      clearCanvas();
      break;
    case 'start-request':
      if (isHost()) await hostStartGame();
      break;
    case 'reset-request':
      if (isHost()) await hostResetGame();
      break;
    case 'roundEnd':
      showSuccess(payload.playerName, payload.word);
      break;
    case 'finished':
      state.phase = 'finished';
      state.started = true;
      showOnly('finished');
      renderFinalScores(payload.players);
      break;
    default:
      break;
  }
}

async function connectSupabase() {
  setLobbyHint('Conectando à sala online...');
  channel = supabaseClient.channel(CHANNEL_NAME, {
    config: {
      presence: { key: clientId },
      broadcast: { self: true, ack: true }
    }
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      mergePresenceIntoState();
      if (isHost()) publishState();
    })
    .on('presence', { event: 'join' }, () => {
      mergePresenceIntoState();
      if (isHost()) publishState();
    })
    .on('presence', { event: 'leave' }, () => {
      const wasPlaying = state.started && state.phase !== 'finished';
      mergePresenceIntoState();
      if (state.players.length === 0) return;
      if (wasPlaying && !state.players.some(player => player.id === state.currentDrawerId)) {
        if (isHost()) hostAdvanceTurn();
      } else if (isHost()) {
        publishState();
      }
    })
    .on('broadcast', { event: 'state' }, ({ payload }) => handleBroadcast('state', payload))
    .on('broadcast', { event: 'roulette' }, ({ payload }) => handleBroadcast('roulette', payload))
    .on('broadcast', { event: 'turn' }, ({ payload }) => handleBroadcast('turn', payload))
    .on('broadcast', { event: 'drawer-word' }, ({ payload }) => handleBroadcast('drawer-word', payload))
    .on('broadcast', { event: 'chat' }, ({ payload }) => handleBroadcast('chat', payload))
    .on('broadcast', { event: 'draw' }, ({ payload }) => handleBroadcast('draw', payload))
    .on('broadcast', { event: 'clear' }, ({ payload }) => handleBroadcast('clear', payload))
    .on('broadcast', { event: 'start-request' }, ({ payload }) => handleBroadcast('start-request', payload))
    .on('broadcast', { event: 'reset-request' }, ({ payload }) => handleBroadcast('reset-request', payload))
    .on('broadcast', { event: 'roundEnd' }, ({ payload }) => handleBroadcast('roundEnd', payload))
    .on('broadcast', { event: 'finished' }, ({ payload }) => handleBroadcast('finished', payload))
    .subscribe(async (status, error) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ id: clientId, name: playerName, color: clientColor, joinedAt });
        mergePresenceIntoState();
        setLobbyHint(`Online. ${state.players.length}/${MAX_PLAYERS} jogadores na sala.`);
        if (isHost()) await publishState();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('Supabase Realtime:', status, error);
        setLobbyHint('Não foi possível conectar à sala online. Verifique o Realtime no Supabase.');
      }
    });
}

els.rouletteWheel.addEventListener('transitionend', event => {
  if (event.propertyName !== 'transform') return;
  const players = getSortedPlayers(state.players);
  const winner = players.find(player => player.id === state.currentDrawerId) || players[0];
  if (winner) els.rouletteResult.textContent = `${winner.name} começa.`;
  els.rouletteWheel.classList.remove('is-spinning');
  if (isHost() && state.started && state.phase === 'roulette') hostStartTurn();
});

els.brushGroup.addEventListener('click', event => { const button=event.target.closest('[data-tool]'); if(button) setTool(button.dataset.tool); });
els.sizeGroup.addEventListener('click', event => { const button=event.target.closest('[data-size]'); if(button) setSize(button.dataset.size); });
els.clearCanvasButton.addEventListener('click', async () => {
  if (!isCurrentDrawer()) return;
  state.strokes = [];
  clearCanvas();
  await broadcast('clear', { senderId: clientId });
});
els.startButton.addEventListener('click', async () => { await broadcast('start-request', { senderId: clientId }); });
els.chatForm.addEventListener('submit', async event => {
  event.preventDefault();
  const text = els.chatInput.value.trim();
  if (!text) return;
  els.chatInput.value = '';
  await sendChat(text);
  els.chatInput.focus();
});
els.playAgainButton.addEventListener('click', async () => { await broadcast('reset-request', { senderId: clientId }); });

window.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    toggleBookOverlay();
  }
});
window.addEventListener('message', event => {
  if (event.data && event.data.type === 'closeBookOverlay') toggleBookOverlay(false);
});
els.bookFrame.addEventListener('load', () => {
  try {
    els.bookFrame.contentWindow.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        window.postMessage({ type:'closeBookOverlay' }, '*');
      }
    });
  } catch (error) {
    // Same-origin when hosted on GitHub Pages.
  }
});

els.successOverlay.classList.add('hidden');
buildPalette();
setupCanvas();
connectSupabase();
