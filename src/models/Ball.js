import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

const textureLoader = new THREE.TextureLoader();
const golfTexture = textureLoader.load("/golftext.avif");
golfTexture.wrapS = THREE.RepeatWrapping;
golfTexture.wrapT = THREE.RepeatWrapping;
golfTexture.repeat.set(1, 1);

export default class Ball {
  constructor(position) {
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshStandardMaterial({ map: golfTexture });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.scale.set(0.1, 0.1, 0.1);
    mesh.position.copy(position);
    mesh.position.y += 0.07;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.velocity = new THREE.Vector3();

    let club = null;

    const mtlLoader = new MTLLoader();
    mtlLoader.setPath("/club/");
    mtlLoader.load("club.mtl", (materials) => {
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath("/club/");
      objLoader.load("club.obj", (object) => {
        club = object;
        club.scale.set(0.01, 0.01, 0.01);
        club.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        club.visible = false;
        mesh._club = club;
      });
    });

    mesh.addClubToScene = (scene) => {
  const tryAdd = () => {
    if (club && !scene.children.includes(club)) {
      scene.add(club);
    } else {
      requestAnimationFrame(tryAdd); 
    }
  };
  tryAdd();
};

    mesh.updateClub = (camera, isMoving) => {
      if (!club) return;
      club.visible = !isMoving;
      if (!isMoving) {
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        camDir.y = 0;
        camDir.normalize();

        const offset = camDir.multiplyScalar(-0.15); // this is how far from ball club is
        const clubPos = mesh.position.clone().add(offset);
        clubPos.y = mesh.position.y + 0.05;

        club.position.copy(clubPos);
        club.lookAt(mesh.position);
        club.rotateX(-Math.PI/1.7);
        club.rotateZ(-Math.PI / 10);   

      }
    };

    return mesh;
  }
}
