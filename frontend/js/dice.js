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
  cube.style.transition = "transform 1.5s cubic-bezier(0.4, 1.4, 0.6, 1)";

  // zmieniamy transformację
  cube.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;

  console.log("Wyrzucono:", result);
}
