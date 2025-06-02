// frontend/js/game.js

console.log('Gra się rozpoczęła!');

// === 1) Połączenie z Socket.IO i przygotowanie zmiennych ===
const socketGame = io();

// Zmienna, w której będziemy trzymać stan gry przesłany przez serwer
let currentGameState = null;

// Pobranie kodu pokoju z URL (np. game.html?code=ABCD)
const urlParams = new URLSearchParams(window.location.search);
const roomCode  = urlParams.get('code');

// Po załadowaniu DOM dołączamy się do istniejącej gry
window.addEventListener('DOMContentLoaded', () => {
  if (!roomCode) {
    alert('Brak kodu pokoju! Nie można dołączyć do gry.');
    return;
  }
  // Wysyłamy event do serwera, żeby wrzucił nas do pokoju i od razu zwrócił stan gry
  socketGame.emit('joinGame', { roomCode });
});


// === 2) OBSŁUGA EVENTÓW Z SERVERA ===

// Kiedy dostajemy od serwera event 'gameStarted' (razem z początkowym stanem gry):
socketGame.on('gameStarted', (gameState) => {
  // 1) Zachowujemy go w currentGameState
  currentGameState = gameState;

  // 2) Rysujemy pionki w odpowiednich kolorach i pozycjach
  initializeBoard(gameState);

  // 3) Wyświetlamy, czyj jest teraz ruch
  updateCurrentPlayer(gameState);

  // 4) Aktywujemy lub dezaktywujemy kostkę w zależności od tego, czy to moja tura
  toggleDice( isMyTurn(gameState) );

  // Log do debugowania:
  console.log(
    'Otrzymano gameStarted:',
    'currentTurn=', gameState.currentTurn,
    'turnOrder=', gameState.turnOrder,
    'to moje id=', socketGame.id
  );
});

// Po każdym ruchu dowolnego gracza dostaniemy 'gameStateUpdate'
socketGame.on('gameStateUpdate', (gameState) => {
  currentGameState = gameState;
  // Przesuwamy pionki w ich nowych pozycjach
  updatePawnsPosition(gameState.positions);
  // Odświeżamy, czyj teraz ruch
  updateCurrentPlayer(gameState);
  // Włączamy/wyłączamy kostkę w zależności od tego, czy to moja tura
  toggleDice( isMyTurn(gameState) );
});

// Jeśli serwer odrzuci ruch (nie Twoja tura), możemy pokazać alert
socketGame.on('moveRejected', (msg) => {
  alert(msg || 'Twój ruch został odrzucony.');
  if (currentGameState) {
    updateCurrentPlayer(currentGameState);
    toggleDice( isMyTurn(currentGameState) );
  }
});


// === 3) POMOCNICZE FUNKCJE DO OBSŁUGI ROZGRYWKI ===

/**
 * Sprawdza, czy teraz jest tura aktualnego klienta.
 * @param {Object} gameState – { players: [...], positions: {...}, turnOrder: [...], currentTurn: <liczba> }
 * @returns {boolean}
 */
function isMyTurn(gameState) {
  // turnOrder to tablica playerId w kolejności, currentTurn – 1-based index.
  const idx             = gameState.currentTurn - 1; 
  const currentPlayerId = gameState.turnOrder[idx];
  return (currentPlayerId === socketGame.id);
}

/**
 * Włącza lub wyłącza możliwość kliknięcia kostki (#cube).
 * Jeśli enabled==true: kostka ma pointer-events:auto i opacity:1.
 * Jeśli enabled==false: pointer-events:none oraz półprzezroczystość.
 * @param {boolean} enabled
 */
function toggleDice(enabled) {
  const cube = document.getElementById('cube');
  if (!cube) return;
  cube.style.pointerEvents = enabled ? 'auto' : 'none';
  cube.style.opacity       = enabled ? '1' : '0.5';
}

/**
 * Oblicza środek elementu .cell RELATYWNIE do lewego-górnego rogu .board-container.
 * Zwraca obiekt { x, y } w pikselach AUF board-container.
 */
function getCellCenter(cellEl) {
  // 1) Współrzędne planszy względem viewportu
  const boardContainer = document.querySelector('.board-container');
  const boardRect      = boardContainer.getBoundingClientRect();

  // 2) Współrzędne tego jednego przycisku .cell
  const cellRect       = cellEl.getBoundingClientRect();

  // 3) Środek tego przycisku względem viewportu
  const centerXViewport = cellRect.left + cellRect.width / 2;
  const centerYViewport = cellRect.top  + cellRect.height / 2;

  // 4) Odejmij offset planszy, by uzyskać współrzędne RELATYWNE do planszy
  return {
    x: centerXViewport - boardRect.left,
    y: centerYViewport - boardRect.top
  };
}

/**
 * Inicjalizuje planszę: tworzy <div class="pawn"> dla każdego gracza
 * i od razu wywołuje updatePawnsPosition, by ustawić je na polu Start (index=1).
 * @param {Object} gameState 
 */
