import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Sphere } from 'three';

export class Ball {
  constructor(scene, onLoad = () => {}) {
    const loader = new GLTFLoader();
    this.boundingSphere = new Sphere();
    this.boundingSphere.radius = 0.3;
    this.velocity = null;
    this.framesSinceShot = null;
    this.mesh = null;

    loader.load('/basket_ball.glb', (gltf) => {
      const ballMesh = gltf.scene.getObjectByName('Basketball_Optimized');

      if (!ballMesh) {
        console.warn('Ball mesh not found in GLB');
        return;
      }

      this.mesh = ballMesh;
      this.mesh.position.set(0, 2, 0);
      scene.add(this.mesh);
      onLoad(this.mesh);
    }, undefined, (error) => {
      console.error('Error loading ball model:', error);
    });
  }

  shoot() {
    if (this.mesh) {
      this.velocity = new THREE.Vector3(0, 0.25, -0.0675);
      this.framesSinceShot = 0;
    }
  }

  update(hoopMesh) {
    if (!this.mesh || !this.velocity) return;

    this.mesh.position.add(this.velocity);
    this.velocity.y -= 0.0075;

    this.boundingSphere.center.copy(this.mesh.position);
    this.boundingSphere.radius = 0.3;

    if (this.framesSinceShot !== null) {
      this.framesSinceShot++;
    }

    if (hoopMesh && this.framesSinceShot > 5) {
      const hoopBox = new Box3().setFromObject(hoopMesh);
      if (hoopBox.intersectsSphere(this.boundingSphere)) {
        console.log("Hit the hoop!");
        this.velocity.z *= -0.6;
        this.velocity.x *= 0.6;
        this.velocity.y *= -0.3;
        this.mesh.position.add(this.velocity.clone().normalize().multiplyScalar(0.1));
      }
    }
  }

  reset() {
    if (this.mesh) {
      this.mesh.position.set(0, 2, 0);
      this.velocity = null;
      this.framesSinceShot = null;
      this.boundingSphere.center.copy(this.mesh.position);
    }
  }
}
