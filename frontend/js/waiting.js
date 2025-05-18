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

//INSTRUKCJA
function showInstructionOverlay() {
  fetch('./instruction.html')
    .then(res => res.text())
    .then(html => {
      const overlay = document.getElementById('instruction-overlay');
      overlay.innerHTML = html;
      overlay.classList.remove('hidden');
    })
    .catch(err => {
      console.error('Błąd ładowania instrukcji:', err);
    });
}

function closeInstructionOverlay() {
  const overlay = document.getElementById('instruction-overlay');
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
}
function loadPage(pageName) {
  fetch(`./${pageName}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById('main-content').innerHTML = html;
    });
}
window.addEventListener('DOMContentLoaded', () => {
  const pageFromHash = window.location.hash?.substring(1) || '';
  if (pageFromHash) {
    loadPage(pageFromHash);
  }
});