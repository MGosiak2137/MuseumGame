// === server.js ===
const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 3000;

const socketClientMap = {};
const usedColors    = new Set();
const usedExtColors = new Set();

app.use(express.static(path.join(__dirname, 'frontend')));

// In-memory rooms store
const rooms = {}; // code -> { name, code, players: [{id,name}], started: bool, game }

// Generate a 4-letter room code
function generateRoomCode() {
  return Math.random().toString(36).substr(2, 4).toUpperCase();
}
function getPublicRooms() {
  return Object.values(rooms)
    .filter(r => !r.external)
    .map(r => ({
      name: r.name,
      code: r.code,
      playerCount: r.players.length,
      started: r.started
    }));
}

    function getExternalRooms() {
  return Object.values(rooms)
    .filter(r => r.external)
    .map(r => ({
      name: r.name,
      code: r.code,
      playerCount: r.players.length,
      maxPlayers: 4,
      started: r.started,
      players: r.players.map(p => ({ id: p.id, name: p.name, ready: p.ready }))
    }));
}


// Random pawn color
const baseColors = [
  'red',
  'green',
  'yellow',
  'blue',
  'pink',
  'purple',
  'orange'
];

function generateRandomColor() {
  // pick until we find one not yet used
  let idx, color;
  do {
    idx   = Math.floor(Math.random() * baseColors.length);
    color = baseColors[idx];
  } while (usedExtColors.has(color));
  return color;
}