function initializeBoard(gameState) {
  // Usuń stare pionki, jeśli jakieś zostały
  document.querySelectorAll('.pawn').forEach(el => el.remove());

  const boardContainer = document.querySelector('.board-container');
  if (!boardContainer) return;

  // Dla każdego gracza w gameState.players utwórz <div class="pawn">
  gameState.players.forEach(player => {
    const pawnEl = document.createElement('div');
    pawnEl.classList.add('pawn');
    pawnEl.id = `pawn-${player.id}`;
    pawnEl.style.backgroundColor = player.color;
    boardContainer.appendChild(pawnEl);
  });

  // Na starcie każdy ma pozycję = 1 (pole Start), więc wywołuj raz:
  updatePawnsPosition(gameState.positions);
}

/**
 * Przesuwa wszystkie pionki zgodnie z obiektem positions,
 * gdzie klucz = playerId, a wartość = indeks pola (1–66).
 * @param {Object} positions – np. { "socketId1": 1, "socketId2": 1, ... }
 */
function updatePawnsPosition(positions) {
  for (const [playerId, fieldIndex] of Object.entries(positions)) {
    const pawnEl = document.getElementById(`pawn-${playerId}`);
    if (!pawnEl) continue;

    // Znajdź przycisk .cell[data-index="{fieldIndex}"]
    const cellEl = document.querySelector(`.cell[data-index="${fieldIndex}"]`);
    if (!cellEl) continue;

    // Oblicz środek tego pola w układzie planszy:
    const { x: relX, y: relY } = getCellCenter(cellEl);

    pawnEl.style.left = `${relX}px`;
    pawnEl.style.top  = `${relY}px`;
  }
}

/**
 * Aktualizuje w #current-player informację, który gracz ma ruch.
 * @param {Object} gameState
 */
function updateCurrentPlayer(gameState) {
  const idx             = gameState.currentTurn - 1;
  const currentPlayerId = gameState.turnOrder[idx];
  const playerObj       = gameState.players.find(p => p.id === currentPlayerId);
  const displayName     = playerObj ? playerObj.name : '—';
  const labelEl         = document.getElementById('current-player');
  if (labelEl) {
    labelEl.textContent = `Teraz ruch: ${displayName}`;
  }
}


// === 4) TIMER ===
let seconds = 0;
function updateTimer() {
  const timerElement = document.getElementById("timer");
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formattedTime = 
    String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  timerElement.textContent = formattedTime;
  seconds++;
}
setInterval(updateTimer, 1000); // co sekundę


// === 5) RZUT KOSTKĄ I WYSŁANIE RUCHU DO SERWERA ===

/**
 * Wywoływane przy kliknięciu kostki (#cube). 
 * Jeśli to moja tura, animuje kostkę, oblicza newPos i wysyła 'playerMove'.
 */
function rollDice() {
  // Jeśli nie znamy stanu gry lub nie moja tura – wychodzimy
  if (!currentGameState || !isMyTurn(currentGameState)) {
    return;
  }

  const cube = document.getElementById('cube');
  if (!cube) return;

  // 1) Losujemy wynik 1–6
  const result = Math.floor(Math.random() * 6) + 1;

  // 2) Ustalamy obrót sześcianu
  const rotations = {
    1: { x: 0,   y: 0   },
    2: { x: 0,   y: 180 },
    3: { x: 0,   y: -90 },
    4: { x: 0,   y: 90  },
    5: { x: 90,  y: 0   },
    6: { x: -90, y: 0   }
  };
  const extraX = (Math.floor(Math.random() * 4) + 3) * 360; // 3–6 pełnych obrotów
  const extraY = (Math.floor(Math.random() * 4) + 3) * 360;
  const finalX = extraX + rotations[result].x;
  const finalY = extraY + rotations[result].y;

  cube.style.transition = "transform 0.7s cubic-bezier(0.4, 1.4, 0.6, 1)";
  cube.style.transform  = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;

  // 3) Po zakończeniu animacji (700ms) obliczamy newPos i wysyłamy do serwera
  setTimeout(() => {
    const myId  = socketGame.id;
    const oldPos = currentGameState.positions[myId];
    const maxIndex = 66;

    let newPos = oldPos + result;
    if (newPos > maxIndex) {
      newPos = newPos - maxIndex; // zawinięcie po "Meta"
    }

    socketGame.emit('playerMove', {
      roomCode,
      playerId: myId,
      newPos
    });

    // Od razu wyłączamy kostkę, by nie dogrywać kilku ruchów przed odpowiedzią
    toggleDice(false);
  }, 700);

  console.log("Wyrzucono:", result);
}

// Aby onclick="rollDice()" w HTML mogło zadziałać, musimy tę funkcję przypiąć globalnie:
window.rollDice = rollDice;
