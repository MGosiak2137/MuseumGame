const socketUser = io();
const roomsContainer = document.getElementById('availableRooms');


socketUser.on('roomList', rooms => {
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
  socketUser.emit('joinRoom', { code, name });
};
socketUser.on('joinSuccess', data => {
  sessionStorage.setItem('roomCode', data.roomCode);
  sessionStorage.setItem('name', data.name);
  window.location.href = '../waiting.html';
});
socketUser.on('joinError', () => alert('Nie można dołączyć do pokoju')); 

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