const CARD_DATA = {
  handel: {
    front: 'cards/red_handel.png',          // grafika przodu
    back: 'cards/red_b_handel.png',         // grafika tyłu
    buttons: ['Kup 1 znacznik', 'Kup 2 znaczniki', 'Nie Kup 3 znaczniki',' X']  // teksty przycisków
  },
  szkolenie_1: {
    front: 'cards/red_szkolenie.png',
    back: 'cards/red_b_szkolenie.png',
    buttons: ['Odp zła', 'odp zła', 'Odp dobra']
  },
  AK_1: {
    front: 'cards/red_ak.png',
    back: 'cards/red_b_ak1.png',
    buttons: ['Tu będzie rzut kostką']
  },
  lapanka: {
    front: 'cards/red_lapanka.png',
    back: 'cards/red_b_lapanka.png',
    buttons: ['wykupujemy!', 'odbijamy!']
  },
  pomoc_1: {
    front: 'cards/red_pomoci.png',
    back: 'cards/red_b_pomoci.png',
    buttons: ['Pomagamy!', 'Nie pomagamy']
  },
  AK_2: {
    front: 'cards/red_ak.png',
    back: 'cards/red_b_ak2.png',
    buttons: ['Tak!', 'Nie']
  },
  ataknamagazyn: {
    front: 'cards/red_ataknamagazyn.png',
    back: 'cards/red_b_ataknamagazyn.png',
    buttons: ['Tak!', 'Nie']
  },
  patrol: {
    front: 'cards/red_patrol.png',
    back: 'cards/red_b_patrol.png',
    buttons: ['tu będzie rzut kostką']
  }
  // Dodaj więcej kart w tym samym stylu - musi być zgodne z ifami w serwer js i odpowiednie png z folderu cards
};





function showCardOverlay(fieldIndex, fieldType, playerId) {
  const data = CARD_DATA[fieldType];
  if (!data) {
    console.error('[overlay] Brak danych dla typu:', fieldType);
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'card-overlay';

  const cardContainer = document.createElement('div');
  cardContainer.classList.add('card-container');

  const card = document.createElement('div');
  card.classList.add('card');

  const front = document.createElement('img');
  front.src = data.front;
  front.classList.add('card-face', 'card-front');

  const back = document.createElement('img');
  back.src = data.back;
  back.classList.add('card-face', 'card-back');

  card.appendChild(front);
  card.appendChild(back);
  cardContainer.appendChild(card);
  overlay.appendChild(cardContainer);

  // Przyciski
  const buttonWrapper = document.createElement('div');
  buttonWrapper.id = 'card-buttons';

  data.buttons.forEach(label => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      console.log(`[overlay] Kliknięto: ${label}`);
      overlay.remove(); // zamknij overlay po kliknięciu
    });
    buttonWrapper.appendChild(btn);
  });

  overlay.appendChild(buttonWrapper);
  document.body.appendChild(overlay);

  // Obrót po opóźnieniu
  setTimeout(() => {
    card.style.transform = 'rotateY(180deg)';
  }, 1000);
}
