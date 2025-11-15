import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { Player } from "@/components/Player";
import { Camera } from "@/components/Camera";
import { Desk } from "./Desk";

interface ClassroomProps {
  roomName: string;
  onExit?: () => void;
}

// Wall collision boxes for classroom
const classroomWalls = [
  // Classroom walls
  { position: [-10, 0, 0] as [number, number, number], width: 0.5, depth: 20 },
  { position: [10, 0, 0] as [number, number, number], width: 0.5, depth: 20 },
  { position: [0, 0, -10] as [number, number, number], width: 20, depth: 0.5 },
  { position: [0, 0, 10] as [number, number, number], width: 20, depth: 0.5 },
];

function ClassroomEnvironment({ roomName }: { roomName: string }) {
  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <hemisphereLight color="#ffffff" groundColor="#444444" intensity={0.5} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 5, -10]} castShadow receiveShadow>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-10, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 10, 20]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Right wall */}
      <mesh position={[10, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 10, 20]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Front wall with door */}
      <mesh position={[0, 5, 10]} castShadow receiveShadow>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f1419" />
      </mesh>

      {/* Whiteboard */}
      <mesh position={[0, 5, -9.8]} castShadow>
        <boxGeometry args={[8, 3, 0.1]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Whiteboard frame */}
      <mesh position={[0, 5, -9.7]}>
        <boxGeometry args={[8.2, 3.2, 0.1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Room title above whiteboard */}
      <Text
        position={[0, 7.5, -9.6]}
        fontSize={0.5}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        {roomName}
      </Text>

      {/* Desks in rows */}
      <Desk position={[-3, 0, -5]} />
      <Desk position={[0, 0, -5]} />
      <Desk position={[3, 0, -5]} />
      <Desk position={[-3, 0, -2]} />
      <Desk position={[0, 0, -2]} isOccupied />
      <Desk position={[3, 0, -2]} />
      <Desk position={[-3, 0, 1]} />
      <Desk position={[0, 0, 1]} />
      <Desk position={[3, 0, 1]} isOccupied />
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
          <pointLight intensity={3} distance={20} color="#ffffff" />
          <mesh castShadow>
            <boxGeometry args={[1.5, 0.1, 1.5]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff" 
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* Wall lights */}
      {[-6, 0, 6].map((z, i) => (
        <group key={`wall-light-${i}`}>
          <group position={[-9.5, 6, z]}>
            <pointLight intensity={2} distance={12} color="#ffaa00" />
            <mesh castShadow>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1} />
            </mesh>
          </group>
          <group position={[9.5, 6, z]}>
            <pointLight intensity={2} distance={12} color="#ffaa00" />
            <mesh castShadow>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

function Scene({ roomName, onExit, onNearDoorChange }: ClassroomProps & { onNearDoorChange: (isNear: boolean) => void }) {
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 0, 8));
  const keysRef = useRef<Record<string, boolean>>({});
  const nearDoorRef = useRef<boolean>(false);

  // Keyboard listener for E key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === "KeyE" && nearDoorRef.current && onExit) {
        onExit();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onExit]);

  const handlePositionChange = (position: THREE.Vector3) => {
    setPlayerPosition(position.clone());

    // Check proximity to exit door at z=10
    const doorPos = new THREE.Vector3(0, 0, 9);
    const distance = position.distanceTo(doorPos);
    const isNear = distance < 2.5;
    
    if (isNear !== nearDoorRef.current) {
      nearDoorRef.current = isNear;
      onNearDoorChange(isNear);
    }
  };

  return (
    <>
      <fog attach="fog" args={["#0a0015", 5, 30]} />
      <ClassroomEnvironment roomName={roomName} />
      <Player
        onPositionChange={handlePositionChange}
        portals={[]}
        walls={classroomWalls}
      />
      <Camera target={playerPosition} />
    </>
  );
}

export function Classroom({ roomName, onExit }: ClassroomProps) {
  const [nearDoor, setNearDoor] = useState(false);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <Canvas
        camera={{ position: [0, 3, 12], fov: 60 }}
        shadows
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <Scene roomName={roomName} onExit={onExit} onNearDoorChange={setNearDoor} />
      </Canvas>

      {/* Controls UI */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          background: "rgba(0, 0, 0, 0.7)",
          padding: "15px",
          borderRadius: "10px",
          color: "white",
          fontFamily: "monospace",
          fontSize: "14px",
        }}
      >
        <div>🎮 WASD or Arrow Keys - Move</div>
        <div>🖱️ Mouse - Look Around</div>
        <div>🔍 Scroll - Zoom</div>
        {nearDoor && (
          <div style={{ marginTop: "10px", color: "#00ff00", fontWeight: "bold" }}>
            ⌨️ Press E to Exit Classroom
          </div>
        )}
      </div>

      {/* Classroom info */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          background: "rgba(255, 255, 255, 0.9)",
          padding: "15px",
          borderRadius: "10px",
          border: "2px solid #00ffff",
          fontFamily: "monospace",
          fontSize: "14px",
          fontWeight: "bold",
        }}
      >
        <div style={{ marginBottom: "5px" }}>🏫 {roomName}</div>
        <div>📍 Interactive Classroom</div>
        <div>👥 12 Student Desks</div>
      </div>

      {/* Exit button overlay */}
      <button
        onClick={onExit}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "12px 24px",
          background: "linear-gradient(45deg, #ff4444, #ff6b6b)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 100,
          boxShadow: "0 4px 15px rgba(255, 68, 68, 0.4)",
        }}
      >
        Exit Classroom
      </button>
    </div>
  );
}
