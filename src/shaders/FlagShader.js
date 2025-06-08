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
        
        float distanceFromPole = uv.x;    
        float verticalPosition = uv.y;    
        
        float wave = sin((distanceFromPole * 10.0 - time * 4.0)) 
                     * 0.02 
                     * pow(distanceFromPole, 1.5);  // More deflection near the tip
        
        float sag = 0.03 * distanceFromPole * (1.0 - verticalPosition);
        
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
