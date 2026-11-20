const HAND_SIZE = 5;
const ACE = 1;
const TEN = 10;
const JACK = 11;
const QUEEN = 12;
const KING = 13;
const MIN_NUM = 1;
const MAX_NUM = 13;

//ハイカード
const ACE_POWER = 14;

//ロイヤルストレートの数字
const ROYAL_NUMBERS = [ACE, TEN, JACK, QUEEN, KING];

//同じ数字が何枚あるか
const PAIR = 2;
const THREE = 3;
const FOUR = 4;

//ペアがいくつあるか
const ONE_PAIR_COUNT = 1;
const TWO_PAIR_COUNT = 2;

//勝ち負け
const WIN = '勝ち';
const LOSE = '負け';
const DRAW = '引分';

//役
const HIGH_CARD = 0;
const ONE_PAIR = 1;
const TWO_PAIR = 2;
const THREE_OF_A_KIND = 3;
const STRAIGHT = 4;
const FLUSH = 5;
const FULL_HOUSE = 6;
const FOUR_OF_A_KIND = 7;
const STRAIGHT_FLUSH = 8;
const ROYAL_FLUSH = 9;

//役名
const ROLE_NAMES = [
  'ハイカード',
  'ワンペア',
  'ツーペア',
  'スリーオブアカインド',
  'ストレート',
  'フラッシュ',
  'フルハウス',
  'フォーカード',
  'ストレートフラッシュ',
  'ロイヤルフラッシュ',
];
const MARKS = ['♠', '♥', '♦', '♣'];

const dealerResult = document.getElementById('dealer-result');
const dealerRoleName = document.getElementById('dealer-role-name');
const dealerCards = document.getElementById('dealer-cards');
const gameButton = document.getElementById('game-button');
const childCards = document.getElementById('child-cards');
const childRoleName = document.getElementById('child-role-name');
const childResult = document.getElementById('child-result');


//トランプ52枚を作る
const makeCards = () => {
  const deck = [];
  for (let i = 0; i < MARKS.length; i++) {
    for (let num = MIN_NUM; num <= MAX_NUM; num++) {
      const card = {
        mark: MARKS[i],
        fileNo: i,
        number: num,
      };
      deck.push(card);
    }
  }
  return deck;
};


//シャッフルする
const shuffleCards = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    const temp = deck[i];
    deck[i] = deck[r];
    deck[r] = temp;
  }
};


// 5枚配る
const drawCards = (deck) => {
  const hand = [];
  for (let i = 0; i < HAND_SIZE; i++) {
    const card = deck.shift(); //shift()先頭を取ったら、残りが前にずれる
    hand.push(card);
  }
  return hand;
};


//画像表示
const makeCardImages = (hand) => {
  let images = '';
  for (const card of hand) {
    images += `<img class="card" src="images/${card.fileNo}_${card.number}.png" alt="トランプ">`;
  }
  return images;
};

//強さ
const getCardPower = (card) => {
  if (card.number === ACE) {
    return ACE_POWER;
  }
  return card.number;
};


//役を調べる
const checkRole = (hand) => {

  //数字ごとの枚数を数える
  const counts = [];
  for (let i = 0; i <= MAX_NUM; i++) {
    counts.push(0);
  }
  for (const card of hand) {
    counts[card.number]++;
  }

  //２３４を探す
  let pairCount = 0;
  let hasThree = false;
  let hasFour = false;
  for (let num = MIN_NUM; num <= MAX_NUM; num++) {
    if (counts[num] === PAIR) {
      pairCount++;
    }
    if (counts[num] === THREE) {
      hasThree = true;
    }
    if (counts[num] === FOUR) {
      hasFour = true;
    }
  }

  //フラッシュか調べる
  let isFlush = true;
  for (let i = 1; i < hand.length; i++) {
    if (hand[i].mark !== hand[0].mark) {
      isFlush = false;
    }
  }

  //ストレートか調べる
  const numbers = [];
  for (const card of hand) {
    numbers.push(card.number);
  }
  numbers.sort((a, b) => a - b);//数を小さい順に並べる

  //ストレートかの確認
  let isStraight = true;
  for (let i = 1; i < HAND_SIZE; i++) {
    if (numbers[i] !== numbers[i - 1] + 1) {
      isStraight = false;
    }
  }

  //ロイヤルストレートとして数える
  let isRoyal = true;
  for (let i = 0; i < HAND_SIZE; i++) {
    if (numbers[i] !== ROYAL_NUMBERS[i]) {
      isRoyal = false;
    }
  }
  if (isRoyal) {
    isStraight = true;
  }

  // (5) 役を決める
  if (isFlush && isRoyal) {
    return ROYAL_FLUSH;
  }
  if (isFlush && isStraight) {
    return STRAIGHT_FLUSH;
  }
  if (hasFour) {
    return FOUR_OF_A_KIND;
  }
  if (hasThree && pairCount === ONE_PAIR_COUNT) {
    return FULL_HOUSE;
  }
  if (isFlush) {
    return FLUSH;
  }
  if (isStraight) {
    return STRAIGHT;
  }
  if (hasThree) {
    return THREE_OF_A_KIND;
  }
  if (pairCount === TWO_PAIR_COUNT) {
    return TWO_PAIR;
  }
  if (pairCount === ONE_PAIR_COUNT) {
    return ONE_PAIR;
  }
  return HIGH_CARD;
};


//勝敗を決める
//手札の強さを強い順に並べる
const getPowerList = (hand) => {
  const powers = [];
  for (const card of hand) {
    powers.push(getCardPower(card));
  }
  powers.sort((a, b) => b - a);
  return powers;
};

const checkWinner = (dealerHand, dealerRole, childHand, childRole) => {
  //役がちがうなら、数字が大きいほうが勝ち
  if (dealerRole > childRole) {
    return WIN;
  }
  if (dealerRole < childRole) {
    return LOSE;
  }


  //ハイカード以外が引分
  if (dealerRole !== HIGH_CARD) {
    return DRAW;
  }

  // ハイカード同士
  const dealerPowers = getPowerList(dealerHand);
  const childPowers = getPowerList(childHand);
  for (let i = 0; i < HAND_SIZE; i++) {
    if (dealerPowers[i] > childPowers[i]) {
      return WIN;
    }
    if (dealerPowers[i] < childPowers[i]) {
      return LOSE;
    }
  }
  return DRAW; //5枚同じなら引分
};

//子の結果は親と反対
const getChildResult = (dealerResultText) => {
  if (dealerResultText === WIN) {
    return LOSE;
  }
  if (dealerResultText === LOSE) {
    return WIN;
  }
  return DRAW;
};


//ゲームボタン
const startGame = () => {
  const deck = makeCards();
  shuffleCards(deck);

  //親と子は同じ山札から引く
  const dealerHand = drawCards(deck);
  const childHand = drawCards(deck);

  const dealerRole = checkRole(dealerHand);
  const childRole = checkRole(childHand);
  const result = checkWinner(dealerHand, dealerRole, childHand, childRole);

  //カードと役を表示
  dealerCards.innerHTML = makeCardImages(dealerHand);
  childCards.innerHTML = makeCardImages(childHand);
  dealerRoleName.textContent = ROLE_NAMES[dealerRole];
  childRoleName.textContent = ROLE_NAMES[childRole];

  //勝ち負けを表示
  dealerResult.textContent = result;
  childResult.textContent = getChildResult(result);
};

gameButton.addEventListener('click', startGame);