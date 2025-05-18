const socket = io();
const playerCount = document.getElementById('playerCount');
const playerList = document.getElementById('playerList');
const leaveBtn = document.getElementById('leaveBtn');

const roomCode = sessionStorage.getItem('roomCode');
const userName = sessionStorage.getItem('userName');

if (!roomCode || !userName) {
  window.location = '/user.html';
}

socket.emit('requestUpdatePlayers', roomCode);

socket.on('updatePlayers', players => {
  const list = document.getElementById('playerList');
  list.innerHTML = '';
  players.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.name;
    list.appendChild(li);
  });
});

leaveBtn.onclick = () => {
  socket.emit('leaveRoom', roomCode);
};

socket.on('leftRoom', () => {
  sessionStorage.removeItem('roomCode');
  sessionStorage.removeItem('userName');
  window.location = './user.html';
});

socket.on('gameStarted', () => {
  window.location = '/game.html';
});