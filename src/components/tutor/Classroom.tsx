import React from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Desk } from './Desk';

interface ClassroomProps {
  roomName: string;
  onExit?: () => void;
}

export function Classroom({ roomName, onExit }: ClassroomProps) {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <ClassroomScene roomName={roomName} onExit={onExit} />
      </Canvas>
      
      {/* Exit button overlay */}
      <button
        onClick={onExit}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          background: 'linear-gradient(45deg, #ff4444, #ff6b6b)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: '0 4px 15px rgba(255, 68, 68, 0.4)'
        }}
      >
        Exit Classroom
      </button>

      {/* Classroom info */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '15px',
          borderRadius: '10px',
          border: '2px solid #00ffff',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        <div style={{ marginBottom: '5px' }}>🏫 {roomName}</div>
        <div>📍 Interactive Classroom</div>
        <div>👥 12 Student Desks</div>
      </div>
    </div>
  );
}

function ClassroomScene({ roomName, onExit }: ClassroomProps) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, 5, -10]} receiveShadow>
        <boxGeometry args={[20, 10, 0.2]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 10, 20]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Right wall */}
      <mesh position={[10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 10, 20]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Front wall with door */}
      <mesh position={[0, 5, 10]} receiveShadow>
        <boxGeometry args={[20, 10, 0.2]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Door opening in front wall */}
      <mesh position={[0, 2.5, 9.9]} receiveShadow>
        <boxGeometry args={[3, 5, 0.3]} />
        <meshStandardMaterial color="#5a4a3a" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f1419" />
      </mesh>

      {/* Whiteboard */}
      <mesh position={[0, 5, -9.9]} castShadow>
        <boxGeometry args={[8, 3, 0.1]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Whiteboard frame */}
      <mesh position={[0, 5, -9.85]} castShadow>
        <boxGeometry args={[8.2, 3.2, 0.05]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Room title above whiteboard */}
      <Text
        position={[0, 7.5, -9.8]}
        fontSize={0.5}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        {roomName}
      </Text>

      {/* Exit sign above door */}
      <Text
        position={[0, 8, 9.8]}
        fontSize={0.3}
        color="#ff4444"
        anchorX="center"
        anchorY="middle"
      >
        EXIT
      </Text>

      {/* Desks in rows */}
      {/* Row 1 */}
      <Desk position={[-3, 0, -5]} />
      <Desk position={[0, 0, -5]} />
      <Desk position={[3, 0, -5]} />

      {/* Row 2 */}
      <Desk position={[-3, 0, -2]} />
      <Desk position={[0, 0, -2]} isOccupied />
      <Desk position={[3, 0, -2]} />

      {/* Row 3 */}
      <Desk position={[-3, 0, 1]} />
      <Desk position={[0, 0, 1]} />
      <Desk position={[3, 0, 1]} isOccupied />

      {/* Row 4 */}
      <Desk position={[-3, 0, 4]} />
      <Desk position={[0, 0, 4]} />
      <Desk position={[3, 0, 4]} />

      {/* Teacher's desk */}
      <group position={[0, 0, -8]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[2, 0.1, 1]} />
          <meshStandardMaterial color="#5a3a2a" />
        </mesh>
        <mesh position={[-0.8, 0.45, -0.35]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.9, 16]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.8, 0.45, -0.35]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.9, 16]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[-0.8, 0.45, 0.35]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.9, 16]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.8, 0.45, 0.35]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.9, 16]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>

      {/* Ceiling lights */}
      {[-5, 0, 5].map((x, i) => (
        <group key={i} position={[x, 9.5, 0]}>
          <pointLight intensity={1} distance={15} color="#ffffff" />
          <mesh castShadow>
            <boxGeometry args={[1, 0.1, 1]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff" 
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      ))}

      {/* Ambient light */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </group>
  );
}
