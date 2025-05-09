export function handleInput(ball) {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && ball.mesh && followingBall) {
        ball.shoot();
        followingBall = false;
      }
      else if (e.code === 'Backspace') {
        ball.reset();
      }
    });
  }
  