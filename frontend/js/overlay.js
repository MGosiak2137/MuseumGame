window.showCardMessage = showCardMessage

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
  msgBox.classList.remove('hidden', 'success', 'fail', 'neutral');
  msgBox.classList.add('show', type);

  setTimeout(() => {
    msgBox.classList.remove('show');
  }, 3500);
}
function showCardDice(callback) {
  // usuń zawartość overlaya
  document.querySelector('.card-buttons')?.remove(); // przyciski

  const container = document.createElement('div');
  container.id = 'card-dice-container';

  const cube = document.createElement('div');
  cube.id = 'card-cube';

  // Dodaj ścianki z cyframi (z obróconym tekstem, by nie był w lustrzanym odbiciu)
  ['front','back','left','right','top','bottom'].forEach((face, i) => {
    const f = document.createElement('div');
    f.className = `face ${face}`;
    f.innerHTML = `<span style="transform: rotateY(180deg); display: inline-block;">${i + 1}</span>`;
    cube.appendChild(f);
  });

  container.appendChild(cube);
  document.querySelector('.card')?.appendChild(container);

  // Losujemy wartość
  const roll = Math.floor(Math.random() * 6) + 1;
  console.log('[ZIELONA KOSTKA] Wylosowano:', roll);

  const rotationMap = {
    1: {x: 0,   y: 0},
    2: {x: 0,   y: 180},
    4: {x: 0,   y: -90},
    3: {x: 0,   y: 90},
    6: {x: 90,  y: 0},
    5: {x: -90, y: 0}
  };

  const extraX = (Math.floor(Math.random() * 3) + 3) * 360;
  const extraY = (Math.floor(Math.random() * 3) + 3) * 360;
  const finalX = extraX + rotationMap[roll].x;
  const finalY = extraY + rotationMap[roll].y;

  // Animacja
  setTimeout(() => {
    cube.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;
  }, 1000);

  // Po zakończeniu animacji
  setTimeout(() => {
    container.remove();
    callback(roll);
  }, 3500);
}



