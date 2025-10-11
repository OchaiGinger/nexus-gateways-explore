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
      {/* Auditorium seat */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshStandardMaterial 
          color={isOccupied ? "#5a3a3a" : isHighlighted ? "#7a5a3a" : "#5a3a2a"}
          emissive={isHighlighted ? "#ffff00" : "#000000"}
          emissiveIntensity={isHighlighted ? 0.3 : 0}
        />
      </mesh>
      
      {/* Seat back */}
      <mesh position={[0, 0.9, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color={isOccupied ? "#4a3a3a" : "#4a3a2a"} />
      </mesh>

      {/* Arm rests */}
      <mesh position={[-0.4, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.3, 0.7]} />
        <meshStandardMaterial color="#3a2a1a" />
      </mesh>
      <mesh position={[0.4, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.3, 0.7]} />
        <meshStandardMaterial color="#3a2a1a" />
      </mesh>

      {/* Seat base */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Writing surface */}
      <mesh position={[0, 0.7, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.05, 0.3]} />
        <meshStandardMaterial color={isOccupied ? "#6a5a5a" : "#6a5a4a"} />
      </mesh>

      {/* Student/occupant */}
      {isOccupied && (
        <group>
          {/* Student body */}
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.6, 8]} />
            <meshStandardMaterial color="#8a6a4a" />
          </mesh>
          {/* Student head */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#8a6a4a" />
          </mesh>
        </group>
      )}
    </group>
  );
}
