let playerDeck = [];
let enemyDeck = [];
let enemyHistory = [];
let playerScore = 0;
let enemyScore = 0;
let winStreak = 0;
let isPlaying = false;
let jokerCrashLose = false;
let specialMessageTimer = null;
let soundOn = true;
const soundButton = document.getElementById("soundButton");
const titleSoundButton = document.getElementById("titleSoundButton");

const flipSound = new Audio("sounds/flip.mp3");
const winSound = new Audio("sounds/win.mp3");
const loseSound = new Audio("sounds/lose.mp3");
const jokerCrashSound = new Audio("sounds/jokerCrash.mp3");
jokerCrashSound.volume = 1.0;
const bgm = new Audio("sounds/bgm.mp3");
const bigCard = document.getElementById("bigCard");
const skillText = document.getElementById("skillText");

function preloadImages() {
  const imageFiles = [
    "joker.png",
    "peace.png",
    "explosion.png",
    "1.png",
    "2.png",
    "3.png",
    "4.png",
    "5.png",
    "6.png",
    "7.png",
    "8.png",
    "9.png",
    "10.png",
    "11.png",
    "12.png",
    "13.png"
  ];

  imageFiles.forEach(file => {
    const img = new Image();
    img.src = `images/${file}`;
  });
}

function showSkill(text) {
  skillText.textContent = text;
  skillText.classList.add("show");
}

function hideSkill() {
  skillText.classList.remove("show");
}

function getSkillName(card) {
  if (card === "J") return "戦略核兵器";

  const n = Number(card);

  if (n >= 13) return "自由の魔神";
  if (n >= 12) return "氷結の虎";
  if (n >= 11) return "眠れる獅子";
  if (n >= 10) return "数の暴力";
  if (n >= 9) return "精鋭特殊部隊";
  if (n >= 8) return "革命の処刑台";
  if (n >= 7) return "南北統一の夢";
  if (n >= 6) return "ドローン爆撃";
  if (n >= 5) return "鉄壁の防空";
  if (n >= 4) return "ゲリラ戦術";
  if (n >= 3) return "NATO連携";
  if (n >= 2) return "恫喝外交";
  return "憲法９条";
}

function showBigCard(value) {
  let src;

  if (value === "J") {
    src = "images/joker.png";
  } else {
    src = `images/${value}.png`;
  }

  bigCard.innerHTML = `<img src="${src}">`;
  bigCard.classList.add("show");
}

function hideBigCard() {
  bigCard.classList.remove("show");
}

bgm.loop = true;
bgm.volume = 0.3;
flipSound.volume = 0.8;
winSound.volume = 0.8;
loseSound.volume = 0.8;

const playerScoreDisplay = document.getElementById("playerScore");
const enemyScoreDisplay = document.getElementById("enemyScore");
const playerCard = document.getElementById("playerCard");
const enemyCard = document.getElementById("enemyCard");
const resultText = document.getElementById("result");
const handDiv = document.getElementById("hand");

function initGame() {
  playerDeck = [...Array(13).keys()].map(n => n + 1);
  playerDeck.push("J");

  enemyDeck = [...Array(13).keys()].map(n => n + 1);
  enemyDeck.push("J");

  enemyHistory = [];
  playerScore = 0;
  enemyScore = 0;

  updateScore();
  renderHand();
  renderHistory();

  renderCard(playerCard, "?");
  renderCard(enemyCard, "?");
}

function renderCard(el, value) {
  el.classList.remove("joker");

  if (value === "?") {
    el.innerHTML = "<span>?</span>";
    return;
  }

  let src;

  if (value === "J") {
    src = "images/joker.png";
  } else {
    src = `images/${value}.png`;
  }

  el.innerHTML = `<img src="${src}">`;
}

function renderHand() {
  handDiv.innerHTML = "";

  playerDeck.forEach(card => {
    const btn = document.createElement("button");
    btn.textContent = card === "J" ? "J" : card;

    if (card === "J") btn.classList.add("joker");

    btn.onclick = () => playTurn(card);

    handDiv.appendChild(btn);
  });
}

