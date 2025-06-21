function getSocket() {
  return window.socket || io(); // fallback awaryjny, jeśli socket jeszcze nie ustawiony
}
function getMyId() {
  return window.myId;
}
function getRoomCode() {
  return window.roomCode;
}
function getCurrentCash() {
  const el = document.getElementById('cash-count');
  return el ? parseInt(el.textContent, 10) || 0 : 0;
}

function showCardMessage(text, type = 'success') { //chmurka informacyjna
  const msgBox = document.getElementById('card-message');
  if (!msgBox) return;

  msgBox.textContent = text;
  msgBox.classList.remove('hidden', 'success', 'fail');
  msgBox.classList.add('show', type);

  setTimeout(() => {
    msgBox.classList.remove('show');
  }, 3000);
}

const CARD_DATA = {
  handel: {
    front: 'cards/red_handel.png',
    back: 'cards/red_b_handel.png',
    options: [
      { label: 'Kup 1 znacznik', effect: { cash: -500, supply: 1 } },
      { label: 'Kup 2 znaczniki', effect: { cash: -1000, supply: 2 } },
      { label: 'Kup 3 znaczniki', effect: { cash: -2500, supply: 3 } },
      { label: 'Rezygnuję', effect: {} }
    ]
  },
  szkolenie_1: {
    front: 'cards/red_szkolenie.png',
    back: 'cards/red_b_szkoleniei.png',
    options: [
      { label: '968261', effect: { cash: -500 } },
      { label: '968251', effect: { cash: -500 } },
      { label: '958251', effect: { cash: +1000} },
      { label: '958254', effect: { cash: -500} }
    ] 
  },
  AK_1: {
    front: 'cards/red_ak.png',
    back: 'cards/red_b_ak1.png',
    // buttons: ['Tu będzie rzut kostką']
        options: [
      { label: 'Kup 1 znacznik', effect: { cash: -500, supply: 1 } },
      { label: 'Kup 2 znaczniki', effect: { cash: -1000, supply: 2 } },
      { label: 'Kup 3 znaczniki', effect: { cash: -2500, supply: 3 } },
      { label: 'Nie stać mnie', effect: {} }
    ]
  },
  lapanka: {
    front: 'cards/red_lapanka.png',
    back: 'cards/red_b_lapanka.png',
    // buttons: ['wykupujemy!', 'odbijamy!']
        options: [
      { label: 'Wykupić!', effect: { cash: -500} },
      { label: 'Odbić!', effect: { } },
        ]
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
  }, // TU ZACZEŁAM ZMIENIAĆ
  ataknaposterunek:{
    front: 'cards/red_ataknaposterunek.png',
    back: 'cards/red_b_ataknaposterunek.png',
    buttons: ['tu będzie rzut kostką']
  },
  zrzutowisko: {
    front: 'cards/red_zrzutowisko.png',
    back: 'cards/red_b_zrzutowisko.png',
    buttons: ['tu będzie rzut kostką']
  },
  pomoc_2: {
    front: 'cards/red_pomocii.png',
    back: 'cards/red_b_pomocii.png',
    buttons: ['Tak!', 'Nie']
  },
  szkolenie_2: {
    front: 'cards/red_szkolenie.png',
    back: 'cards/red_b_szkolenie.png',
    buttons: ['Odp zła', 'odp zła', 'Odp dobra']
  },
  AK_3: {
    front: 'cards/red_ak.png',
    back: 'cards/red_b_ak3.png',
    buttons: ['Tak!', 'Nie']
  },
  wsypa: {
    front: 'cards/red_wyspa.png', //LITERÓWKA - W GRAFICE KART TEŻ
    back: 'cards/red_b_wyspa.png',
    buttons: ['Dalej']
  },
  szkolenie_3: {
    front: 'cards/red_szkolenie.png',
    back: 'cards/red_b_szkolenie.png',
    buttons: ['Odp zła', 'odp zła', 'Odp dobra']
  },
  AK_4: {
    front: 'cards/red_ak.png',
    back: 'cards/red_b_ak4.png',
    buttons: ['tu będzie rzut kostką']
  },
  //CZARNE
  lapanka_b: {
    front: 'cards/black_lapanka.png',
    back: 'cards/black_b_lapanka.png',
    buttons: ['wykupujemy!', 'odbijamy!']
  },
  burza_b: {
    front: 'cards/black_burza.png',
    back: 'cards/black_b_burzai.png',
    buttons: ['tu będzie rzut kostką']
  },
  szkolenie_1_b:{
    front: 'cards/black_szkolenie.png',
    back: 'cards/black_b_szkolenie.png',
    buttons: ['Odp zła', 'odp zła', 'Odp dobra']
  },
  burza_2_b: {
    front: 'cards/black_burza.png',
    back: 'cards/black_b_burzaii.png',
    buttons: ['atak', 'ukrycie']
  },
  patrol_b: {
    front: 'cards/black_patrol.png',
    back: 'cards/black_b_patrol.png',
    buttons: ['tu będzie rzut kostką']
  },
  szkolenie_2_b:{
    front: 'cards/black_szkolenie.png',
    back: 'cards/black_b_szkolenie.png',
    buttons: ['Odp zła', 'odp zła', 'Odp dobra']
  },
  pomoc_1_b:{
    front: 'cards/black_pomociii.png',
    back: 'cards/black_b_pomociii.png',
    buttons: ['TAK!', 'NIE']
  },
  burza_3_b:{
    front: 'cards/black_burza.png',
    back: 'cards/black_b_burzaiii.png',
    buttons: ['X']
  },
  zrzutowisko_b:{
    front: 'cards/black_zrzutowisko.png',
    back: 'cards/black_b_zrzutowisko.png',
    buttons: ['tu będzie rzut kostką']
  },
  ataknaposterunek_b:{
    front: 'cards/black_ataknaposterunek.png',
    back: 'cards/black_b_ataknaposterunek.png',
    buttons: ['tu będzie rzut kostką']
  },
  handel_b:{
    front: 'cards/black_handel.png',
    back: 'cards/black_b_handel.png',
    options: [
      { label: 'Kup 1 znacznik', effect: { cash: -500, supply: 1 } },
      { label: 'Kup 2 znaczniki', effect: { cash: -1000, supply: 2 } },
      { label: 'Kup 3 znaczniki', effect: { cash: -2500, supply: 3 } },
      { label: 'Nie stać mnie', effect: {} }
    ]
  },
  ataknamagazyn_b:{
    front: 'cards/black_ataknamagazyn.png',
    back: 'cards/black_b_ataknamagazyn.png',
    buttons: ['TAK!', 'NIE']
  },
  pomoc_2_b:{
    front: 'cards/black_pomociv.png',
    back: 'cards/black_b_pomociv.png',
    buttons: ['TAK!', 'NIE']
  },
  burza_4_b:{
    front: 'cards/black_burza.png',
    back: 'cards/black_b_burzaiv.png',
    buttons: ['TAK!', 'NIE']
  },
  burza_5_b:{
    front: 'cards/black_burza.png',
    back: 'cards/black_b_burzav.png',
    buttons: ['Tu będzie rzut kostką']
  },
  ujawnienie_b:{
    front: 'cards/black_ujawnienie.png',
    back: 'cards/black_b_ujawnienie.png',
    buttons: ['Tu będzie rzut kostką']
  },
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

// Sprawdź czy to karta z 'options' (np. handel), czy zwykła z 'buttons'
const options = data.options || data.buttons.map(label => ({ label, effect: {} }));

options.forEach(option => {
  const btn = document.createElement('button');
  btn.textContent = option.label;

    btn.addEventListener('click', () => {
    console.log(`[overlay] Kliknięto: ${option.label}`);
    const change = option.effect;
    const currentCash = getCurrentCash(); // dodana na górze
    const cost = change?.cash || 0;

    if (cost < 0 && currentCash + cost < 0) {  // Gracza nie stać 

      console.log('[overlay] Gracza nie stać na tę opcję');
      showCardMessage('NIE MASZ WYSTARCZAJĄCO PIENIĘDZY!', 'fail');
      return; // przerywamy wykonanie
    }
      if (fieldType === 'szkolenie_1') { // Szkolenie - pole 2
      if (change.cash === +1000) {
        showCardMessage('Dobra odpowiedź! +1000 zł', 'success');
      } else if (change.cash === -500) {
        showCardMessage('Zła odpowiedź! -500 zł', 'fail');
      }
    }
    // if (fieldType === 'AK_1') - // AK - pole 3
      // if (fieldType === 'lapanka') {
      //   if (change.cash === -500) {
      //     showCardMessage('Tranzakcja! -500 zł', 'neutral');
      //   } else if ()
      // }
    if (change && Object.keys(change).length > 0) {
      console.log('[overlay] Wysyłam żądanie zmiany ekwipunku:', change);
      getSocket().emit('applyCardEffect', {
        playerId,
        change
      });
    } else {
      console.log('[overlay] Brak efektu tylko zamykam');
    }
    overlay.remove();
  });
    buttonWrapper.appendChild(btn);
  });
  overlay.appendChild(buttonWrapper);
  document.body.appendChild(overlay);
  // Obrót po opóźnieniu - karta
  setTimeout(() => {
    card.style.transform = 'rotateY(180deg)';
  }, 1000);
}
