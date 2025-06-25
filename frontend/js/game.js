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
let gameEnded = false;
window.cardActive = false;
window.game = game;
window.updateTurnIndicator = null;




// utility: place/refresh all pawns
function renderPawns() {
  // Usuń wszystkie stare pionki
  document.querySelectorAll('.pawn').forEach(el => el.remove());

  const pawnsByPosition = {};

  // Grupuj graczy według pozycji na planszy
  game.players.forEach(p => {
    const posIndex = game.positions[p.id];
    if (!pawnsByPosition[posIndex]) pawnsByPosition[posIndex] = [];
    pawnsByPosition[posIndex].push(p);
  });

  for (const posIndex in pawnsByPosition) {
    const pawns = pawnsByPosition[posIndex];
    const cellBtn = boardContainer.querySelector(`.cell[data-index="${posIndex}"]`);
    if (!cellBtn) continue;

    const { left, top, width, height } = cellBtn.getBoundingClientRect();
    const boardRect = boardContainer.getBoundingClientRect();
    const baseX = (left - boardRect.left + width / 2) / boardRect.width * 100;
    const baseY = (top  - boardRect.top  + height / 2) / boardRect.height * 100;

    // Dynamiczne przesunięcia w okręgu wokół środka pola
    const offsets = [];
    const radius = 0.4; // rozstaw w procentach — dostosuj jeśli chcesz ciaśniej/szerzej

    for (let j = 0; j < pawns.length; j++) {
      if (pawns.length === 1) {
        offsets.push([0, 0]); // jeden gracz → środek
      } else {
        const angle = (2 * Math.PI * j) / pawns.length;
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        offsets.push([dx, dy]);
      }
    }

    pawns.forEach((p, i) => {
      const img = document.createElement('div');
      img.classList.add('pawn');
      img.style.setProperty('--pawn-color', p.color);
      img.style.position = 'absolute';

      const [dx, dy] = offsets[i] || [0, 0];
      img.style.left = `${baseX + dx}%`;
      img.style.top  = `${baseY + dy}%`;

      // Dodaj nazwę gracza pod pionkiem
      const nameLabel = document.createElement('div');
      nameLabel.classList.add('player-name');
      nameLabel.textContent = p.name;
      img.appendChild(nameLabel);

      boardContainer.appendChild(img);
    });
  }
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

  window.cardActive = !!game.cardActive;
  renderPawns();
  startTimer(game.startTime);
  updateTurnIndicator(game.turnOrder[game.currentTurn]);
});
function animateValueChange(id, newValue) {
  const el = document.getElementById(id);
  if (!el) return;

  const oldValue = parseInt(el.textContent, 10) || 0;
  const className = newValue > oldValue ? 'value-change-up' :
                    newValue < oldValue ? 'value-change-down' : '';

  el.textContent = newValue;

  if (className) {
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), 1000);
  }
}

socket.on('updateInventory', ({ playerId, inventory }) => {
  if (playerId !== myId) return;

  animateValueChange('cash-count', inventory.cash);
  animateValueChange('supply-count', inventory.supply);
  animateValueChange('help-count', inventory.help);
  animateValueChange('arrest-count', inventory.arrest);

  console.log('[CLIENT] Zaktualizowano ekwipunek gracza:', inventory);
});
socket


//TUTAJ LOGIKA RUCHU KOSTKI CO BYŁO PIERWOTNIE W ODDZIELNYM SKRYPCIE
// after each roll
 socket.on('diceResult', ({ playerId, roll, positions, nextPlayerId }) => {
  if (roll === 0) {
    console.log(`[CLIENT] Pominięto turę gracza ${playerId}. Przekazanie tury do ${nextPlayerId}.`);
    game.currentTurn = game.turnOrder.indexOf(nextPlayerId);
    updateTurnIndicator(nextPlayerId);
    return;
  }

  console.log(`[CLIENT] diceResult: player=${playerId}, roll=${roll}, position=${positions[playerId]}, nextPlayer=${nextPlayerId}`);

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
    game.positions[playerId] = steps[i];
    renderPawns();
    i++;
    if (i < steps.length) {
      setTimeout(animateStep, 600);
    } else {
      game.positions = { ...positions };
      renderPawns(); // na wszelki wypadek
      if (positions[playerId] === 66 && playerId === myId) {
        console.log('[CLIENT] Gracz dotarł do mety – emitujemy playerReachedEnd');
        socket.emit('playerReachedEnd', { roomCode, playerId: myId });
      }
      game.currentTurn = game.turnOrder.indexOf(nextPlayerId);
      updateTurnIndicator(nextPlayerId);
    }
    window.game=game;
  }

  if (steps.length > 0) {
    animateStep();
  } else {
    game.currentTurn = game.turnOrder.indexOf(nextPlayerId);
    updateTurnIndicator(nextPlayerId);
  window.game=game;
  }

  // Kostka – animacja
  const cube = document.getElementById('cube');
  const rotations = {
    1: { x: 0,   y: 0   },
    2: { x: 0,   y: 180 },
    3: { x: 0,   y: -90 },
    4: { x: 0,   y: 90  },
    5: { x: 90,  y: 0   },
    6: { x: -90, y: 0   }
  };
  const extraX = (Math.floor(Math.random() * 4) + 3) * 360;
  const extraY = (Math.floor(Math.random() * 4) + 3) * 360;
  const finalX = extraX + rotations[roll].x;
  const finalY = extraY + rotations[roll].y;

  cube.style.transition = "transform 1.5s cubic-bezier(0.4, 1.4, 0.6, 1)";
  cube.style.transform  = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;

  renderPawns();
  updateTurnIndicator(nextPlayerId);
});

