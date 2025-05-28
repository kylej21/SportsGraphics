import * as THREE from "three";
import SkyDomeShaderMaterial from "./shaders/SkyShader.js";
import LeafSwayShader from "./shaders/LeafShader.js";

const textureLoader = new THREE.TextureLoader();
const barkTexture = textureLoader.load("/HazelnutBark.png");
const leavesTexture = textureLoader.load("/HazelnutLeaves.png");
const leavesAlpha = textureLoader.load("/HazelnutLeavesMask.png");

const greensTexture = textureLoader.load("/darkgreenstext.jpeg");
greensTexture.wrapS = THREE.RepeatWrapping;
greensTexture.wrapT = THREE.RepeatWrapping;
greensTexture.repeat.set(4, 4);

export function generateHazelnuts(baseModel, domeRadius, courseTileArray) {
  const group = new THREE.Group();

  const courseTilesSet = new Set();
  for (let i = 0; i < courseTileArray.length; i += 2) {
    const x = Math.floor(courseTileArray[i]);
    const z = Math.floor(courseTileArray[i + 1]);
    courseTilesSet.add(`${x}_${z}`);
  }

  for (let i = 0; i < 30; i++) {
    const x = (Math.random() - 0.25) * domeRadius * 2;
    const z = (Math.random() - 0.25) * domeRadius * 2;

    const tileX = Math.floor(x);
    const tileZ = Math.floor(z);

    let overlapsCourse = false;
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (courseTilesSet.has(`${tileX + dx}_${tileZ + dz}`)) {
          overlapsCourse = true;
        }
      }
    }
    if (overlapsCourse) continue;

    const nut = baseModel.clone();
    const swayMaterial = LeafSwayShader(leavesTexture, leavesAlpha);

    nut.traverse((child) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase();
        if (name.includes("tree")) {
          child.material = new THREE.MeshStandardMaterial({ map: barkTexture });
        } else if (name.includes("leaf") || name.includes("leaves")) {
          child.material = swayMaterial;
        } else {
          child.material = new THREE.MeshStandardMaterial({ color: "green" });
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    nut.position.set(x, 0, z);
    nut.rotation.y = Math.random() * Math.PI * 2;
    nut.scale.setScalar(0.1 + Math.random() * 0.125);

    group.add(nut);
  }

  return group;
}

export function addGroundPlane(scene, bounds) {
  const radius = Math.max(bounds.width, bounds.height) * 1.5;
  const sizeX = radius * 1.5;
  const sizeZ = radius * 1.5;

  const geometry = new THREE.PlaneGeometry(sizeX, sizeZ);
  const material = new THREE.MeshStandardMaterial({ map: greensTexture });

  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;

  ground.position.set(bounds.width / 2 - 0.5, 0, bounds.height / 2 - 0.5);

  ground.receiveShadow = true;
  scene.add(ground);
}

export function SkyDome(bounds) {
  const skytextureLoader = new THREE.TextureLoader();
  const silhouetteTex = skytextureLoader.load("/sunset.png");

  const radius = Math.max(bounds.width, bounds.height) * 1.1;

  const geometry = new THREE.SphereGeometry(
    radius,
    32,
    32,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2,
  );

  const skyMaterial = SkyDomeShaderMaterial(silhouetteTex);
  const dome = new THREE.Mesh(geometry, skyMaterial);

  dome.position.set(bounds.width / 2 - 0.5, 0, bounds.height / 2 - 0.5);

  return dome;
}

export function getCourseTileCenters(levelData) {
  const positions = [];
  for (let z = 0; z < levelData.length; z++) {
    for (let x = 0; x < levelData[0].length; x++) {
      const cell = levelData[z][x];
      if (cell === "0" || cell === "X" || cell === "S" || cell === "1") {
        positions.push(x, z);
      }
    }
  }
  return new Float32Array(positions);
}
