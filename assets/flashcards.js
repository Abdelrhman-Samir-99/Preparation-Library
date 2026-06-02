/* flashcards.js — generic flashcard runtime.
 *
 * Each topic page loads this together with theme.js, then calls
 * initFlashcards({ title, subtitle }). Questions are fetched from
 * ./questions.json (sibling to the page).
 *
 * Theme handling lives in theme.js.
 */

const CARD_FRONT_HEIGHT = 280;

let questions = [];
let order = [];
let currentIndex = 0;
let isFlipped = false;
let missed = new Set();
let mode = 'sequential';

function initFlashcards(config) {
  initTheme();
  document.getElementById('topicTitle').textContent = config.title;
  document.getElementById('topicSubtitle').textContent = config.subtitle;

  fetch('questions.json')
    .then(res => res.json())
    .then(data => {
      questions = data;
      order = questions.map((_, i) => i);
      showCard();
    });
}

function setMode(m) {
  mode = m;
  document.getElementById('btnSequential').classList.toggle('active', m === 'sequential');
  document.getElementById('btnShuffle').classList.toggle('active', m === 'shuffle');
  document.getElementById('btnMissedOnly').classList.toggle('active', m === 'missed');

  if (m === 'shuffle') {
    order = questions.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  } else if (m === 'missed') {
    if (missed.size === 0) {
      alert('No missed questions yet! Keep studying.');
      setMode('sequential');
      return;
    }
    order = [...missed];
  } else {
    order = questions.map((_, i) => i);
  }

  currentIndex = 0;
  missed = new Set();
  updateMissedCount();
  document.getElementById('completionScreen').style.display = 'none';
  document.getElementById('flashcardArea').style.display = 'block';
  showCard();
}

function showCard() {
  const card = document.getElementById('card');
  const container = document.querySelector('.card-container');

  if (isFlipped) {
    card.style.transition = 'none';
    container.style.transition = 'none';
    card.classList.remove('flipped');
    isFlipped = false;
    card.offsetHeight;
    card.style.transition = '';
    container.style.transition = '';
  }

  const q = questions[order[currentIndex]];
  document.getElementById('questionNumber').textContent = `Question ${order[currentIndex] + 1}`;
  document.getElementById('questionText').textContent = q.question;

  let answerHTML = formatMarkdown(q.answer);

  if (q.code) {
    for (const key of Object.keys(q.code)) {
      const block = q.code[key];
      answerHTML += `
        <div class="code-block">
          <div class="code-block-title">${block.title}</div>
          <pre>${syntaxHighlight(block.json)}</pre>
        </div>`;
    }
  }

  document.getElementById('answerText').innerHTML = answerHTML;
  container.style.height = CARD_FRONT_HEIGHT + 'px';

  const pct = ((currentIndex + 1) / order.length) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = `${currentIndex + 1} / ${order.length}`;
}

function flipCard() {
  isFlipped = !isFlipped;
  document.getElementById('card').classList.toggle('flipped', isFlipped);

  const container = document.querySelector('.card-container');
  if (isFlipped) {
    const backFace = document.querySelector('.card-back');
    container.style.height = Math.max(CARD_FRONT_HEIGHT, backFace.scrollHeight) + 'px';
  } else {
    container.style.height = CARD_FRONT_HEIGHT + 'px';
  }
}

function nextCard() {
  if (currentIndex < order.length - 1) {
    currentIndex++;
    showCard();
  } else {
    showCompletion();
  }
}

function prevCard() {
  if (currentIndex > 0) {
    currentIndex--;
    showCard();
  }
}

function markMissed() {
  missed.add(order[currentIndex]);
  updateMissedCount();
  setTimeout(() => nextCard(), 300);
}

function updateMissedCount() {
  document.getElementById('missedCount').textContent = missed.size;
}

function showCompletion() {
  document.getElementById('flashcardArea').style.display = 'none';
  const screen = document.getElementById('completionScreen');
  screen.style.display = 'block';

  const total = order.length;
  const known = total - missed.size;

  let msg = `You knew <span class="correct">${known}</span> out of <span class="correct">${total}</span> questions`;
  if (missed.size > 0) {
    msg += `<br><span class="wrong">${missed.size}</span> missed`;
    msg += `<br><br>Try "Missed Only" mode to review them!`;
    msg += `<div class="missed-list">`;
    for (const qi of missed) {
      msg += `<div class="missed-item">${questions[qi].question}</div>`;
    }
    msg += `</div>`;
  } else {
    msg += `<br><br>Perfect score!`;
  }

  document.getElementById('finalScore').innerHTML = msg;
}

function restart() {
  setMode('sequential');
}

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

function syntaxHighlight(json) {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(?:\\.|[^"\\])*")\s*:/g, '<span style="color:#79c0ff">$1</span>:')
    .replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span style="color:#a5d6ff">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span style="color:#ff7b72">$1</span>')
    .replace(/\b(Allow|Deny)\b/g, '<span style="color:#ffa657">$1</span>');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') nextCard();
  else if (e.key === 'ArrowLeft') prevCard();
  else if (e.key === ' ') { e.preventDefault(); flipCard(); }
  else if (e.key === '2') markMissed();
});
