const socketUrl = (() => {
  if (location.protocol === 'file:') return 'ws://localhost:3000';
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${location.host}`;
})();

const storedName = localStorage.getItem('clubReaderName') || sessionStorage.getItem('clubReaderName') || '';
if (!storedName.trim()) {
  window.location.href = 'index.html';
}
const playerName = storedName.trim().slice(0, 40);
localStorage.setItem('clubReaderName', playerName);
sessionStorage.setItem('clubReaderName', playerName);

const PLAYER_COLORS = ['#9b6572','#547c72','#897157','#6e6d9b','#9a7a9f','#64869b','#9a684b','#6d8c5b','#8b617f','#72818f'];
const PALETTE = ['#2e292b','#5c4b4b','#857474','#b68f8f','#d79ca5','#e6b7bd','#f0c7b4','#d99a74','#b97852','#e3bd8a','#c9b36d','#a98a49','#7d8d61','#99ad80','#c1cdae','#6d9290','#8aaeb0','#9dc2c7','#6f839f','#8997b8','#8176a6','#a596c0','#cda5c2','#d3c1d1','#f2e7d6','#fffaf1'];

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
  timerBadge: document.getElementById('timerBadge'),
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

let state = { players: [], started: false, phase: 'lobby', round: 0, turnIndex: -1, currentDrawerId: null, word: null, deadline: null, strokes: [], room: 'dom-quixote' };
let ws = null;
let clientId = null;
let canvasCtx = null;
let drawing = false;
let lastPoint = null;
let currentColor = PALETTE[0];
let currentSize = 3;
let currentTool = 'pencil';
let countdownTimer = null;
let reconnectTimer = null;
let wheelRotation = 0;

function escapeHtml(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

function connect() {
  clearTimeout(reconnectTimer);
  try {
    ws = new WebSocket(socketUrl);
  } catch (error) {
    setLobbyHint('O servidor do jogo não está disponível.');
    return;
  }

  ws.addEventListener('open', () => {
    ws.send(JSON.stringify({ type: 'join', name: playerName, room: 'dom-quixote' }));
    setLobbyHint('Até 10 jogadores podem participar.');
  });
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    handleMessage(message);
  });
  ws.addEventListener('close', () => {
    els.roundStatus.textContent = 'Desconectado';
    setLobbyHint('Conexão perdida. Tentando reconectar...');
    reconnectTimer = setTimeout(connect, 1800);
  });
}

function send(payload) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
}

function handleMessage(msg) {
  switch (msg.type) {
    case 'welcome': clientId = msg.playerId; applyState(msg.state); break;
    case 'state': applyState(msg.state); break;
    case 'chat': addChatMessage(msg.player, msg.text, msg.color); break;
    case 'draw': drawStroke(msg.stroke); break;
    case 'clear': clearCanvas(); break;
    case 'roulette': runRoulette(msg.players, msg.firstIndex, msg.firstPlayerId); break;
    case 'turn': startTurn(msg); break;
    case 'roundEnd': showSuccess(msg.playerName, msg.word); break;
    case 'finished': showFinished(msg.players); break;
    case 'error': setLobbyHint(msg.message); break;
    default: break;
  }
}

function applyState(nextState) {
  state = nextState;
  renderPlayers();
  renderScores();
  els.playerCounter.textContent = `${state.players.length} de 10`;
  if (!state.started || state.phase === 'lobby') {
    showOnly('lobby');
    els.roundStatus.textContent = 'Lobby';
    els.startButton.disabled = false;
    return;
  }
  if (state.phase === 'roulette') {
    showOnly('roulette');
    els.roundStatus.textContent = `Rodada ${state.round} de 5`;
    return;
  }
  if (state.phase === 'playing') {
    showOnly('game');
    els.roundStatus.textContent = `Rodada ${state.round} de 5`;
    syncCanvasFromState();
    updateTurnUI();
    if (state.deadline) startLocalCountdown(state.deadline);
    return;
  }
  if (state.phase === 'finished') {
    showOnly('finished');
    els.roundStatus.textContent = 'Fim';
    renderFinalScores(state.players);
  }
}

function showOnly(view) {
  els.lobbyView.classList.toggle('hidden', view !== 'lobby');
  els.rouletteView.classList.toggle('hidden', view !== 'roulette');
  els.gameView.classList.toggle('hidden', view !== 'game');
  els.finishedView.classList.toggle('hidden', view !== 'finished');
}

function setLobbyHint(text) { els.startHint.textContent = text; }

function renderPlayers() {
  const sorted = [...state.players].sort((a,b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity:'base' }));
  els.lobbyPlayers.innerHTML = sorted.length ? sorted.map(p => `<div class="player-chip"><span class="player-dot" style="background:${p.color}"></span><span>${escapeHtml(p.name)}</span></div>`).join('') : '<div class="player-chip">Aguardando jogadores...</div>';
}

function renderScores() {
  const sorted = [...state.players].sort((a,b) => b.score - a.score || a.name.localeCompare(b.name, 'pt-BR', { sensitivity:'base' }));
  els.scoreList.innerHTML = sorted.map(p => `<div class="score-row"><div class="score-main"><span class="turn-dot" style="background:${p.color}"></span><span class="score-name">${escapeHtml(p.name)}</span></div><span class="score-points">${p.score}</span></div>`).join('');
}

function renderFinalScores(players) {
  const sorted = [...players].sort((a,b) => b.score - a.score || a.name.localeCompare(b.name, 'pt-BR', { sensitivity:'base' }));
  els.finalScore.innerHTML = sorted.map((p, index) => `<div class="score-row"><div class="score-main"><span class="turn-dot" style="background:${p.color}"></span><span class="score-name">${index + 1}. ${escapeHtml(p.name)}</span></div><span class="score-points">${p.score} pontos</span></div>`).join('');
}

function runRoulette(players, firstIndex, firstPlayerId) {
  showOnly('roulette');
  els.roundStatus.textContent = `Rodada ${state.round || 1} de 5`;
  els.rouletteLabels.innerHTML = '';
  const count = players.length;
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
  setTimeout(() => {
    const winner = players.find(p => p.id === firstPlayerId) || players[firstIndex];
    els.rouletteResult.textContent = `${winner.name} começa.`;
    els.rouletteWheel.classList.remove('is-spinning');
  }, 3800);
}

function startTurn(turn) {
  state.currentDrawerId = turn.drawerId;
  state.word = turn.word;
  state.deadline = turn.deadline;
  state.round = turn.round;
  state.turnIndex = turn.turnIndex;
  state.phase = 'playing';
  state.strokes = [];
  clearCanvas();
  showOnly('game');
  updateTurnUI();
  startLocalCountdown(turn.deadline);
}

function updateTurnUI() {
  const drawer = state.players.find(p => p.id === state.currentDrawerId);
  const mine = drawer && drawer.id === clientId;
  if (mine) {
    els.turnLabel.textContent = `SUA VEZ · RODADA ${state.round}/5`;
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

function startLocalCountdown(deadline) {
  clearInterval(countdownTimer);
  const tick = () => {
    const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    const mins = String(Math.floor(seconds / 60)).padStart(2,'0');
    const secs = String(seconds % 60).padStart(2,'0');
    els.timerBadge.textContent = `${mins}:${secs}`;
    if (seconds <= 0) clearInterval(countdownTimer);
  };
  tick();
  countdownTimer = setInterval(tick, 250);
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
    const img = new Image();
    img.onload = () => canvasCtx.drawImage(img,0,0,logicalWidth,logicalHeight);
    img.src = snapshot;
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
  const stroke = { x1:lastPoint.x, y1:lastPoint.y, x2:point.x, y2:point.y, color:currentColor, size:currentSize, tool:currentTool };
  drawStroke(stroke);
  send({ type:'draw', stroke });
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

function isCurrentDrawer() { return state.phase === 'playing' && state.currentDrawerId === clientId; }

function setTool(tool) {
  currentTool = tool;
  document.querySelectorAll('.tool-button').forEach(btn => btn.classList.toggle('active', btn.dataset.tool === tool));
}
function setSize(size) {
  currentSize = Number(size);
  document.querySelectorAll('.size-button').forEach(btn => btn.classList.toggle('active', btn.dataset.size === String(size)));
}
function setColor(color) {
  currentColor = color;
  document.querySelectorAll('.color-swatch').forEach(btn => btn.classList.toggle('active', btn.dataset.color === color));
}
function buildPalette() {
  els.palette.innerHTML = PALETTE.map(color => `<button class="color-swatch${color===currentColor?' active':''}" type="button" style="background:${color}" data-color="${color}" aria-label="Cor ${color}"></button>`).join('');
  els.palette.addEventListener('click', e => { const btn = e.target.closest('.color-swatch'); if (btn) setColor(btn.dataset.color); });
}

els.brushGroup.addEventListener('click', e => { const btn=e.target.closest('[data-tool]'); if(btn) setTool(btn.dataset.tool); });
els.sizeGroup.addEventListener('click', e => { const btn=e.target.closest('[data-size]'); if(btn) setSize(btn.dataset.size); });
els.clearCanvasButton.addEventListener('click', () => { if (!isCurrentDrawer()) return; clearCanvas(); send({ type:'clear' }); });
els.startButton.addEventListener('click', () => send({ type:'start' }));
els.chatForm.addEventListener('submit', e => { e.preventDefault(); const text=els.chatInput.value; if (!text.trim()) return; send({ type:'chat', text }); els.chatInput.value=''; els.chatInput.focus(); });
els.playAgainButton.addEventListener('click', () => send({ type:'reset' }));

function showSuccess(name, word) {
  els.successName.textContent = name;
  els.successWord.textContent = word;
  els.successOverlay.classList.remove('hidden');
  setTimeout(() => els.successOverlay.classList.add('hidden'), 2600);
}

function toggleBookOverlay(force) {
  const open = force ?? els.bookOverlay.classList.contains('hidden');
  els.bookOverlay.classList.toggle('hidden', !open);
  els.bookOverlay.setAttribute('aria-hidden', String(!open));
  if (open) {
    els.bookFrame.focus({ preventScroll:true });
  }
}

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    e.preventDefault();
    toggleBookOverlay();
  }
});
window.addEventListener('message', e => {
  if (e.data && e.data.type === 'closeBookOverlay') toggleBookOverlay(false);
});
els.bookFrame.addEventListener('load', () => {
  try {
    els.bookFrame.contentWindow.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        window.postMessage({ type:'closeBookOverlay' }, '*');
      }
    });
  } catch (error) {
    // Same-origin when hosted under the same site; if not, parent Esc still works.
  }
});

buildPalette();
setupCanvas();
connect();
