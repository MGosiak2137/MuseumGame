// client‐side persistent ID – exactly the same as in user.js / externalUser.js
const CLIENT_ID_KEY = 'museumGameClientId';
let clientId = sessionStorage.getItem(CLIENT_ID_KEY);
 if (!clientId) {
   const newId = Math.random().toString(36).substr(2, 9);
   sessionStorage.setItem(CLIENT_ID_KEY, newId);
   clientId = newId;
}

const socketWait = io();
const code   = sessionStorage.getItem('roomCode');
const name   = sessionStorage.getItem('name');

document.getElementById('roomCode').textContent = code;

const playerListUl = document.getElementById('playerList');
const readyListUl  = document.getElementById('readyList');
const readyBtn     = document.getElementById('readyBtn');
const leaveBtn     = document.getElementById('leaveBtn');

let players = [];

// Dołącz do pokoju - ważne, aby poinformować serwer
//socketWait.emit('joinRoom', { code, name });
 socketWait.on('connect', () => {
   // store waiting‐room socket id for later reconnect
   sessionStorage.setItem('playerId', clientId);
  socketWait.emit('joinRoom', { code, name, clientId });
    console.log('[WAITING_EXTERNAL] emitted joinRoom for external waiting with clientId=', clientId);
   console.log('[WAITING] emitted joinRoom for external waiting');
 });

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


// 3) Mark ourselves ready
readyBtn.onclick = () => {
  socketWait.emit('playerReady', { code, playerId: clientId });
  readyBtn.disabled = true;
};

// 4) When game starts, redirect
socketWait.on('gameStarted', () => {
  window.location.href = `../Game.html?code=${code}&playerId=${clientId}`;
});

// 5) Leave room
leaveBtn.onclick = () => {
  socketWait.emit('leaveRoom', { code, clientId });
  sessionStorage.clear();
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