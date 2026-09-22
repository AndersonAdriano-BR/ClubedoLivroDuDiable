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
const ROUND_END_REVEAL_MS = 7000;
const DRAW_FLUSH_MS = 24;
const SAVE_KEY = 'duDiableDomQuixoteMatchV6';
const CHAT_COLLAPSED_KEY = 'duDiableChatCollapsedV3';
const PLAYER_ID_KEY = 'duDiablePlayerIdSession';
const PLAYER_JOIN_KEY = 'duDiablePlayerJoinedAtSession';
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

// O ID da sessão é o próprio nome do leitor e vive somente enquanto a aba estiver aberta.
// Isso torna a ordem de entrada legível e temporária, como solicitado.
const playerId = sessionStorage.getItem(PLAYER_ID_KEY) || playerName;
sessionStorage.setItem(PLAYER_ID_KEY, playerId);
const joinedAt = Number(sessionStorage.getItem(PLAYER_JOIN_KEY)) || Date.now();
sessionStorage.setItem(PLAYER_JOIN_KEY, String(joinedAt));
const JOIN_TOKEN_KEY = 'duDiableJoinTokenSession';
const joinToken = sessionStorage.getItem(JOIN_TOKEN_KEY) || crypto.randomUUID();
sessionStorage.setItem(JOIN_TOKEN_KEY, joinToken);

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
  joinOrder: [],
  turnOrder: [],
  turnPosition: -1,
  currentDrawerId: null,
  turnKey: null,
  secretWord: null,
  strokes: [],
  chatHistory: [],
  hostId: null,
  started: false,
  roundEndUntil: 0,
  lastWinnerId: null,
  lastWinnerName: null,
  lastWinnerWord: null
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
let handledGuessKey = null;
let restoredFromDisk = false;
let roundEndTimer = null;
let startHandling = false;
let themeHandling = false;
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

function orderedPlayers(players = state.players, order = state.joinOrder) {
  const map = new Map(players.map(p => [p.id, p]));
  const ordered = [];
  (Array.isArray(order) ? order : []).forEach(id => { if (map.has(id)) ordered.push(map.get(id)); map.delete(id); });
  // Fallback only when a legacy/local snapshot does not have an order yet.
  if (!Array.isArray(order) || order.length === 0) {
    return [...map.values()].sort((a,b) => Number(a.joinedAt)-Number(b.joinedAt) || a.id.localeCompare(b.id));
  }
  return ordered.concat([...map.values()].sort((a,b) => Number(a.joinedAt)-Number(b.joinedAt) || a.id.localeCompare(b.id)));
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
  const currentOrder = Array.isArray(state.joinOrder) ? state.joinOrder : [];
  const ordered = [];
  currentOrder.forEach(id => { if (map.has(id)) { ordered.push(map.get(id)); map.delete(id); } });
  [...map.values()].sort((a,b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id)).forEach(p => ordered.push(p));
  return ordered.slice(0, MAX_PLAYERS);
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
      joinOrder: Array.isArray(raw.state.joinOrder) ? raw.state.joinOrder.slice() : [],
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
    joinOrder: state.joinOrder.slice(),
    turnOrder: state.turnOrder.slice(),
    turnPosition: state.turnPosition,
    currentDrawerId: state.currentDrawerId,
    turnKey: state.turnKey,
    hostId: authoritativeHostId(),
    started: state.started,
    roundEndUntil: state.roundEndUntil,
    lastWinnerId: state.lastWinnerId,
    lastWinnerName: state.lastWinnerName,
    lastWinnerWord: state.lastWinnerWord,
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
  els.gameView.classList.toggle('hidden',view!=='game');
  els.finishedView.classList.toggle('hidden',view!=='finished');
}

function renderPlayerCount() { els.playerCounter.textContent = `${state.players.length} de ${MAX_PLAYERS}`; }

