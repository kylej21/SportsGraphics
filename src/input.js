export function handleInput(ball) {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        ball.shoot();
      }
      else if (e.code === 'Backspace') {
        ball.reset();
      }
    });
  }
  