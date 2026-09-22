/*
  CLUBE DO LIVRO DU DIABLE — PAINT / Dom Quixote
  BETA FINAL v5 — Supabase Realtime
  Sem cronômetro de rodada. A única espera automática é a transição visual de 5s
  após a roleta mostrar a ordem, conforme a mecânica definida.
*/

const SUPABASE_URL = 'https://deltfsnecejvhallkuex.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_hCsy5bXtgIayWX54F1LN5w_oh6gCk4G';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const ROOM_NAME = 'dom-quixote';
const CHANNEL_NAME = `du-diable:${ROOM_NAME}`;
const MAX_PLAYERS = 10;
const TOTAL_ROUNDS = 5;
const ROULETTE_SPIN_MS = 7200;
const ROULETTE_REVEAL_MS = 5000;
const DRAW_FLUSH_MS = 24;
const SAVE_KEY = 'duDiableDomQuixoteMatchV5';
const CHAT_COLLAPSED_KEY = 'duDiableChatCollapsedV3';
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

// 7 temas × 50 palavras simples. Codificadas para evitar a lista legível no código-fonte.
const ENCODED_THEME_WORDS = 'eyJDb21pZGEiOlsicGl6emEiLCJoYW1iw7pyZ3VlciIsInNhbmR1w61jaGUiLCJjYWNob3Jyby1xdWVudGUiLCJzb3J2ZXRlIiwiYm9sbyIsImJyaWdhZGVpcm8iLCJwaXBvY2EiLCJiYW5hbmEiLCJtYcOnw6MiLCJsYXJhbmphIiwidXZhIiwibWVsYW5jaWEiLCJtb3JhbmdvIiwiYWJhY2F4aSIsImNvY28iLCJjZW5vdXJhIiwiYmF0YXRhIiwibWlsaG8iLCJ0b21hdGUiLCJhcnJveiIsImZlaWrDo28iLCJtYWNhcnLDo28iLCJsYXNhbmhhIiwic29wYSIsInNhbGFkYSIsIm92byIsInF1ZWlqbyIsInDDo28iLCJ0b3JyYWRhIiwicGFucXVlY2EiLCJiaXNjb2l0byIsImNob2NvbGF0ZSIsInBpcnVsaXRvIiwiY2h1cnJhc2NvIiwic3VzaGkiLCJ0YWNvIiwidG9ydGEiLCJyb3NxdWluaGEiLCJiYWxhIiwibWVsIiwiZ2VsZWlhIiwibWFudGVpZ2EiLCJpb2d1cnRlIiwiY2Fmw6kiLCJzdWNvIiwiw6FndWEiLCJyZWZyaWdlcmFudGUiLCJjaMOhIiwiYXplaXRvbmEiXSwiQW5pbWFsIjpbImdhdG8iLCJjYWNob3JybyIsImNhdmFsbyIsInZhY2EiLCJwb3JjbyIsIm92ZWxoYSIsImdhbGluaGEiLCJwYXRvIiwiZ2FsbyIsImNvZWxobyIsInJhdG8iLCJoYW1zdGVyIiwibWFjYWNvIiwibGXDo28iLCJ0aWdyZSIsInVyc28iLCJlbGVmYW50ZSIsImdpcmFmYSIsInplYnJhIiwiY2FtZWxvIiwiY2FuZ3VydSIsInBhbmRhIiwiY29hbGEiLCJsb2JvIiwicmFwb3NhIiwidmVhZG8iLCJlc3F1aWxvIiwidGFydGFydWdhIiwiY29icmEiLCJsYWdhcnRvIiwiamFjYXLDqSIsInNhcG8iLCJiYWxlaWEiLCJnb2xmaW5obyIsInR1YmFyw6NvIiwicG9sdm8iLCJwZWl4ZSIsImNhcmFuZ3Vlam8iLCJwaW5ndWltIiwiZm9jYSIsIsOhZ3VpYSIsImNvcnVqYSIsInBhcGFnYWlvIiwicG9tYm8iLCJiZWlqYS1mbG9yIiwiYm9yYm9sZXRhIiwiYWJlbGhhIiwiYXJhbmhhIiwiZm9ybWlnYSIsImNhcmFjb2wiXSwiQcOnw6NvIjpbImNvcnJlciIsInB1bGFyIiwiYW5kYXIiLCJuYWRhciIsInZvYXIiLCJkYW7Dp2FyIiwiY2FudGFyIiwiY29tZXIiLCJiZWJlciIsImRvcm1pciIsInJpciIsImNob3JhciIsImdyaXRhciIsImFjZW5hciIsImJhdGVyIiwiY2h1dGFyIiwiam9nYXIiLCJicmluY2FyIiwibGVyIiwiZXNjcmV2ZXIiLCJkZXNlbmhhciIsInBpbnRhciIsImNvemluaGFyIiwicGVzY2FyIiwiZGlyaWdpciIsImNhbWluaGFyIiwiZXNjdXRhciIsIm9saGFyIiwiYXBvbnRhciIsImFicmHDp2FyIiwiYmVpamFyIiwiZXNwaXJyYXIiLCJ0b3NzaXIiLCJlc3ByZWd1acOnYXIiLCJzdWJpciIsImRlc2NlciIsImNhaXIiLCJlbXB1cnJhciIsInB1eGFyIiwiY2FycmVnYXIiLCJhYnJpciIsImZlY2hhciIsImNvcnRhciIsImxhdmFyIiwidmFycmVyIiwiY2F2YXIiLCJwbGFudGFyIiwicmVnYXIiLCJhc3NvYmlhciIsIm1hc3RpZ2FyIl0sIk9iamV0byI6WyJib2xhIiwiY2FkZWlyYSIsIm1lc2EiLCJjYW1hIiwic29mw6EiLCJwb3J0YSIsImphbmVsYSIsImNoYXZlIiwibGl2cm8iLCJsw6FwaXMiLCJjYW5ldGEiLCJtb2NoaWxhIiwiw7NjdWxvcyIsInRlbGVmb25lIiwiY29tcHV0YWRvciIsInRlY2xhZG8iLCJtb3VzZSIsInRlbGV2aXPDo28iLCJjb250cm9sZSIsInJlbMOzZ2lvIiwiZ3VhcmRhLWNodXZhIiwiY2hhcMOpdSIsInNhcGF0byIsImNhbWlzYSIsImNhbMOnYSIsIm1laWEiLCJlc2NvdmEiLCJwZW50ZSIsImVzcGVsaG8iLCJnYXJmbyIsImZhY2EiLCJjb2xoZXIiLCJwcmF0byIsImNvcG8iLCJnYXJyYWZhIiwicGFuZWxhIiwiZnJpZ2lkZWlyYSIsInZhc3NvdXJhIiwiYmFsZGUiLCJtYXJ0ZWxvIiwiY2hhdmUgZGUgZmVuZGEiLCJ0ZXNvdXJhIiwiY2FpeGEiLCJjZXN0byIsInZlbGEiLCJsw6JtcGFkYSIsInZpb2zDo28iLCJwaW5jZWwiLCJjw6JtZXJhIiwiYmljaWNsZXRhIl0sIlBlcnNvbmFnZW0iOlsiRG9tIFF1aXhvdGUiLCJTYW5jaG8gUGFuw6dhIiwiQ2luZGVyZWxhIiwiQnJhbmNhIGRlIE5ldmUiLCJDaGFwZXV6aW5obyBWZXJtZWxobyIsIlBpbsOzcXVpbyIsIlBldGVyIFBhbiIsIkFsaWNlIiwiQ2hhcGVsZWlybyIsIlNoZXJsb2NrIEhvbG1lcyIsIlJvYmluIEhvb2QiLCJUYXJ6YW4iLCJIw6lyY3VsZXMiLCJNZWR1c2EiLCJEcsOhY3VsYSIsIkZyYW5rZW5zdGVpbiIsIkhvbWVtLUFyYW5oYSIsIlN1cGVybWFuIiwiQmF0bWFuIiwiSHVsayIsIlRob3IiLCJGbGFzaCIsIk11bGhlci1NYXJhdmlsaGEiLCJQb3BleWUiLCJNaWNrZXkiLCJQYXRldGEiLCJTYWxzaWNoYSIsIlNjb29ieS1Eb28iLCJUb20iLCJKZXJyeSIsIkJvYiBFc3BvbmphIiwiUGVybmFsb25nYSIsIlBpY2EtUGF1IiwiTWFmYWxkYSIsIkNoYXJsaWUgQnJvd24iLCJTbm9vcHkiLCJIYXJyeSBQb3R0ZXIiLCJIZXJtaW9uZSIsIkdhbmRhbGYiLCJGcm9kbyIsIkx1a2UgU2t5d2Fsa2VyIiwiRGFydGggVmFkZXIiLCJZb2RhIiwiSW5kaWFuYSBKb25lcyIsIkphbWVzIEJvbmQiLCJKYWNrIFNwYXJyb3ciLCJTaHJlayIsIkdhdG8gZGUgQm90YXMiLCJTaW1iYSIsIk11bGFuIl0sIlByb2Zpc3PDtWVzIjpbIm3DqWRpY28iLCJkZW50aXN0YSIsInByb2Zlc3NvciIsInBvbGljaWFsIiwiYm9tYmVpcm8iLCJwaWxvdG8iLCJtb3RvcmlzdGEiLCJjb3ppbmhlaXJvIiwiZ2Fyw6dvbSIsInBhZGVpcm8iLCJhw6dvdWd1ZWlybyIsImZhemVuZGVpcm8iLCJqYXJkaW5laXJvIiwicGVzY2Fkb3IiLCJjYXJwaW50ZWlybyIsInBlZHJlaXJvIiwicGludG9yIiwiZWxldHJpY2lzdGEiLCJtZWPDom5pY28iLCJmb3TDs2dyYWZvIiwiam9ybmFsaXN0YSIsImVzY3JpdG9yIiwiYXRvciIsImNhbnRvciIsIm3DunNpY28iLCJkYW7Dp2FyaW5vIiwiYXJ0aXN0YSIsImNpZW50aXN0YSIsImFzdHJvbmF1dGEiLCJzb2xkYWRvIiwianVpeiIsImFkdm9nYWRvIiwidmV0ZXJpbsOhcmlvIiwiZW5mZXJtZWlybyIsImZhcm1hY8OqdXRpY28iLCJiYXJiZWlybyIsImNhYmVsZWlyZWlybyIsImNvc3R1cmVpcm8iLCJzYXBhdGVpcm8iLCJjYXJ0ZWlybyIsImVudHJlZ2Fkb3IiLCJtb3RvcmlzdGEgZGUgw7RuaWJ1cyIsIm1hcXVpbmlzdGEiLCJtYXJpbmhlaXJvIiwibWVyZ3VsaGFkb3IiLCJhcnF1ZcOzbG9nbyIsImJpYmxpb3RlY8OhcmlvIiwicHJvZ3JhbWFkb3IiLCJkZXNlbmhpc3RhIiwiYXN0csO0bm9tbyJdLCJHZXJhbCI6WyJjYXNhIiwiZXNjb2xhIiwiaG9zcGl0YWwiLCJjYXN0ZWxvIiwicG9udGUiLCJlc3RyYWRhIiwibW9udGFuaGEiLCJwcmFpYSIsImlsaGEiLCJmbG9yZXN0YSIsImRlc2VydG8iLCJ2dWxjw6NvIiwicmlvIiwibGFnbyIsIm1hciIsInNvbCIsImx1YSIsImVzdHJlbGEiLCJudXZlbSIsImNodXZhIiwibmV2ZSIsImFyY28tw61yaXMiLCJmb2dvIiwidmVudG8iLCLDoXJ2b3JlIiwiZmxvciIsImdyYW1hIiwicGVkcmEiLCJhcmVpYSIsImJhcmNvIiwibmF2aW8iLCJhdmnDo28iLCJ0cmVtIiwiY2Fycm8iLCLDtG5pYnVzIiwiYmljaWNsZXRhIiwic2Vtw6Fmb3JvIiwiZmFyb2wiLCJ0b3JyZSIsImlncmVqYSIsInBhcnF1ZSIsImNpcmNvIiwiZm9ndWV0ZSIsInBsYW5ldGEiLCJyb2LDtCIsInBpcmF0YSIsInRlc291cm8iLCJtYXBhIiwiY29yb2EiLCJlc3BhZGEiXX0=';
function decodeThemeWords() {
  try { return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(ENCODED_THEME_WORDS), c=>c.charCodeAt(0)))); }
  catch (_) { return {Geral:['casa']}; }
}
const THEME_WORDS = decodeThemeWords();
const THEME_NAMES = Object.keys(THEME_WORDS);

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
  themePicker: document.getElementById('themePicker'),
  themeButtons: document.getElementById('themeButtons'),
  themeWait: document.getElementById('themeWait'),
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
  theme: null,
  turnOrder: [],
  turnPosition: -1,
  currentDrawerId: null,
  turnKey: null,
  secretWord: null,
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
let canvasReady = false;
let drawing = false;
let lastPoint = null;
let currentColor = PALETTE[0];
let currentSize = 5;
let currentTool = 'pencil';
let pendingSegments = [];
let flushDrawTimer = null;
let drawSendChain = Promise.resolve();
let wheelRotation = 0;
let handledGuessKey = null;
let restoredFromDisk = false;
let rouletteTimer = null;
let startHandling = false;
let rouletteHandling = false;
let resizeObserver = null;
const seenStrokeIds = new Set();

