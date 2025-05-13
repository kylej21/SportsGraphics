import * as THREE from 'three';

export default class Ball {
  constructor(position) {
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xff8c00 }); // orange
    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.position.copy(position);
    this.mesh.position.y += 0.3;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    return this.mesh; 
  }
}