const CARD_DATA = {
  handel: {
    front: 'cards/red_handel.png',
    back: 'cards/red_b_handel.png',
    options: [
      { label: 'Kup 1 znacznik', effect: { cash: -500, supply: 1 } },
      { label: 'Kup 2 znaczniki', effect: { cash: -1000, supply: 2 } },
      { label: 'Kup 5 znaczników', effect: { cash: -2500, supply: 5 } },
      { label: 'Rezygnujemy z zakupu', effect: {cash: -0, supply: 0} }
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
      options: [
    { label: 'Polska Walcząca', effect: { cash: +1000} },
    { label: 'Powstanie Warszawskie', effect: { cash: -500} },
    { label: 'Pierwsza Wojna', effect: { cash: -500} },
    { label: 'Polska Waleczna', effect: { cash: -500} },
  ]
},
  lapanka_b: {
    front: 'cards/black_lapanka.png',
    back:  'cards/black_b_lapanka.png',
    options: [{ label: 'Rzucamy kostką!', effect: {} }]
  },
  pomoc_1: {
    front: 'cards/red_pomoci.png',
    back: 'cards/red_b_pomoci.png',
    options : [
      { label: 'Pomagamy!', effect: {} },
      { label: 'Nie!', effect: {} }
    ]
  },
  AK_2: {
    front: 'cards/red_ak.png',
    back: 'cards/red_b_ak2.png',
    options : [
      { label: 'Tak!', effect: { cash: 1000, supply: 2} },
      { label: 'Nie', effect: {} }
    ]
  },
  ataknamagazyn: {
    front: 'cards/red_ataknamagazyn.png',
    back: 'cards/red_b_ataknamagazyn.png',
    options : [
      { label: 'Tak!', effect: {} },
      { label: 'Nie', effect: {} }
    ]
  },
  patrol: {
    front: 'cards/red_patrol.png',
    back: 'cards/red_b_patrol.png',
    options : [{label:'Rzucamy kostką'}]
  }, 
  ataknaposterunek:{
    front: 'cards/red_ataknaposterunek.png',
    back: 'cards/red_b_ataknaposterunek.png',
    options : [{label:'Rzucamy kostką'}]
  },
  zrzutowisko: {
    front: 'cards/red_zrzutowisko.png',
    back: 'cards/red_b_zrzutowisko.png',
    options : [{label:'Rzucamy kostką'}]
  },
  pomoc_2: {
    front: 'cards/red_pomocii.png',
    back: 'cards/red_b_pomocii.png',
    options : [
      { label: 'Tak!', effect: {} },
      { label: 'Nie', effect: {} }
    ]
  }, 
  szkolenie_2: {
    front: 'cards/red_szkolenie.png',
    back: 'cards/red_b_szkolenieii.png',
    options : [
      { label: '29815', effect: {cash: -500} },
      { label: '29845', effect: { cash: 1000} },
      { label: '28951', effect: {cash: -500}},
      { label: '24451', effect: {cash: -500} }
    ]
  },
  AK_3: {
    front: 'cards/red_ak.png',
    back: 'cards/red_b_ak3.png',
    options : [
      { label: 'Tak!', effect: {} },
      { label: 'Nie', effect: {} }
    ]
  },
  wsypa: {
    front: 'cards/red_wsypa.png', 
    back: 'cards/red_b_wsypa.png',
    options : [{label:'O nie!'}]
  },
  szkolenie_3: {
  front: 'cards/red_szkolenie.png',
  back: 'cards/red_b_szkolenieiii.png',
  options : [
    { label: 'MIL', effect: {cash: -500} },
    { label: 'NIL', effect: { cash: 1000} },
    { label: 'NJL', effect: {cash: -500}},
    { label: 'OJM', effect: {cash: -500} }
  ]
},
  AK_4: {
    front: 'cards/red_ak.png',
    back: 'cards/red_b_ak4.png',
    options : [{label:'Rzucamy kostką!'}]
  },
   lapanka: {
    front: 'cards/red_lapanka.png',
    back: 'cards/red_b_lapanka.png',
    options : [{label:'Odbić!'},{label:'Wykupić!'}]
  },
  //CZARNE // ---------------------------------------------------------------------------
  lapanka_b: {
    front: 'cards/black_lapanka.png',
    back: 'cards/black_b_lapanka.png',
    options : [{label:'Rzucamy kostką!'}]
  },
  burza_1_b: {
    front: 'cards/black_burza.png',
    back: 'cards/black_b_burzai.png',
    options : [{ label: 'Rzucamy kostką!', effect: {} }]
  },
  szkolenie_1_b:{
  front: 'cards/black_szkolenie.png',
  back: 'cards/black_b_szkolenie.png',
  options : [
    { label: '22.07.1945', effect: {cash: -500} },
    { label: '23.07.1944', effect: { cash: 1000} },
    { label: '23.08.1944', effect: {cash: -500}},
    { label: '22.08.1945', effect: {cash: -500} }
  ]
},
  burza_2_b: {
    front: 'cards/black_burza.png',
    back: 'cards/black_b_burzaii.png',
    options : [
      { label: 'Atakujemy!', effect: {} },
      { label: 'Ukrywamy się', effect: {} }
    ]
  },
  patrol_b: {
    front: 'cards/black_patrol.png',
    back: 'cards/black_b_patrol.png',
    options : [{ label: 'Rzucamy kostką!', effect: {} }]
  },
  szkolenie_2_b:{
    front: 'cards/black_szkolenie.png',
    back: 'cards/black_b_szkolenie.png',
    options : [{ label: 'Tu jeszcze coś damy!', effect: {} }]
  },
  pomoc_1_b:{
    front: 'cards/black_pomociii.png',
    back: 'cards/black_b_pomociii.png',
    options : [
      { label: 'Tak!', effect: {} },
      { label: 'Nie', effect: {} }
    ]
  }, 
  burza_3_b:{
    front: 'cards/black_burza.png',
    back: 'cards/black_b_burzaiii.png',
    options : [{ label: 'X', effect: {} }]
  },
  zrzutowisko_b:{
    front: 'cards/black_zrzutowisko.png',
    back: 'cards/black_b_zrzutowisko.png',
    options : [{ label: 'Rzucamy kostką!', effect: {} }]
  },
  ataknaposterunek_b:{
    front: 'cards/black_ataknaposterunek.png',
    back: 'cards/black_b_ataknaposterunek.png',
    options : [{ label: 'Rzucamy kostką!', effect: {} }]
  },
  handel_b:{
    front: 'cards/black_handel.png',
    back: 'cards/black_b_handel.png',
    options: [
      { label: 'Kup 1 znacznik', effect: { cash: -1500, supply: 1 } },
      { label: 'Kup 2 znaczniki', effect: { cash: -2000, supply: 2 } },
      { label: 'Kup 5 znaczniki', effect: { cash: -3000, supply: 5 } },
      { label: 'Rezygnujemy z zakupu', effect: {cash: -0, supply: 0} }
    ]
  },
  ataknamagazyn_b:{
    front: 'cards/black_ataknamagazyn.png',
    back: 'cards/black_b_ataknamagazyn.png',
    options: [{label: '😭'}]
  },
  pomoc_2_b:{
    front: 'cards/black_pomociv.png',
    back: 'cards/black_b_pomociv.png',
    options : [
      { label: 'Tak!', effect: {} },
      { label: 'Nie', effect: {} }
    ]
  },
  burza_4_b:{
    front: 'cards/black_burza.png',
    back: 'cards/black_b_burzaiv.png',
    options : [
      { label: 'Tak!', effect: {} },
      { label: 'Nie', effect: {} }
    ]
  },
  burza_5_b:{
    front: 'cards/black_burza.png',
    back: 'cards/black_b_burzav.png',
    options : [{ label: 'Rzucamy kostką!', effect: {} }]
  },
  ujawnienie_b:{
    front: 'cards/black_ujawnienie.png',
    back: 'cards/black_b_ujawnienie.png',
    options : [
      { label: 'Omijamy żołnierzy', effect: {} },
      { label: 'Ujawniamy się', effect: {} }
    ]
  },
  // Dodaj więcej kart w tym samym stylu - musi być zgodne z ifami w serwer js i odpowiednie png z folderu cards
};





function showCardOverlay(fieldIndex, fieldType, playerId) {
  let autoTimer;
  let optionClicked = false;
  window.cardActive = true;
  if (window.updateTurnIndicator && window.game) {
   // ponownie zrenderuj kostkę (będzie zablokowana)
   window.updateTurnIndicator(window.game.turnOrder[window.game.currentTurn])  }
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

  const options = data.options || data.buttons.map(label => ({ label, effect: {} }));

  options.forEach(option => {
  const btn = document.createElement('button');
  btn.textContent = option.label;

  const cost = option.effect?.cash || 0;
  const currentCash = getCurrentCash();

  if (cost < 0 && currentCash + cost < 0) {
  btn.disabled = true;
  btn.style.opacity = '0.5';
  btn.style.cursor = 'not-allowed';
  }
  btn.addEventListener('click', () => {
    console.log(`[overlay] Kliknięto: ${option.label}`);
    if (optionClicked) return;
  optionClicked = true;
  clearTimeout(autoTimer);
  disableAllCardButtons();
    
    const change = option.effect;
    const currentCash = getCurrentCash();
    const cost = change?.cash || 0;

    // --- SPRAWDZENIE FUNDUSZY ---
    if (cost < 0 && currentCash + cost < 0) {
      console.log('[overlay] Gracza nie stać na tę opcję');
      showCardMessage('NIE MASZ WYSTARCZAJĄCO PIENIĘDZY!', 'fail');
      return;
    }

    // --- POLE SZKOLENIE -------------------------------------------------- SKOŃCZONE
    if (fieldType === 'szkolenie_1') {
      if (change.cash === 1000) {
        showCardMessage('Dobra odpowiedź! +1000 zł', 'success');
      } else if (change.cash === -500) {
        showCardMessage('Zła odpowiedź! -500 zł', 'fail');
      }
       // emit efektu i zamknij kartę
  getSocket().emit('applyCardEffect', {
    playerId,
    change
  });
  overlay.remove();
  return;

    }

    // --- POLE AK_1 ------------------------------------- 
  if (fieldType === 'AK_1') {
  if (change.cash === 1000) {
    showCardMessage('Dobra odpowiedź! +1000 zł', 'success');
  } else if (change.cash === -500) {
    showCardMessage('Zła odpowiedź! -500 zł', 'fail');
  }
   getSocket().emit('applyCardEffect', {
    playerId,
    change
  });
  overlay.remove();
  return;
}
    // POLE HANDEL ------------------------------------------------------------ SKOŃCZONE
    if (fieldType === 'handel') {
      if (option.label === 'Kup 1 znacznik') {
        showCardMessage('Zakupiono 1 znacznik zaopatrzenia', 'success');
      } else if (option.label === 'Kup 2 znaczniki') {
        showCardMessage('Zakupiono 2 znaczniki zaopatrzenia', 'success');
      } else if (option.label === 'Kup 5 znaczników') {
        showCardMessage('Zakupiono 5 znaczników zaopatrzenia', 'success');
      } else if (option.label === 'Rezygnujemy z zakupu') {
        showCardMessage('Rezygnujecie z zakupu', 'neutral');
      }
      // 2) Emitujemy efekt zgodny z CARD_DATA.options.effect
  const change = option.effect || {};
  getSocket().emit('applyCardEffect', {
    playerId,
    change
  });

  // 3) Zamykamy overlay i od razu odblokowujemy kostkę
  overlay.remove();
  window.cardActive = false;
  window.updateTurnIndicator(window.game.turnOrder[window.game.currentTurn]);
  return;
    }
    // --- POLE ŁAPANKA -------------------------------------- SKOŃCZONE - UWAGA skipTurn!
    if (fieldType === 'lapanka') {
      if (option.label === 'Odbić!') { // przycisk "Odbić!"
        showCardMessage('Rzucacie kostką!', 'neutral');
        showCardDice(result => {
          let change;
          if (result <= 2) {
            showCardMessage('Niepowodzenie! Otrzymujecie znacznik Areszt.', 'fail');
            //getSocket().emit('applyCardEffect', {
              //playerId,
              //change: { arrest: 1 }
            //});
            change = { arrest: 1 };
          } else {
            const supplyText = document.getElementById('supply-count')?.textContent || '0';
            const currentSupply = parseInt(supplyText, 10);
            //const effect = { skipTurn: 1 };
            change = { skipTurn: 1 };

            if (currentSupply > 0) {
              change.supply = -1;
              showCardMessage('Tracicie 1 zaopatrzenie i kolejkę.', 'neutral');
            } else {
              showCardMessage('Uciekacie, ale tracicie kolejkę.', 'neutral');
            }}
            getSocket().emit('applyCardEffect', { playerId, change });
      overlay.remove();
    });
    //overlay.remove();



     window.cardActive = false;
         window.updateTurnIndicator(window.game.turnOrder[window.game.currentTurn]);
    //     // jeżeli skipTurn, od razu przejdź do następnego gracza
    //     if (change.skipTurn) {
    //       getSocket().emit('rollDice', { roomCode: getRoomCode() });
    //     }
    //   });
    //   return;
      return;
    
            }
            if (option.label === 'Wykupić!') {
    // obsługa wykupienia
    showCardMessage('Transakcja! -500 zł', 'neutral');
    getSocket().emit('applyCardEffect', {
      playerId,
      change: { cash: -500 }
    });
    overlay.remove();
     window.cardActive = false;
       window.updateTurnIndicator(window.game.turnOrder[window.game.currentTurn]);

    return;
  }
    }

    // --- POLE POMOC ---
    if (fieldType === 'pomoc_1') {
      if (option.label === 'Pomagamy!') { // przycisk "Pomagamy!"
        showCardMessage('Rzucacie kostką...', 'neutral');
        showCardDice(result => {
          if (result <= 4) {
            showCardMessage('Zdobyliście dokumenty! Zyskujecie znacznik Pomoc.', 'success');
            getSocket().emit('applyCardEffect', {
              playerId,
              change: { help: 1 }
            });
          } else {
            showCardMessage('Nie udało się zdobyć dokumentów. Tracicie 500 zł.', 'fail');
            getSocket().emit('applyCardEffect', {
              playerId,
              change: { cash: -500 }
            });
          }
          overlay.remove(); // zamknij overlay po zakończeniu
        });
        return; // zakończ obsługę „Tak”
      }
      if (option.label === 'Nie!') {
        showCardMessage('Nic nie robicie w kwestii dokumentów.', 'neutral');
      }
    }
    // --- POLE AK 2 ---
    if (fieldType === 'AK_2') {
      if (option.label === 'Tak!') { // przycisk "Tak!"
        showCardMessage('Akcja zakończyła się powodzeniem. Zyskujecie 2 znaczniki zaopatrzenia i 1000 zł.', 'success');
        getSocket().emit('applyCardEffect', {
      playerId,
      change: { supply: 2, cash: 1000 }
    });
      } else if (option.label === 'Nie') {
        showCardMessage('Oddalacie się bezpiecznie, ale tracicie kolejkę.', 'neutral');
         getSocket().emit('applyCardEffect', {
      playerId,
      change: { skipTurn: 1 }
    });
    overlay.remove();
        window.cardActive = false;
        window.updateTurnIndicator(window.game.turnOrder[window.game.currentTurn]); // ← zaktualizuj turę
  return;
      }
      //overlay.remove();
      //window.cardActive = false; // odblokuj kostkę
  // odśwież wskaźnik tury
  //window.updateTurnIndicator(window.game.turnOrder[window.game.currentTurn]);

      //return;
    }
    // --- POLE ATAK NA MAGAZYN ---
    if (fieldType === 'ataknamagazyn') {
    if (option.label === 'Tak!') {
      showCardMessage('Rzucacie kostką...', 'neutral');
      showCardDice(result => {
        if (result <= 4) {
          showCardMessage('Zdobyliście towary! +6 znaczników Zaopatrzenia.', 'success');
          getSocket().emit('applyCardEffect', {
            playerId,
            change: { supply: 6 }
          });
        } else {
          showCardMessage('Akcja przerwana. Nic nie zdobyliście.', 'fail');
          getSocket().emit('applyCardEffect', {
          playerId,
          change: {}
        });
        }
        overlay.remove(); // zamknij overlay po rzucie
      });
      return;
    }
    if (option.label === 'Nie') {
      showCardMessage('Akcja nie powiodła się. Tracicie 2 znaczniki i kolejkę.', 'fail');
      getSocket().emit('applyCardEffect', {
        playerId,
        change: { supply: -2, skipTurn: 1} 
        });
        overlay.remove();
        window.cardActive = false;
        window.updateTurnIndicator(window.game.turnOrder[window.game.currentTurn]); // ← zaktualizuj turę
  return;

      }
    }
    // --- POLE PATROL ---
    if (fieldType === 'patrol') {
    if (option.label === 'Rzucamy kostką') {
      showCardMessage('Kontrola dokumentów. Rzucacie kostką...', 'neutral');
      showCardDice(result => {
        let change = {};

        if (result >= 1 && result <= 3) {
          showCardMessage('Udało się uniknąć zatrzymania, ale za łapówkę w wysokości 1000 zł.', 'fail');
           change = { cash: -1000 };
        } else if (result === 4 || result === 5) {
          showCardMessage('Kontrola przebiegła pomyślnie. Możecie iść dalej.', 'success');
          change = {};
        } else if (result === 6) {
          showCardMessage('Niepowodzenie! Otzrymujecie znacznik areszt.', 'fail');
          change = { arrest: 1 };

        }
        // wyślij efekt do serwera
      getSocket().emit('applyCardEffect', { playerId, change });

      // zamknij overlay i odblokuj kostkę dopiero po animacji karty
      overlay.remove();
      window.cardActive = false;
      window.updateTurnIndicator(window.game.turnOrder[window.game.currentTurn]);

        // overlay.remove(); // zamyka overlay po rzucie
      });
      return;
    }
    }
    // --- POLE ATAK NA POSTERUNEK ---
    if (fieldType === 'ataknaposterunek') {
      if (option.label === 'Rzucamy kostką') {
        showCardMessage('Rozpoczynacie akcję odbicia więźniów...', 'neutral');
        
        showCardDice(result => {
          // Zawsze karzymy 1 supply + skipTurn, a w razie sukcesu dajemy też help
      const change = {
        supply: -1,
        skipTurn: 1,
        ...(result >= 1 && result <= 4 ? { help: 1 } : {})
      };
          if (result >= 1 && result <= 4) {
            showCardMessage('Sukces! Więźniowie odzyskali wolność. Zyskujecie znacznik Pomoc.', 'success');
            
          } else {
            showCardMessage('Niepowodzenie! Niemcy wezwali wsparcie. Tracicie znacznik zaopatrzenia.', 'fail');
          }
            getSocket().emit('applyCardEffect', {
              playerId,
              change
            });
          
          
      // Zamknij overlay, odblokuj kostkę i odśwież turę
      overlay.remove();
      window.cardActive = false;
      window.updateTurnIndicator(window.game.turnOrder[window.game.currentTurn]);
 // Jeśli daliśmy skipTurn, przejdź od razu do następnego gracza
      
        });
        return; // zakończ obsługę
      }
    }
    // --- POLE ZRZUTOWISKO ---
    if (fieldType === 'zrzutowisko') {
    if (option.label === 'Rzucamy kostką') {
      showCardMessage('Zaczynacie oczekiwać na zrzut...', 'neutral');
      // getSocket().emit('applyCardEffect', {
      //   playerId,
      //   change: { skipTurn: 1 }
      // });

      // Rzut kostką
      showCardDice(result => {
        // Zawsze cofamy turę
      const change = { skipTurn: 1 };
        
        if (result >= 1 && result <= 2) {
          showCardMessage('Zostaliście namierzeni! Tracicie 1 znacznik Zaopatrzenia.', 'fail');
          
          change.supply  = -1;
        
        } else {
          showCardMessage('Zrzut udany! Zyskujecie 5 znaczników Zaopatrzenia i 1000 zł.', 'success');
        
          change.supply = 5;
        change.cash   = 1000;
        }
        getSocket().emit('applyCardEffect', { playerId, change });
        overlay.remove(); // zamknij overlay po animacji kostki
        window.cardActive = false;
      window.updateTurnIndicator(window.game.turnOrder[window.game.currentTurn]);
      //getSocket().emit('rollDice', { roomCode: getRoomCode() });
      });

      return; // zakończ obsługę
    }
  }
  // --- POLE POMOC 2 ---
    if (fieldType === 'pomoc_2') {
      let change;
    if (option.label === 'Tak!') {
      showCardMessage('Przekazujecie żywność i dokumenty. +3 Pomoc, -1 Zaopatrzenie, -1000 zł.', 'success');
      change = { help: 3, supply: -1, cash: -1000 };
    } else if (option.label === 'Nie pomagamy') {
      showCardMessage('Zostaliście zaatakowani przez rabusiów! -1 Zaopatrzenie.', 'fail');
      change = { supply: -1 };
    }
    getSocket().emit('applyCardEffect', { playerId, change });
    overlay.remove(); // zamknij overlay po decyzji
    return;
  }
  // --- POLE SZKOLENIE 2 ---
  if (fieldType === 'szkolenie_2') {
    if (change.cash === 1000) {
      showCardMessage('Poprawna odpowiedż! Zyskujecie 1000 zł.', 'success');
    } else if (change.cash === -500) {
      showCardMessage('Zła odpowiedź! Tracicie 500 zł.', 'fail');
    }
    getSocket().emit('applyCardEffect', {
      playerId,
      change
    });
    overlay.remove(); // zamknij overlay po decyzji
    return;
  }
  // --- POLE AK 3 ---
    if (fieldType === 'AK_3') {
    if (option.label === 'Tak!') {
      showCardMessage('Rzucacie kostką...', 'neutral');
      showCardDice(result => {
        const change = result <= 2
          ? { supply: -2 }    // fail
          : { cash: 2500 };   // success
        if (result <= 2) {
          showCardMessage('Niepowodzenie! Tracicie 2 znaczniki zaopatrzenia.', 'fail');
          // getSocket().emit('applyCardEffect', {
          //   playerId,
          //   change: { supply: -2 }
          // });
        } else {
          showCardMessage('Sukces! Otrzymujecie 2500 zł!', 'success');}
          getSocket().emit('applyCardEffect', {
            playerId,
            change
          });
          overlay.remove();   
      });
      return; // zakończ obsługę tej opcji
    }
    if (option.label === 'Nie') {
      showCardMessage('Rezygnujecie z akcji. Nic się nie dzieje.', 'neutral');
    
    getSocket().emit('applyCardEffect', { playerId, change: {supply: +0} });
    overlay.remove();
    return;
  }}
    // --- POLE WSYPA ---
if (fieldType === 'wsypa') {
  if (option.label === 'O nie!') {
    // Pobierz aktualne wartości z interfejsu
    const currentCash = getCurrentCash();
    const supplyText = document.getElementById('supply-count')?.textContent || '0';
    const currentSupply = parseInt(supplyText, 10);

    // Oblicz straty (połowa zaokrąglona w dół)
    const lostCash = Math.floor(currentCash / 2);
    const lostSupply = Math.floor(currentSupply / 2);

    // Sprawdź czy jest coś do utraty
    if (lostCash === 0 && lostSupply === 0) {
      showCardMessage('Donosiciel w oddziale! Na szczęście nie macie nic do stracenia.', 'neutral');
    } else {
      showCardMessage(
        `Donosiciel w oddziale! Tracicie ${lostCash} zł i ${lostSupply} zaopatrzenia.`,
        'fail'
      );
    }

    // Wyślij efekt do serwera (nawet jeśli 0, aby zaktualizować stan)
    getSocket().emit('applyCardEffect', {
      playerId,
      change: {
        cash: -lostCash,
        supply: -lostSupply
      }
    });

    overlay.remove();
    return;
  }
}
  // --- POLE SZKOLENIE 3 ---
  if (fieldType === 'szkolenie_3') {
    if (change.cash === 1000) {
      showCardMessage('Dobra odpowiedź! +1000 zł', 'success');
    } else if (change.cash === -500) {
      showCardMessage('Zła odpowiedź! -500 zł', 'fail');
    }
    // Emit i zamknij overlay
    getSocket().emit('applyCardEffect', { playerId, change });
    overlay.remove();
   return;
  }

  // --- POLE AK 4 ---
    if (fieldType === 'AK_4') {
      if (option.label === 'Rzucamy kostką!') {
        showCardMessage('Podejmujecie się bardzo trudnej akcji... Tracicie 2 znaczki zaopatrzenia.', 'neutral');
        // Na starcie -2 supply
        // getSocket().emit('applyCardEffect', {
        //   playerId,
        //   change: { supply: -2 }
        // });
        // Rzut kostką
        showCardDice(result => {
           const change = { supply: -2,
        // dodatkowo help lub arrest
        ...(result >= 4 ? { help: 2 } : { arrest: 1 })
      };
          if (result >= 4 && result <= 6) {
            showCardMessage('Sukces! Otrzymujecie 2 znaczniki Pomoc.', 'success');
            // getSocket().emit('applyCardEffect', {
            //   playerId,
            //   change: { help: 2 }
            // });
          } else {
            showCardMessage('Niepowodzenie! Otrzymujecie znacznik Areszt.', 'fail');}
            getSocket().emit('applyCardEffect', {
              playerId,
              change
            });
          
          overlay.remove(); // zamknięcie po rzucie
        });

        return;
      }
    }





    // ------------------------------------------- CZARNE KARTY ---------------------------------------------------
    
    // --- POLE LAPANKA B ----------------------------------------- SKOŃCZONE 
    if (fieldType === 'lapanka_b') {
    if (option.label === 'Rzucamy kostką!') {
      showCardDice((dice) => {
        const change = dice <= 2
        ? { arrest: 1 }
        : { supply: -1 };
        if (dice <= 2) {
          showCardMessage('Próba kończy się niepowodzeniem. Otrzymujecie znacznik Areszt.', 'fail');
          // getSocket().emit('applyCardEffect', {
          //   playerId,
          //   change: { arrest: 1 }
          // });
        } else {
          showCardMessage('Akcja zakończyła się powodzeniem, ale tracicie 1 znacznik Zaopatrzenia.', 'neutral');}
          getSocket().emit('applyCardEffect', {
            playerId,
            change
          });
        
        overlay.remove();
      });
      return;
    }
  }
  // --- POLE BURZA_1_B ---
if (fieldType === 'burza_1_b') {
  if (option.label=== 'Rzucamy kostką!') {
    showCardMessage('Podejmujecie akcję... Rzucacie kostką!', 'neutral');
    showCardDice(result => {
      const change = result > 2
        ? { supply: 5, cash: 2000 }
        : {};
      if (result <= 2) {
        showCardMessage('Wycofujecie się — sklep był patrolowany. Brak efektu.', 'fail');
      } else {
        showCardMessage('Sukces! +5 znaczników zaopatrzenia i 2000 zł.', 'success');}
        getSocket().emit('applyCardEffect', {
          playerId,
          change
        });
      
      overlay.remove();
    });
    return;
  }
}

// --- POLE SZKOLENIE_1_B -------------------------
 if (fieldType === 'szkolenie_1_b') {
   if (change.cash === 1000) {
     showCardMessage('Dobra odpowiedź! +1000 zł', 'success');
   } else if (change.cash === -500) {
     showCardMessage('Zła odpowiedź! -500 zł', 'fail');
   }
   getSocket().emit('applyCardEffect', { playerId, change });
    overlay.remove();
    return;
 }

// --- POLE BURZA_2_B ---
  if (fieldType === 'burza_2_b') {
    if (option.label==='Atakujemy!') {
      showCardMessage('Podejmujecie próbę rozbrojenia żandarmów. Rzucacie kostką...', 'neutral');
      showCardDice(result => {
        const change = result <= 2? { arrest: 1 }
          : { supply: 5, cash: 1500 };
        if (result <= 2) {
          showCardMessage('Niepowodzenie! Jeden z żołnierzy został schwytany. +1 znacznik Areszt.', 'fail');
          
        } else {
          showCardMessage('Sukces! Zdobyliście 5 zaopatrzenia i 1500 zł.', 'success');}
          getSocket().emit('applyCardEffect', {
            playerId,
            change
          });
        
        overlay.remove();
      });
      return;
    }

    if (option.label === 'Ukrywamy się') {
      showCardMessage('Ukrywacie się w pociągu. Nic się nie dzieje.', 'neutral');
      getSocket().emit('applyCardEffect', { playerId, change: {supply: +0} });
      overlay.remove();
      return;
    }
  }
// --- POLE PATROL_B ---
if (fieldType === 'patrol_b') {
  if (option.label === 'Rzucamy kostką!') {
    showCardMessage('Zatrzymanie przez patrol... Rzucacie kostką!', 'neutral');
    showCardDice(result => {
      let change = {};
      if (result >= 1 && result <= 3) {
        change = { cash: -1000 };
        showCardMessage('Uratowała was łapówka. Płacicie 1000 zł.', 'fail');
      
      } else if (result === 4 || result === 5) {
        change = { arresst: 0 };
        showCardMessage('Kontrola przebiegła pomyślnie. Możecie iść dalej.', 'success');
      } else if (result === 6) {
        change = { arrest: 1 };
        showCardMessage('Niepowodzenie! Żołnierz został zatrzymany. +1 Areszt.', 'fail');}
        getSocket().emit('applyCardEffect', {
          playerId,
          change
        });
      overlay.remove();
    });
    return;
  }
}
  // --- POLE SZKOLENIE_2_B --------------------------------------------------------- tu jeszcze coś dodamy

// --- POLE POMOC_1_B ---
if (fieldType === 'pomoc_1_b') {
  if (option.label === 'Tak!') {
    showCardMessage('Zgadzacie się pomóc. Tracicie kolejkę, ale zdobywacie 2 znaczniki Pomoc.', 'success');
    const change = { help: 2, skipTurn: 1 };
    getSocket().emit('applyCardEffect', {
      playerId,
      change
    });
    overlay.remove();
    return;
  }

  if (option.label === 'Nie') {
    showCardMessage('Odmówiliście pomocy. W okolicy rozpoczyna się łapanka!', 'fail');
    // wywołujemy kartę lapanka_b
    getSocket().emit('applyCardEffect', { playerId, change: {} });
      overlay.remove();
      // po chwili otwórz kartę lapanka_b
      setTimeout(() => {
        showCardOverlay(null, 'lapanka_b', playerId);
      }, 1500);
      return;
  }
}

  // --- POLE BURZA_3_B ---
  if (fieldType === 'burza_3_b') {
    if (option.label === 'X') {
      showCardMessage(' +4 zaopatrzenia, +1000 zł.', 'success');
      const change = { supply: 4, cash: 1000 };
      getSocket().emit('applyCardEffect', {
        playerId,
        change });
      overlay.remove();
      return;
    }
  }

  // --- POLE ZRZUTOWISKO_B ---
  if (fieldType === 'zrzutowisko_b') {
    if (option.label === 'Rzucamy kostką!')  {
      showCardMessage('Zaczynacie oczekiwać na zrzut... Tracicie kolejkę.', 'neutral');
      // Tracimy kolejkę od razu

      showCardDice(result => {
        const change = {
        skipTurn: 1,
        ...(result <= 2
          ? { supply: -1 }
          : { supply: 5, cash: 2000 })
      };
        if (result >= 1 && result <= 2) {
          showCardMessage('Zostaliście namierzeni! Tracicie 1 znacznik Zaopatrzenia.', 'fail');
        } else {
          showCardMessage('Zrzut udany! +5 zaopatrzenia, +2000 zł.', 'success');}
          getSocket().emit('applyCardEffect', {
            playerId,
            change
          });
        overlay.remove(); 
      });
      return;
    }
  }


  // --- POLE ATAK NA POSTERUNE
  if (fieldType === 'ataknaposterunek_b') {
    if (option.label === 'Rzucamy kostką!') {
      showCardMessage('Rozpoczynacie akcję odbicia więźniów... Tracicie 1 kolejkę i 1 zaopatrzenie.', 'neutral');
      showCardDice(result => {
      const change = {
        skipTurn: 1,
        supply: -1,
        ...(result >= 1 && result <= 3 ? { help: 3 } : {})
      };
      
        if (result >= 1 && result <= 3) {
          showCardMessage('Sukces! Więźniowie odzyskali wolność. +3 Pomoc.', 'success');
          
        } else {
          showCardMessage('Niepowodzenie! Tracicie kolejny znacznik zaopatrzenia.', 'fail');}
          getSocket().emit('applyCardEffect', {
            playerId,
            change
          });
        
        overlay.remove();
      });

      return;
    }
  }

    // POLE HANDEL 
  if (fieldType === 'handel_b') {
    let change = {};
    if (option.label === 'Kup 1 znacznik') {
      showCardMessage('Zakupiono 1 znacznik zaopatrzenia', 'success');
      change = { supply: 1 };
    } else if (option.label === 'Kup 2 znaczniki') {
      showCardMessage('Zakupiono 2 znaczniki zaopatrzenia', 'success');
      change = { supply: 2 };
    } else if (option.label === 'Kup 5 znaczniki') {
      showCardMessage('Zakupiono 5 znaczników zaopatrzenia', 'success');
      change = { supply: 5 };
    } else if (option.label === 'Rezygnujemy z zakupu') {
      showCardMessage('Rezygnujecie z zakupu', 'neutral');
    }
     getSocket().emit('applyCardEffect', { playerId, change });
    overlay.remove();
    return;
  }

    // --- POLE ATAK NA MAGAZYN B ---
  if (fieldType === 'ataknamagazyn_b') {
    if (option.label === '😭') {
      showCardMessage('Niepowodzenie!', 'neutral');
    getSocket().emit('applyCardEffect', { playerId, change: {} });
    overlay.remove();
    return;

    }
  }

  // --- POLE POMOC_2_B ---
if (fieldType === 'pomoc_2_b') {
  if (option.label === 'Tak!') {
    showCardMessage('Podejmujecie akcję ratunkową. Tracicie 1 znacznik Zaopatrzenia...', 'neutral');
    
    showCardDice(result => {
      const change = {
          supply: -1,
          ...(result >= 1 && result <= 3 ? { help: 1 } : { arrest: 1 })
        };
      if (result >= 1 && result <= 3) {
        showCardMessage('Sukces! Odbiliście więźniów. +1 znacznik Pomoc.', 'success');
        
      } else {
        showCardMessage('Niepowodzenie. Jeden z żołnierzy został zatrzymany.', 'fail');}
        getSocket().emit('applyCardEffect', {
          playerId,
          change
        });
      
      overlay.remove();
    });
    return;
  }
  if (option.label === 'Nie') {
    showCardMessage('Ignorujecie prośbę o pomoc... ale zostajecie zatrzymani przez niemiecki patrol!', 'fail');
    getSocket().emit('applyCardEffect', { playerId, change: {} });
      overlay.remove();
      setTimeout(() => showCardOverlay(null, 'patrol_b', playerId), 1500);
      return;
  }
}

    // --- POLE BURZA_4_B ---
    if (fieldType === 'burza_4_b') {
      if (option.label === 'Tak!') {
        showCardMessage('Rozpoczynacie akcję rozbrojenia... Rzucacie kostką!', 'neutral');
        showCardDice(result => {
           const change = result <= 4
          ? { supply: 5, cash: 1500 }
          : { arrest: 1 };
          if (result >= 1 && result <= 4) {
            showCardMessage('Sukces! +5 zaopatrzenia, +1500 zł.', 'success');
            
          } else {
            showCardMessage('Niepowodzenie. Jeden z żołnierzy został schwytany.', 'fail');}
            getSocket().emit('applyCardEffect', {
              playerId,
              change
            });
          
          overlay.remove();
        });
        return;
      }
      if (option.label === 'Nie') {
        showCardMessage('Rezygnujecie z akcji. Idziecie dalej bez przeszkód.', 'neutral');
        getSocket().emit('applyCardEffect', { playerId, change: {} });
      overlay.remove();
      return;
      }
    }

    // --- POLE BURZA_5_B ---
    if (fieldType === 'burza_5_b') {
      if (option.label === 'Rzucamy kostką!') {
        showCardDice(result => {
          const reward = result * 500;
          showCardMessage(`Zdobyliście ${reward} zł!`, 'success');
          const change = { cash: reward };
          getSocket().emit('applyCardEffect', {
            playerId,
            change
          });
          overlay.remove();
        });
        return;
      }
    }

    // --- POLE UJAWNIENIE_B ---
    if (fieldType === 'ujawnienie_b') {
    if (option.label === 'Omijamy żołnierzy') {
      showCardMessage('Próbujecie ominąć Sowietów. Rzucacie kostką...', 'neutral');
      showCardDice(result => {
        const change = result <= 3 ? {} : { cash: -1000 };
        if (result >= 1 && result <= 3) {
          showCardMessage('Udało się! Omijacie żołnierzy i idziecie dalej.', 'success');
        } else {
          showCardMessage('Zostaliście zauważeni! Tracicie 1000 zł.', 'fail');}
          getSocket().emit('applyCardEffect', {
            playerId,
            change
          });
        overlay.remove();
      });
      return;
    }
    if (option.label === 'Ujawniamy się') {
      showCardMessage('Ujawniliście się. Rzucacie kostką...', 'neutral');

      showCardDice(result => {
         let change = {};

        if (result >= 1 && result <= 2) {
          showCardMessage('Sowieci potrzebują waszej pomocy. Możecie iść dalej.', 'success');
          change = { cash: +0};

        } else if (result === 3 || result === 4) {
          const currentCash = getCurrentCash();
          change = { cash: -currentCash };
          showCardMessage(`Przekupstwo się powiodło. Tracicie całą gotówkę.`, 'neutral');
        } 
        else {
          showCardMessage('Zostaliście uznani za niebezpiecznych. Dostajęcie znacznik areszt.', 'fail');
          change = { arrest: 1 };}
          getSocket().emit('applyCardEffect', {
            playerId,
            change
          });
        
        overlay.remove();
      });
      return;
    }
  }



    // --- POZOSTAŁE PRZYPADKI: efekt i zamknięcie ---
    // if (change && Object.keys(change).length > 0) {
    //   console.log('[overlay] Wysyłam żądanie zmiany ekwipunku:', change);
    //   getSocket().emit('applyCardEffect', {
    //     playerId,
    //     change
    //   });
    // } else {
    //   console.log('[overlay] Brak efektu, tylko zamykam overlay');
    // }
    // overlay.remove(); // zamknięcie overlay jeśli nie było "Odbić!"
    // window.cardActive = false;
    //   if (window.updateTurnIndicator && window.game) {
    //     window.updateTurnIndicator(window.game.turnOrder[window.game.currentTurn]);
    //   }
    console.log('[overlay] Wysyłam applyCardEffect (nawet gdy change={}):', change);
    getSocket().emit('applyCardEffect', {
      playerId,
      change
    });
    overlay.remove();
    // nie musisz tu już ręcznie podnosić window.cardActive=false,
    // serwer wyśle event cardClosed do wszystkich klientów
    return;
  });
  buttonWrapper.appendChild(btn);


  // Pasek czasu
  const timerBar = document.createElement('div');
  timerBar.id = 'card-timer-bar';
  overlay.appendChild(timerBar);
  overlay.appendChild(buttonWrapper);
  document.body.appendChild(overlay);

  // Pasek czasu animacja
  setTimeout(() => {
    timerBar.style.transition = 'transform 60s linear';
    timerBar.style.transform = 'scaleX(0)';
  }, 100);

  // Obrót karty po 1 sekundzie
  setTimeout(() => {
    card.style.transform = 'rotateY(180deg)';
  }, 1000);

  // Automatyczne zamknięcie po 60 sekundach
  autoTimer = setTimeout(() => {
    showCardMessage('Czas minął!', 'fail');
    setTimeout(() => {
      overlay.remove();
      getSocket().emit('applyCardEffect', {
        playerId,
        change: {}
      });
    }, 1500);
  }, 60000);
});
}
function disableAllCardButtons() {
  const buttons = document.querySelectorAll('#card-buttons button');
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  });
}
