import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
const golfTexture = textureLoader.load('/golftext.avif'); 
golfTexture.wrapS = THREE.RepeatWrapping;
golfTexture.wrapT = THREE.RepeatWrapping;
golfTexture.repeat.set(1, 1);

export default class Ball {
  constructor(position) {
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshStandardMaterial({ map: golfTexture });
    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.scale.set(0.1, 0.1, 0.1);
    this.mesh.position.copy(position);
    this.mesh.position.y += 0.07;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    return this.mesh; 
  }
}
