import React, { useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import { Desk } from './Desk';
import ClassroomPlayer from './ClassroomPlayer';

interface ClassroomProps {
  roomName: string;
  onExit?: () => void;
}

export function Classroom({ roomName, onExit }: ClassroomProps) {
  const [nearSeatIndex, setNearSeatIndex] = useState<number | null>(null);
  const [isSitting, setIsSitting] = useState(false);
  const [sittingPosition, setSittingPosition] = useState<THREE.Vector3 | null>(null);

  const handleSitDown = () => {
    if (nearSeatIndex !== null) {
      const seatPos = seatPositions[nearSeatIndex].position;
      // Position slightly in front of the desk when sitting
      const sitPos = new THREE.Vector3(seatPos[0], seatPos[1] + 0.5, seatPos[2] - 0.3);
      setSittingPosition(sitPos);
      setIsSitting(true);
    }
  };

  const handleStandUp = () => {
    setIsSitting(false);
    setSittingPosition(null);
  };

  const seatPositions = [
    // Row 1 - More spacing
    { position: [-4, 0, -6] as [number, number, number] },
    { position: [-1.5, 0, -6] as [number, number, number] },
    { position: [1, 0, -6] as [number, number, number] },
    { position: [3.5, 0, -6] as [number, number, number] },
    // Row 2
    { position: [-4, 0, -3.5] as [number, number, number] },
    { position: [-1.5, 0, -3.5] as [number, number, number] },
    { position: [1, 0, -3.5] as [number, number, number] },
    { position: [3.5, 0, -3.5] as [number, number, number] },
    // Row 3
    { position: [-4, 0, -1] as [number, number, number] },
    { position: [-1.5, 0, -1] as [number, number, number] },
    { position: [1, 0, -1] as [number, number, number] },
    { position: [3.5, 0, -1] as [number, number, number] },
    // Row 4
    { position: [-4, 0, 1.5] as [number, number, number] },
    { position: [-1.5, 0, 1.5] as [number, number, number] },
    { position: [1, 0, 1.5] as [number, number, number] },
    { position: [3.5, 0, 1.5] as [number, number, number] },
  ];

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', cursor: 'none' }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 1.6, 8], fov: 75 }}
        gl={{ antialias: true }}
      >
        <EnhancedClassroomScene 
          roomName={roomName} 
          nearSeatIndex={nearSeatIndex} 
          isSitting={isSitting}
        />
        <ClassroomPlayer 
          seats={seatPositions}
          onSeatProximity={setNearSeatIndex}
          isSitting={isSitting}
          sittingPosition={sittingPosition}
          onSitRequest={handleSitDown}
          onStandRequest={handleStandUp}
        />
        
        {/* Only show orbit controls when not in first-person */}
        {!isSitting && <OrbitControls enableZoom={false} />}
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
        <div>👥 16 Student Desks</div>
        {isSitting && <div style={{ marginTop: '5px', color: '#00aa00' }}>✓ Seated - Focus on Board</div>}
      </div>

      {/* Controls hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '25px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '12px 25px',
          color: '#000000',
          borderRadius: '10px',
          border: '2px solid #00ffff',
          zIndex: 40,
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
        }}
      >
        {isSitting ? (
          <div>Press E to stand up • Focus on the board</div>
        ) : (
          <div>🖱️ Move mouse to look • 🎮 WASD to move • 💺 Get close to desk and press E to sit</div>
        )}
      </div>

      {/* Seat prompt */}
      {!isSitting && nearSeatIndex !== null && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#000000',
            padding: '20px 30px',
            borderRadius: '15px',
            border: '3px solid #00ffff',
            zIndex: 50,
            textAlign: 'center',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.8)',
          }}
        >
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>
            💺 Desk Available
          </div>
          <div style={{ marginBottom: '15px', fontSize: '1rem' }}>
            Press E to sit down and focus on the board
          </div>
          <button
            onClick={handleSitDown}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(45deg, #00ffff, #0088ff)',
              color: '#000',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
            }}
          >
            Sit Down (E)
          </button>
        </div>
      )}
    </div>
  );
}

