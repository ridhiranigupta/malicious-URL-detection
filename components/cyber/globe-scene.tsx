"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Icosahedron, OrbitControls, Stars } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function CoreGlobe() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.2;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.8} floatIntensity={0.9}>
      <Icosahedron ref={meshRef} args={[1.45, 1]}>
        <meshStandardMaterial color="#22d3ee" wireframe emissive="#3b82f6" emissiveIntensity={0.8} />
      </Icosahedron>
    </Float>
  );
}

export function GlobeScene() {
  return (
    <div className="h-[360px] w-full md:h-[500px]">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.45} />
        <pointLight position={[4, 4, 4]} intensity={3} color="#38bdf8" />
        <pointLight position={[-3, -3, -3]} intensity={2} color="#8b5cf6" />
        <Stars radius={70} depth={50} count={2500} factor={3} saturation={0.6} fade speed={0.8} />
        <CoreGlobe />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
