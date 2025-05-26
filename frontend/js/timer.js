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