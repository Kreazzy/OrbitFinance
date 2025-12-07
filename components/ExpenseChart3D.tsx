import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { CategoryData } from '../types';

interface ChartProps {
  data: CategoryData[];
  currencySymbol: string;
}

// Professional Palette: Indigo, Emerald, Rose, Amber, Cyan
const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4'];

function TorusSegment({ 
  startArc, 
  endArc, 
  color, 
  radius, 
  hovered, 
  onHover 
}: { 
  startArc: number; 
  endArc: number; 
  color: string; 
  radius: number;
  hovered: boolean;
  onHover: (status: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const length = endArc - startArc;

  useFrame((state, delta) => {
    const targetScale = hovered ? 1.05 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 15);
  });

  return (
    <group rotation={[0, 0, startArc]}>
      <mesh 
        ref={meshRef}
        position={[0, 0, 0]}
        onPointerOver={(e) => { e.stopPropagation(); onHover(true); }}
        onPointerOut={() => onHover(false)}
      >
        <torusGeometry args={[radius, 0.5, 32, 64, length - 0.05]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.1}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.1}
        />
      </mesh>
    </group>
  );
}

function Scene({ data, currencySymbol }: ChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  let currentAngle = 0;

  return (
    <group rotation={[0.4, 0.4, 0]}>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      {data.map((item, index) => {
        if (item.value === 0) return null;
        const arcLength = (item.value / total) * Math.PI * 2;
        const start = currentAngle;
        currentAngle += arcLength;
        const color = COLORS[index % COLORS.length];

        return (
          <React.Fragment key={item.name}>
             <TorusSegment
                startArc={start}
                endArc={start + arcLength}
                color={color}
                radius={2.8}
                hovered={hoveredIndex === index}
                onHover={(h) => setHoveredIndex(h ? index : null)}
             />
             {hoveredIndex === index && (
                <Html position={[0, 0, 0]} center>
                   <div className="bg-surface/90 p-3 rounded-lg border border-border text-center backdrop-blur-md shadow-xl w-32">
                      <div className="text-primary font-semibold text-xs uppercase tracking-wider">{item.name}</div>
                      <div className="text-white font-bold text-lg">{currencySymbol}{item.value.toLocaleString()}</div>
                      <div className="text-textMuted text-xs">{Math.round((item.value/total)*100)}%</div>
                   </div>
                </Html>
             )}
          </React.Fragment>
        );
      })}
      
      {hoveredIndex === null && (
         <Html position={[0, 0, 0]} center>
            <div className="text-center pointer-events-none select-none">
              <div className="text-textMuted text-xs font-semibold uppercase tracking-wider mb-1">Total</div>
              <div className="text-white text-2xl font-bold tracking-tight">
                {currencySymbol}{total.toLocaleString()}
              </div>
            </div>
         </Html>
      )}
    </group>
  );
}

const ExpenseChart3D: React.FC<ChartProps> = (props) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
          <Scene {...props} />
        </Float>
      </Canvas>
    </div>
  );
};

export default ExpenseChart3D;