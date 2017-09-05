const categories = ['fruits', 'vegetables'];
let entries = [];
let answer;

function setupGuess() {
  let category = categories[Math.floor(Math.random()*categories.length)];
  fetch(`./json/${category}.json`)
    .then(response => response.json())
    .then(json => {
      entries = json.entries;
      answer = entries[Math.floor(Math.random()*entries.length)];
      console.log(answer);
    });
}

document.addEventListener('guess', function() {
  setupGuess();
});
