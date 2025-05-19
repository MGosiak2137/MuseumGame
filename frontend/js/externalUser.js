const socket = io();
const roomsList = document.getElementById('rooms');
const joinBtn = document.getElementById('joinBtn');
const createBtn = document.getElementById('createBtn'); // Nowy przycisk do tworzenia pokoju
const nameInput = document.getElementById('userName');
const codeInput = document.getElementById('roomCode');
const errorP = document.getElementById('error');

socket.on('roomList', rooms => {
    const container = document.getElementById('availableRooms');
    container.innerHTML = '';
    if (rooms.length === 0) {
        const message = document.createElement('div');
        message.textContent = 'Aktualnie nie ma dostępnych pokoi.';
        container.appendChild(message);
    } else {
        rooms.forEach((room, index) => {
            const div = document.createElement('div');
            div.textContent = `${room.name} (kod: ${room.code}) - Liczba graczy: ${room.players.length}/${room.maxPlayers}`;
            if (room.players.length < room.maxPlayers) {
                const joinButton = document.createElement('button');
                joinButton.textContent = 'Dołącz';
                joinButton.onclick = () => dołączDoPokoju(room.code);
                div.appendChild(joinButton);
            } else {
                const fullSpan = document.createElement('span');
                fullSpan.textContent = ' (Pełny)';
                fullSpan.style.color = 'red';
                div.appendChild(fullSpan);
            }
            container.appendChild(div);
        });
    }
});

function dołączDoPokoju(code) {
    const name = nameInput.value.trim();
    if (!name) {
        errorP.textContent = 'Podaj swoją nazwę!';
        return;
    }
    socket.emit('joinRoom', { code, name });
}

// Obsługa tworzenia nowego pokoju
if (createBtn) {
    createBtn.onclick = () => {
        const name = nameInput.value.trim();
        if (!name) {
            errorP.textContent = 'Podaj nazwę dla nowego pokoju!';
            return;
        }
        socket.emit('createRoom', { name });
    };
}

socket.on('joinError', message => {
    errorP.textContent = message || 'Nie można dołączyć do pokoju!';
});

socket.on('roomFullError', code => {
    errorP.textContent = `Pokój o kodzie ${code} jest pełny!`;
});

socket.on('maxRoomsReached', () => {
    errorP.textContent = 'Osiągnięto maksymalną liczbę dostępnych pokoi.';
});

socket.on('joinSuccess', ({ roomCode, name }) => {
    sessionStorage.setItem('roomCode', roomCode);
    sessionStorage.setItem('userName', name);
    window.location.href = '/waiting.html';
});

joinBtn.onclick = () => {
    const name = nameInput.value.trim();
    const code = codeInput.value.trim().toUpperCase();
    if (!name || !code) {
        errorP.textContent = 'Podaj nazwę i kod pokoju!';
        return;
    }
    socket.emit('joinRoom', { code, name });
};

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