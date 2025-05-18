const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Stałe i struktury
const ADMIN_PASSWORD = 'secret123'; // Zmień na inne hasło
const rooms = {}; // { [code]: { name, code, players: [{id, name}], started } }

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Routing logowania admina
app.get('/admin_login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin_login.html'));
});
app.post('/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    return res.redirect('/admin.html');
  }
  res.redirect('/admin_login.html?error=1');
});

// Pomocnicze funkcje
function generateRoomCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function getPublicRooms() {
  return Object.values(rooms)
    .filter(r => !r.started)
    .map(r => ({ code: r.code, name: r.name, playerCount: r.players.length }));
}

// Socket.IO
io.on('connection', socket => {
  socket.emit('roomList', getPublicRooms());
  // Admin: tworzenie pokoju
  socket.on('createRoom', roomName => {
    const code = generateRoomCode();
    rooms[code] = { name: roomName, code, players: [], started: false };
    io.emit('roomList', getPublicRooms());
  });

  // Admin: usuwanie pokoju
  socket.on('deleteRoom', code => {
    delete rooms[code];
    io.emit('roomList', getPublicRooms());
  });

  // Admin: start gry
  socket.on('startGame', code => {
    const room = rooms[code];
    if (!room) return;
    room.started = true;
    io.to(code).emit('gameStarted');
    io.emit('roomList', getPublicRooms());
  });

  // Użytkownik: dołączenie do pokoju
  socket.on('joinRoom', ({ code, name }) => {
    const room = rooms[code];
    if (!room || room.started) {
      return socket.emit('joinError');
    }
    room.players.push({ id: socket.id, name });
    socket.join(code);
    io.to(code).emit('updatePlayers', room.players);
    socket.emit('joinSuccess', { roomCode: code, name });
    io.emit('roomList', getPublicRooms());
  });

  // Użytkownik: opuszczenie pokoju
  socket.on('leaveRoom', code => {
    const room = rooms[code];
    if (!room) return;
    room.players = room.players.filter(p => p.id !== socket.id);
    socket.leave(code);
    io.to(code).emit('updatePlayers', room.players);
    socket.emit('leftRoom');
    io.emit('roomList', getPublicRooms());
  });

  // Poczekalnia: zapytanie o listę uczestników
  socket.on('requestUpdatePlayers', code => {
    const room = rooms[code];
    if (!room) return;
    socket.join(code);
    socket.emit('updatePlayers', room.players);
  });

  // Rozłączenie: sprzątanie
  socket.on('disconnect', () => {
    for (const code in rooms) {
      const room = rooms[code];
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        io.to(code).emit('updatePlayers', room.players);
        io.emit('roomList', getPublicRooms());
      }
    }
  });
});

// Start serwera
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server działa na porcie ${PORT}`));