// game.js
document.addEventListener('DOMContentLoaded', () => {
const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('code');
console.log('[CLIENT] Script loaded, roomCode=', roomCode);
// cache DOM nodes
const timerEl         = document.getElementById('timer');
const boardContainer  = document.querySelector('.board-container');
const cube            = document.getElementById('cube-container');
const currentPlayerEl = document.getElementById('current-player');
const oldPlayerId = sessionStorage.getItem('playerId');
let myId = oldPlayerId;   
socket.emit('joinGame', { roomCode, oldPlayerId });

let game = null;

// utility: place/refresh all pawns
function renderPawns() {
  // remove old
  document.querySelectorAll('.pawn').forEach(el => el.remove());

  game.players.forEach(p => {
    const posIndex = game.positions[p.id];
    const cellBtn  = boardContainer.querySelector(`.cell[data-index="${posIndex}"]`);
    if (!cellBtn) return;

    const img = document.createElement('div');
    img.classList.add('pawn');

    // ← set the CSS variable, not backgroundColor
    img.style.setProperty('--pawn-color', p.color);

    // position at center of button
    const { left, top, width, height } = cellBtn.getBoundingClientRect();
    const boardRect = boardContainer.getBoundingClientRect();
    const x = (left - boardRect.left + width/2)  / boardRect.width  * 100;
    const y = (top  - boardRect.top  + height/2) / boardRect.height * 100;
    img.style.left = `${x}%`;
    img.style.top  = `${y}%`;

    boardContainer.appendChild(img);
  });
}

// start the shared timer
let timerInterval = null;
function startTimer(startTime) {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = String(Math.floor(elapsed/60)).padStart(2,'0');
    const secs = String(elapsed % 60).padStart(2,'0');
    timerEl.textContent = `${mins}:${secs}`;
  }, 500);
}

// when page loads, tell server we’re on the board
socket.on('connect', () => {
  //myId = socket.id;
  //console.log('[CLIENT] socket connected, myId =', myId);
  //const oldPlayerId = sessionStorage.getItem('playerId');
//socket.emit('joinGame', { roomCode, oldPlayerId });
  //console.log('[CLIENT] emitted joinGame');
  console.log('[CLIENT] socket re-connected, re-joining with', myId);
  socket.emit('joinGame', { roomCode, oldPlayerId: myId });
});

// receive full state
socket.on('initGame', srvGame => {
  game = srvGame;
  console.log('[CLIENT:initGame] received', game);
  console.log('[CLIENT:initGame] turnOrder =', game.turnOrder, 'currentTurn =', game.currentTurn);

  renderPawns();
  startTimer(game.startTime);
  updateTurnIndicator(game.turnOrder[game.currentTurn]);
});
socket.on('updateInventory', ({ playerId, inventory }) => {
  if (playerId !== myId) return; // AKTUALIZACJA PANELU TYLKO DLA GRACZA

  document.getElementById('cash-count').textContent   = inventory.cash;
  document.getElementById('supply-count').textContent = inventory.supply;
  document.getElementById('help-count').textContent   = inventory.help;
  document.getElementById('arrest-count').textContent = inventory.arrest;

  console.log('[CLIENT] Zaktualizowano ekwipunek gracza:', inventory);
});


//TUTAJ LOGIKA RUCHU KOSTKI CO BYŁO PIERWOTNIE W ODDZIELNYM SKRYPCIE
// after each roll
  socket.on('diceResult', ({ playerId, roll, positions, nextPlayerId }) => {
  console.log('[CLIENT:diceResult] playerId=', playerId, 'roll=', roll, 'nextPlayerId=', nextPlayerId);
  
  // 1) Determine from/to
  const from = game.positions[playerId];
  const to   = positions[playerId];
  const steps = [];
  for (let idx = from + 1; idx <= to; idx++) {
    steps.push(idx);
  }

  // 2) Animate pawn moving one cell at a time
  let i = 0;
  function animateStep() {
    // update that single pawn's position
    game.positions[playerId] = steps[i];
    renderPawns();

    i++;
    if (i < steps.length) {
      // next cell in 200ms
      setTimeout(animateStep, 600);
    } else {
      // 3) once animation is done, finalize state & UI
      game.positions = { ...positions };    // sync entire positions object
      game.currentTurn = game.turnOrder.indexOf(nextPlayerId);
      updateTurnIndicator(nextPlayerId);

      //alert(`Gracz ${playerId === myId ? 'Ty' : 'inny'} wyrzucił ${roll}`);
    }
  }

  // kick off the animation (or instantly if zero steps)
  if (steps.length > 0) {
    animateStep();
  } else {
    // no movement? just finalize
    game.currentTurn = game.turnOrder.indexOf(nextPlayerId);
    updateTurnIndicator(nextPlayerId);
    //alert(`Gracz ${playerId === myId ? 'Ty' : 'inny'} wyrzucił ${roll}`);
  }

// 1) animate cube to show the rolled face
const cube = document.getElementById('cube');

  // base face rotations
  const rotations = {
    1: { x: 0,   y: 0   }, 
    2: { x: 0,   y: 180 }, 
    3: { x: 0,   y: -90 }, 
    4: { x: 0,   y: 90  },
    5: { x: 90,  y: 0   }, 
    6: { x: -90, y: 0   }
  };
  // chaotic extra spins (3–6 full turns)
  const extraX = (Math.floor(Math.random() * 4) + 3) * 360;
  const extraY = (Math.floor(Math.random() * 4) + 3) * 360;

  const finalX = extraX + rotations[roll].x;
  const finalY = extraY + rotations[roll].y;

  //const { x, y } = faceMap[roll];
   // apply the spin
  console.log('[KOSTKA] finalX:', finalX, 'finalY:', finalY);
  console.log('[KOSTKA] cube =', cube);
  cube.style.transition = "transform 1.5s cubic-bezier(0.4, 1.4, 0.6, 1)";
  cube.style.transform  = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;

  // 2) move all pawns

  renderPawns();
  updateTurnIndicator(nextPlayerId);
  //alert(`Gracz ${playerId === myId ? 'Ty' : 'inny'} wyrzucił ${roll}`); 
});
socket.on('showCard', ({ fieldIndex, fieldType, playerId }) => { //funkcja show card - czyli pokazanie karty przypisanej do pola
  if (playerId !== myId) return;
  console.log('[CLIENT] showCard received:', fieldIndex, fieldType);
  showCardOverlay(fieldIndex, fieldType, playerId);
});

// show whose turn, and enable/disable cube
function updateTurnIndicator(turnPlayerId) {
  console.log('[CLIENT:updateTurn] now turn =', turnPlayerId);
  const me = (turnPlayerId === myId);
  currentPlayerEl.textContent = me ? 'Twoja kolej!' : 'Kolej gracza ' + turnPlayerId;
  cube.style.pointerEvents = me ? 'auto' : 'none';
  cube.style.opacity = me ? '1' : '0.5';
}

// click on cube → attempt to roll
  cube.addEventListener('click', () => {
    console.log('[CLIENT] click on cube, myId=', myId);
    socket.emit('rollDice', { roomCode });
    console.log('[CLIENT] emitted rollDice');
  });

    socket.on('popupMessage', ({ text }) => {
    alert(text); // Możesz później zamienić na ładny
  });
});

window.socket = socket;
window.myId = myId;