import * as THREE from 'three';

export default function Hole(position) {
  const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.01, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x654321 });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.copy(position);
  mesh.position.y += 0.005; // Just above ground

  mesh.receiveShadow = true;

  return mesh;
}