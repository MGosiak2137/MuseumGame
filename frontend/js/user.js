// client-side persistent ID
const CLIENT_ID_KEY = 'museumGameClientId';
 let clientId = localStorage.getItem(CLIENT_ID_KEY);
 if (!clientId) {
  clientId = Math.random().toString(36).substr(2, 9);
 localStorage.setItem(CLIENT_ID_KEY, clientId);
 }

const socket = io();
const roomsContainer = document.getElementById('availableRooms');
document.getElementById('roomCode').addEventListener('input', function () {
  this.value = this.value.toUpperCase();
}); // tylko duże litery !


socket.on('roomList', rooms => {
  roomsContainer.innerHTML = '';
  rooms.filter(r => !r.started).forEach(r => {
    const li = document.createElement('li');
    li.textContent = `${r.name} (${r.code}) - ${r.playerCount} graczy`;
    
    
    roomsContainer.appendChild(li);
  });
});
document.getElementById('joinBtn').onclick = () => {
  const name = document.getElementById('userName').value.trim();
  const code = document.getElementById('roomCode').value.trim().toUpperCase();
  if (!name) return alert('Podaj nick');
  if (!code) return alert('Podaj kod pokoju');
  socket.emit('joinRoom', { code, name, clientId });
};
socket.on('joinSuccess', ({ roomCode, name, external }) => {
  if (external) {
    errorP.textContent = 'Ten kod jest nieprawidłowy!';
    return;
  }
  sessionStorage.setItem('playerId', socket.id);
  sessionStorage.setItem('roomCode', roomCode);
  sessionStorage.setItem('name', name);
  sessionStorage.setItem('external', 'false');
  window.location.href = '../waiting.html';
});
socket.on('joinError', () => alert('Nie można dołączyć do pokoju')); 

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

document.getElementById('roomCode').addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    document.getElementById('joinBtn').click();
  }
}); // dodaję żeby dało się eterem akceptować


window.addEventListener('DOMContentLoaded', () => {
    const pageFromHash = window.location.hash?.substring(1) || '';
    if (pageFromHash) {
        loadPage(pageFromHash);
    }
});