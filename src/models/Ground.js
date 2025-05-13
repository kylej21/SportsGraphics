import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const grassTexture = loader.load('/grassnew.jpg');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(2, 2); 

export default function Ground(position) {
  const geometry = new THREE.BoxGeometry(1, 0.05, 1);
  const material = new THREE.MeshStandardMaterial({ map: grassTexture });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.position.y += 0.025;

  mesh.receiveShadow = true;
  return mesh;
}