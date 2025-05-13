import * as THREE from 'three';

export default function Ground(position) {
  const geometry = new THREE.BoxGeometry(1, 0.05, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x90ee90 });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.copy(position);
  mesh.position.y += 0.025; 

  mesh.receiveShadow = true;

  return mesh;
}
