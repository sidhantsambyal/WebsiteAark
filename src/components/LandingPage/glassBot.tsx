"use client";

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshTransmissionMaterial, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const FluidMaterial = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  const shaderArgs = useMemo(() => ({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      
      // Simplex-like noise for organic fluid swirling
      float noise(vec2 p) {
        return sin(p.x * 12.0 + uTime * 0.5) * sin(p.y * 12.0 + uTime * 0.5);
      }

      void main() {
        vec2 p = vUv - 0.5;
        
        // --- VIBRANT ORB PALETTE (User Requested) ---
        vec3 cRed = vec3(1.0, 0.047, 0.0);       // #FF0C00
        vec3 cBlue = vec3(0.0, 0.451, 0.949);    // #0073F2
        vec3 cPink = vec3(0.953, 0.133, 0.380);  // #F32261
        // Fine-tuned fluid domain-warp speed (You can adjust the 0.85 multiplier directly below to tune speed!)
        float tSpeed = uTime * 1.2;
        vec2 q = vec2(0.0);
        q.x = sin(vUv.x * 4.0 + tSpeed) + cos(vUv.y * 4.0 + tSpeed * 1.2);
        q.y = cos(vUv.x * 4.0 - tSpeed) + sin(vUv.y * 4.0 - tSpeed * 0.9);
        
        // Let the slower noise rigorously bend the fundamental coordinates
        float n = noise(p * 1.2 + q * 0.2);
        vec2 distUv = p + vec2(n * 0.2, n * 0.2) + q * 0.1;
        
        // Map the distorted swift fluid grid radially
        float angle = atan(distUv.y, distUv.x) + tSpeed * 0.2; // Fluid slowly spiraling
        float t = fract((angle + 3.14159) / 6.28318);
        
        vec3 finalColor;
        
        // Massive Red dominance, smooth blending specifically into Pink and Blue
        if (t < 0.5) {
            // From 0 to 0.5, strictly Red transitioning to Pink near the boundary
            finalColor = mix(cRed, cPink, smoothstep(0.3, 0.5, t));
        } else if (t < 0.75) {
            // From 0.5 to 0.75, transition Pink to Blue
            finalColor = mix(cPink, cBlue, smoothstep(0.5, 0.75, t));
        } else {
            // Loop back cleanly from Blue to Red
            finalColor = mix(cBlue, cRed, smoothstep(0.75, 1.0, t));
        }
        
        // Suppress maximum brightness slightly to physically prevent any 'white-out' 
        // interaction with the glossy transmission shell.
        finalColor *= 0.9; 

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* SIZE REDUCTION: Reduced inner sphere radius from 0.85 to 0.65 */}
      <sphereGeometry args={[0.65, 64, 64]} />
      <shaderMaterial args={[shaderArgs]} transparent />
    </mesh>
  );
};

const Eyes = ({ mousePos }: { mousePos: { x: number, y: number } }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const blinkRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!groupRef.current || !blinkRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mousePos.x * 0.25, 0.15);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, mousePos.y * 0.25, 0.15);
    const time = Date.now() * 0.001;
    const isBlinking = Math.sin(time * 0.8) > 0.97;
    blinkRef.current.scale.y = THREE.MathUtils.lerp(blinkRef.current.scale.y, isBlinking ? 0.05 : 1, 0.25);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0.5]}>
      <group ref={blinkRef}>
        {/* SIZE REDUCTION: Eyes scaled down slightly to match smaller orb */}
        <mesh position={[-0.15, 0.15, 0.3]}>
          <capsuleGeometry args={[0.05, 0.12, 4, 8]} />
          {/* REMOVED GLOW: Using a flat basic material with no emission/reflectivity */}
          <meshBasicMaterial color="#fff" />
        </mesh>
        <mesh position={[0.15, 0.15, 0.3]}>
          <capsuleGeometry args={[0.05, 0.12, 4, 8]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      </group>
    </group>
  );
};

const GlassBot = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  return (
    <div
      className="relative w-full h-full"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
        });
      }}
    >
      <Canvas
        className="relative z-10 drop-shadow-[0_0_10px_rgba(0,163,255,0.7)]"
        key="glassbot-canvas"
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={45} />
        <ambientLight intensity={0.8} />

        <FluidMaterial />

        {/* SIZE REDUCTION: Main glass sphere radius reduced from 1 to 0.75 */}
        <Sphere args={[0.75, 64, 64]}>
          <MeshTransmissionMaterial
            thickness={1.5}
            roughness={0.0}
            transmission={1}
            ior={1.2}
            chromaticAberration={0.03}
            backside={true}
          />
        </Sphere>

        <Eyes mousePos={mousePos} />
      </Canvas>
    </div>
  );
};

export default GlassBot;