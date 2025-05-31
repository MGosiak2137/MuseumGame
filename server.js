// === server.js ===
const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 3000;

const usedColors = new Set();
const usedExtColors = new Set();


app.use(express.static(path.join(__dirname, 'frontend')));

// In-memory rooms store
const rooms = {}; // code -> { name, code, players: [{id,name}], started: bool, game }

// Generate a 4-letter room code
function generateRoomCode() {
  return Math.random().toString(36).substr(2, 4).toUpperCase();
}
// Return list of rooms for lobby/admin
function getPublicRooms() {
  return Object.values(rooms)
    .filter(r => !r.external)  // TYLKO pokoje NIEZEWNĘTRZNE
    .map(r => ({
      name: r.name,
      code: r.code,
      playerCount: r.players.length,
      started: r.started
    }));}

    function getExternalRooms() {
  return Object.values(rooms)
    .filter(r => r.external)  // TYLKO pokoje zewnętrzne
    .map(r => ({
      name: r.name,
      code: r.code,
      playerCount: r.players.length,
      maxPlayers: 4,
      started: r.started,
      players: r.players
    }));
}


// Random pawn color
function generateRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

// Socket.IO
io.on('connection', socket => {
  // Send current room list
  socket.emit('roomList', getPublicRooms());

  // Emit listy pokoi zewnętrznych do panelu external userów
  socket.emit('externalRoomList', getExternalRooms());

  // Admin creates a room
  socket.on('createRoom', name => {
    const code = generateRoomCode();
    rooms[code] = { name, code, players: [], started: false, external: false };
    io.emit('roomList', getPublicRooms());
  });

  socket.on('externalCreateRoom', name => {
    const code = generateRoomCode();
    rooms[code] = { name, code, players: [], started: false, external: true };
    io.emit('externalRoomList', getExternalRooms());
  });

  // Admin deletes a room
  socket.on('deleteRoom', code => {
    delete rooms[code];
    io.emit('roomList', getPublicRooms());
    io.emit('externalRoomList', getExternalRooms());
  });

  // User joins a room
  socket.on('joinRoom', ({ code, name }) => {
    const room = rooms[code];
    if (!room || room.started || room.players.length >= 4) {
      socket.emit('joinError');
      return;
    }
    room.players.push({ id: socket.id, name, ready: false });
    socket.join(code);
    io.to(code).emit('updatePlayers', room.players);
    socket.emit('joinSuccess', { roomCode: code, name, external: room.external });
    io.emit('roomList', getPublicRooms());
    io.emit('externalRoomList', getExternalRooms());
  });

  // User leaves a room manually
  socket.on('leaveRoom', code => {
    const room = rooms[code];
    if (!room) return;
    room.players = room.players.filter(p => p.id !== socket.id);
    socket.leave(code);
    io.to(code).emit('updatePlayers', room.players);
    io.emit('roomList', getPublicRooms());
    io.emit('externalRoomList', getExternalRooms());
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    for (const code in rooms) {
      const room = rooms[code];
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        io.to(code).emit('updatePlayers', room.players);
        io.emit('roomList', getPublicRooms());
        io.emit('externalRoomList', getExternalRooms());
      }
    }
  });

    // External user ustawia, że jest gotowy do startu
  socket.on('playerReady', ({roomCode, playerId})=>{
    const room=rooms[roomCode];
    if(!room || room.started ) return;
    const player = room.players.find(p=>p.id === playerId);
    if(!player) return;
    player.ready = true;
    io.to(roomCode).emit('updatePlayers', room.players);
    //sprawdź czy wsyscy gotowi i liczba graczy 2-4
    
    const allReady = room.players.length >= 2 && room.players.length <= 4 && room.players.every(p => p.ready);
    if (allReady) {
      room.started = true;
    
    const players = room.players.map (p => {
      let color;
      do {
    color = generateRandomColor();
  } while (usedExtColors.has(color));
  
  // Zarejestruj kolor i zwróć obiekt gracza
  usedExtColors.add(color);
  return {
    id:    p.id,
    name:  p.name,
    color
  };
});
room.game = {
      players,
      positions: players.reduce((acc, p) => { acc[p.id] = 1; return acc; }, {}),
      turnOrder: players.map(p => p.id),
      currentTurn: 1
    };
    io.to(roomCode).emit('gameStarted', room.game);
    io.emit('externalRoomList', getExternalRooms());
      io.emit('roomList', getPublicRooms());}
  });
    
  
  // Admin starts the game
  socket.on('startGame', code => {
    const room = rooms[code];
    if (!room || room.started) return;
    room.started = true;
    // Initialize game state
    const players = room.players.map(p => {
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

    room.game = {
      players,
      positions: players.reduce((acc, p) => { acc[p.id] = 1; return acc; }, {}),
      turnOrder: players.map(p => p.id),
      currentTurn: 1
    };
    io.to(code).emit('gameStarted', room.game);
    io.emit('roomList', getPublicRooms());
    io.emit('externalRoomList', getExternalRooms());
  });



//GRA
// Obsługa ruchu gracza
socket.on('playerMove', ({ roomCode, playerId, newPos }) => {
  const room = rooms[roomCode];
  if (!room || !room.started || !room.game) return;

  // Sprawdź czy to aktualna tura
  if (room.game.turnOrder[room.game.currentTurn - 1] !== playerId) {
    // Nie jest tura tego gracza
    socket.emit('moveRejected', 'Nie jest Twoja tura');
    return;
  }

  // Aktualizuj pozycję gracza
  room.game.positions[playerId] = newPos;

  // Zmieniamy turę na kolejnego gracza
  room.game.currentTurn++;
  if (room.game.currentTurn > room.game.turnOrder.length) {
    room.game.currentTurn = 1; // powrót do pierwszego gracza
  }

  // Emitujemy nowy stan gry do wszystkich w pokoju
  io.to(roomCode).emit('gameStateUpdate', room.game);
  // Potwierdzamy ruch temu graczowi (można usunąć jeśli niepotrzebne)
  socket.emit('moveConfirmed', room.game);
});

// Ten event pozwoli klientowi, który wszedł na game.html, dołączyć do ongoing gry
  socket.on('joinGame', ({ roomCode }) => {
    const room = rooms[roomCode];
    // Sprawdzamy, czy pokój istnieje, jest w stanie "started" i ma zainicjowaną grę
    if (!room || !room.started || !room.game) return;
    // Dołączamy tego socket-a do pokoju Socket.IO (tak, by dostawał dalsze aktualizacje)
    socket.join(roomCode);
    // Od razu wysyłamy mu pełen stan gry (jakby dopiero co wystartowała)
    socket.emit('gameStarted', room.game);
  });


});

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));