function playTurn(playerCardValue) {
  if (isPlaying) return;
  if (playerDeck.length === 0) return;

  isPlaying = true;

  if (soundOn) {
    bgm.play();
    flipSound.currentTime = 0;
    flipSound.play();
  }

const enemyIndex = Math.floor(Math.random() * enemyDeck.length);
const enemyCardValue = enemyDeck[enemyIndex];

  playerDeck = playerDeck.filter(c => c !== playerCardValue);
  enemyDeck.splice(enemyIndex, 1);

  renderHand();

  // 自分カード拡大
  showBigCard(playerCardValue);
  showSkill(getSkillName(playerCardValue));

  if (playerCardValue === "J") {
    triggerJokerEffect();
  }

  resultText.textContent = "あなたのカード！";

  setTimeout(() => {
    hideBigCard();
    hideSkill();
    clearJokerEffect();

    renderCard(playerCard, playerCardValue);
    renderCard(enemyCard, "?");
    animateOneCard(playerCard);

    resultText.textContent = "相手のカードを確認中...";

    setTimeout(() => {
      if (soundOn) {
        flipSound.currentTime = 0;
        flipSound.play();
      }

      // 相手カード拡大
      showBigCard(enemyCardValue);
      showSkill("敵：" + getSkillName(enemyCardValue));

      if (enemyCardValue === "J") {
        triggerJokerEffect();
      }

      setTimeout(() => {
        hideBigCard();
        hideSkill();
        clearJokerEffect();

        renderCard(enemyCard, enemyCardValue);
        animateOneCard(enemyCard);

        enemyHistory.push(enemyCardValue);
        renderHistory();

       resolveBattle(playerCardValue, enemyCardValue);
       updateScore();

       if (playerDeck.length === 0) {
       endGame();
       } else {
          isPlaying = false;
      }
      }, 1300);

    }, 800);

  }, 1300);
}

function resolveBattle(p, e) {
  let text = "";

if (p === "J" && e === "J") {
  jokerCrashLose = true;
  enemyScore += 999;
  text = "JOKER同士！両者は敗北...";

  bgm.pause();

  if (soundOn) {
    jokerCrashSound.currentTime = 0;
    jokerCrashSound.play();
  }

bigCard.innerHTML = `<img src="images/explosion.png">`;

bigCard.classList.remove("joker-effect");
bigCard.classList.add("show");
void bigCard.offsetWidth;
bigCard.classList.add("joker-effect");

skillText.textContent = "最悪の事態発生…";
skillText.classList.remove("peace", "doom");
skillText.classList.add("show", "doom");

setTimeout(() => {
  skillText.textContent = "世界は崩壊した...";
}, 2000);

setTimeout(() => {
  skillText.classList.remove("show", "doom");
  bigCard.classList.remove("show", "joker-effect");
}, 5000);

  playerDeck = [];

  } else if (p === "J" && e === 1) {
    enemyScore += 13;
    text = "JOKER負け！相手に13点";

    setTimeout(() => {
      showSpecialMessage("９条バリアで防がれた！");
    }, 1000);

  } else if (e === "J" && p === 1) {
    playerScore += 13;
    text = "JOKER撃破！+13点";

    setTimeout(() => {
      showSpecialMessage("９条バリアで防いだ！");
    }, 1000);

  } else if (p === "J" && e !== "J") {
    text = "JOKER勝ち（0点）";

  } else if (e === "J" && p !== "J") {
    text = "相手JOKER勝ち（0点）";

  } else {
    if (p > e) {
      playerScore += p - e;
      text = `勝ち！+${p - e}`;
    } else if (e > p) {
      enemyScore += e - p;
      text = `負け... 相手に+${e - p}`;
    } else {
      text = "引き分け";
    }
  }

  resultText.textContent = text;
}

function renderHistory() {
  const historyDiv = document.getElementById("enemyHistory");

  if (!historyDiv) return;

  historyDiv.innerHTML = "";

  const sorted = [...enemyHistory].sort((a, b) => {
    if (a === "J") return 1;
    if (b === "J") return -1;
    return a - b;
  });

  sorted.forEach(card => {
    const div = document.createElement("div");
    div.textContent = card;
    historyDiv.appendChild(div);
  });
}

function updateScore() {
  playerScoreDisplay.textContent = "あなた: " + playerScore;
  enemyScoreDisplay.textContent = "相手: " + enemyScore;
}

