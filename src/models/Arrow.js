import * as THREE from "three";

class Arrow {
  constructor() {
    this.arrowGroup = new THREE.Group();

    const shaftGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.3, 8);
    const shaftMaterial = new THREE.MeshBasicMaterial({
      color: 0x4444ff,
      transparent: true,
      opacity: 0.8,
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.rotation.z = Math.PI / 2;

    const headGeometry = new THREE.ConeGeometry(0.02, 0.06, 8);
    const headMaterial = new THREE.MeshBasicMaterial({
      color: 0x2222ff,
      transparent: true,
      opacity: 0.8,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.rotation.z = -Math.PI / 2;
    head.position.x = 0.18;

    this.arrowGroup.add(shaft);
    this.arrowGroup.add(head);

    this.arrowGroup.position.y = 0.15;
    this.arrowGroup.visible = false;
  }

  update(isCharging, ball, camera, chargeStartTime) {
    if (!isCharging || !ball) {
      this.arrowGroup.visible = false;
      return;
    }

    this.arrowGroup.visible = true;

    const currentChargeDuration = (performance.now() - chargeStartTime) / 1000;
    const maxChargeTime = 2;
    const clampedDuration = Math.min(currentChargeDuration, maxChargeTime);
    const chargePower = Math.pow(clampedDuration / maxChargeTime, 1.25);

    const ballDirection = new THREE.Vector3();
    camera.getWorldDirection(ballDirection);
    ballDirection.y = 0;
    ballDirection.normalize();

    const angle = Math.atan2(ballDirection.x, ballDirection.z);
    this.arrowGroup.rotation.y = angle - Math.PI / 2;

    const minScale = 0.3;
    const maxScale = 1.5;
    const scale = minScale + (maxScale - minScale) * chargePower;
    this.arrowGroup.scale.set(scale, 1, 1);

    const forwardOffset = ballDirection
      .clone()
      .multiplyScalar(0.1 + (scale - minScale) * 0.1);
    this.arrowGroup.position.copy(ball.position).add(forwardOffset);
    this.arrowGroup.position.y = 0.15;

    const blueColor = new THREE.Color(0x4444ff);
    const redColor = new THREE.Color(0xff4444);
    const currentColor = blueColor.clone().lerp(redColor, chargePower);

    this.arrowGroup.children.forEach((child) => {
      if (child.material) {
        child.material.color.copy(currentColor);
        child.material.opacity = Math.min(1.0, 0.6 + 0.4 * chargePower);
      }
    });
  }

  hide() {
    this.arrowGroup.visible = false;
  }

  addToScene(scene) {
    scene.add(this.arrowGroup);
  }
}

export default Arrow;
