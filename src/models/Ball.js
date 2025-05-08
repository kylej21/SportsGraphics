import * as THREE from 'three';

/*
    Ball
    - Constructor
    - shoot()
    - update()
    - reset()

    FREE TEXTURE FROM : https://www.vecteezy.com/vector-art/135839-basketball-texture-free-vector
*/



export class Ball {
  constructor() {
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const texture = new THREE.TextureLoader().load('/basketball.webp');
    const material = new THREE.MeshStandardMaterial({ map: texture });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 2, 0);
    this.velocity = null;
  }

  shoot() {
    this.velocity = new THREE.Vector3(0, 0.5, -0.17); 
  }

  update() {
    if (this.velocity) {
      this.mesh.position.add(this.velocity);
      this.velocity.y -= 0.03;
    }
  }
  reset() {
    this.mesh.position.set(0, 2, 0);
    this.velocity = null;
  }
}
