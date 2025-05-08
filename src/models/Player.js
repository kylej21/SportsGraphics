import * as THREE from 'three';

export class Player {
  constructor() {
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 1, 0);
  }
}
