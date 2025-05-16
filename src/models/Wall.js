import * as THREE from "three";

const loader = new THREE.TextureLoader();
const stoneTexture = loader.load("/stone.jpg");
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

function createLeftWall(position) {
  return createWall(new THREE.BoxGeometry(0.1, 0.2001, 1.001), position, {
    x: -0.45,
  });
}

function createRightWall(position) {
  return createWall(new THREE.BoxGeometry(0.1, 0.2001, 1.001), position, {
    x: +0.45,
  });
}

function createTopWall(position) {
  return createWall(new THREE.BoxGeometry(1, 0.2, 0.1), position, { z: -0.45 });
}

function createBottomWall(position) {
  return createWall(new THREE.BoxGeometry(1, 0.2, 0.1), position, { z: +0.45 });
}

export function createWallsFromString(position, wallString) {
  const group = new THREE.Group();

  if (wallString.includes("L")) group.add(createLeftWall(position));
  if (wallString.includes("R")) group.add(createRightWall(position));
  if (wallString.includes("T")) group.add(createTopWall(position));
  if (wallString.includes("B")) group.add(createBottomWall(position));

  return group;
}

export function WallCorner(position) {
  return createWall(new THREE.BoxGeometry(0.15, 0.2, 0.15), position);
}
