// Tutaj będzie logika rozgrywki (np. system rund, rzuty kostką, itp.).
console.log('Gra się rozpoczęła! Do zaimplementowania.');
const socketGame = io();

 // Przykład jak złapać kliknięcie i rozpoznać pole:
    document.querySelectorAll('.cell').forEach(btn => {
      btn.addEventListener('click', e => {
        const field = e.currentTarget.dataset.field;
        console.log('Kliknięto pole:', field);
        // tu dorzuć swoją logikę JS
      });
    });

//TIMER
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

setInterval(updateTimer, 1000); // Aktualizacja co 1 sekundę


//DICE
function rollDice() {
  const cube = document.getElementById('cube');
  const result = Math.floor(Math.random() * 6) + 1;

  const rotations = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: 180 },
    3: { x: 0, y: -90 },
    4: { x: 0, y: 90 },
    5: { x: 90, y: 0 },
    6: { x: -90, y: 0 }
  };

  // dodajemy CHAOTYCZNE szybkie obroty (losowe pełne)
  const extraX = Math.floor(Math.random() * 4 + 3) * 360; // 3–6 obrotów
  const extraY = Math.floor(Math.random() * 4 + 3) * 360; // 3–6 obrotów

  const finalX = extraX + rotations[result].x;
  const finalY = extraY + rotations[result].y;

  // ustawiamy super szybką animację
  cube.style.transition = "transform 0.7s cubic-bezier(0.4, 1.4, 0.6, 1)";

  // zmieniamy transformację
  cube.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;

  console.log("Wyrzucono:", result);
}