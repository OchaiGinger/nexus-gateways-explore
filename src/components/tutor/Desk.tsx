import React from 'react';
import * as THREE from 'three';

interface DeskProps {
  position: [number, number, number];
  isOccupied?: boolean;
  id?: string;
  onSitAttempt?: (deskId: string) => void;
}

export function Desk({ position, isOccupied = false, id = "", onSitAttempt }: DeskProps) {
  return (
    <group position={position}>
      {/* Desk top */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.05, 0.4]} />
        <meshStandardMaterial color="#5a3a2a" />
      </mesh>

      {/* Desk legs */}
      <mesh position={[-0.35, 0.55, -0.15]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.35, 0.55, -0.15]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[-0.35, 0.55, 0.15]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.35, 0.55, 0.15]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Chair */}
      <group position={[0, 0, 0.3]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.05, 0.4]} />
          <meshStandardMaterial color={isOccupied ? "#8a4a2a" : "#3a2a1a"} />
        </mesh>
        <mesh position={[0, 0.3, -0.15]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.4, 0.05]} />
          <meshStandardMaterial color={isOccupied ? "#8a4a2a" : "#3a2a1a"} />
        </mesh>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>

      {/* Student indicator if occupied */}
      {isOccupied && (
        <mesh position={[0, 1.3, 0]} castShadow>
          {/* Simple student avatar sitting */}
          <group>
            {/* Head */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#d4a574" />
            </mesh>
            {/* Body */}
            <mesh position={[0, -0.15, 0]}>
              <boxGeometry args={[0.2, 0.25, 0.15]} />
              <meshStandardMaterial color="#3a6b9e" />
            </mesh>
          </group>
        </mesh>
      )}
    </group>
  );
}
