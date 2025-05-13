import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const stoneTexture = loader.load('/stone.jpg');
stoneTexture.wrapS = THREE.RepeatWrapping;
stoneTexture.wrapT = THREE.RepeatWrapping;
stoneTexture.repeat.set(0.25, 0.25);

function createWall(geometry, position, offset = {}) {
  const material = new THREE.MeshStandardMaterial({ map: stoneTexture });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.copy(position);
  mesh.position.x += offset.x || 0;
  mesh.position.y += offset.y || 0.1;
  mesh.position.z += offset.z || 0;

  mesh.receiveShadow = true;
  mesh.castShadow = true;

  return mesh;
}

export function WallVL(position) {
  return createWall(new THREE.BoxGeometry(0.1, 0.2, 1), position, { x: 0.45 });
}

export function WallVR(position) {
  return createWall(new THREE.BoxGeometry(0.1, 0.2, 1), position, { x: -0.45 });
}

export function WallHT(position) {
  return createWall(new THREE.BoxGeometry(1, 0.2, 0.1), position, { z: 0.45 });
}

export function WallHB(position) {
  return createWall(new THREE.BoxGeometry(1, 0.2, 0.1), position, { z: -0.45 });
}

export function WallCorner(position) {
  return createWall(new THREE.BoxGeometry(0.15, 0.2, 0.15), position);
}

export function WallLU(position) {
  const group = new THREE.Group();
  group.add(WallVR(position));
  group.add(WallHT(position));
  group.add(WallHB(position));
  return group;
}

export function WallRU(position) {
  const group = new THREE.Group();
  group.add(WallVL(position));
  group.add(WallHT(position));
  group.add(WallHB(position));
  return group;
}

export function WallUU(position) {
  const group = new THREE.Group();
  group.add(WallVL(position));
  group.add(WallVR(position));
  group.add(WallHB(position));
  return group;
}

export function WallDU(position) {
  const group = new THREE.Group();
  group.add(WallVL(position));
  group.add(WallVR(position));
  group.add(WallHT(position));
  return group;
}

export function WallLR(position) {
  const group = new THREE.Group();
  group.add(WallVL(position));
  group.add(WallVR(position));
  return group;
}

export function WallTB(position) {
  const group = new THREE.Group();
  group.add(WallHT(position));
  group.add(WallHB(position));
  return group;
}

export function WallLT(position) {
  const group = new THREE.Group();
  group.add(WallVR(position));
  group.add(WallHB(position));
  return group;
}

export function WallRB(position) {
  const group = new THREE.Group();
  group.add(WallVL(position));
  group.add(WallHT(position));
  return group;
}
