const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const rooms={};


app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });

//nowe połączenie użytkownika:(socket reprezentuje indywidualne polaczenie klienta)
io.on('connection',(socket)=>{
  console.log('Nowe połączenie', socket.id);
//tworzenie pokoju, generowanie unikalnego kodu, pusta lista uzytkowników  z flaga false, zwraca kod pokou
  socket.on('createRoom',(callback)=>{
    const roomCode=generateRoomCode();
    rooms[roomCode]={users:[],started:false};
    callback({success:true, roomCode});
    console.log('Utworzono pokój: ',roomCode);
  });
    //pobieranie listy dostepnych pokoi, filtruje rooms aby znalezc te ktore nie zostaly rozpoczete i maja mniej niz 4 graczy, zwraca liste kodów pokoi:
    socket.on('getRooms', (callback) => {
      const openRooms = Object.entries(rooms)
          .filter(([_, data]) => !data.started && data.users.length < 4)
          .map(([code]) => code);
      callback(openRooms);
    });
    //dołączenie do pokoju - dołącza uzytkownika i socket
    socket.on('joinRoom', ({ roomCode, userName }, callback) => {
      const room = rooms[roomCode];
      if (!room || room.started || room.users.length >= 4) {
          return callback({ success: false, message: 'Nie można dołączyć do pokoju.' });
      }
      room.users.push({ id: socket.id, name: userName });
      socket.join(roomCode);
      callback({ success: true });
    });
    //rozpoczecie gry
    socket.on('startGame', (roomCode) => {
      if (rooms[roomCode]) {
          rooms[roomCode].started = true;
          io.to(roomCode).emit('gameStarted');
      }
  });
    //rozłączenie gracza
    socket.on('disconnect', () => {
      for (const [roomCode, room] of Object.entries(rooms)) {
          room.users = room.users.filter(u => u.id !== socket.id);
          if (room.users.length === 0 && !room.started) {
              delete rooms[roomCode];
          }
      }
  });
  socket.on('getRoomDetails', (roomCode, callback) => {
    const room = rooms[roomCode];
    if (room) {
        callback(room);
    } else {
        callback(null);
    }
});

  });
//tworzy unikalny kod, sprawdza czy juz taki nie istnieje w jakims room
  function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    do {
        code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while (rooms[code]);
    return code;
}

  

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
