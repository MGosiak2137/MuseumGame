const socket = io();

const loginSection = document.getElementById('loginSection');
const mainPanel = document.getElementById('mainPanel');
const loginBtn = document.getElementById('loginBtn');
const accessPasswordInput = document.getElementById('accessPassword');
const loginError = document.getElementById('loginError');

const roomsContainer = document.getElementById('availableRooms');

const createBtn = document.getElementById('createBtn');
const userNameInput = document.getElementById('userName');
const roomNameInput = document.getElementById('roomName');
const errorP = document.getElementById('error');

// Proste sprawdzenie hasła 1234
loginBtn.onclick = () => {
  const pwd = accessPasswordInput.value.trim();
  if (pwd === '1234') {
    loginSection.style.display = 'none';
    mainPanel.style.display = 'block';
    errorP.textContent = '';
    socket.emit('requestExternalRooms'); // opcjonalnie, ale wywołamy aby dostać listę
  } else {
    loginError.textContent = 'Niepoprawne hasło';
  }
};

// Wyświetlanie listy pokoi zewnętrznych
socket.on('externalRoomList', rooms => {
  roomsContainer.innerHTML = '';
  if (rooms.length === 0) {
    const message = document.createElement('div');
    message.textContent = 'Aktualnie nie ma dostępnych pokoi.';
    roomsContainer.appendChild(message);
  } else {
    rooms.forEach(room => {
      const div = document.createElement('div');
      div.textContent = `${room.name} (kod: ${room.code}) - Liczba graczy: ${room.playerCount}/4`;
      if (!room.started && room.playerCount < 4) {
        const joinButton = document.createElement('button');
        joinButton.textContent = 'Dołącz';
        joinButton.onclick = () => joinRoom(room.code);
        div.appendChild(joinButton);
      } else {
        const fullSpan = document.createElement('span');
        fullSpan.textContent = ' (Pełny lub rozpoczęty)';
        fullSpan.style.color = 'red';
        div.appendChild(fullSpan);
      }
      roomsContainer.appendChild(div);
    });
  }
});

function joinRoom(code) {
  const name = userNameInput.value.trim();
  if (!name) {
    errorP.textContent = 'Podaj swoją nazwę!';
    return;
  }
  errorP.textContent = '';
  socket.emit('joinRoom', { code, name });
}



createBtn.onclick = () => {
  const name = userNameInput.value.trim();
  const roomName = roomNameInput.value.trim();
  if (!name) {
    errorP.textContent = 'Podaj swoją nazwę!';
    return;
  }
  if (!roomName) {
    errorP.textContent = 'Podaj nazwę pokoju!';
    return;
  }
  errorP.textContent = '';
  socket.emit('externalCreateRoom', roomName);
};

socket.on('joinError', message => {
  errorP.textContent = message || 'Nie można dołączyć do pokoju!';
});

socket.on('joinSuccess', ({ roomCode, name, external }) => {
  if (!external) {
    errorP.textContent = 'Ten pokój nie jest pokojem zewnętrznym!';
    return;
  }
  sessionStorage.setItem('roomCode', roomCode);
  sessionStorage.setItem('name', name);
  sessionStorage.setItem('external', 'true');
  window.location.href = '/waiting_external.html';
});

//INSTRUKCJA (bez zmian)
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