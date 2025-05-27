// Tutaj będzie logika rozgrywki (np. system rund, rzuty kostką, itp.).
console.log('Gra się rozpoczęła! Do zaimplementowania.');
const socketGame = io();
const params = new URLSearchParams(window.location.search);
const roomCode = params.get('code');

const board = document.getElementById('board');
const rollBtn = document.getElementById('rollBtn');
const diceResultSpan = document.getElementById('diceResult');
const yourTurnSpan = document.getElementById('yourTurn');

let gameState = null;
let myPlayerId = null;

// Stwórz planszę z 20 pól (przyciski)
function createBoard() {
  board.innerHTML = '';
  for (let i = 1; i <= 20; i++) {
    const btn = document.createElement('button');
    btn.classList.add('cell');
    btn.id = `cell-${i}`;
    btn.textContent = i;
    btn.style.position = 'relative';
    btn.style.width = '80px';
    btn.style.height = '80px';
    btn.style.margin = '2px';
    board.appendChild(btn);
  }
}

// Rysuj pionki na planszy wg pozycji z gameState
function renderPawns() {
  // Najpierw wyczyść wszystkie pionki
  for (let i = 1; i <= 20; i++) {
    const cell = document.getElementById(`cell-${i}`);
    // Usuń stare pionki (elementy z klasą 'pawn')
    [...cell.querySelectorAll('.pawn')].forEach(p => p.remove());
  }

  if (!gameState) return;

  // Narysuj pionki graczy na odpowiednich polach
  gameState.players.forEach(player => {
    const pos = gameState.positions[player.id];
    if (!pos) return;

    const cell = document.getElementById(`cell-${pos}`);
    if (!cell) return;

    const pawn = document.createElement('div');
    pawn.classList.add('pawn');
    pawn.style.backgroundColor = player.color;
    pawn.style.width = '20px';
    pawn.style.height = '20px';
    pawn.style.borderRadius = '50%';
    pawn.style.position = 'absolute';
    pawn.style.top = '5px';

    // Ustaw offset, aby pionki nie nachodziły na siebie
    const index = gameState.players.findIndex(p => p.id === player.id);
    pawn.style.left = (5 + index * 22) + 'px';

    // Dodaj pionek do pola
    cell.appendChild(pawn);
  });
}

// Aktualizuj tekst "Twój ruch" i włącz/wyłącz przycisk
function updateTurnInfo() {
  if (!gameState) return;

  const currentPlayerId = gameState.turnOrder[gameState.currentTurn - 1];
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);

  yourTurnSpan.textContent = currentPlayer ? currentPlayer.name : '?';

  rollBtn.disabled = (myPlayerId !== currentPlayerId);
  if (rollBtn.disabled) {
    diceResultSpan.textContent = '-';
  }
}

function rollDice() {
  if (!gameState) return;
  const currentPlayerId = gameState.turnOrder[gameState.currentTurn - 1];
  if (myPlayerId !== currentPlayerId) {
    alert('To nie Twój ruch!');
    return;
  }
  const roll = Math.floor(Math.random() * 6) + 1;
  diceResultSpan.textContent = roll;

  // Wylicz nową pozycję
  let newPos = gameState.positions[myPlayerId] + roll;
  if (newPos > 20) newPos = 20; // Nie wychodzimy poza planszę

  // Wyślij ruch do serwera (można to później rozwinąć o weryfikacje i synchronizację)
  socketGame.emit('playerMove', { roomCode, playerId: myPlayerId, newPos });
}

// Nasłuch na start gry (ustawiamy stan gry)
socketGame.on('gameStarted', game => {
  gameState = game;
  myPlayerId = socketGame.id;
  createBoard();
  renderPawns();
  updateTurnInfo();
});

// Nasłuch na aktualizację stanu gry (np. ruchy innych graczy)
socketGame.on('gameStateUpdate', game => {
  gameState = game;
  renderPawns();
  updateTurnInfo();
});

// Po wciśnięciu przycisku rzutu kostką
rollBtn.addEventListener('click', () => {
  rollDice();
});
cell

// Nasłuch na potwierdzenie ruchu od serwera
socketGame.on('moveConfirmed', game => {
  gameState = game;
  renderPawns();
  updateTurnInfo();
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