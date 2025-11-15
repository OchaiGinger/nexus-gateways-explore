import React from 'react';
import * as THREE from 'three';

interface DeskProps {
  position: [number, number, number];
  isOccupied?: boolean;
}

export function Desk({ position, isOccupied = false }: DeskProps) {
  return (
    <group position={position}>
      {/* Desk top */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.05, 0.4]} />
        <meshStandardMaterial color="#5a3a2a" />
      </mesh>
      
      {/* Desk legs */}
      <mesh position={[-0.35, 0.45, -0.15]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.35, 0.45, -0.15]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[-0.35, 0.45, 0.15]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.35, 0.45, 0.15]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Chair */}
      <group position={[0, 0, 0.3]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.05, 0.4]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[0, 0.2, -0.15]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.4, 0.05]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>

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
