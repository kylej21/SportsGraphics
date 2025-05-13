import * as THREE from 'three';
import GrassShaderMaterial from '../shaders/GrassBlades.js';

export default function RoughField(bounds, courseTileData, tileCount) {
  const bladeCount = 100000;
  const dummy = new THREE.Object3D();
  const geometry = new THREE.PlaneGeometry(0.03, 0.1, 1, 4);
  geometry.translate(0, 0.15, 0);

  const offsetArray = new Float32Array(bladeCount);
  for (let i = 0; i < bladeCount; i++) {
    offsetArray[i] = Math.random() * 2.0 + 1.0;
  }
  geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsetArray, 1));

  const material = GrassShaderMaterial(courseTileData, tileCount);
  const mesh = new THREE.InstancedMesh(geometry, material, bladeCount);

  const spreadX = bounds.width + 15;
  const spreadZ = bounds.height + 15;

  for (let i = 0; i < bladeCount; i++) {
    const x = (Math.random() - 0.5) * spreadX + bounds.width / 2;
    const z = (Math.random() - 0.5) * spreadZ + bounds.height / 2;
    dummy.position.set(x, 0, z);
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.scale.setScalar(0.5 + Math.random() * 0.5);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  mesh.frustumCulled = false;
  return mesh;
}