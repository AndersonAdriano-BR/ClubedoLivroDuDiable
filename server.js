const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const MAX_PLAYERS = 10;
const TURN_SECONDS = 90;
const ROUNDS = 5;

const WORDS = [
  'castelo','cavalo','espada','moinho','dragao','ponte','floresta','coroa','livro','capa',
  'janela','chave','torre','mascara','carruagem','rosa','lua','sol','estante','relogio',
  'navio','tesouro','fantasma','monstro','rei','rainha','pirata','mapa','farol','labirinto',
  'boneca','espelho','porta','escada','vela','sapato','chapéu','guitarra','guarda-chuva','gato',
  'cachorro','peixe','arvore','montanha','nuvem','chuva','oculos','telefone','sorvete','bolo'
];

const PLAYER_COLORS = ['#9b6572','#547c72','#897157','#6e6d9b','#9a7a9f','#64869b','#9a684b','#6d8c5b','#8b617f','#72818f'];
const rooms = new Map();

function makeRoom(roomId) {
  return {
    id: roomId,
    players: [],
    started: false,
    phase: 'lobby',
    round: 0,
    turnIndex: -1,
    orderedPlayers: [],
    firstIndex: -1,
    currentDrawerId: null,
    word: null,
    deadline: null,
    strokes: [],
    usedWords: new Set(),
    turnTimer: null,
    transitionTimer: null
  };
}

function roomState(room) {
  return {
    room: room.id,
    players: room.players.map(p => ({ id:p.id, name:p.name, color:p.color, score:p.score })),
    started: room.started,
    phase: room.phase,
    round: room.round,
    turnIndex: room.turnIndex,
    currentDrawerId: room.currentDrawerId,
    word: null,
    deadline: room.deadline,
    strokes: room.strokes
  };
}

function broadcast(room, payload) {
  const raw = JSON.stringify(payload);
  room.players.forEach(p => {
    if (p.ws.readyState === p.ws.OPEN) p.ws.send(raw);
  });
}

function broadcastState(room) {
  const raw = JSON.stringify({ type:'state', state:roomState(room) });
  room.players.forEach(p => {
    if (p.ws.readyState === p.ws.OPEN) p.ws.send(raw);
  });
}

function cleanName(name) {
  return String(name || 'Leitor').trim().slice(0,40) || 'Leitor';
}

function sortPlayers(room) {
  return [...room.players].sort((a,b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity:'base' }) || a.joinedAt-b.joinedAt);
}

function chooseWord(room) {
  const available = WORDS.filter(word => !room.usedWords.has(normalize(word)));
  const pool = available.length ? available : WORDS;
  const word = pool[Math.floor(Math.random() * pool.length)];
  room.usedWords.add(normalize(word));
  return word;
}

function normalize(text) {
  return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9 ]/g,'').trim().toLocaleLowerCase('pt-BR');
}

function clearTurnTimer(room) {
  if (room.turnTimer) clearTimeout(room.turnTimer);
  room.turnTimer = null;
  if (room.transitionTimer) clearTimeout(room.transitionTimer);
  room.transitionTimer = null;
}

function startGame(room) {
  if (room.started || room.players.length === 0) return;
  room.started = true;
  room.phase = 'roulette';
  room.round = 1;
  room.orderedPlayers = sortPlayers(room);
  room.firstIndex = Math.floor(Math.random() * room.orderedPlayers.length);
  room.turnIndex = room.firstIndex;
  room.strokes = [];
  room.usedWords.clear();
  broadcastState(room);
  broadcast(room, {
    type:'roulette',
    players:room.orderedPlayers.map(p => ({ id:p.id, name:p.name, color:p.color })),
    firstIndex:room.firstIndex,
    firstPlayerId:room.orderedPlayers[room.firstIndex].id
  });
  room.transitionTimer = setTimeout(() => beginTurn(room), 4300);
}

function beginTurn(room) {
  if (!room.started) return;
  room.phase = 'playing';
  room.currentDrawerId = room.orderedPlayers[room.turnIndex].id;
  room.word = chooseWord(room);
  room.strokes = [];
  room.deadline = Date.now() + TURN_SECONDS * 1000;
  broadcastState(room);
  broadcast(room, {
    type:'turn',
    drawerId:room.currentDrawerId,
    word:room.word,
    deadline:room.deadline,
    round:room.round,
    turnIndex:room.turnIndex,
    players:room.players.map(p => ({ id:p.id, name:p.name, color:p.color, score:p.score }))
  });
  room.turnTimer = setTimeout(() => finishTurn(room, null), TURN_SECONDS * 1000 + 200);
}

function finishTurn(room, winner) {
  if (!room.started || room.phase !== 'playing') return;
  clearTurnTimer(room);
  const drawer = room.players.find(p => p.id === room.currentDrawerId);
  const word = room.word;
  room.phase = 'roulette';
  room.deadline = null;
  room.strokes = [];
  broadcast(room, { type:'roundEnd', playerName:winner ? winner.name : 'Ninguém', word });

  room.transitionTimer = setTimeout(() => {
    room.turnIndex += 1;
    if (room.turnIndex >= room.orderedPlayers.length) {
      room.turnIndex = 0;
      room.round += 1;
    }
    if (room.round > ROUNDS) {
      finishGame(room);
      return;
    }
    beginTurn(room);
  }, winner ? 2700 : 900);

  if (drawer) room.currentDrawerId = drawer.id;
  broadcastState(room);
}

