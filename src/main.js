import * as THREE from 'three';
import { scene, camera, renderer } from './scene.js';
import { Ball } from './models/Ball.js';
import { Hoop } from './models/Hoop.js';
import { PlayerController, handleInput, followingBall } from './playercontrols/playermovement.js';
import { setupInputHandlers } from './playercontrols/keys.js';

setupInputHandlers();

const player = new PlayerController();
const ball = new Ball(scene, () => {});
const hoop = new Hoop(scene);

handleInput(ball);

function animate() {
  requestAnimationFrame(animate);

  player.update();

  if (ball.mesh) {
    ball.update(hoop.mesh);
  }

  if (ball.mesh && followingBall) {
    ball.mesh.position.copy(player.position);
    const { cameraPos, lookAt } = player.getCameraTransform();
    camera.position.copy(cameraPos);
    camera.lookAt(lookAt);
  }

  renderer.render(scene, camera);
}

animate();
