import * as THREE from 'three';
import { keys } from './keys.js';

export let followingBall = true;

export class PlayerController {
  constructor() {
    this.position = new THREE.Vector3(0, 2, 0);
    this.rotation = new THREE.Euler(0, 0, 0);
    this.moveSpeed = 0.1;
    this.turnSpeed = 0.02;
  }

  update() {
    if (keys['KeyW']) this.position.z -= this.moveSpeed;
    if (keys['KeyS']) this.position.z += this.moveSpeed;
    if (keys['KeyA']) this.position.x -= this.moveSpeed;
    if (keys['KeyD']) this.position.x += this.moveSpeed;

    if (keys['ArrowLeft'])  this.rotation.y += this.turnSpeed;
    if (keys['ArrowRight']) this.rotation.y -= this.turnSpeed;
    if (keys['ArrowUp'])    this.rotation.x -= this.turnSpeed;
    if (keys['ArrowDown'])  this.rotation.x += this.turnSpeed;

    this.rotation.x = THREE.MathUtils.clamp(this.rotation.x, -Math.PI / 2, Math.PI / 2);
  }

  getCameraTransform() {
    const offset = new THREE.Vector3(0, 0.25, 0.5).applyEuler(this.rotation);
    const lookDir = new THREE.Vector3(0, 0.1, -1).applyEuler(this.rotation);
    return {
      cameraPos: this.position.clone().add(offset),
      lookAt: this.position.clone().add(lookDir)
    };
  }
}

export function handleInput(ball) {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && ball.mesh && followingBall) {
      ball.shoot();
      followingBall = false;
    }
    if (e.code === 'Backspace') {
      ball.reset();
      followingBall = true;
    }
  });
}
