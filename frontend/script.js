const socket = io();
let currentRoomCode = null;
function goHome() {
    hideAllScreens();
    document.getElementById('main-screen').classList.remove('hidden');
    currentMode = null;
}

function hideAllScreens() {
    document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
}
function showJoinScreen() {
    hideAllScreens();
    document.getElementById('join-screen').classList.remove('hidden');
}
function promptAdminPassword() {
    const correctPassword = "hasloadmin";
    const userInput = prompt("Podaj hasło administratora:");

    if (userInput === correctPassword) {
        window.location.href = "AdminPanel.html";
    } else {
        alert("Błędne hasło!");
    }
}
function createRoom() {
    socket.emit('createRoom', (response) => {
        if (response.success) {
            currentRoomCode = response.roomCode;
            document.getElementById('room-code').innerText = 'Kod pokoju: ' + response.roomCode;
            // Pokazuj co jakiś czas liczbę użytkowników w pokoju
            pollRoomUserCount();
        } else {
            alert('Nie udało się utworzyć pokoju.');
        }
    });
}
// Funkcja do okresowego sprawdzania liczby graczy
function pollRoomUserCount() {
    const interval = setInterval(() => {
        if (!currentRoomCode) return;
        socket.emit("getRooms", (rooms) => {
            // Pokazuj przycisk jeśli pokój nadal istnieje i ma ≥ 2 graczy
            socket.emit("getRoomDetails", currentRoomCode, (data) => {
                if (data && data.users.length >= 2) {
                    document.getElementById('start-game-btn').style.display = "inline-block";
                } else {
                    document.getElementById('start-game-btn').style.display = "none";
                }
            });
        });
    }, 2000); // co 2 sekundy
}
// Rozpoczęcie gry
function startGame() {
    if (!currentRoomCode) return;
    socket.emit("startGame", currentRoomCode);
}
window.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("room-list")) {
        socket.emit("getRooms", (rooms) => {
            const list = document.getElementById("room-list");
            list.innerHTML = "";
            rooms.forEach(code => {
                const li = document.createElement("li");
                li.textContent = code;
                list.appendChild(li);
            });
        });
    }
});

function joinRoom() {
    const roomCode = document.getElementById("room-code-input").value.trim().toUpperCase();
    const userName = document.getElementById("username-input").value.trim();

    if (!roomCode || !userName) {
        alert("Wpisz imię i kod pokoju.");
        return;
    }

    socket.emit("joinRoom", { roomCode, userName }, (response) => {
        if (response.success) {
            alert("Dołączono do pokoju: " + roomCode);
            console.log("Kliknięto przycisk Dołącz");
            // Można tu zapisać dane np. w sessionStorage do użycia w grze:
            sessionStorage.setItem("roomCode", roomCode);
            sessionStorage.setItem("userName", userName);
            // Czekamy aż admin rozpocznie grę
        } else {
            alert("Błąd: " + response.message);
        }
    });

    socket.on("gameStarted", () => {
        window.location.href = "Game.html";
    });

    window.onload = function() {
    const logo = document.querySelector('.logo');
    const backgroundContainer = document.querySelector('.background-container');

    if (logo && backgroundContainer) {
        const logoWidth = logo.offsetWidth;
        backgroundContainer.style.width = `${logoWidth + 40}px`; // Szerokość logo + padding
    }
};
}
function showInstructionOverlay() {
  fetch('pages/instruction.html')
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
// Załaduj podstronę do #main-content i opcjonalnie pomiń zapis historii
function loadPage(pageName, skipHistory = false) {
  fetch(`pages/${pageName}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById('main-content').innerHTML = html;

      // Dodaj wpis do historii przeglądarki, chyba że mamy skip
      if (!skipHistory) {
        history.pushState({ page: pageName }, '', `#${pageName}`);
      }
    })
    .catch(err => {
      console.error('Błąd ładowania strony:', err);
    });
}

// Obsługa wstecz w historii (działa z przyciskiem ⟵ lub przeglądarką)
window.addEventListener('popstate', (event) => {
  const page = event.state?.page || '';
  if (page) {
    loadPage(page, true); // Załaduj podstronę bez zapisywania historii
  } else {
    // Brak strony – wróć do menu głównego
    document.getElementById('main-content').innerHTML = `
      <div class="mode-selection">
        <button class="mode-btn post-workshop" onclick="loadPage('WorkShopPanel')">Uczestnik Warsztatów</button>
        <button class="mode-btn hybrid" onclick="loadPage('UserPanel')">Dla użytkownika z zewnątrz</button>
      </div>
    `;
  }
});

// Obsługa przycisku powrotu do poprzedniej strony
function goBack() {
  history.back();
}

// Obsługa przycisku powrotu do strony głównej
function goHome() {
  history.pushState(null, '', '#'); // reset URL
  // Przywróć widok główny
  document.getElementById('main-content').innerHTML = `
    <div class="mode-selection">
      <button class="mode-btn post-workshop" onclick="loadPage('WorkShopPanel')">Uczestnik Warsztatów</button>
      <button class="mode-btn hybrid" onclick="loadPage('UserPanel')">Dla użytkownika z zewnątrz</button>
    </div>
  `;
}

// Przy pierwszym załadowaniu strony – wczytaj z hash
window.addEventListener('DOMContentLoaded', () => {
  const pageFromHash = window.location.hash?.substring(1);
  if (pageFromHash) {
    loadPage(pageFromHash, true);
  }
});