import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function AbstractMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.2;
      meshRef.current.rotation.y = Math.cos(t * 0.15) * 0.2;
      meshRef.current.position.y = Math.sin(t * 0.2) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
      <sphereGeometry args={[4, 64, 64]} />
      <meshStandardMaterial
        color="#1e1b4b" // Deep Indigo
        wireframe={true}
        transparent={true}
        opacity={0.03}
        roughness={0}
        metalness={0.1}
      />
    </mesh>
  );
}

function FloatingOrbs() {
   const groupRef = useRef<THREE.Group>(null!);

   useFrame((state) => {
      const t = state.clock.getElapsedTime();
      if(groupRef.current) {
         groupRef.current.rotation.y = t * 0.05;
      }
   });

   return (
      <group ref={groupRef}>
         <mesh position={[4, 2, -5]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#6366f1" transparent opacity={0.1} />
         </mesh>
         <mesh position={[-5, -3, -5]}>
            <sphereGeometry args={[2, 32, 32]} />
            <meshStandardMaterial color="#10b981" transparent opacity={0.05} />
         </mesh>
      </group>
   )
}

const ThreeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 bg-background pointer-events-none transition-colors duration-500">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#818cf8" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#34d399" />
        <AbstractMesh />
        <FloatingOrbs />
      </Canvas>
      {/* Gradient Overlay for that modern SaaS look */}
      <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-background/80" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
    </div>
  );
};

export default ThreeBackground;