function escapeHtml(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

function normalizeWord(value) {
  return String(value || '').trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
}

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

function presencePlayers() {
  const presence = channel?.presenceState?.() || {};
  const map = new Map();
  Object.values(presence).flat().forEach(item => {
    if (!item?.id || !item?.name) return;
    map.set(String(item.id), cleanPlayer(item));
  });
  return [...map.values()];
}

function authoritativeRoster() {
  const map = new Map();
  state.players.forEach(p => map.set(p.id, cleanPlayer(p)));
  presencePlayers().forEach(p => {
    const existing = map.get(p.id);
    map.set(p.id, existing ? {...p, score: existing.score} : p);
  });
  return [...map.values()].sort((a,b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id)).slice(0, MAX_PLAYERS);
}

function authoritativeHostId() {
  const roster = authoritativeRoster();
  return roster.length ? roster[0].id : null;
}

function isHost() { return authoritativeHostId() === playerId; }
function isCurrentDrawer() { return state.phase === 'playing' && state.currentDrawerId === playerId; }

function localSave() {
  try {
    const safeState = {...state};
    localStorage.setItem(SAVE_KEY, JSON.stringify({savedAt:Date.now(),state:safeState,currentColor,currentSize,currentTool}));
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
      secretWord: raw.state.secretWord || null,
      players: Array.isArray(raw.state.players) ? raw.state.players.map(cleanPlayer) : [],
      turnOrder: Array.isArray(raw.state.turnOrder) ? raw.state.turnOrder.slice() : [],
      strokes: Array.isArray(raw.state.strokes) ? raw.state.strokes.slice(-5000) : [],
      chatHistory: Array.isArray(raw.state.chatHistory) ? raw.state.chatHistory.slice(-200) : []
    };
    currentColor = raw.currentColor || currentColor;
    currentSize = Number(raw.currentSize) || currentSize;
    currentTool = raw.currentTool || currentTool;
    state.hostId = authoritativeHostId();
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
    theme: state.theme,
    turnOrder: state.turnOrder.slice(),
    turnPosition: state.turnPosition,
    currentDrawerId: state.currentDrawerId,
    turnKey: state.turnKey,
    hostId: authoritativeHostId(),
    started: state.started,
    rouletteSpun: state.rouletteSpun,
    rouletteWinnerId: state.rouletteWinnerId,
    rouletteRevealUntil: state.rouletteRevealUntil,
    chatHistory: state.chatHistory.slice(-200)
  };
}

