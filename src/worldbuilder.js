import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
const greensTexture = textureLoader.load('/darkgreenstext.jpeg'); 
greensTexture.wrapS = THREE.RepeatWrapping;
greensTexture.wrapT = THREE.RepeatWrapping;
greensTexture.repeat.set(4, 4);

export function addGroundPlane(scene, bounds) {
  const sizeX = bounds.width + 10;
  const sizeZ = bounds.height + 10;

  const geometry = new THREE.PlaneGeometry(sizeX, sizeZ);
  const material = new THREE.MeshStandardMaterial({ map: greensTexture }); 

  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;

  ground.position.set(
    bounds.width / 2 - 0.5,
    0, 
    bounds.height / 2 - 0.5
  );

  ground.receiveShadow = true;
  scene.add(ground);
}

export function SkyDome(bounds) {
  const radius = Math.max(bounds.width, bounds.height) * 1.5;
  const geometry = new THREE.SphereGeometry(radius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0x87ceeb,
    side: THREE.BackSide,
  });

  const dome = new THREE.Mesh(geometry, material);
  dome.position.set(bounds.width / 2 - 0.5, 0, bounds.height / 2 - 0.5);

  return dome;
}

export function getCourseTileCenters(levelData) {
  const positions = [];
  for (let z = 0; z < levelData.length; z++) {
    for (let x = 0; x < levelData[0].length; x++) {
      const cell = levelData[z][x];
      if (cell === '0' || cell === 'X' || cell === 'S' || cell === '1') {
        positions.push(x, z);
      }
    }
  }
  return new Float32Array(positions);
}