function EnhancedClassroomScene({ 
  roomName, 
  nearSeatIndex,
  isSitting 
}: { 
  roomName: string; 
  nearSeatIndex: number | null;
  isSitting: boolean;
}) {
  return (
    <group>
      {/* Enhanced Floor with pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial 
          color="#2a2a3a" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Floor grid pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshBasicMaterial 
          color="#3a3a4a"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>

      {/* Enhanced Walls */}
      {/* Back wall */}
      <mesh position={[0, 5, -12]} receiveShadow castShadow>
        <boxGeometry args={[24, 10, 0.3]} />
        <meshStandardMaterial color="#2a2a4a" roughness={0.7} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-12, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, 10, 24]} />
        <meshStandardMaterial color="#2a2a4a" roughness={0.7} />
      </mesh>

      {/* Right wall */}
      <mesh position={[12, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, 10, 24]} />
        <meshStandardMaterial color="#2a2a4a" roughness={0.7} />
      </mesh>

      {/* Front wall with door */}
      <mesh position={[0, 5, 12]} receiveShadow castShadow>
        <boxGeometry args={[24, 10, 0.3]} />
        <meshStandardMaterial color="#2a2a4a" roughness={0.7} />
      </mesh>

      {/* Door opening in front wall */}
      <mesh position={[0, 2.5, 11.9]} receiveShadow castShadow>
        <boxGeometry args={[3, 5, 0.5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </mesh>

      {/* Stage at front of classroom */}
      <group position={[0, 0.2, -10]}>
        {/* Stage platform */}
        <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
          <boxGeometry args={[10, 0.2, 3]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.8} />
        </mesh>
        
        {/* Stage steps */}
        <mesh position={[0, -0.1, 1.5]} receiveShadow castShadow>
          <boxGeometry args={[11, 0.1, 1]} />
          <meshStandardMaterial color="#6a5a4a" roughness={0.8} />
        </mesh>

        {/* Stage border */}
        <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
          <boxGeometry args={[10.2, 0.1, 3.2]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} />
        </mesh>
      </group>

      {/* Enhanced Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#4a4a6a" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Enhanced Whiteboard */}
      <group position={[0, 4, -11.8]}>
        {/* Whiteboard main surface */}
        <mesh castShadow>
          <boxGeometry args={[9, 4, 0.2]} />
          <meshStandardMaterial color="#f8f8f8" roughness={0.3} metalness={0.1} />
        </mesh>
        
        {/* Whiteboard frame */}
        <mesh position={[0, 0, -0.1]} castShadow>
          <boxGeometry args={[9.4, 4.4, 0.3]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
        </mesh>

        {/* Whiteboard markers */}
        <mesh position={[-2, 1, 0.1]} castShadow>
          <boxGeometry args={[0.8, 0.1, 0.05]} />
          <meshStandardMaterial color="#ff4444" />
        </mesh>
        <mesh position={[0, 0.5, 0.1]} castShadow>
          <boxGeometry args={[1.2, 0.1, 0.05]} />
          <meshStandardMaterial color="#00aa00" />
        </mesh>
        <mesh position={[2, -0.5, 0.1]} castShadow>
          <boxGeometry args={[0.6, 0.1, 0.05]} />
          <meshStandardMaterial color="#0088ff" />
        </mesh>
      </group>

      {/* Room title above whiteboard */}
      <Text
        position={[0, 8, -11.7]}
        fontSize={0.6}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {roomName}
      </Text>

      {/* Exit sign above door */}
      <group position={[0, 8, 11.7]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.8, 0.5, 0.1]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
        </mesh>
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          EXIT
        </Text>
      </group>

      {/* Classroom decorations */}
      
      {/* Bookshelves on sides */}
      <Bookshelf position={[-11, 2.5, -4]} />
      <Bookshelf position={[-11, 2.5, 4]} />
      <Bookshelf position={[11, 2.5, -4]} rotation={[0, Math.PI, 0]} />
      <Bookshelf position={[11, 2.5, 4]} rotation={[0, Math.PI, 0]} />

      {/* Wall posters */}
      <Poster position={[-8, 4, -11.9]} rotation={[0, 0, 0]} />
      <Poster position={[8, 4, -11.9]} rotation={[0, 0, 0]} />
      <Poster position={[-11.9, 4, -6]} rotation={[0, Math.PI/2, 0]} />
      <Poster position={[-11.9, 4, 6]} rotation={[0, Math.PI/2, 0]} />
      <Poster position={[11.9, 4, -6]} rotation={[0, -Math.PI/2, 0]} />
      <Poster position={[11.9, 4, 6]} rotation={[0, -Math.PI/2, 0]} />

      {/* Clock on back wall */}
      <Clock position={[10, 7, -11.9]} />

      {/* Desks in rows with proper spacing */}
      {/* Row 1 */}
      <Desk position={[-4, 0, -6]} isHighlighted={nearSeatIndex === 0} />
      <Desk position={[-1.5, 0, -6]} isHighlighted={nearSeatIndex === 1} />
      <Desk position={[1, 0, -6]} isHighlighted={nearSeatIndex === 2} />
      <Desk position={[3.5, 0, -6]} isHighlighted={nearSeatIndex === 3} />

      {/* Row 2 */}
      <Desk position={[-4, 0, -3.5]} isHighlighted={nearSeatIndex === 4} />
      <Desk position={[-1.5, 0, -3.5]} isHighlighted={nearSeatIndex === 5} />
      <Desk position={[1, 0, -3.5]} isHighlighted={nearSeatIndex === 6} />
      <Desk position={[3.5, 0, -3.5]} isHighlighted={nearSeatIndex === 7} />

      {/* Row 3 */}
      <Desk position={[-4, 0, -1]} isHighlighted={nearSeatIndex === 8} />
      <Desk position={[-1.5, 0, -1]} isHighlighted={nearSeatIndex === 9} />
      <Desk position={[1, 0, -1]} isHighlighted={nearSeatIndex === 10} />
      <Desk position={[3.5, 0, -1]} isHighlighted={nearSeatIndex === 11} />

      {/* Row 4 */}
      <Desk position={[-4, 0, 1.5]} isHighlighted={nearSeatIndex === 12} />
      <Desk position={[-1.5, 0, 1.5]} isHighlighted={nearSeatIndex === 13} />
      <Desk position={[1, 0, 1.5]} isHighlighted={nearSeatIndex === 14} />
      <Desk position={[3.5, 0, 1.5]} isHighlighted={nearSeatIndex === 15} />

      {/* Enhanced Teacher's desk */}
      <group position={[0, 0, -8]}>
        <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.1, 1.5]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.1, 0.15, 1.6]} />
          <meshStandardMaterial color="#5a3a2a" roughness={0.8} />
        </mesh>
        
        {/* Desk legs */}
        {[[-1.2, -0.6], [1.2, -0.6], [-1.2, 0.6], [1.2, 0.6]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.45, z]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.9, 16]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
        ))}

        {/* Computer on teacher's desk */}
        <group position={[0, 1, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.4, 0.05]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[0, -0.3, 0.1]} castShadow>
            <boxGeometry args={[0.1, 0.3, 0.1]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
        </group>
      </group>

      {/* Enhanced ceiling lights - brighter and more realistic */}
      {[-8, -4, 0, 4, 8].map((x) =>
        [-6, -2, 2, 6].map((z) => (
          <group key={`${x}-${z}`} position={[x, 9.5, z]}>
            <pointLight intensity={2} distance={12} color="#ffffff" decay={1} />
            <mesh castShadow>
              <cylinderGeometry args={[0.8, 1, 0.3, 16]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.3}
                metalness={0.1}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0, -0.2, 0]} castShadow>
              <cylinderGeometry args={[0.7, 0.7, 0.1, 16]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        ))
      )}

      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.8} color="#ffffff" />
      
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        color="#ffffff"
      />
      
      <hemisphereLight 
        skyColor="#a0a0ff" 
        groundColor="#404080" 
        intensity={0.5}
      />

      {/* Additional fill lights */}
      <pointLight position={[0, 8, 0]} intensity={0.3} distance={20} color="#ffffff" />
    </group>
  );
}

// Additional decorative components
function Bookshelf({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.3, 5, 2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      {/* Shelves */}
      {[1.5, 0.5, -0.5, -1.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.1, 2.1]} />
          <meshStandardMaterial color="#5a3a2a" />
        </mesh>
      ))}
      {/* Books */}
      {[-0.7, -0.3, 0.1, 0.5, 0.9].map((z, i) => (
        <mesh key={i} position={[0.1, 1, z]} castShadow>
          <boxGeometry args={[0.2, 0.8, 0.15]} />
          <meshStandardMaterial color={['#ff4444', '#00aa00', '#0088ff', '#ffff00', '#ff00ff'][i]} />
        </mesh>
      ))}
    </group>
  );
}

function Poster({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial color={['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)]} />
      </mesh>
      <mesh position={[0, 0, -0.01]} castShadow>
        <planeGeometry args={[2.1, 1.6]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </group>
  );
}

function Clock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      <mesh position={[0, 0, 0.06]} castShadow>
        <cylinderGeometry args={[0.75, 0.75, 0.1, 32]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {/* Clock hands */}
      <mesh position={[0, 0, 0.11]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.5, 0.03, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, 0.12]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <boxGeometry args={[0.3, 0.04, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export default Classroom;
