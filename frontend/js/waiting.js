// client‐side persistent ID – exactly the same as in user.js / externalUser.js
const CLIENT_ID_KEY = 'museumGameClientId';
let clientId = sessionStorage.getItem(CLIENT_ID_KEY);
if (!clientId) {
  clientId = Math.random().toString(36).substr(2, 9);
  sessionStorage.setItem(CLIENT_ID_KEY, clientId);
}


const socketWait = io();
const code = sessionStorage.getItem('roomCode');
const name = sessionStorage.getItem('name');
document.getElementById('roomCode').textContent = code;
// Re-join room
let players = [];

socketWait.on('connect', () => {
   // store waiting‐room socket id for later reconnect
   sessionStorage.setItem('playerId', clientId);
  socketWait.emit('joinRoom', { code, name, clientId });
    console.log('[WAITING_] emitted joinRoom for external waiting with clientId=', clientId);
   console.log('[WAITING] emitted joinRoom for internal waiting');
 });

// Dołącz do pokoju - ważne, aby poinformować serwer
//socketWait.emit('joinRoom', { code, name });

socketWait.on('updatePlayers', players => {
  const ul = document.getElementById('playerList'); ul.innerHTML = '';
  players.forEach(p => {
    const li = document.createElement('li'); li.textContent = p.name;
    ul.appendChild(li);
  });
});


// Leave room logic
leaveBtn.onclick = () => {
  socketWait.emit('leaveRoom', { code, clientId });
  sessionStorage.clear();
  window.location.href = '../user.html';
};

socketWait.on('gameStarted', () => {
  window.location.href = `../Game.html?code=${code}`;
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