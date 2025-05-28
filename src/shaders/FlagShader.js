import * as THREE from "three";

export default function FlagShaderMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      color: { value: new THREE.Color(0xff0000) },
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
        
      void main() {
        vUv = uv;
        vec3 pos = position;
        
        float distanceFromPole = uv.x;      // 0.0 (attached) → 1.0 (free)
        float verticalPosition = uv.y;      // 0.0 (bottom)   → 1.0 (top)
        
        // Wind wave traveling along the flag (transverse oscillation)
        float wave = sin((distanceFromPole * 10.0 - time * 4.0)) 
                     * 0.02 
                     * pow(distanceFromPole, 1.5);  // More deflection near the tip
        
        // Simulate gravity sag with exponential curve
        float sag = 0.03 * distanceFromPole * (1.0 - verticalPosition);
        
        // Combine horizontal flap and vertical droop
        pos.z += wave;
        pos.y -= sag;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }


    `,
    fragmentShader: `
      uniform vec3 color;
      varying vec2 vUv;

      void main() {
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.DoubleSide,
  });
}
