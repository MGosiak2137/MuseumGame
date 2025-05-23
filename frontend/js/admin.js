const socketAdmin = io();
const roomsList = document.getElementById('rooms');
document.getElementById('createBtn').addEventListener('click', () => {
  const name = document.getElementById('roomName').value.trim();
  if (name) socketAdmin.emit('createRoom', name);
});
socketAdmin.on('roomList', rooms => {
  roomsList.innerHTML = '';
  rooms.forEach(r => {
    const li = document.createElement('li');
    li.textContent = `${r.name} (${r.code}) - ${r.playerCount} graczy`;
    const del = document.createElement('button'); del.textContent = 'Usuń';
    del.onclick = () => socketAdmin.emit('deleteRoom', r.code);
    li.appendChild(del);
    if (!r.started) {
      const start = document.createElement('button'); start.textContent = 'Start';
      start.onclick = () => socketAdmin.emit('startGame', r.code);
      li.appendChild(start);
    }
    roomsList.appendChild(li);
  });
});

//Instrukcja
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