function renderLobbyPlayers() {
  const list = orderedPlayers();
  els.lobbyPlayers.innerHTML = list.length ? list.map((p,index) => `<div class="player-chip"><span class="join-number">${String(index+1).padStart(2,'0')}</span><span class="player-dot" style="background:${p.color}"></span><span>${escapeHtml(p.name)}</span>${p.id===authoritativeHostId()?'<span style="margin-left:auto;font-size:8px;color:#f2cf69;text-transform:uppercase;letter-spacing:.1em">primeiro</span>':''}</div>`).join('') : '<div class="player-chip">Aguardando leitores...</div>';
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

function mergePresenceIntoLobby() {
  const present = presencePlayers();
  const presentIds = new Set(present.map(p=>p.id));
  const byId = new Map(state.players.map(p=>[p.id,p]));
  const nextOrder = state.joinOrder.filter(id => presentIds.has(id));

  present.forEach(p => {
    if (!nextOrder.includes(p.id)) nextOrder.push(p.id);
    const old = byId.get(p.id);
    byId.set(p.id, old ? {...p, score:old.score} : p);
  });

  state.joinOrder = nextOrder.slice(0,MAX_PLAYERS);
  state.players = state.joinOrder.map(id => byId.get(id)).filter(Boolean);
  state.hostId = authoritativeHostId();
  renderState();
  localSave();
}

function removeLeftPlayer(id) {
  if (!id) return;
  const wasDrawer = state.currentDrawerId === id;
  state.players = state.players.filter(p=>p.id!==id);
  state.joinOrder = state.joinOrder.filter(x=>x!==id);
  state.turnOrder = state.turnOrder.filter(x=>x!==id);
  state.hostId = authoritativeHostId();
  renderState();
  if (isHost() && wasDrawer && state.started) {
    if (state.phase==='theme' || state.phase==='playing') hostAdvanceTurn();
    else if (state.phase==='roundEnd') scheduleRoundEnd();
  } else if (isHost()) publishState(true);
}

function showRoundEndState() {
  const name = state.lastWinnerName || state.players.find(p=>p.id===state.lastWinnerId)?.name || 'Leitor';
  const word = state.lastWinnerWord || '';
  showSuccess(name, word);
}

function scheduleRoundEnd() {
  if (roundEndTimer) { clearTimeout(roundEndTimer); roundEndTimer=null; }
  if (!isHost() || state.phase!=='roundEnd') return;
  const remaining = Math.max(0, Number(state.roundEndUntil || 0) - Date.now());
  roundEndTimer = window.setTimeout(async()=>{
    roundEndTimer=null;
    if (isHost() && state.phase==='roundEnd') await hostAdvanceTurn();
  }, remaining);
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
    const canStart = isHost() && state.players.length>0 && state.players.length<=MAX_PLAYERS;
    els.startButton.disabled=!canStart;
    const host = state.players.find(p=>p.id===authoritativeHostId());
    els.startHint.textContent = state.players.length ? `Primeiro leitor: ${host ? host.name : '—'}. ${canStart ? 'Você pode iniciar.' : 'Aguardando o primeiro leitor.'}` : 'Aguardando leitores...';
    return;
  }

  if (state.phase === 'theme' || state.phase === 'playing' || state.phase === 'roundEnd') {
    showOnly('game');
    els.roundStatus.textContent=`Rodada ${state.round} de ${TOTAL_ROUNDS}`;
    updateThemeUI();
    updateTurnUI();
    if (state.phase==='roundEnd') showRoundEndState(); else hideSuccess();
    resizeCanvas();
    requestAnimationFrame(resizeCanvas);
    if (state.phase==='roundEnd') scheduleRoundEnd();
    return;
  }

  if (state.phase === 'finished') {
    showOnly('finished');
    els.roundStatus.textContent='Fim';
    renderFinalScores();
    hideSuccess();
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
    joinOrder:Array.isArray(nextState.joinOrder)?nextState.joinOrder.slice():state.joinOrder,
    turnOrder:Array.isArray(nextState.turnOrder)?nextState.turnOrder.slice():state.turnOrder,
    strokes:fromSnapshot && Array.isArray(nextState.strokes)?nextState.strokes.slice(-5000):state.strokes,
    chatHistory:Array.isArray(nextState.chatHistory)?nextState.chatHistory.slice(-200):state.chatHistory
  };
  if (state.phase !== 'playing' || state.currentDrawerId !== playerId) {
    // O host precisa manter a palavra em memória para validar os palpites,
    // mas os demais leitores nunca devem receber essa palavra.
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
  if (mine) { renderThemeButtons(); els.themeButtons.querySelectorAll('.theme-choice').forEach(b=>b.disabled=themeHandling); }
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
    const roster=orderedPlayers(authoritativeRoster(), state.joinOrder);
    if(!roster.length)return;
    themeHandling=false;
    state={...state,matchId:crypto.randomUUID(),started:true,phase:'theme',round:1,theme:null,joinOrder:roster.map(p=>p.id),turnOrder:roster.map(p=>p.id),turnPosition:0,currentDrawerId:roster[0].id,turnKey:`match:r1:t0`,secretWord:null,strokes:[],roundEndUntil:0,lastWinnerId:null,lastWinnerName:null,lastWinnerWord:null,players:roster.map(cleanPlayer)};
    state.turnKey=`${state.matchId}:r1:t0`;
    handledGuessKey=null;
    pendingSegments=[];
    seenStrokeIds.clear();
    clearCanvas();hideSuccess();localSave();renderState();
    await broadcast('theme-phase',{matchId:state.matchId,drawerId:state.currentDrawerId,round:state.round,turnPosition:state.turnPosition,turnKey:state.turnKey});
    await publishState(true);
  } finally {
    startHandling=false;
  }
}