// Socket.IO
io.on('connection', socket => {
  // Immediately send both lists
  socket.emit('roomList', getPublicRooms());
  socket.emit('externalRoomList', getExternalRooms());

  // — Admin creates internal room —
  socket.on('createRoom', name => {
    const code = generateRoomCode();
    rooms[code] = { name, code, players: [], started: false, external: false };
    io.emit('roomList', getPublicRooms());
  });

  // — Admin creates external room —
  socket.on('externalCreateRoom', ({ roomName, userName, clientId }) => {
    const code = generateRoomCode();
    rooms[code] = {
      name:     roomName,
      code,
      players:  [],
      started:  false,
      external: true
    };
    io.emit('externalRoomList', getExternalRooms());
  });

  // Admin deletes a room
  socket.on('deleteRoom', code => {
    delete rooms[code];
    io.emit('roomList', getPublicRooms());
    io.emit('externalRoomList', getExternalRooms());
  });

  // User joins a room
  socket.on('joinRoom', ({ code, name, clientId }) => {
    const room = rooms[code];
    socketClientMap[socket.id] = clientId;

    if (!room || room.started || room.players.length >= 4) {
      socket.emit('joinError', 'Cannot join room');
      return;
    }

    const existing = room.players.find(p => p.id === clientId);
  if (existing) {
    existing.socketId = socket.id;
    existing.name     = name;          // in case they changed it
  } else {
    room.players.push({ id: clientId, socketId: socket.id, name, ready: false });}
    socket.join(code);

    io.to(code).emit('updatePlayers', room.players.map(p => ({
    id:   p.id,
    name: p.name,
    ready: p.ready
  })));
    socket.emit('joinSuccess', { roomCode: code, name, external: room.external });
    io.emit('roomList', getPublicRooms());
    io.emit('externalRoomList', getExternalRooms());
  });

  // User leaves a room manually
    socket.on('leaveRoom', ({ code, clientId }) => {
    const room = rooms[code];
    if (!room) return;
    room.players = room.players.filter(p => p.id !== clientId);
    socket.leave(code);
    io.to(code).emit('updatePlayers',
      room.players.map(p => ({ id: p.id, name: p.name, ready: p.ready }))
    );
    io.emit('roomList', getPublicRooms());
    io.emit('externalRoomList', getExternalRooms());
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const clientId = socketClientMap[socket.id];
    delete socketClientMap[socket.id];
    for (const code in rooms) {
      const room = rooms[code];
      const idx = room.players.findIndex(p => p.id === clientId);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        io.to(code).emit('updatePlayers',
          room.players.map(p => ({ id: p.id, name: p.name, ready: p.ready }))
        );
        io.emit('roomList', getPublicRooms());
        io.emit('externalRoomList', getExternalRooms());
      }
    }
  });

    // External user ustawia, że jest gotowy do startu
  socket.on('playerReady', ({ code, playerId }) => {
    const room = rooms[code];
    if (!room || room.started) return;
    const p = room.players.find(x => x.id === playerId);
    if (!p) return;
    p.ready = true;
    io.to(code).emit('updatePlayers',
      room.players.map(x => ({ id: x.id, name: x.name, ready: x.ready }))
    );

    const allReady = room.players.length >= 2
                  && room.players.length <= 4
                  && room.players.every(x => x.ready);
    if (!allReady) return;

    // Start the external game
    room.started = true;
    const gamePlayers = room.players.map(x => {
      const color = generateRandomColor();
      usedExtColors.add(color);
      return { id: x.id, name: x.name, color };
    });
    const positions = {};
    gamePlayers.forEach(x => positions[x.id] = 1);
    const turnOrder = gamePlayers.map(x => x.id);

    room.game = {
      players:     gamePlayers,
      positions,
      turnOrder,
      currentTurn: 0,
      startTime:   Date.now()
    };
    io.to(code).emit('gameStarted', room.game);
    io.emit('externalRoomList', getExternalRooms());
    io.emit('roomList', getPublicRooms());
  });

    
  
  // Admin starts the game// initial positions: everyone starts on field 1
  
  
  socket.on('startGame', code => {
    const room = rooms[code];
    if (!room || room.started) return;
    room.started = true;
    const startTime = Date.now();
    // Initialize game state
    const gamePlayers = room.players.map(p => {
  let color;
  // Generuj nowy kolor, dopóki nie trafi na unikalny
  do {
    color = generateRandomColor();
  } while (usedColors.has(color));
  
  // Zarejestruj kolor i zwróć obiekt gracza
  usedColors.add(color);
  return {
    id:    p.id,
    name:  p.name,
    color
  };
});
const positions={};
gamePlayers.forEach(p => positions[p.id] = 1);
const turnOrder = gamePlayers.map(p => p.id);
 console.log('[SERVER] Starting admin game in room', code);
  console.log('[SERVER] turnOrder =', turnOrder);
    room.game = {
      players: gamePlayers,
      positions,
      //: players.reduce((acc, p) => { acc[p.id] = 1; return acc; }, {}),
      turnOrder,
      //: players.map(p => p.id),
      currentTurn: 0,
      startTime: Date.now()
    };
    io.to(code).emit('gameStarted', room.game);
    io.emit('roomList', getPublicRooms());
    io.emit('externalRoomList', getExternalRooms());
  });



//GRA
  // GRA — turn management, dice rolls, re-joins
  // — Join an ongoing game (re-connect) —
  socket.on('joinGame', ({ roomCode, oldPlayerId }) => {
    const room = rooms[roomCode];
    if (!room || !room.started) return;
   
    socketClientMap[socket.id] = oldPlayerId;
    socket.join(roomCode);
    socket.emit('initGame', room.game);
  });

  socket.on('rollDice', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    const game = room.game;
    //const currentPlayerId = game.turnOrder[game.currentTurn];
      const clientId = socketClientMap[socket.id];
  const currentPlayerId = game.turnOrder[game.currentTurn];
  if (clientId !== currentPlayerId) return;
    console.log('[SERVER] rollDice request from', socket.id, 'for room', roomCode);
   console.log('[SERVER] expected turn =', currentPlayerId);
    // only allow the current player to roll
    //if (socket.id !== currentPlayerId) return;

    // server-authority roll
    const roll = Math.floor(Math.random() * 6) + 1;
    console.log('[SERVER] generator roll =', roll, 'for', socket.id);
    // advance position (max field index = 66)
    //const newPos = Math.min(game.positions[socket.id] + roll, 66);
    //game.positions[socket.id] = newPos;

    const newPos = Math.min(game.positions[clientId] + roll, 66);
    game.positions[clientId] = newPos;
    
    console.log('[SERVER] updated positions:', game.positions);
    // advance turn (wrap around)
    game.currentTurn = ((game.currentTurn+1) % game.turnOrder.length);
    console.log('[SERVER] next currentTurn index =', game.currentTurn,
               '→', game.turnOrder[game.currentTurn - 1]);


    // broadcast the result & updated state
    io.to(roomCode).emit('diceResult', {
    playerId: clientId,
      roll,
      positions: game.positions,
    nextPlayerId: game.turnOrder[game.currentTurn]
    });
  });
})

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));