function snapshotState() { return {...publicState(), strokes:state.strokes.slice(-5000)}; }

async function broadcast(event,payload={}) {
  if (!channel) return;
  try { await channel.send({type:'broadcast',event,payload}); } catch (error) { console.error('Broadcast',event,error); }
}

async function publishState(includeStrokes=false) {
  state.hostId = authoritativeHostId();
  localSave();
  await broadcast(includeStrokes ? 'snapshot' : 'state', {state: includeStrokes ? snapshotState() : publicState()});
}

async function publishTurnSecret(recipientId) {
  if (!isHost() || !state.secretWord || !recipientId) return;
  await broadcast('turn-secret', {matchId:state.matchId,turnKey:state.turnKey,recipientId,wordToken:tokenForWord(state.secretWord)});
}

function setStatus(text) { els.statusBanner.textContent = text; }

function showOnly(view) {
  els.lobbyView.classList.toggle('hidden',view!=='lobby');
  els.rouletteView.classList.toggle('hidden',view!=='roulette');
  els.gameView.classList.toggle('hidden',view!=='game');
  els.finishedView.classList.toggle('hidden',view!=='finished');
}

function renderPlayerCount() { els.playerCounter.textContent = `${state.players.length} de ${MAX_PLAYERS}`; }

function renderLobbyPlayers() {
  const list = sortedPlayers();
  els.lobbyPlayers.innerHTML = list.length ? list.map(p => `<div class="player-chip"><span class="player-dot" style="background:${p.color}"></span><span>${escapeHtml(p.name)}</span>${p.id===authoritativeHostId()?'<span style="margin-left:auto;font-size:8px;color:#f2cf69;text-transform:uppercase;letter-spacing:.1em">host</span>':''}</div>`).join('') : '<div class="player-chip">Aguardando leitores...</div>';
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
  els.chatShell.classList.toggle('is-collapsed', value);
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
  const clean = players.filter(Boolean);
  const count = clean.length;
  if (!count) return;
  const radius = Math.min(168, Math.max(118, 118 + count * 5));
  const segment = 360/count;
  clean.forEach((player,index) => {
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

function clearWinnerHighlight() { els.rouletteLabels.querySelectorAll('.wheel-label').forEach(el=>el.classList.remove('winner')); }
function highlightWinner(id) {
  clearWinnerHighlight();
  const el = els.rouletteLabels.querySelector(`[data-player-id="${CSS.escape(id)}"]`);
  if (el) el.classList.add('winner');
}

function runRouletteSpin(firstIndex) {
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
  if (rouletteTimer) { clearTimeout(rouletteTimer); rouletteTimer=null; }
  if (!isHost() || state.phase!=='roulette' || !state.rouletteSpun) return;
  const remaining = Math.max(0, Number(state.rouletteRevealUntil || 0) - Date.now());
  rouletteTimer = window.setTimeout(async () => {
    rouletteTimer=null;
    if (isHost() && state.phase==='roulette' && state.rouletteSpun) await hostBeginTheme();
  }, remaining);
}

function mergePresenceIntoLobby() {
  const list = sortedPlayers(presencePlayers().slice(0,MAX_PLAYERS));
  const old = new Map(state.players.map(p=>[p.id,p]));
  state.players = list.map(p=>({...p,score:old.get(p.id)?.score || 0}));
  state.hostId = authoritativeHostId();
  renderState();
  localSave();
}

function removeLeftPlayer(id) {
  if (!id) return;
  const wasDrawer = state.currentDrawerId === id;
  state.players = state.players.filter(p=>p.id!==id);
  state.turnOrder = state.turnOrder.filter(x=>x!==id);
  state.hostId = authoritativeHostId();
  renderState();
  if (wasDrawer && isHost() && state.phase==='playing') hostAdvanceTurn();
  else if (isHost()) publishState(true);
}

function renderState() {
  state.hostId = authoritativeHostId();
  renderLobbyPlayers();
  renderScores();
  renderChatHistory();
  renderPlayerCount();

  if (state.phase === 'lobby' || !state.started) {
    showOnly('lobby');
    els.roundStatus.textContent='Lobby';
    els.startButton.disabled=!state.players.length || state.players.length>MAX_PLAYERS;
    els.startHint.textContent=`${state.players.length}/${MAX_PLAYERS} leitores. Qualquer leitor pode pressionar Start.`;
    return;
  }

  if (state.phase === 'roulette') {
    showOnly('roulette');
    els.roundStatus.textContent='Sorteio';
    buildRouletteLabels(sortedPlayers());
    els.sortearButton.disabled=Boolean(state.rouletteSpun);
    if (state.rouletteSpun) showRouletteResult();
    else { clearWinnerHighlight(); els.rouletteResult.textContent='Clique em Sortear para começar.'; els.rouletteOrder.classList.add('hidden'); }
    return;
  }

  if (state.phase === 'theme') {
    showOnly('game');
    els.roundStatus.textContent=`Rodada ${state.round} de ${TOTAL_ROUNDS}`;
    updateThemeUI();
    updateTurnUI();
    resizeCanvas();
    return;
  }

  if (state.phase === 'playing') {
    showOnly('game');
    els.roundStatus.textContent=`Rodada ${state.round} de ${TOTAL_ROUNDS}`;
    updateThemeUI();
    updateTurnUI();
    resizeCanvas();
    requestAnimationFrame(resizeCanvas);
    return;
  }

  if (state.phase === 'finished') {
    showOnly('finished');
    els.roundStatus.textContent='Fim';
    renderFinalScores();
  }
}

function applyState(nextState,{fromSnapshot=false}={}) {
  if (!nextState) return;
  const sameTurn = state.turnKey && state.turnKey === nextState.turnKey;
  const preservedSecret = sameTurn ? state.secretWord : null;
  state = {
    ...state,
    ...nextState,
    secretWord: preservedSecret,
    players:Array.isArray(nextState.players)?nextState.players.map(cleanPlayer):state.players,
    turnOrder:Array.isArray(nextState.turnOrder)?nextState.turnOrder.slice():state.turnOrder,
    strokes:fromSnapshot && Array.isArray(nextState.strokes)?nextState.strokes.slice(-5000):state.strokes,
    chatHistory:Array.isArray(nextState.chatHistory)?nextState.chatHistory.slice(-200):state.chatHistory
  };
  if (state.phase !== 'playing' || state.currentDrawerId !== playerId) {
    if (!isHost()) state.secretWord = null;
  }
  state.hostId = authoritativeHostId();
  if (fromSnapshot) {
    seenStrokeIds.clear();
    state.strokes.forEach(s=>seenStrokeIds.add(s.id));
  }
  localSave();
  renderState();
}

function renderThemeButtons() {
  els.themeButtons.innerHTML = THEME_NAMES.map(theme => `<button class="theme-choice" type="button" data-theme="${escapeHtml(theme)}">${escapeHtml(theme)}</button>`).join('');
}

function updateThemeUI() {
  const mine = state.phase === 'theme' && state.currentDrawerId === playerId;
  els.themePicker.classList.toggle('hidden', !mine);
  els.themeWait.classList.toggle('hidden', !(state.phase === 'theme' && !mine));
  if (mine) renderThemeButtons();
  if (state.phase !== 'theme') els.themePicker.classList.add('hidden');
}

function updateTurnUI() {
  const drawer=state.players.find(p=>p.id===state.currentDrawerId);
  const mine=state.currentDrawerId===playerId;
  els.gameView.classList.toggle('is-observer',!mine || state.phase!=='playing');
  if (state.phase === 'theme') {
    els.turnLabel.textContent=mine?`SUA VEZ · RODADA ${state.round}/${TOTAL_ROUNDS}`:`VEZ DE ${drawer?drawer.name.toUpperCase():'OUTRO LEITOR'} · RODADA ${state.round}/${TOTAL_ROUNDS}`;
    els.turnMessage.textContent=mine?'Escolha um tema para receber uma palavra.':`Aguardando ${drawer?drawer.name:'o desenhista'}.`;
    els.wordStrip.classList.remove('is-drawer');
    els.wordLabel.textContent=mine?'Escolha uma categoria abaixo.':'A palavra será escolhida pelo desenhista.';
    els.drawingTools.classList.add('hidden');
    setStatus(mine?'Escolha um tema para começar.':`${drawer?drawer.name:'O desenhista'} está escolhendo um tema.`);
    return;
  }
  if (mine) {
    els.turnLabel.textContent=`SUA VEZ · RODADA ${state.round}/${TOTAL_ROUNDS}`;
    els.turnMessage.textContent=`${state.theme?`Tema: ${state.theme}`:'Área de pintura.'}`;
    els.wordStrip.classList.add('is-drawer');
    els.wordLabel.textContent=`Sua palavra: ${state.secretWord||'—'}`;
    els.drawingTools.classList.remove('hidden');
    setStatus('Você está pintando. O desenho é visível para a sala.');
  } else {
    els.turnLabel.textContent=drawer?`VEZ DE ${drawer.name.toUpperCase()} · RODADA ${state.round}/${TOTAL_ROUNDS}`:'SINCRONIZANDO';
    els.turnMessage.textContent=drawer?`${drawer.name} está pintando.`:'Reconectando à sala.';
    els.wordStrip.classList.remove('is-drawer');
    els.wordLabel.textContent=state.theme?`Tema: ${state.theme}. A palavra está escondida.`:'A palavra está escondida.';
    els.drawingTools.classList.add('hidden');
    setStatus(drawer?`${drawer.name} está pintando.`:'Recebendo o estado da sala.');
  }
}

function drawStroke(stroke) {
  if (!canvasCtx || !stroke || !canvasReady) return;
  const rect=els.canvas.getBoundingClientRect();
  if (rect.width<=0 || rect.height<=0) return;
  const x1=stroke.x1*rect.width,y1=stroke.y1*rect.height;
  const x2=stroke.x2*rect.width,y2=stroke.y2*rect.height;
  canvasCtx.save();
  canvasCtx.globalCompositeOperation=stroke.tool==='eraser'?'destination-out':'source-over';
  canvasCtx.globalAlpha=stroke.tool==='chalk'?.72:stroke.tool==='marker'?.9:1;
  canvasCtx.strokeStyle=stroke.tool==='eraser'?'#000':stroke.color;
  canvasCtx.lineWidth=stroke.tool==='marker'?stroke.size*1.65:stroke.tool==='chalk'?stroke.size*1.3:stroke.size;
  canvasCtx.lineCap='round';canvasCtx.lineJoin='round';
  canvasCtx.beginPath();canvasCtx.moveTo(x1,y1);canvasCtx.lineTo(x2,y2);canvasCtx.stroke();canvasCtx.restore();
}

function syncCanvasFromState() {
  if (!canvasCtx || !canvasReady) return;
  const rect=els.canvasWrap.getBoundingClientRect();
  if (rect.width<=0 || rect.height<=0) return;
  const ratio=Math.min(window.devicePixelRatio||1,2);
  canvasCtx.save();canvasCtx.setTransform(1,0,0,1,0,0);canvasCtx.clearRect(0,0,els.canvas.width,els.canvas.height);canvasCtx.restore();
  canvasCtx.setTransform(ratio,0,0,ratio,0,0);canvasCtx.fillStyle='#f7f7f4';canvasCtx.fillRect(0,0,rect.width,rect.height);
  state.strokes.forEach(drawStroke);
}

function resizeCanvas() {
  const rect=els.canvasWrap.getBoundingClientRect();
  if (rect.width<=0 || rect.height<=0) { canvasReady=false; return; }
  const ratio=Math.min(window.devicePixelRatio||1,2);
  const width=Math.max(1,Math.floor(rect.width*ratio));
  const height=Math.max(1,Math.floor(rect.height*ratio));
  if (els.canvas.width!==width || els.canvas.height!==height) {
    els.canvas.width=width;els.canvas.height=height;
  }
  canvasReady=true;
  canvasCtx.setTransform(ratio,0,0,ratio,0,0);canvasCtx.lineCap='round';canvasCtx.lineJoin='round';
  syncCanvasFromState();
}

function canvasPoint(event){
  const rect=els.canvas.getBoundingClientRect();
  return {x:(event.clientX-rect.left)/rect.width,y:(event.clientY-rect.top)/rect.height};
}

function addLocalStroke(stroke) {
  state.strokes.push(stroke);
  seenStrokeIds.add(stroke.id);
  if (state.strokes.length>5000) state.strokes.splice(0,state.strokes.length-5000);
  drawStroke(stroke);
  pendingSegments.push(stroke);
}

function beginStroke(event){
  if(!isCurrentDrawer() || !canvasReady) return;
  drawing=true;els.canvas.setPointerCapture?.(event.pointerId);lastPoint=canvasPoint(event);
  const stroke={id:crypto.randomUUID(),x1:lastPoint.x,y1:lastPoint.y,x2:lastPoint.x,y2:lastPoint.y,color:currentColor,size:currentSize,tool:currentTool,senderId:playerId};
  addLocalStroke(stroke);flushDrawQueue();
}

function continueStroke(event){
  if(!drawing || !isCurrentDrawer() || !canvasReady) return;
  const point=canvasPoint(event);
  const stroke={id:crypto.randomUUID(),x1:lastPoint.x,y1:lastPoint.y,x2:point.x,y2:point.y,color:currentColor,size:currentSize,tool:currentTool,senderId:playerId};
  addLocalStroke(stroke);lastPoint=point;queueDrawFlush();
}

function endStroke(){
  if(!drawing) return;
  drawing=false;lastPoint=null;flushDrawQueue();
  localSave();
  if (state.strokes.length) broadcast('draw-snapshot',{matchId:state.matchId,turnKey:state.turnKey,strokes:state.strokes.slice(-1800)});
}

function queueDrawFlush(){
  if(flushDrawTimer)return;
  flushDrawTimer=window.setTimeout(flushDrawQueue,DRAW_FLUSH_MS);
}

function flushDrawQueue(){
  if(flushDrawTimer){clearTimeout(flushDrawTimer);flushDrawTimer=null;}
  if(!pendingSegments.length)return;
  const batch=pendingSegments.splice(0,10);
  drawSendChain=drawSendChain.then(()=>broadcast('draw-batch',{matchId:state.matchId,turnKey:state.turnKey,strokes:batch})).catch(()=>{});
  if(pendingSegments.length)queueDrawFlush();
}

function clearCanvas(){
  if(!canvasCtx || !canvasReady)return;
  const rect=els.canvasWrap.getBoundingClientRect();
  if(rect.width<=0 || rect.height<=0)return;
  const ratio=Math.min(window.devicePixelRatio||1,2);
  canvasCtx.save();canvasCtx.setTransform(1,0,0,1,0,0);canvasCtx.clearRect(0,0,els.canvas.width,els.canvas.height);canvasCtx.restore();
  canvasCtx.setTransform(ratio,0,0,ratio,0,0);canvasCtx.fillStyle='#f7f7f4';canvasCtx.fillRect(0,0,rect.width,rect.height);
}

function setTool(tool){currentTool=tool;document.querySelectorAll('.tool-button').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));localSave();}
function setSize(size){currentSize=Number(size);document.querySelectorAll('.size-button').forEach(b=>b.classList.toggle('active',b.dataset.size===String(size)));localSave();}
function setColor(color){currentColor=color;document.querySelectorAll('.color-swatch').forEach(b=>b.classList.toggle('active',b.dataset.color===color));localSave();}
function buildPalette(){els.palette.innerHTML=PALETTE.map(c=>`<button class="color-swatch${c===currentColor?' active':''}" data-color="${c}" style="background:${c}" title="${c}" aria-label="Cor ${c}"></button>`).join('');}

async function sendChat(text){await broadcast('chat',{senderId:playerId,player:playerName,text:text.slice(0,200),color:clientColor,matchId:state.matchId,turnKey:state.turnKey});}
function addChatMessage(message){if(!message?.text)return;state.chatHistory=[...state.chatHistory,message].slice(-200);appendChatElement(message);els.chatMessages.scrollTop=els.chatMessages.scrollHeight;localSave();}

function showSuccess(name,word){
  els.successName.textContent=name;els.successWord.textContent=word;
  els.successOverlay.classList.remove('hidden');
  const card=els.successOverlay.querySelector('.success-card');
  card.classList.remove('success-animate');
  void card.offsetWidth;
  card.classList.add('success-animate');
}

function hideSuccess(){els.successOverlay.classList.add('hidden');}

function nextWord(){
  const previous=state.secretWord;
  const pool=Object.values(THEME_WORDS).flat();
  const candidates=pool.filter(w=>normalizeWord(w)!==normalizeWord(previous));
  return candidates[Math.floor(Math.random()*candidates.length)] || pool[0] || 'casa';
}

async function hostStartGame(){
  if(startHandling || !isHost() || state.phase!=='lobby' || state.started)return;
  startHandling=true;
  try {
    const roster=sortedPlayers(authoritativeRoster());
    if(!roster.length)return;
    state={...state,matchId:crypto.randomUUID(),started:true,phase:'roulette',round:1,theme:null,turnPosition:-1,turnOrder:[],currentDrawerId:null,turnKey:null,secretWord:null,strokes:[],rouletteSpun:false,rouletteWinnerId:null,rouletteRevealUntil:0,players:roster.map(cleanPlayer)};
    wheelRotation=0;els.rouletteWheel.classList.remove('is-spinning');els.rouletteWheel.style.transform='rotate(0deg)';
    clearCanvas();hideSuccess();localSave();renderState();
    await publishState(true);
  } finally {
    startHandling=false;
  }
}

async function hostSpinRoulette(){
  if(rouletteHandling || !isHost() || state.phase!=='roulette' || state.rouletteSpun)return;
  rouletteHandling=true;
  try {
    const alphabetical=sortedPlayers(state.players);
    if(!alphabetical.length)return;
    const firstIndex=Math.floor(Math.random()*alphabetical.length);
    state.rouletteSpun=true;
    state.rouletteWinnerId=alphabetical[firstIndex].id;
    state.turnOrder=[...alphabetical.slice(firstIndex),...alphabetical.slice(0,firstIndex)].map(p=>p.id);
    state.turnPosition=0;
    state.currentDrawerId=state.turnOrder[0]||null;
    state.turnKey=`${state.matchId}:r${state.round}:t${state.turnPosition}`;
    state.rouletteRevealUntil=Date.now()+ROULETTE_SPIN_MS+ROULETTE_REVEAL_MS;
    localSave();renderState();
    await broadcast('roulette-spin',{matchId:state.matchId,firstIndex,winnerId:state.rouletteWinnerId,turnOrder:state.turnOrder,revealUntil:state.rouletteRevealUntil});
    await publishState(false);
    scheduleRouletteEnd();
  } finally {
    rouletteHandling=false;
  }
}

async function hostBeginTheme() {
  if(!isHost() || !state.started || !state.turnOrder.length) return;
  state.phase='theme';
  state.theme=null;
  state.currentDrawerId=state.turnOrder[state.turnPosition]||null;
  state.secretWord=null;
  state.strokes=[];
  state.turnKey=`${state.matchId}:r${state.round}:t${state.turnPosition}`;
  handledGuessKey=null;
  pendingSegments=[];
  seenStrokeIds.clear();
  clearCanvas();hideSuccess();localSave();renderState();
  await broadcast('theme-phase',{matchId:state.matchId,drawerId:state.currentDrawerId,round:state.round,turnPosition:state.turnPosition,turnKey:state.turnKey});
  await publishState(true);
}

function chooseThemeWord(theme) {
  const list=THEME_WORDS[theme]||THEME_WORDS.Geral;
  const previous=state.secretWord;
  const candidates=list.filter(w=>normalizeWord(w)!==normalizeWord(previous));
  return candidates[Math.floor(Math.random()*candidates.length)]||list[0];
}

async function hostChooseTheme(theme,requesterId) {
  if(!isHost()||state.phase!=='theme'||requesterId!==state.currentDrawerId||!THEME_WORDS[theme]) return;
  state.theme=theme;
  state.secretWord=chooseThemeWord(theme);
  state.phase='playing';
  state.strokes=[];pendingSegments=[];seenStrokeIds.clear();handledGuessKey=null;
  clearCanvas();hideSuccess();localSave();renderState();
  await broadcast('turn-start',{matchId:state.matchId,drawerId:state.currentDrawerId,round:state.round,turnPosition:state.turnPosition,turnKey:state.turnKey,theme});
  await publishTurnSecret(state.currentDrawerId);
  await publishState(true);
}

async function hostStartTurn(){ await hostBeginTheme(); }

async function hostAdvanceTurn(){
  if(!isHost()||!state.started||state.phase!=='playing')return;
  state.turnOrder=state.turnOrder.filter(id=>state.players.some(p=>p.id===id));
  if(!state.turnOrder.length){await finishGame();return;}
  const next=state.turnPosition+1;
  if(next>=state.turnOrder.length){
    if(state.round>=TOTAL_ROUNDS){await finishGame();return;}
    state.round+=1;state.turnPosition=0;
  } else state.turnPosition=next;
  await hostStartTurn();
}

async function finishGame(){
  state.phase='finished';state.currentDrawerId=null;state.turnKey=null;state.secretWord=null;state.started=true;localSave();renderState();await publishState(true);await broadcast('finished',{matchId:state.matchId,players:state.players});
}

async function hostResetGame(){
  if(!isHost())return;
  const roster=sortedPlayers(presencePlayers().slice(0,MAX_PLAYERS));
  state={room:ROOM_NAME,matchId:null,players:roster.map(p=>({...p,score:0})),phase:'lobby',round:0,theme:null,turnOrder:[],turnPosition:-1,currentDrawerId:null,turnKey:null,secretWord:null,strokes:[],chatHistory:[],hostId:null,started:false,rouletteSpun:false,rouletteWinnerId:null,rouletteRevealUntil:0};
  handledGuessKey=null;seenStrokeIds.clear();pendingSegments=[];clearCanvas();hideSuccess();localSave();renderState();await publishState(true);
}

async function handleGuessResult(message){
  if(!isHost()||state.phase!=='playing')return;
  if(message.matchId && state.matchId && message.matchId!==state.matchId)return;
  if(message.turnKey && state.turnKey && message.turnKey!==state.turnKey)return;
  const sender=state.players.find(p=>p.id===message.senderId);
  if(!sender || sender.id===state.currentDrawerId)return;
  const answer=normalizeWord(state.secretWord);
  const guess=normalizeWord(message.text);
  const key=`${state.matchId}:${state.round}:${state.turnPosition}`;
  if(!answer || guess!==answer || handledGuessKey===key)return;
  handledGuessKey=key;
  state.players=state.players.map(p=>p.id===sender.id?{...p,score:p.score+10}:p);
  await broadcast('round-end',{matchId:state.matchId,turnKey:state.turnKey,winnerId:sender.id,winnerName:sender.name,word:answer});
  await hostAdvanceTurn();
}

function requestStateFromHost(){ broadcast('state-request',{requesterId:playerId}); }

async function handleBroadcast(event,payload){
  switch(event){
    case 'state':
      applyState(payload.state);
      if(isCurrentDrawer() && !state.secretWord && isHost()) await publishTurnSecret(playerId);
      break;
    case 'snapshot':
      applyState(payload.state,{fromSnapshot:true});
      if(isCurrentDrawer() && !state.secretWord && isHost()) await publishTurnSecret(playerId);
      break;
    case 'start-request':
      if(isHost()) await hostStartGame();
      break;
    case 'roulette-spin-request':
      if(isHost()) await hostSpinRoulette();
      break;
    case 'theme-request':
      if(isHost() && payload.drawerId===state.currentDrawerId) await hostChooseTheme(payload.theme,payload.drawerId);
      break;
    case 'roulette-spin':
      if(payload.matchId && state.matchId && payload.matchId!==state.matchId)return;
      state.phase='roulette';state.started=true;state.rouletteSpun=true;state.rouletteWinnerId=payload.winnerId;state.turnOrder=payload.turnOrder||[];state.turnPosition=0;state.currentDrawerId=state.turnOrder[0]||null;state.rouletteRevealUntil=Number(payload.revealUntil)||0;state.turnKey=`${state.matchId}:r${state.round}:t0`;
      localSave();renderState();runRouletteSpin(Number(payload.firstIndex)||0);scheduleRouletteEnd();
      break;
    case 'theme-phase':
      if(payload.matchId && state.matchId && payload.matchId!==state.matchId)return;
      state.phase='theme';state.started=true;state.matchId=payload.matchId||state.matchId;state.currentDrawerId=payload.drawerId;state.round=Number(payload.round)||state.round;state.turnPosition=Number(payload.turnPosition);state.turnKey=payload.turnKey||`${state.matchId}:r${state.round}:t${state.turnPosition}`;state.theme=null;state.secretWord=null;state.strokes=[];seenStrokeIds.clear();pendingSegments=[];hideSuccess();localSave();renderState();clearCanvas();
      break;
    case 'turn-start':
      if(payload.matchId && state.matchId && payload.matchId!==state.matchId)return;
      hideSuccess();state.phase='playing';state.started=true;state.matchId=payload.matchId||state.matchId;state.currentDrawerId=payload.drawerId;state.round=Number(payload.round)||state.round;state.turnPosition=Number(payload.turnPosition);state.turnKey=payload.turnKey||`${state.matchId}:r${state.round}:t${state.turnPosition}`;state.theme=payload.theme||null;state.strokes=[];seenStrokeIds.clear();pendingSegments=[];localSave();renderState();clearCanvas();
      break;
    case 'turn':
      if(payload.matchId && state.matchId && payload.matchId!==state.matchId)return;
      hideSuccess();state.phase='playing';state.started=true;state.matchId=payload.matchId||state.matchId;state.currentDrawerId=payload.drawerId;state.round=Number(payload.round)||state.round;state.turnPosition=Number(payload.turnPosition);state.turnKey=payload.turnKey||`${state.matchId}:r${state.round}:t${state.turnPosition}`;state.rouletteSpun=true;state.strokes=[];seenStrokeIds.clear();pendingSegments=[];state.secretWord=(playerId===payload.drawerId||isHost())?wordFromToken(payload.wordToken):null;localSave();renderState();clearCanvas();
      break;
    case 'turn-secret':
      if(payload.matchId!==state.matchId || payload.recipientId!==playerId || payload.turnKey!==state.turnKey)return;
      state.secretWord=wordFromToken(payload.wordToken);localSave();updateTurnUI();
      break;
    case 'secret-request':
      if(isHost() && payload.requesterId===state.currentDrawerId && state.secretWord) await publishTurnSecret(payload.requesterId);
      break;
    case 'chat': {
      const message={player:payload.player,text:payload.text,color:payload.color,senderId:payload.senderId,matchId:payload.matchId,turnKey:payload.turnKey};
      addChatMessage(message);
      if(isHost()) await handleGuessResult(message);
      break;
    }
    case 'draw-batch':
      if(payload.matchId!==state.matchId || payload.turnKey!==state.turnKey)return;
      (payload.strokes||[]).forEach(stroke=>{if(!stroke?.id||seenStrokeIds.has(stroke.id))return;seenStrokeIds.add(stroke.id);state.strokes.push(stroke);drawStroke(stroke);});
      if(state.strokes.length>5000)state.strokes.splice(0,state.strokes.length-5000);
      localSave();
      break;
    case 'draw-snapshot':
      if(payload.matchId!==state.matchId || payload.turnKey!==state.turnKey || !Array.isArray(payload.strokes))return;
      state.strokes=payload.strokes.slice(-5000);seenStrokeIds.clear();state.strokes.forEach(s=>seenStrokeIds.add(s.id));resizeCanvas();syncCanvasFromState();localSave();
      break;
    case 'clear':
      if(payload.matchId && payload.matchId!==state.matchId)return;
      state.strokes=[];seenStrokeIds.clear();clearCanvas();localSave();
      break;
    case 'round-end':
      if(payload.matchId!==state.matchId || payload.turnKey!==state.turnKey)return;
      showSuccess(payload.winnerName,payload.word);
      addChatMessage({player:payload.winnerName,text:`acertou "${payload.word}"`,color:state.players.find(p=>p.id===payload.winnerId)?.color||'#7fe8aa',correct:true});
      break;
    case 'finished':
      hideSuccess();state.phase='finished';state.started=true;if(Array.isArray(payload.players))state.players=payload.players.map(cleanPlayer);state.currentDrawerId=null;state.turnKey=null;state.secretWord=null;localSave();renderState();
      break;
    case 'reset-request':
      if(isHost()) await hostResetGame();
      break;
    case 'state-request':
      if(isHost()) { await publishState(true); if(state.phase==='playing' && state.secretWord && payload.requesterId===state.currentDrawerId) await publishTurnSecret(payload.requesterId); }
      break;
  }
}

async function connectSupabase(){
  setStatus('Conectando à sala...');
  channel=supabaseClient.channel(CHANNEL_NAME,{config:{presence:{key:playerId},broadcast:{self:true,ack:true}}});
  channel
    .on('presence',{event:'sync'},async()=>{
      if(state.phase==='lobby' || !state.started){mergePresenceIntoLobby();if(isHost())await publishState(true);}
      renderPlayerCount();renderScores();
    })
    .on('presence',{event:'join'},async()=>{if(state.phase==='lobby'||!state.started){mergePresenceIntoLobby();if(isHost())await publishState(true);}})
    .on('presence',{event:'leave'},async({key,leftPresences})=>{const ids=(leftPresences||[]).map(x=>x?.id).filter(Boolean).map(String);if(ids.length)ids.forEach(removeLeftPlayer);else if(key)removeLeftPlayer(String(key));})
    .on('broadcast',{event:'state'},({payload})=>handleBroadcast('state',payload))
    .on('broadcast',{event:'snapshot'},({payload})=>handleBroadcast('snapshot',payload))
    .on('broadcast',{event:'start-request'},({payload})=>handleBroadcast('start-request',payload))
    .on('broadcast',{event:'roulette-spin-request'},({payload})=>handleBroadcast('roulette-spin-request',payload))
    .on('broadcast',{event:'roulette-spin'},({payload})=>handleBroadcast('roulette-spin',payload))
    .on('broadcast',{event:'theme-phase'},({payload})=>handleBroadcast('theme-phase',payload))
    .on('broadcast',{event:'theme-request'},({payload})=>handleBroadcast('theme-request',payload))
    .on('broadcast',{event:'turn-start'},({payload})=>handleBroadcast('turn-start',payload))
    .on('broadcast',{event:'turn'},({payload})=>handleBroadcast('turn',payload))
    .on('broadcast',{event:'turn-secret'},({payload})=>handleBroadcast('turn-secret',payload))
    .on('broadcast',{event:'secret-request'},({payload})=>handleBroadcast('secret-request',payload))
    .on('broadcast',{event:'chat'},({payload})=>handleBroadcast('chat',payload))
    .on('broadcast',{event:'draw-batch'},({payload})=>handleBroadcast('draw-batch',payload))
    .on('broadcast',{event:'draw-snapshot'},({payload})=>handleBroadcast('draw-snapshot',payload))
    .on('broadcast',{event:'clear'},({payload})=>handleBroadcast('clear',payload))
    .on('broadcast',{event:'round-end'},({payload})=>handleBroadcast('round-end',payload))
    .on('broadcast',{event:'finished'},({payload})=>handleBroadcast('finished',payload))
    .on('broadcast',{event:'reset-request'},({payload})=>handleBroadcast('reset-request',payload))
    .on('broadcast',{event:'state-request'},({payload})=>handleBroadcast('state-request',payload))
    .subscribe(async(status,error)=>{
      if(status==='SUBSCRIBED'){
        await channel.track({id:playerId,name:playerName,color:clientColor,joinedAt});
        setStatus('Sala conectada.');
        requestStateFromHost();
        if(state.phase==='playing' && state.currentDrawerId===playerId && !state.secretWord) await broadcast('secret-request',{requesterId:playerId});
      } else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){
        console.error('Supabase Realtime:',status,error);setStatus('Sem conexão com a sala.');
      }
    });
}