async function hostBeginTheme() {
  if(!isHost() || !state.started || !state.turnOrder.length) return;
  themeHandling=false;
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

async function hostChooseTheme(theme,requesterId,requestTurnKey=state.turnKey) {
  if(!isHost()||state.phase!=='theme'||requesterId!==state.currentDrawerId||requestTurnKey!==state.turnKey||!THEME_WORDS[theme]) return false;
  themeHandling=false;
  state.theme=theme;
  state.secretWord=chooseThemeWord(theme);
  state.phase='playing';
  state.roundEndUntil=0;state.lastWinnerId=null;state.lastWinnerName=null;state.lastWinnerWord=null;
  state.strokes=[];pendingSegments=[];seenStrokeIds.clear();handledGuessKey=null;
  clearCanvas();hideSuccess();localSave();renderState();
  await broadcast('turn-start',{matchId:state.matchId,drawerId:state.currentDrawerId,round:state.round,turnPosition:state.turnPosition,turnKey:state.turnKey,theme});
  await publishTurnSecret(state.currentDrawerId);
  await publishState(true);
  return true;
}

async function hostAdvanceTurn(){
  if(!isHost()||!state.started||!['theme','playing','roundEnd'].includes(state.phase))return;
  const currentId=state.currentDrawerId;
  state.turnOrder=state.turnOrder.filter(id=>state.players.some(p=>p.id===id));
  if(!state.turnOrder.length){await finishGame();return;}
  const currentIndex=state.turnOrder.indexOf(currentId);
  let next=currentIndex>=0 ? currentIndex+1 : 0;
  if(next>=state.turnOrder.length){
    if(state.round>=TOTAL_ROUNDS){await finishGame();return;}
    state.round+=1;
    next=0;
  }
  state.turnPosition=next;
  await hostBeginTheme();
}

async function finishGame(){
  state.phase='finished';state.currentDrawerId=null;state.turnKey=null;state.secretWord=null;state.roundEndUntil=0;state.started=true;localSave();renderState();await publishState(true);await broadcast('finished',{matchId:state.matchId,players:state.players});
}

async function hostResetGame(){
  if(!isHost())return;
  const roster=orderedPlayers(presencePlayers().slice(0,MAX_PLAYERS), state.joinOrder);
  state={room:ROOM_NAME,matchId:null,players:roster.map(p=>({...p,score:0})),phase:'lobby',round:0,theme:null,joinOrder:roster.map(p=>p.id),turnOrder:[],turnPosition:-1,currentDrawerId:null,turnKey:null,secretWord:null,strokes:[],chatHistory:[],hostId:null,started:false,roundEndUntil:0,lastWinnerId:null,lastWinnerName:null,lastWinnerWord:null};
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
  state.phase='roundEnd';
  state.roundEndUntil=Date.now()+ROUND_END_REVEAL_MS;
  state.lastWinnerId=sender.id;
  state.lastWinnerName=sender.name;
  state.lastWinnerWord=answer;
  state.secretWord=null;
  localSave();
  renderState();
  await broadcast('round-end',{matchId:state.matchId,turnKey:state.turnKey,winnerId:sender.id,winnerName:sender.name,word:answer,roundEndUntil:state.roundEndUntil});
  await publishState(true);
  scheduleRoundEnd();
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
    case 'theme-request':
      if(isHost() && payload.drawerId===state.currentDrawerId && payload.turnKey===state.turnKey) {
        await hostChooseTheme(payload.theme,payload.drawerId,payload.turnKey);
      }
      break;
    case 'theme-phase':
      if(payload.matchId && state.matchId && payload.matchId!==state.matchId)return;
      themeHandling=false;state.phase='theme';state.started=true;state.matchId=payload.matchId||state.matchId;state.currentDrawerId=payload.drawerId;state.round=Number(payload.round)||state.round;state.turnPosition=Number(payload.turnPosition);state.turnKey=payload.turnKey||`${state.matchId}:r${state.round}:t${state.turnPosition}`;state.theme=null;state.secretWord=null;state.strokes=[];state.roundEndUntil=0;state.lastWinnerId=null;state.lastWinnerName=null;state.lastWinnerWord=null;seenStrokeIds.clear();pendingSegments=[];hideSuccess();localSave();renderState();clearCanvas();
      break;
    case 'turn-start':
      if(payload.matchId && state.matchId && payload.matchId!==state.matchId)return;
      themeHandling=false;hideSuccess();state.phase='playing';state.started=true;state.matchId=payload.matchId||state.matchId;state.currentDrawerId=payload.drawerId;state.round=Number(payload.round)||state.round;state.turnPosition=Number(payload.turnPosition);state.turnKey=payload.turnKey||`${state.matchId}:r${state.round}:t${state.turnPosition}`;state.theme=payload.theme||null;state.strokes=[];state.roundEndUntil=0;state.lastWinnerId=null;state.lastWinnerName=null;state.lastWinnerWord=null;seenStrokeIds.clear();pendingSegments=[];localSave();renderState();clearCanvas();
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
      state.phase='roundEnd';
      state.roundEndUntil=Number(payload.roundEndUntil)||Date.now()+ROUND_END_REVEAL_MS;
      state.lastWinnerId=payload.winnerId||null;
      state.lastWinnerName=payload.winnerName||'Leitor';
      state.lastWinnerWord=payload.word||'';
      state.secretWord=null;
      showSuccess(state.lastWinnerName,state.lastWinnerWord);
      addChatMessage({player:state.lastWinnerName,text:`acertou "${state.lastWinnerWord}"`,color:state.players.find(p=>p.id===state.lastWinnerId)?.color||'#7fe8aa',correct:true});
      localSave();
      renderState();
      break;
    case 'finished':
      hideSuccess();state.phase='finished';state.started=true;if(Array.isArray(payload.players))state.players=payload.players.map(cleanPlayer);state.currentDrawerId=null;state.turnKey=null;state.secretWord=null;state.roundEndUntil=0;localSave();renderState();
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
    .on('presence',{event:'join'},async({key,newPresences})=>{if(state.phase==='lobby'||!state.started){mergePresenceIntoLobby();if(isHost())await publishState(true);}})
    .on('presence',{event:'leave'},async({key,leftPresences})=>{const ids=(leftPresences||[]).map(x=>x?.id).filter(Boolean).map(String);if(ids.length)ids.forEach(removeLeftPlayer);else if(key)removeLeftPlayer(String(key));})
    .on('broadcast',{event:'state'},({payload})=>handleBroadcast('state',payload))
    .on('broadcast',{event:'snapshot'},({payload})=>handleBroadcast('snapshot',payload))
    .on('broadcast',{event:'start-request'},({payload})=>handleBroadcast('start-request',payload))
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
        await channel.track({id:playerId,name:playerName,color:clientColor,joinedAt,joinToken});
        const sameIdPresences = (channel.presenceState()?.[playerId] || []).filter(p => p?.joinToken && p.joinToken !== joinToken);
        if (sameIdPresences.some(p => Number(p.joinedAt) <= joinedAt)) {
          setStatus('Este nome já está em uso nesta sala.');
          els.startButton.disabled = true;
          await channel.untrack();
          window.location.href = 'index.html';
          return;
        }
        setStatus('Sala conectada.');
        requestStateFromHost();
        if(state.phase==='playing' && state.currentDrawerId===playerId && !state.secretWord) await broadcast('secret-request',{requesterId:playerId});
      } else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){
        console.error('Supabase Realtime:',status,error);setStatus('Sem conexão com a sala.');
      }
    });
}

els.chatToggle.addEventListener('click',()=>setChatCollapsed(!els.chatShell.classList.contains('is-collapsed')));
els.startButton.addEventListener('click',()=>{ if(isHost()) broadcast('start-request',{senderId:playerId}); });
els.themeButtons.addEventListener('click',async e=>{ const button=e.target.closest('[data-theme]'); if(!button || state.phase!=='theme' || state.currentDrawerId!==playerId || themeHandling)return; const theme=button.dataset.theme; if(!THEME_WORDS[theme])return; themeHandling=true; updateThemeUI(); if(isHost()) { const ok=await hostChooseTheme(theme,playerId,state.turnKey); if(!ok){themeHandling=false;updateThemeUI();} } else { await broadcast('theme-request',{drawerId:playerId,theme,turnKey:state.turnKey}); setStatus('Tema enviado. Aguardando a palavra...'); } });
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
