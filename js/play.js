// getCurrentLanguage() comes from language.js, word lists from words-xx.js


let words = [];
let secret = "";
let currentRow = 0;
let col = 0;
let gameover = false;
let guess = "";
let startTime = Date.now();
let timerInterval;
const maxRows = 6;
let current_lang = getCurrentLanguage();

const grid = document.getElementById('grid');

// build grid
for(let i=0;i<maxRows*5;i++){
  const div = document.createElement('div');
  div.className = 'cell';
  grid.appendChild(div);
}

let ready = false;

function init() {
  words = (window.WORDS && window.WORDS[current_lang]) || [];
  // empty list (e.g. Dutch not filled in yet) -> fall back to English
  if (words.length === 0 && current_lang !== "en") {
    console.warn(`No ${current_lang} words yet, falling back to English words`);
    words = (window.WORDS && window.WORDS.en) || [];
  }

  if (words.length === 0) {
    alert("Could not load the word list (js/words-en.js).");
    return;
  }

  secret = pickWord();
  ready = true;
  console.log("Words loaded:", words.length);
}

function pickWord() {
  return words[Math.floor(Math.random() * words.length)];
}

init();

// ONE place that handles input, used by the real keyboard AND the on-screen keyboard
function handleKey(key){
  if(gameover) return;

  if(key === 'Enter'){
    submitGuess();
    return;
  }

  if(key === 'Backspace'){
    if(col > 0){
      col--;
      guess = guess.slice(0, -1);
      grid.children[currentRow*5 + col].textContent = "";
    }
    return;
  }

  if(key.length === 1 && /[a-zA-Z]/.test(key) && col < 5){
    const letter = key.toLowerCase();
    grid.children[currentRow*5 + col].textContent = letter;
    guess += letter;
    col++;
  }
}

// physical keyboard (desktop)
document.addEventListener("keydown", (e) => {
  if(e.ctrlKey || e.metaKey || e.altKey) return;
  if(e.key === 'Enter') e.preventDefault();
  handleKey(e.key);
});

// ---------- on-screen keyboard (phones) ----------
const keyboardEl = document.getElementById('keyboard');
const keyRows = ["qwertyuiop", "asdfghjkl", "+zxcvbnm-"]; // + = Enter, - = Backspace
const keyButtons = {};

keyRows.forEach(rowLetters => {
  const row = document.createElement('div');
  row.className = 'key-row';
  for(const ch of rowLetters){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'key';
    if(ch === '+'){ btn.textContent = 'ENTER'; btn.dataset.key = 'Enter'; btn.classList.add('wide'); }
    else if(ch === '-'){ btn.textContent = '\u232B'; btn.dataset.key = 'Backspace'; btn.classList.add('wide'); }
    else { btn.textContent = ch; btn.dataset.key = ch; keyButtons[ch] = btn; }
    row.appendChild(btn);
  }
  keyboardEl.appendChild(row);
});

// mousedown preventDefault stops the buttons from taking focus (so physical Enter can't re-click them)
keyboardEl.addEventListener('mousedown', e => e.preventDefault());
keyboardEl.addEventListener('click', e => {
  const btn = e.target.closest('.key');
  if(btn) handleKey(btn.dataset.key);
});

// colour the keys after a guess (green > yellow > red)
function updateKeyColors(row){
  const rank = { red: 1, yellow: 2, green: 3 };
  for(let i=0;i<5;i++){
    const cell = grid.children[row*5 + i];
    const btn = keyButtons[cell.textContent];
    if(!btn) continue;
    const status = ['green','yellow','red'].find(c => cell.classList.contains(c));
    const current = ['green','yellow','red'].find(c => btn.classList.contains(c));
    if(!current || rank[status] > rank[current]){
      btn.classList.remove('green','yellow','red');
      btn.classList.add(status);
    }
  }
}

function resetKeyboard(){
  Object.values(keyButtons).forEach(b => b.classList.remove('green','yellow','red'));
}

function submitGuess(){

  if(!ready) return; // word list not loaded yet

  if(guess.length !== 5) {
    alert("Enter 5 letters");
  return;
  }

  if(!words.includes(guess)){
    alert("Not a valid word!");
    return;
  }

let secretArr = secret.split('');
let guessArr = guess.split('');


  for(let i=0;i<5;i++){
    const cell = grid.children[currentRow*5 + i];
    
    // green
    if(guessArr[i] === secretArr[i]){
      cell.classList.add('green');
      secretArr[i] = null;
      guessArr[i] = null;
    }
  }

  // yellow and red
  for(let i=0;i<5;i++){
    const cell = grid.children[currentRow*5 + i];
    
    if(guessArr[i] === null) continue;

    let index = secretArr.indexOf(guessArr[i]);
    if(index !== -1){
      cell.classList.add('yellow');
      secretArr[index] = null;
    } else {
      cell.classList.add('red');
    }
  }

  updateKeyColors(currentRow);

  if (guess === secret) {
  gameover = true;

  clearInterval(timerInterval);

  document.getElementById("FinalTime").textContent = 
    document.getElementById("timer").textContent;

  setTimeout(() => {
    document.getElementById("victoryScreen").classList.remove("hidden");
  }, 200);
}

  currentRow++;
  col = 0;
  guess = "";

  if(currentRow === maxRows && !gameover){
  gameover = true;

  clearInterval(timerInterval);

  // show the correct word
  document.getElementById("lostWord").textContent = secret;

  document.getElementById("FinalTimeLose").textContent = 
    document.getElementById("timer").textContent;


  setTimeout(() => {
    document.getElementById("loseScreen").classList.remove("hidden");
  }, 200);
}
}

document.getElementById("playAgainBtn").addEventListener("click", () => {
  clearInterval(timerInterval);
  document.getElementById("timer").textContent = "0:00";
  startTimer();
  document.activeElement.blur(); // so Enter doesn't re-click the button

  // hide victory screen
  document.getElementById("victoryScreen").classList.add("hidden");

  // reset variables
  currentRow = 0;
  col = 0;
  guess = "";
  gameover = false;

  // clear grid
  for (let i = 0; i < grid.children.length; i++) {
    grid.children[i].textContent = "";
    grid.children[i].classList.remove("green", "yellow", "red");
  }

  // pick new word
  secret = pickWord();
  resetKeyboard();

  console.log("New secret:", secret);
});

// PLAY AGAIN (LOSE)
document.getElementById("playAgainLoseBtn").addEventListener("click", () => {
  clearInterval(timerInterval);
  document.getElementById("timer").textContent = "0:00";
  startTimer();
  document.activeElement.blur(); // so Enter doesn't re-click the button

  document.getElementById("loseScreen").classList.add("hidden");

  currentRow = 0;
  col = 0;
  guess = "";
  gameover = false;

  for (let i = 0; i < grid.children.length; i++) {
    grid.children[i].textContent = "";
    grid.children[i].classList.remove("green", "yellow", "red");
  }

  secret = pickWord();
  resetKeyboard();
});


function startTimer() {
  startTime = Date.now();

  timerInterval = setInterval(() => {
    let now = Date.now();
    let diff = Math.floor((now - startTime) / 1000);

    let minutes = Math.floor(diff / 60);
    let seconds = diff % 60;

    document.getElementById("timer").textContent =
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}
startTimer();
