// Tutaj będzie logika rozgrywki (np. system rund, rzuty kostką, itp.).
console.log('Gra się rozpoczęła! Do zaimplementowania.');
const socketGame = io();
const params = new URLSearchParams(window.location.search);
const roomCodeGame = params.get('code');
let gameState;

function createBoard() {
  const board = document.getElementById('board');
  for (let i = 1; i <= 20; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.id = `cell-${i}`;
    cell.textContent = i;
    board.appendChild(cell);
  }
}

function updatePawns() {
  
}


