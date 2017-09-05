const body = document.querySelector('body');
const playgrounds = document.querySelectorAll('.playground');
let currentPlaygroundIndex = 0;
let currentPlayground = playgrounds[currentPlaygroundIndex];
let nextPlayground;
let scrollTime = 600;
let isScrolling = false;
let events = {};

function scrollJack(e) {
  // If scrolling up
  if (isScrolling) return;
  isScrolling = true;
  if (e.deltaY < 0) {
    currentPlayground = playgrounds[currentPlaygroundIndex];
    if (currentPlaygroundIndex > 0) {
      currentPlaygroundIndex--;
    }
    nextPlayground = playgrounds[currentPlaygroundIndex];
    scrollToCurrentPlayground(false);
  } else {
    currentPlayground = playgrounds[currentPlaygroundIndex];
    if (currentPlaygroundIndex < playgrounds.length - 1) {
      currentPlaygroundIndex++;
    }
    nextPlayground = playgrounds[currentPlaygroundIndex];
    scrollToCurrentPlayground(true);
  }
}

function scrollToCurrentPlayground(isScrollDown) {
  if (!nextPlayground) return;
  if (isScrollDown) {
    currentPlayground.classList.add('current');
    nextPlayground.classList.add('next-scrolling', 'sliding');
    setTimeout(() => {
      currentPlayground.classList.remove('current');
      nextPlayground.classList.remove('next-scrolling', 'sliding');
      nextPlayground.classList.add('current');
      if (nextPlayground.dataset.playground) {
        document.dispatchEvent(events[nextPlayground.dataset.playground]);
      }
      isScrolling = false;
    }, scrollTime);
  } else {
    nextPlayground.classList.add('up');
    currentPlayground.classList.remove('current');
    nextPlayground.classList.remove('next-scrolling', 'sliding');
    nextPlayground.classList.add('current');
    setTimeout(() => {
      nextPlayground.classList.remove('up');
    }, 10);

    if (nextPlayground.dataset.playground) {
      document.dispatchEvent(events[nextPlayground.dataset.playground]);
    }
    isScrolling = false;
  }
}

function setupCustomEvents() {
  playgrounds.forEach(playground => {
    if (playground.dataset.playground) {
      events[playground.dataset.playground] = new Event(playground.dataset.playground);
    }
  });
}

document.addEventListener('wheel', scrollJack);

setupCustomEvents();
