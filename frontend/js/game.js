// game.js
document.addEventListener('DOMContentLoaded', () => {
const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('code');
console.log('[CLIENT] Script loaded, roomCode=', roomCode);
// cache DOM nodes
const timerEl         = document.getElementById('timer');
const storedPlayerId = sessionStorage.getItem('playerId') 
                       || localStorage.getItem('playerId');
const boardContainer  = document.querySelector('.board-container');
const cube            = document.getElementById('cube-container');

const currentPlayerEl = document.getElementById('current-player');
//const oldPlayerId = sessionStorage.getItem('playerId');
//let myId = oldPlayerId;   
let myId = storedPlayerId;
socket.emit('joinGame', { roomCode, oldPlayerId:myId });
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
  //window.game = game;
  console.log('[CLIENT:initGame] received', game);
  console.log('[CLIENT:initGame] turnOrder =', game.turnOrder, 'currentTurn =', game.currentTurn);

  if(!myId){

  }

  sessionStorage.setItem('playerId', myId);
  localStorage.setItem('playerId', myId);
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
  updateTurnIndicator(game.turnOrder[game.currentTurn]);
});

// 2) gdy ktokolwiek zamknie kartę
socket.on('cardClosed', () => {
  window.cardActive = false;
  updateTurnIndicator(game.turnOrder[game.currentTurn]);
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
    currentPlayerEl.textContent = `Kolej gracza ${nextName}`;;
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
socket.on('endGame', ({ scores }) => {
  console.log('[CLIENT] Otrzymano dane końcowe:', scores);

  const overlay = document.createElement('div');
  overlay.id = 'game-end-overlay';
  document.body.appendChild(overlay);

  // 1. NAPIS animowany
  const message = document.createElement('div');
  message.id = 'game-end-message';
  message.textContent = '🎉 Koniec rozgrywki! 🎉';
  overlay.appendChild(message);

  // 2. Po 3 sekundach: konfetti + tabela + opis
  setTimeout(() => {
    //  Konfetti
      for (let i = 0; i < 80; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}vw`;
        piece.style.animationDelay = `${Math.random() * 2}s`;
        piece.style.backgroundColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
        piece.style.transform = `rotate(${Math.random() * 360}deg) scale(${Math.random() * 1.2 + 0.6})`;
        piece.style.borderRadius = `${Math.random() < 0.5 ? '50%' : '0%'}`;
        document.body.appendChild(piece);

        setTimeout(() => piece.remove(), 5000);
      }

    // Tabela wyników
    const table = document.createElement('table');
    table.id = 'results-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Miejsce</th>
        <th>Gracz</th>
        <th>Punkty</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    scores.sort((a, b) => b.score - a.score).forEach((s, index) => {
      const row = document.createElement('tr');
      row.classList.add('result-row');
      setTimeout(() => {
        row.style.animationDelay = `${index * 0.3}s`;
        row.classList.add('animate');
      }, 0);
      let medal = '';
      if (index === 0) medal = '🥇';
      else if (index === 1) medal = '🥈';
      else if (index === 2) medal = '🥉';
      else medal = (index + 1).toString();

      row.innerHTML = `
        <td>${medal}</td>
        <td>${s.name}</td>
        <td>${s.score}</td>
      `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    overlay.appendChild(table);

    //  Opis punktacji
    const desc = document.createElement('div');
    desc.classList.add('score-description');
    desc.innerHTML = `
      <p><strong>Jak graczom przyznano punkty:</strong></p>
      <ul>
        <li> 2 pkt za każde 500 zł w ekwipunku</li>
        <li> 4 pkt za każdy znacznik zaopatrzenia</li>
        <li> 10 pkt za każdy znacznik pomocy</li>
        <li> –10 pkt za każdy znacznik aresztu</li>
        <li> +10 pkt za dotarcie do mety jako pierwszy</li>
      </ul>
    `;
    overlay.appendChild(desc);
  }, 3000);
});

});
window.socket = socket;
window.myId = myId;
