const socketWait = io();

const code = sessionStorage.getItem('roomCode');
const name = sessionStorage.getItem('name');
const playerId = socketWait.id; // ID gniazda

document.getElementById('roomCode').textContent = code;

const playerListUl = document.getElementById('playerList');
const readyListUl = document.getElementById('readyList');
const readyBtn = document.getElementById('readyBtn');
const leaveBtn = document.getElementById('leaveBtn');

let players = [];

// Dołącz do pokoju - ważne, aby poinformować serwer
socketWait.emit('joinRoom', { code, name });

// Aktualizacja listy graczy i gotowości
socketWait.on('updatePlayers', pls => {
  players = pls;
  playerListUl.innerHTML = '';
  readyListUl.innerHTML = '';

  players.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.name;
    playerListUl.appendChild(li);

    if (p.ready) {
      const rli = document.createElement('li');
      rli.textContent = p.name;
      readyListUl.appendChild(rli);
    }
  });

  // Włącz przycisk gotowości jeśli jest 2-4 graczy
  if (players.length >= 2 && players.length <= 4) {
    readyBtn.disabled = false;
  } else {
    readyBtn.disabled = true;
  }
});

// Kliknięcie przycisku gotowości
readyBtn.onclick = () => {
  // Znajdź swojego gracza i ustaw gotowość
  socketWait.emit('playerReady', { roomCode: code, playerId: socketWait.id });
  readyBtn.disabled = true;
};

// Start gry
socketWait.on('gameStarted', () => {
  window.location.href = `../game.html?code=${code}`;
});

// Opuszczenie pokoju
leaveBtn.onclick = () => {
  socketWait.emit('leaveRoom', code);
  sessionStorage.removeItem('roomCode');
  sessionStorage.removeItem('name');
  sessionStorage.removeItem('external');
  window.location.href = '../externalUser.html';
};

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
  fetch(`../${pageName}.html`)
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