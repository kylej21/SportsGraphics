import * as THREE from 'three';

export class Hoop {
  constructor() {
    const ring = new THREE.TorusGeometry(0.6, 0.05, 16, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(ring, material);
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.position.set(0, 3.5, -5);
  }
}
