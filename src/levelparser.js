import * as THREE from 'three';
import Wall from './models/Wall';
import Ground from './models/Ground';
import Hole from './models/Hole';

export function loadLevel(levelData, scene) {
  const tileSize = 1;
  let startPosition = null;
  const width = levelData[0].length;
  const height = levelData.length;

  levelData.forEach((row, z) => {
    row.forEach((cell, x) => {
      const position = new THREE.Vector3(x * tileSize, 0, z * tileSize);
      switch (cell) {
        case '1':
          scene.add(Wall(position));
          break;
        case '0':
          scene.add(Ground(position));
          break;
        case 'X':
          scene.add(Ground(position));
          scene.add(Hole(position));
          break;
        case 'S':
          scene.add(Ground(position));
          startPosition = position.clone();
          break;
      }
    });
  });

  const bounds = {
    width: width * tileSize,
    height: height * tileSize,
  };

  return { startPosition, bounds };
}

