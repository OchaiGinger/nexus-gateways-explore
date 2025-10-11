import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Text } from '@react-three/drei';
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
  const [isMouseDown, setIsMouseDown] = useState(false); // Add this state

  // Generate classroom seats with random occupancy
  const seatPositions = useMemo(() => {
    const seats: { position: [number, number, number]; isOccupied: boolean }[] = [];
    const rows = 8;
    const seatsPerRow = 12;
    const rowSpacing = 2.5;
    const seatSpacing = 1.8;
    const centerAisle = 3;
    
    // Create stepped seating (descending towards front)
    for (let row = 0; row < rows; row++) {
      const z = 6 - row * rowSpacing; // Move forward (negative Z) as row increases
      const y = -row * 0.4; // Step down each row
      
      // Left section
      for (let seat = 0; seat < seatsPerRow / 2; seat++) {
        const x = -((seatsPerRow / 2) * seatSpacing / 2) + seat * seatSpacing;
        const isOccupied = Math.random() < 0.3; // 30% chance of being occupied
        seats.push({ position: [x, y, z], isOccupied });
      }
      
      // Right section (skip center aisle)
      for (let seat = 0; seat < seatsPerRow / 2; seat++) {
        const x = centerAisle / 2 + seat * seatSpacing;
        const isOccupied = Math.random() < 0.3; // 30% chance of being occupied
        seats.push({ position: [x, y, z], isOccupied });
      }
    }
    
    return seats;
  }, []);

  const handleSitDown = () => {
    if (nearSeatIndex !== null && !seatPositions[nearSeatIndex].isOccupied) {
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

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        background: '#000', 
        cursor: isMouseDown ? 'grabbing' : 'grab' 
      }}
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      onMouseLeave={() => setIsMouseDown(false)} // Reset when mouse leaves
    >
      <Canvas 
        shadows 
        camera={{ position: [0, 1.6, 8], fov: 75 }}
        gl={{ antialias: true }}
      >
        <ClassroomScene 
          roomName={roomName} 
          seatPositions={seatPositions}
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
        <div>📍 Classroom Style</div>
        <div>👥 {seatPositions.length} Seats</div>
        {isSitting && <div style={{ marginTop: '5px', color: '#00aa00' }}>✓ Seated - Focus on Front</div>}
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
          <div>Press E to stand up • Focus on the front</div>
        ) : (
          <div>🖱️ Click & drag to look • 🎮 WASD to move • 💺 Get close to empty desk and press E to sit</div>
        )}
      </div>

      {/* Seat prompt - Only show for unoccupied seats */}
      {!isSitting && nearSeatIndex !== null && !seatPositions[nearSeatIndex].isOccupied && (
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
            Press E to sit down and focus on the front
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

function ClassroomScene({ 
  roomName, 
  seatPositions,
  nearSeatIndex,
  isSitting 
}: { 
  roomName: string; 
  seatPositions: { position: [number, number, number]; isOccupied: boolean }[];
  nearSeatIndex: number | null;
  isSitting: boolean;
}) {
  return (
    <group>
      {/* Enhanced Floor with pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color="#1a1a2a" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Floor steps */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -i * 0.4 - 2.2, 6 - i * 2.5]} receiveShadow>
          <ringGeometry args={[12, 15, 32, 1, 0, Math.PI]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.7} />
        </mesh>
      ))}

      {/* Enhanced Walls */}
      <mesh position={[0, 5, 12]} receiveShadow castShadow>
        <cylinderGeometry args={[16, 16, 10, 32, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#2a2a4a" roughness={0.7} />
      </mesh>

      {/* Side walls */}
      <mesh position={[-15, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, 10, 30]} />
        <meshStandardMaterial color="#2a2a4a" roughness={0.7} />
      </mesh>
      <mesh position={[15, 5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, 10, 30]} />
        <meshStandardMaterial color="#2a2a4a" roughness={0.7} />
      </mesh>

      {/* Front wall with whiteboard */}
      <mesh position={[0, 5, -16]} receiveShadow castShadow>
        <boxGeometry args={[30, 10, 0.3]} />
        <meshStandardMaterial color="#2a2a4a" roughness={0.7} />
      </mesh>

      {/* Teacher's area */}
      <group position={[0, -0.5, -14]}>
        {/* Teacher's desk */}
        <mesh position={[0, 0.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[4, 1, 2]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.6} />
        </mesh>
        
        {/* Desk front */}
        <mesh position={[0, 0, 1]} receiveShadow castShadow>
          <boxGeometry args={[4.2, 0.2, 0.5]} />
          <meshStandardMaterial color="#8B4513" roughness={0.5} />
        </mesh>

        {/* Whiteboard */}
        <mesh position={[0, 3, -1.5]} castShadow receiveShadow>
          <boxGeometry args={[8, 4, 0.1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 3, -1.45]} castShadow>
          <boxGeometry args={[8.2, 4.2, 0.1]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>

        {/* Whiteboard frame */}
        <mesh position={[0, 3, -1.4]} castShadow>
          <boxGeometry args={[8.4, 4.4, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>

      {/* Ceiling */}
      <mesh position={[0, 12, 0]} receiveShadow castShadow>
        <sphereGeometry args={[18, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4a4a6a" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Room title */}
      <Text
        position={[0, 8, -15.7]}
        fontSize={0.8}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {roomName} CLASSROOM
      </Text>

      {/* Exit signs */}
      <group position={[0, 8, 11.7]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[2, 0.6, 0.1]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
        </mesh>
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          EXIT
        </Text>
      </group>

      {/* Side exit signs */}
      <group position={[-14, 8, 0]} rotation={[0, Math.PI/2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.5, 0.1]} />
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
      <group position={[14, 8, 0]} rotation={[0, -Math.PI/2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.5, 0.1]} />
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

      {/* Classroom desks */}
      {seatPositions.map((seat, index) => (
        <Desk
          key={index}
          position={seat.position}
          isOccupied={seat.isOccupied}
          isHighlighted={nearSeatIndex === index && !seat.isOccupied}
        />
      ))}

      {/* Ceiling lights */}
      {Array.from({ length: 5 }, (_, i) => 
        Array.from({ length: 3 }, (_, j) => (
          <group key={`${i}-${j}`} position={[-8 + i * 4, 10, -8 + j * 4]}>
            <pointLight intensity={3} distance={15} color="#ffffff" decay={1} />
            <mesh castShadow>
              <cylinderGeometry args={[0.6, 0.8, 0.4, 16]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.4}
                metalness={0.2}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, -0.3, 0]} castShadow>
              <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.6}
              />
            </mesh>
          </group>
        ))
      )}

      {/* Front lighting */}
      <group position={[0, 8, -10]}>
        <spotLight
          intensity={5}
          distance={20}
          angle={Math.PI / 4}
          penumbra={0.5}
          color="#ffffff"
          position={[0, 2, 0]}
          target-position={[0, 0, -4]}
          castShadow
        />
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.5, 0.5, 16]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>

      {/* Side lights */}
      {[-5, 5].map((x) => (
        <group key={x} position={[x, 6, -12]}>
          <spotLight
            intensity={4}
            distance={15}
            angle={Math.PI / 6}
            penumbra={0.3}
            color="#ffffee"
            position={[0, 0, 0]}
            target-position={[0, -2, -2]}
          />
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.3, 0.3, 16]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
        </group>
      ))}

      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.6} color="#ffffff" />
      
      <directionalLight
        position={[0, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        color="#ffffff"
      />
      
      <hemisphereLight 
        skyColor="#a0a0ff" 
        groundColor="#404080" 
        intensity={0.4}
      />

      {/* Additional fill lights */}
      <pointLight position={[0, 15, 0]} intensity={0.5} distance={25} color="#ffffff" />
    </group>
  );
}

export default Classroom;
