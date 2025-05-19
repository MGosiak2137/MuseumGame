const socket = io();
const roomsList = document.getElementById('rooms');
const createBtn = document.getElementById('createBtn');
const roomNameInput = document.getElementById('roomName');

createBtn.onclick = () => {
  const name = roomNameInput.value.trim();
  if (!name) return;
  socket.emit('createRoom', name);
  roomNameInput.value = '';
};

socket.on('roomList', rooms => {
  roomsList.innerHTML = '';
  rooms.forEach(r => {
    const li = document.createElement('li');
    const roomNameSpan = document.createElement('span');
    roomNameSpan.textContent = `${r.name} [${r.code}] - ${r.playerCount} graczy `;

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'room-buttons';

    const del = document.createElement('button');
    del.textContent = 'Usuń';
    del.onclick = () => socket.emit('deleteRoom', r.code);

    const start = document.createElement('button');
    start.textContent = 'Start';
    start.onclick = () => socket.emit('startGame', r.code);

    buttonsDiv.appendChild(del);
    buttonsDiv.appendChild(start);

    li.appendChild(roomNameSpan);
    li.appendChild(buttonsDiv);
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