function endGame() {

  if (playerScore > enemyScore) {
    winStreak++;

    resultText.innerHTML = `
      勝利！<br>
      現在 ${winStreak} 連勝中！<br><br>
      次のゲームを開始しますか？<br>
      <button onclick="nextGame()">YES</button>
      <button onclick="stopGame(${winStreak})">NO</button>
    `;

    if (soundOn) winSound.play();

  } else if (enemyScore > playerScore) {
    const finalStreak = winStreak;

    resultText.innerHTML = `
      敗北...<br>
      最終連勝数：${finalStreak}<br><br>
      <button onclick="shareResult(${finalStreak})">SNSに投稿</button>
      <button onclick="stopGame(${finalStreak})">OK</button>
    `;

    winStreak = 0;

    bgm.pause();

    if (soundOn && !jokerCrashLose) loseSound.play();

    jokerCrashLose = false;

  } else {
    const finalStreak = winStreak;

    resultText.innerHTML = `
      引き分け！<br>
      最終連勝数：${finalStreak}<br><br>
      <button onclick="shareResult(${finalStreak})">SNSに投稿</button>
      <button onclick="stopGame(${finalStreak})">OK</button>
    `;

    winStreak = 0;

    bgm.pause();
  }
}
function resetGame() {
  isPlaying = false; //

  bgm.pause();
  bgm.currentTime = 0;

  winStreak = 0;

  initGame();
  resultText.textContent = "カードを選んでください";
}

function nextGame() {
  isPlaying = false; //

  initGame();
  resultText.textContent = "カードを選んでください";
}

function stopGame(streak) {
  const finalStreak = streak ?? winStreak ?? 0;

  resultText.innerHTML = `
    最終連勝数：${finalStreak}<br><br>
    <button onclick="shareResult(${finalStreak})">SNSに投稿</button>
  `;
}

function shareResult(streak) {
  const text = `世界大戦カードバトルで ${streak} 連勝！🔥
何連勝いける？
https://no-more-nukes.netlify.app/`;

  const hashtags = "世界大戦カードバトル,NOMORENUKES";

  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=${hashtags}`;

  window.open(url, "_blank");
}

function animateOneCard(cardEl) {
  cardEl.classList.remove("flip");
  void cardEl.offsetWidth;
  cardEl.classList.add("flip");
}

function triggerJokerEffect() {
  bigCard.classList.remove("joker-effect");
  void bigCard.offsetWidth;
  bigCard.classList.add("joker-effect");

  skillText.classList.add("joker");
}

function clearJokerEffect() {
  skillText.classList.remove("joker");
}

function showSpecialMessage(text, image = "peace.png", type = "peace", duration = 1400) {
  if (specialMessageTimer) {
    clearTimeout(specialMessageTimer);
  }

  bigCard.innerHTML = `<img src="images/${image}">`;
  bigCard.classList.add("show");

  skillText.textContent = text;

  skillText.classList.remove("peace", "doom");
  skillText.classList.add("show", type);

  bigCard.classList.remove("joker-effect");
  void bigCard.offsetWidth;
  bigCard.classList.add("joker-effect");

  specialMessageTimer = setTimeout(() => {
    skillText.classList.remove("show", type);
    bigCard.classList.remove("show", "joker-effect");
  }, duration);
}

function toggleSound() {
  soundOn = !soundOn;

  const text = soundOn ? "🔊 音ON" : "🔇 音OFF";

  if (soundButton) soundButton.textContent = text;
  if (titleSoundButton) titleSoundButton.textContent = text;

  if (soundOn) {
    bgm.play();
  } else {
    bgm.pause();
  }
}

function showRules() {
  alert(
`【世界大戦カードバトル ルール】

・お互いに1〜13とJOKERを1枚ずつ持つ
・毎ターン、カードを1枚ずつ出して勝負
・数字同士は大きい方が勝ち
・得点は数字の差

例：
あなた5、相手3 → あなたに2点

・JOKERは2〜13に勝つ
・JOKERで勝っても得点は0
・JOKERは1にだけ負ける
・1でJOKERに勝つと13点
・お互いがJOKERを出した場合、その時点で敗北（特殊ルール）

全カードを出し終えた時点で
得点が高い方の勝ち！`
  );
}
function playSound(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === "click") {
    osc.type = "square";
    osc.frequency.value = 520;
    gain.gain.value = 0.08;
  }

  if (type === "win") {
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.12;
  }

  if (type === "lose") {
    osc.type = "sawtooth";
    osc.frequency.value = 180;
    gain.gain.value = 0.1;
  }

  osc.start();

  setTimeout(() => {
    osc.stop();
  }, 120);
}

const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");

gameScreen.style.display = "none";

function startGame() {
  titleScreen.classList.add("fade-out");

  setTimeout(() => {
    titleScreen.style.display = "none";
    gameScreen.style.display = "block";
    gameScreen.classList.add("fade-in");

    initGame();

    if (soundOn) {
      bgm.currentTime = 0;
      bgm.play();
    }
  }, 1000);
}

const initialText = soundOn ? "🔊 音ON" : "🔇 音OFF";
if (soundButton) soundButton.textContent = initialText;
if (titleSoundButton) titleSoundButton.textContent = initialText;

preloadImages();
initGame();