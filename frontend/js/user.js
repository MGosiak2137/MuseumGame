const socket = io();
const roomsList = document.getElementById('rooms');
const joinBtn = document.getElementById('joinBtn');
const nameInput = document.getElementById('userName');
const codeInput = document.getElementById('roomCode');
const errorP = document.getElementById('error');


socket.on('roomList', rooms => {
    const container = document.getElementById('availableRooms');
    container.innerHTML = '';
    rooms.forEach((room, index) => {
        const div = document.createElement('div');
        div.textContent = `${room.name} (kod: ${room.code})`;

        container.appendChild(div);
    });
});

function dołączDoPokoju(code) {
    const nameInput = document.getElementById('nameInput'); // istniejące pole z nickiem
    socket.emit('joinRoom', { code, name: nameInput.value });
}

socket.on('joinError', () => {
    errorP.textContent = 'Nie można dołączyć do pokoju!';
});

socket.on('joinSuccess', ({ roomCode, name }) => {
    sessionStorage.setItem('roomCode', roomCode);
    sessionStorage.setItem('userName', name);
    // przekierowanie do poczekalni – używamy ścieżki absolutnej,
    // żeby nie było problemów z ../ itp.
    window.location.href = '/waiting.html';
});

joinBtn.onclick = () => {
    const name = nameInput.value.trim();
    const code = codeInput.value.trim().toUpperCase();
    if (!name || !code) {
        errorP.textContent = 'Podaj nazwę grupy i kod pokoju!';
        return;
    }
    socket.emit('joinRoom', { code, name });
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