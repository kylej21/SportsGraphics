import { scene, camera, renderer, controls } from './scene.js';
import { Player } from './models/Player.js';
import { Ball } from './models/Ball.js';
import { Hoop } from './models/Hoop.js';
import { handleInput } from './input.js';

const player = new Player();
const ball = new Ball();
const hoop = new Hoop();

scene.add(player.mesh);
scene.add(ball.mesh);
scene.add(hoop.mesh);

camera.position.z = 10;

function animate() {
  requestAnimationFrame(animate);
  ball.update(); 
  controls.update();
  renderer.render(scene, camera);
}

handleInput(ball); 

animate();