function finishGame(room) {
  clearTurnTimer(room);
  room.phase = 'finished';
  room.started = true;
  room.currentDrawerId = null;
  room.word = null;
  room.deadline = null;
  broadcast(room, { type:'finished', players:room.players.map(p => ({ id:p.id, name:p.name, color:p.color, score:p.score })) });
  broadcastState(room);
}

function resetRoom(room) {
  clearTurnTimer(room);
  room.started = false;
  room.phase = 'lobby';
  room.round = 0;
  room.turnIndex = -1;
  room.orderedPlayers = [];
  room.firstIndex = -1;
  room.currentDrawerId = null;
  room.word = null;
  room.deadline = null;
  room.strokes = [];
  room.usedWords.clear();
  room.players.forEach(p => p.score = 0);
  broadcastState(room);
}

function leavePlayer(room, player) {
  const index = room.players.indexOf(player);
  if (index < 0) return;
  const wasDrawer = player.id === room.currentDrawerId;
  room.players.splice(index,1);
  if (room.players.length === 0) {
    clearTurnTimer(room);
    rooms.delete(room.id);
    return;
  }
  if (room.started && wasDrawer && room.phase === 'playing') finishTurn(room, null);
  if (!room.started) broadcastState(room);
}

function assignColor(room) { return PLAYER_COLORS[room.players.length % PLAYER_COLORS.length]; }

function handleMessage(player, message) {
  const room = rooms.get(player.room);
  if (!room) return;
  switch (message.type) {
    case 'start':
      startGame(room);
      break;
    case 'chat': {
      const text = String(message.text || '').slice(0,200);
      if (!text.trim()) return;
      const isPlaying = room.phase === 'playing';
      const correct = isPlaying && player.id !== room.currentDrawerId && normalize(text) === normalize(room.word);
      if (correct) {
        if (player.lastCorrectTurn !== room.turnIndex) {
          player.lastCorrectTurn = room.turnIndex;
          player.score += 10;
          broadcast(room, { type:'chat', player:player.name, text, color:player.color });
          finishTurn(room, player);
        }
      } else {
        broadcast(room, { type:'chat', player:player.name, text, color:player.color });
      }
      break;
    }
    case 'draw':
      if (room.phase !== 'playing' || player.id !== room.currentDrawerId) return;
      if (!message.stroke) return;
      room.strokes.push(message.stroke);
      broadcast(room, { type:'draw', stroke:message.stroke });
      break;
    case 'clear':
      if (room.phase !== 'playing' || player.id !== room.currentDrawerId) return;
      room.strokes = [];
      broadcast(room, { type:'clear' });
      break;
    case 'reset':
      if (room.players.length) resetRoom(room);
      break;
    default:
      break;
  }
}

const mime = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'application/javascript; charset=utf-8',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.jfif':'image/jpeg', '.svg':'image/svg+xml', '.txt':'text/plain; charset=utf-8'
};

const server = http.createServer((req,res) => {
  let requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);
  if (requestPath === '/') requestPath = '/index.html';
  const safePath = path.normalize(path.join(ROOT, requestPath));
  if (!safePath.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.stat(safePath, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(safePath).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-cache' });
    fs.createReadStream(safePath).pipe(res);
  });
});

const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  const player = { ws, id:crypto.randomUUID(), name:'Leitor', room:'dom-quixote', color:'#9b6572', score:0, joinedAt:Date.now(), lastCorrectTurn:-1 };
  ws.send(JSON.stringify({ type:'hello', message:'Conectado' }));

  ws.on('message', raw => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return; }
    if (message.type === 'join') {
      if (player.roomJoined) return;
      const roomId = String(message.room || 'dom-quixote');
      const room = rooms.get(roomId) || makeRoom(roomId);
      if (room.players.length >= MAX_PLAYERS) { ws.send(JSON.stringify({ type:'error', message:'A sala já está cheia.' })); ws.close(); return; }
      if (room.started) { ws.send(JSON.stringify({ type:'error', message:'Esta partida já começou.' })); ws.close(); return; }
      player.room = roomId;
      player.name = cleanName(message.name);
      player.color = assignColor(room);
      player.roomJoined = true;
      room.players.push(player);
      rooms.set(roomId, room);
      ws.send(JSON.stringify({ type:'welcome', playerId:player.id, state:roomState(room) }));
      broadcastState(room);
      return;
    }
    if (!player.roomJoined) return;
    handleMessage(player, message);
  });

  ws.on('close', () => {
    if (!player.roomJoined) return;
    const room = rooms.get(player.room);
    if (room) leavePlayer(room, player);
  });
});

server.listen(PORT, () => {
  console.log(`Du Diable server on http://localhost:${PORT}`);
});