socket.on('showCard', ({ fieldIndex, fieldType, playerId }) => {
  if (playerId !== myId) return;
  console.log('[CLIENT] showCard received:', fieldIndex, fieldType);
  setTimeout(() => {
    showCardOverlay(fieldIndex, fieldType, playerId);
  }, 1000);
});
// globalne flagi i helpery już są: window.cardActive, window.updateTurnIndicator, window.game

// 1) gdy ktokolwiek otworzy kartę
socket.on('cardOpened', () => {
  window.cardActive = true;
  // przerysuj kostkę wg obecnej kolejki
  updateTurnIndicator(window.game.turnOrder[window.game.currentTurn]);
});

// 2) gdy ktokolwiek zamknie kartę
socket.on('cardClosed', () => {
  window.cardActive = false;
  updateTurnIndicator(window.game.turnOrder[window.game.currentTurn]);
});


// show whose turn, and enable/disable cube
function updateTurnIndicator(turnPlayerId) {
  const me = (turnPlayerId === myId);
  
  //let allowRoll = me;
  let allowRoll = me && !window.cardActive;
  if (me) {
    // sprawdzamy, czy mam aktywny skipTurn
    const mePlayer = game.players.find(p => p.id === myId);
    if (mePlayer?.inventory?.skipTurn > 0) {
      allowRoll = false;
    }
  }

  ///currentPlayerEl.textContent = me
  // (allowRoll ? 'Twoja kolej!' : 'Pomijasz turę')
   // : 'Kolej gracza ' + turnPlayerId;
if (me) {
    currentPlayerEl.textContent = allowRoll ? 'Twoja kolej!' : 'Pomijasz turę';
  } else {
    // Znajdź w tablicy graczy obiekt o danym ID i pobierz jego nazwę
    const nextPlayer = game.players.find(p => p.id === turnPlayerId);
    const nextName   = nextPlayer ? nextPlayer.name : turnPlayerId;
    currentPlayerEl.textContent = `Kolej gracza ${nextName}`;
  }
  cube.style.pointerEvents = allowRoll ? 'auto' : 'none';
  cube.style.opacity = allowRoll ? '1' : '0.5';
}
window.updateTurnIndicator = updateTurnIndicator;
window.game = game;
// click on cube → attempt to roll
  cube.addEventListener('click', () => {
    if (gameEnded) {
      console.log('[CLIENT] Rzut zablokowany – gra zakończona.');
      return;
    }

    console.log('[CLIENT] click on cube, myId=', myId);
    socket.emit('rollDice', { roomCode });
    console.log('[CLIENT] emitted rollDice');
  });

    socket.on('popupMessage', ({ text, type }) => {
    if (typeof showCardMessage === 'function') {
      showCardMessage(text, type || 'neutral');
    } else {
      alert(text); // awaryjnie
    }
  });
    socket.on('endGame', () => {
      console.log('[CLIENT] Otrzymano sygnał końca gry');

      gameEnded = true;
      if (timerInterval) clearInterval(timerInterval);

      // === Overlay z ciemnym tłem ===
      const overlay = document.createElement('div');
      overlay.id = 'game-end-overlay';

      const message = document.createElement('div');
      message.id = 'game-end-message';
      message.textContent = '🎉 KONIEC ROZGRYWKI 🎉';

      overlay.appendChild(message);
      document.body.appendChild(overlay);

      // Usuń po 3 sekundach
      setTimeout(() => {
        overlay.remove();
        // TODO: można pokazać ekran wyników
      }, 3000);

      // Konfetti
      generateConfetti(150);

      function generateConfetti(count) {
        for (let i = 0; i < count; i++) {
          const confetti = document.createElement('div');
          confetti.classList.add('confetti-piece');
          confetti.style.left = `${Math.random() * 100}vw`;
          confetti.style.animationDelay = `${Math.random() * 0.5}s`;
          confetti.style.setProperty('--hue', Math.floor(Math.random() * 360));
          document.body.appendChild(confetti);
          setTimeout(() => confetti.remove(), 4000);
        }
      }
    });
});
window.socket = socket;
window.myId = myId;
