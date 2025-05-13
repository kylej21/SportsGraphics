import * as THREE from 'three';
import FlagShaderMaterial from '../shaders/FlagShader.js';

const loader = new THREE.TextureLoader();
const grassTexture = loader.load('/grassnew.jpg');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(2, 2);

export default function HoleTile(position) {
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, -0.5);
  shape.lineTo(0.5, -0.5);
  shape.lineTo(0.5, 0.5);
  shape.lineTo(-0.5, 0.5);
  shape.lineTo(-0.5, -0.5);

  const holeRadius = 0.06;
  const holePath = new THREE.Path();
  holePath.absellipse(0, 0, holeRadius, holeRadius, 0, Math.PI * 2, false);
  shape.holes.push(holePath);

  const holeDepth = 0.03;

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: holeDepth,
    bevelEnabled: false
  });

  const topMaterial = new THREE.MeshStandardMaterial({
    map: grassTexture,
    side: THREE.DoubleSide
  });

  const sideMaterial = new THREE.MeshStandardMaterial({
    color: 0x654321,
    side: THREE.DoubleSide
  });

  const materials = [topMaterial, sideMaterial];
  const tile = new THREE.Mesh(geometry, materials);

  tile.rotation.x = -Math.PI / 2;
  tile.position.set(position.x, position.y + 0.02, position.z); 
  tile.receiveShadow = true;

  const dirt = new THREE.Mesh(
    new THREE.CylinderGeometry(holeRadius, holeRadius, 0.001, 32),
    new THREE.MeshStandardMaterial({ color: 0x654321 })
  );

  dirt.position.set(position.x, position.y + 0.02 - holeDepth + 0.03, position.z); 
  dirt.receiveShadow = true;

  const poleHeight = 1;
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, poleHeight, 8),
    new THREE.MeshStandardMaterial({ color: 0x888888 }) 
  );
  pole.position.set(position.x, position.y + 0.02 - holeDepth + 0.0005 + poleHeight / 2, position.z);
  pole.castShadow = true;


  const flagWidth = 0.25;
  const flagHeight = 0.125;

  const flagGeometry = new THREE.PlaneGeometry(flagWidth, flagHeight);
  flagGeometry.translate(flagWidth / 2, 0, 0);
  const flagMaterial = FlagShaderMaterial();
  const flag = new THREE.Mesh(flagGeometry, flagMaterial);

  flag.position.set(
  position.x,
  pole.position.y + poleHeight / 2 - 0.05,
  position.z
);
  flag.rotation.y = Math.PI/4; 
  const group = new THREE.Group();
  group.add(tile);
  group.add(dirt);
  group.add(pole);
  group.add(flag);


  return group;
}
