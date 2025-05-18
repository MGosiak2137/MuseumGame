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
    li.textContent = `${r.name} [${r.code}] - ${r.playerCount} graczy `;
    const del = document.createElement('button');
    del.textContent = 'Usuń';
    del.onclick = () => socket.emit('deleteRoom', r.code);
    const start = document.createElement('button');
    start.textContent = 'Start';
    start.onclick = () => socket.emit('startGame', r.code);
    li.append(del, start);
    roomsList.append(li);
  });
});