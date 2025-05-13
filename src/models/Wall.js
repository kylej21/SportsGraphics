import * as THREE from 'three';

export default function Wall(position) {
  const geometry = new THREE.BoxGeometry(1, 0.2, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0xd3d3d3 });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.copy(position);
  mesh.position.y += 0.1;

  mesh.receiveShadow = true;
  mesh.castShadow = true;

  return mesh;
}