els.chatToggle.addEventListener('click',()=>setChatCollapsed(!els.chatShell.classList.contains('is-collapsed')));
els.startButton.addEventListener('click',()=>broadcast('start-request',{senderId:playerId}));
els.sortearButton.addEventListener('click',()=>{ if(els.sortearButton.disabled)return; els.sortearButton.disabled=true; broadcast('roulette-spin-request',{senderId:playerId}); });
els.themeButtons.addEventListener('click',e=>{ const button=e.target.closest('[data-theme]'); if(!button || state.phase!=='theme' || state.currentDrawerId!==playerId)return; els.themeButtons.querySelectorAll('.theme-choice').forEach(b=>b.disabled=true); const theme=button.dataset.theme; if(isHost()) hostChooseTheme(theme,playerId); else broadcast('theme-request',{drawerId:playerId,theme}); });
els.brushGroup.addEventListener('click',e=>{const b=e.target.closest('[data-tool]');if(b)setTool(b.dataset.tool)});
els.sizeGroup.addEventListener('click',e=>{const b=e.target.closest('[data-size]');if(b)setSize(b.dataset.size)});
els.palette.addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(b)setColor(b.dataset.color)});
els.clearCanvasButton.addEventListener('click',async()=>{if(!isCurrentDrawer())return;state.strokes=[];seenStrokeIds.clear();clearCanvas();await broadcast('clear',{senderId:playerId,matchId:state.matchId,turnKey:state.turnKey});localSave();setStatus('Quadro limpo.');});
els.chatForm.addEventListener('submit',async e=>{e.preventDefault();const text=els.chatInput.value.trim();if(!text)return;els.chatInput.value='';await sendChat(text);els.chatInput.focus();});
els.playAgainButton.addEventListener('click',()=>broadcast('reset-request',{senderId:playerId}));

window.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();const open=!els.bookOverlay.classList.contains('hidden');els.bookOverlay.classList.toggle('hidden',open);els.bookOverlay.setAttribute('aria-hidden',String(open));if(!open)els.bookFrame.focus({preventScroll:true});}});
window.addEventListener('message',e=>{if(e.data?.type==='closeBookOverlay'){els.bookOverlay.classList.add('hidden');els.bookOverlay.setAttribute('aria-hidden','true');}});
window.addEventListener('resize',resizeCanvas);
window.addEventListener('pointerup',endStroke);
window.addEventListener('beforeunload',()=>{try{channel?.untrack()}catch(_){}localSave();});

function setupCanvas(){
  canvasCtx=els.canvas.getContext('2d',{willReadFrequently:true});
  resizeObserver=new ResizeObserver(()=>resizeCanvas());
  resizeObserver.observe(els.canvasWrap);
  els.canvas.addEventListener('pointerdown',beginStroke);
  els.canvas.addEventListener('pointermove',continueStroke);
}

buildPalette();
restoreChatCollapsed();
restoreLocalSave();
setupCanvas();
renderState();
connectSupabase();
