import React from 'react';
import * as THREE from 'three';

interface DeskProps {
  position: [number, number, number];
  isOccupied?: boolean;
  isHighlighted?: boolean;
}

export function Desk({ position, isOccupied = false, isHighlighted = false }: DeskProps) {
  return (
    <group position={position}>
      {/* Desk top */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 0.05, 0.6]} />
        <meshStandardMaterial 
          color={isHighlighted ? "#7a5a3a" : "#5a3a2a"}
          emissive={isHighlighted ? "#ffff00" : "#000000"}
          emissiveIntensity={isHighlighted ? 0.2 : 0}
        />
      </mesh>
      
      {/* Desk legs */}
      <mesh position={[-0.4, 0.45, -0.25]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 16]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.4, 0.45, -0.25]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 16]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[-0.4, 0.45, 0.25]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 16]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.4, 0.45, 0.25]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 16]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Chair */}
      <group position={[0, 0, 0.4]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.05, 0.5]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[0, 0.2, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.4, 0.05]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.4, 16]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>

      {/* Books and supplies on desk */}
      <mesh position={[0.2, 0.93, -0.1]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.2]} />
        <meshStandardMaterial color="#ff4444" />
      </mesh>
      <mesh position={[-0.2, 0.93, 0.1]} castShadow>
        <boxGeometry args={[0.1, 0.05, 0.15]} />
        <meshStandardMaterial color="#0088ff" />
      </mesh>

      {/* Student indicator if occupied */}
      {isOccupied && (
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
      )}
    </group>
  );
}
