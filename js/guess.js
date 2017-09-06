const categories = ['fruits', 'vegetables'];
let entries = [];
let answerObj = {};
let allClues;
let chosenClues = [];
let category = getRandomArrayEntry(categories);
let gameOn;
let currentWinStreak = 0;
let bestWinStreak;
let incorrectAnswers = {
  total: 3,
  current: 0
}

const dom = {
  bestWinStreak: document.querySelector('.guess .best-win-streak .value'),
  currentWinStreak: document.querySelector('.guess .current-win-streak .value'),
  categoryText: document.querySelector('.guess .category-text'),
  inputForm: document.querySelector('.guess form[name="guess-form"]'),
  textInput: document.querySelector('.guess form[name="guess-form"] input[type="text"]'),
  guessResults: document.querySelectorAll('.guess [data-guess]'),
  clues: document.querySelector('.guess .clue-text'),
  winScreen: document.querySelector('.guess .win'),
  loseScreen: document.querySelector('.guess .lose')
}
// Utility functions

function getRandomArrayEntry(array) {
  return array[Math.floor(Math.random()*array.length)];
}

// Clue functions

function buildClueHints(clues, answer) {
  let finalClues = [];
  clues.forEach(clue => {
    if (clue.key == 'beginsWith') {
      clue.finalSentence = clue.sentence + answer.charAt(0).toUpperCase() + '.';
    } else if (clue.key == 'endsWith') {
      clue.finalSentence = clue.sentence + answer.substr(-1).toUpperCase() + '.';
    } else if (clue.key == 'length') {
      clue.finalSentence = clue.sentence + answer.length + ' characters.';
    }
    finalClues.push(clue.finalSentence);
  });
  return finalClues;
}

function buildClues(allClues, answer) {
  let unfinishedClues = [];
  unfinishedClues[0] = getRandomArrayEntry(allClues);
  unfinishedClues[1] = getRandomArrayEntry(allClues);
  while (unfinishedClues[0] === unfinishedClues[1]) {
    unfinishedClues[1] = getRandomArrayEntry(allClues);
  }
  chosenClues = buildClueHints(unfinishedClues, answer);
}

// Category functions
function showCategory(category) {
  dom.categoryText.classList.remove('chosen');
  let cats = [...categories];
  let iteration = {
    totalTime: 500,
    totalIterations: 5,
    currentIteration: 0,
    catIndex: 0
  }
  let finalCategoryIndex = categories.findIndex((cat) => cat === category);
  let categoryInterval = setInterval(() => {
    if (iteration.catIndex > cats.length - 1) {
      iteration.catIndex = 0;
    }
    if (iteration.currentIteration > iteration.totalIterations) {
      if (cats[iteration.catIndex] === category) {
        clearInterval(categoryInterval);
        gameOn = true;
        dom.categoryText.classList.add('chosen');
      }
    }
    dom.categoryText.textContent = cats[iteration.catIndex];
    iteration.currentIteration++;
    iteration.catIndex++;
  }, iteration.totalTime / cats.length);
}

// Input

function handleGameOver(win) {
  gameOn = false;
  if (win) {
    dom.inputForm.classList.add('hide');
    dom.winScreen.classList.remove('hide');
    currentWinStreak++;
    dom.currentWinStreak.textContent = currentWinStreak;
    if (currentWinStreak > bestWinStreak) {
      localStorage.setItem('bestWinStreak', currentWinStreak);
    }
  } else {
    dom.inputForm.classList.add('hide');
    dom.loseScreen.classList.remove('hide');
    currentWinStreak = 0;
  }
}

function verifyGuess(guess) {
  guess = guess.toLowerCase().replace(/\s/g, '');
  // If guess is incorrect
  if (guess !== answerObj.strippedAnswer) {
    incorrectAnswers.current++;
    // If user has enough incorrect guesses for a game over
    if (incorrectAnswers.current === incorrectAnswers.total) {
      markGuessResults(incorrectAnswers.current);
      handleGameOver(false);
    // If user does NOT have enough incorrect guesses for a game over
    } else {
      markGuessResults(incorrectAnswers.current);
      giveClue();
    }
  // If guess is correct
  } else {
    markGuessResults(incorrectAnswers.current++, true);
    handleGameOver(true);
  }
}

function giveClue() {
  let div = document.createElement('div');
  div.textContent = chosenClues.splice(0, 1);
  dom.clues.appendChild(div);
}

function markGuessResults(current, correct = false) {
  dom.guessResults.forEach(result => {
    if (result.dataset.guess == incorrectAnswers.current) {
      if (correct) {
        result.classList.add('correct');
      } else {
        result.classList.add('incorrect');
      }
    }
  });
}

function clearGuessResults() {
  dom.guessResults.forEach(result => {
    result.classList.remove('correct');
    result.classList.remove('incorrect');
  });
}

function handleGuessInput(e) {
  e.preventDefault();
  if (!gameOn || dom.textInput.value.trim().length == 0) return;
  let guess = dom.textInput.value;
  verifyGuess(guess);
  dom.inputForm.reset();
}

// Master reset function

function resetGuess() {
  gameOn = false;
  bestWinStreak = localStorage.getItem('bestWinStreak') || 0;
  dom.currentWinStreak.textContent = currentWinStreak;
  dom.bestWinStreak.textContent = bestWinStreak;
  dom.clues.innerHTML = '';
  incorrectAnswers.current = 0;
  clearGuessResults();
  dom.inputForm.classList.remove('hide');
  dom.winScreen.classList.add('hide');
  dom.loseScreen.classList.add('hide');
  dom.textInput.focus();
  Promise.all([getCategoryData, getClueData]).then((response) => {
    dom.inputForm.reset();
    entries = response[0];
    answerObj.trueAnswer = entries[Math.floor(Math.random()*entries.length)];
    answerObj.strippedAnswer = answerObj.trueAnswer.replace(/\s/g, '');
    allClues = response[1];
    buildClues(allClues, answerObj.strippedAnswer);
    showCategory(category);
    console.log(answerObj.strippedAnswer);
  });
}

function checkForReset(e) {
  if (e.keyCode === 13 && !gameOn) {
    resetGuess();
  }
}

// API

let getClueData = fetch(`./json/clues.json`)
  .then(response => response.json())
  .then(json => {
    return json.entries;
  });

let getCategoryData = fetch(`./json/${category}.json`)
  .then(response => response.json())
  .then(json => {
    return json.entries;
  });

dom.inputForm.addEventListener('submit', handleGuessInput);
document.addEventListener('guess', resetGuess);
document.addEventListener('keydown', checkForReset);
