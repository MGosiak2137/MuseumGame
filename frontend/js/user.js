const socket = io();
const roomsList = document.getElementById('rooms');
const joinBtn = document.getElementById('joinBtn');
const nameInput = document.getElementById('userName');
const codeInput = document.getElementById('roomCode');
const errorP = document.getElementById('error');

socket.on('roomList', rooms => {
  const container = document.getElementById('availableRooms');
  container.innerHTML = '';
  rooms.forEach(room => {
    const div = document.createElement('div');
    div.textContent = `${room.name} (kod: ${room.code})`;

    const btn = document.createElement('button');
    btn.textContent = 'Dołącz';
    btn.onclick = () => dołączDoPokoju(room.code);

    div.appendChild(btn);
    container.appendChild(div);
  });
});

function dołączDoPokoju(code) {
  const nameInput = document.getElementById('nameInput'); // istniejące pole z nickiem
  socket.emit('joinRoom', { code, name: nameInput.value });
}

socket.on('joinError', () => {
  errorP.textContent = 'Nie można dołączyć do pokoju!';
});

socket.on('joinSuccess', ({ roomCode, name }) => {
  sessionStorage.setItem('roomCode', roomCode);
  sessionStorage.setItem('userName', name);
  // przekierowanie do poczekalni – używamy ścieżki absolutnej,
  // żeby nie było problemów z ../ itp.
  window.location.href = '/waiting.html';
});

joinBtn.onclick = () => {
  const name = nameInput.value.trim();
  const code = codeInput.value.trim().toUpperCase();
  if (!name || !code) {
    errorP.textContent = 'Podaj nick i kod pokoju!';
    return;
  }
  socket.emit('joinRoom', { code, name });
};


