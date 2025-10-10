import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Stars, Text } from "@react-three/drei";
import * as THREE from "three";
import { Camera } from "../Camera";
import { TutorPlayer } from "./TutorPlayer";
import { Door } from "./Door";
import { Classroom } from "./Classroom";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

// Enhanced classrooms with L-shaped positioning
const classrooms = [
  // Main corridor (z-axis)
  { name: "Mathematics", position: [-8, 2, -25], side: "left", inSession: true },
  { name: "Physics", position: [8, 2, -25], side: "right", inSession: false },
  { name: "Computer Science", position: [-8, 2, -15], side: "left", inSession: true },
  { name: "Chemistry", position: [8, 2, -15], side: "right", inSession: false },
  { name: "Biology", position: [-8, 2, -5], side: "left", inSession: true },
  { name: "Literature", position: [8, 2, -5], side: "right", inSession: false },
  
  // L-shaped corridor (x-axis)
  { name: "History", position: [-15, 2, 5], side: "left", inSession: false },
  { name: "Art & Design", position: [-25, 2, 5], side: "left", inSession: true },
  { name: "Music", position: [-35, 2, 5], side: "left", inSession: false },
  { name: "Economics", position: [15, 2, 5], side: "right", inSession: true },
  { name: "Psychology", position: [25, 2, 5], side: "right", inSession: false },
  { name: "Engineering", position: [35, 2, 5], side: "right", inSession: true },
];

function Hallway({ onDoorClick, nearDoorIndex }: { onDoorClick: (index: number) => void; nearDoorIndex: number | null }) {
  return (
    <group>
      {/* Main corridor floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} receiveShadow>
        <planeGeometry args={[20, 40]} />
        <meshStandardMaterial color="#0a0a1f" />
      </mesh>

      {/* L-shaped extension floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 10]} receiveShadow>
        <planeGeometry args={[60, 20]} />
        <meshStandardMaterial color="#0a0a1f" />
      </mesh>

      {/* Grid overlay - Main corridor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -10]}>
        <planeGeometry args={[20, 40, 20, 40]} />
        <meshBasicMaterial color="#ff4dff" wireframe transparent opacity={0.1} />
      </mesh>

      {/* Grid overlay - L-shaped extension */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 10]}>
        <planeGeometry args={[60, 20, 60, 20]} />
        <meshBasicMaterial color="#ff4dff" wireframe transparent opacity={0.1} />
      </mesh>

      {/* Walls - Main corridor */}
      {/* Left wall */}
      <mesh position={[-10, 5, -10]} receiveShadow>
        <boxGeometry args={[0.5, 10, 40]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Right wall */}
      <mesh position={[10, 5, -10]} receiveShadow>
        <boxGeometry args={[0.5, 10, 40]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 5, -30]} receiveShadow>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Walls - L-shaped extension */}
      {/* Left wall of L-shape */}
      <mesh position={[-30, 5, 10]} receiveShadow>
        <boxGeometry args={[0.5, 10, 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Right wall of L-shape */}
      <mesh position={[30, 5, 10]} receiveShadow>
        <boxGeometry args={[0.5, 10, 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, 5, 20]} receiveShadow>
        <boxGeometry args={[60, 10, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Connecting wall between corridors */}
      <mesh position={[0, 5, 0]} receiveShadow>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Opening in connecting wall */}
      <mesh position={[0, 8, 0]} receiveShadow>
        <boxGeometry args={[6, 4, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.5} />
      </mesh>

      {/* Ceiling - Main corridor */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, -10]}>
        <planeGeometry args={[20, 40]} />
        <meshStandardMaterial color="#050510" />
      </mesh>

      {/* Ceiling - L-shaped extension */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 10]}>
        <planeGeometry args={[60, 20]} />
        <meshStandardMaterial color="#050510" />
      </mesh>

      {/* Direction indicators using Text from drei */}
      <Text
        position={[0, 3, -28]}
        fontSize={0.8}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        MAIN CORRIDOR
      </Text>

      <Text
        position={[0, 3, 18]}
        fontSize={0.8}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        L-SHAPED WING
      </Text>

      {/* Doors with proper rotation for FPS */}
      {classrooms.map((classroom, index) => {
        let rotation: [number, number, number] = [0, 0, 0];
        
        // Rotate doors to face the hallway properly
        if (classroom.side === "left") {
          rotation = [0, Math.PI / 2, 0]; // Face right (toward center of hallway)
        } else if (classroom.side === "right") {
          rotation = [0, -Math.PI / 2, 0]; // Face left (toward center of hallway)
        }

        return (
          <Door
            key={index}
            position={classroom.position as [number, number, number]}
            rotation={rotation}
            label={classroom.name}
            isClassInSession={classroom.inSession}
            onClick={() => onDoorClick(index)}
          />
        );
      })}

      {/* Ceiling lights - Main corridor */}
      {Array.from({ length: 6 }).map((_, i) => (
        <pointLight
          key={`main-${i}`}
          position={[0, 9, -25 + i * 8]}
          intensity={0.8}
          distance={12}
          color="#ff4dff"
        />
      ))}

      {/* Ceiling lights - L-shaped extension */}
      {Array.from({ length: 8 }).map((_, i) => (
        <pointLight
          key={`lshape-${i}`}
          position={[-27.5 + i * 7.8, 9, 10]}
          intensity={0.8}
          distance={12}
          color="#ff4dff"
        />
      ))}

      {/* Ambient light */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={0.5} castShadow />
    </group>
  );
}

function Scene({ 
  viewMode, 
  selectedClassroom,
  onDoorProximity,
  nearDoorIndex
}: { 
  viewMode: 'hallway' | 'classroom';
  selectedClassroom: number | null;
  onDoorProximity: (index: number | null) => void;
  nearDoorIndex: number | null;
}) {
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1.6, -20));
  const [cameraRotation, setCameraRotation] = useState(0);
  const [, setNearDoor] = useState<number | null>(null);

  const handleDoorProximity = (doorIndex: number | null) => {
    setNearDoor(doorIndex);
    onDoorProximity(doorIndex);
  };

  if (viewMode === 'classroom' && selectedClassroom !== null) {
    return (
      <>
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <Classroom roomName={classrooms[selectedClassroom].name} />
        <TutorPlayer
          onPositionChange={setPlayerPosition}
          cameraRotation={cameraRotation}
          onDoorProximity={handleDoorProximity}
          doors={classrooms.map(c => ({ 
            position: c.position as [number, number, number],
            side: c.side 
          }))}
          isFPS={true}
        />
        <Camera target={playerPosition} onCameraRotation={setCameraRotation} isFPS={true} />
      </>
    );
  }

  return (
    <>
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      <Hallway 
        onDoorClick={() => {}} 
        nearDoorIndex={nearDoorIndex}
      />
      <TutorPlayer
        onPositionChange={setPlayerPosition}
        cameraRotation={cameraRotation}
        onDoorProximity={handleDoorProximity}
        doors={classrooms.map(c => ({ 
          position: c.position as [number, number, number],
          side: c.side 
        }))}
        isFPS={true}
      />
      <Camera target={playerPosition} onCameraRotation={setCameraRotation} isFPS={true} />
    </>
  );
}

export function HallwayScene() {
  const [viewMode, setViewMode] = useState<'hallway' | 'classroom'>('hallway');
  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);
  const [nearDoorIndex, setNearDoorIndex] = useState<number | null>(null);

  const handleEnterClassroom = () => {
    if (nearDoorIndex !== null) {
      setSelectedClassroom(nearDoorIndex);
      setViewMode('classroom');
    }
  };

  const handleExitClassroom = () => {
    setViewMode('hallway');
    setSelectedClassroom(null);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0 }}>
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 1.6, -20], fov: 75 }} gl={{ antialias: true }}>
          <Scene 
            viewMode={viewMode} 
            selectedClassroom={selectedClassroom}
            onDoorProximity={setNearDoorIndex}
            nearDoorIndex={nearDoorIndex}
          />
        </Canvas>
      </KeyboardControls>

      {/* Door proximity indicator */}
      {nearDoorIndex !== null && viewMode === 'hallway' && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.8)",
            border: "2px solid #ff4dff",
            borderRadius: "15px",
            padding: "20px 40px",
            color: "#ff4dff",
            fontSize: "1.5rem",
            fontWeight: "bold",
            textAlign: "center",
            zIndex: 100,
            boxShadow: "0 0 30px rgba(255, 77, 255, 0.5)",
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            🚪 {classrooms[nearDoorIndex].name}
          </div>
          <div style={{ fontSize: "1rem", opacity: 0.8, fontWeight: "normal", marginBottom: "10px" }}>
            {classrooms[nearDoorIndex].inSession ? "🟢 Class in Session" : "🔴 Available"}
          </div>
          <button
            onClick={handleEnterClassroom}
            style={{
              background: "#ff4dff",
              color: "#000",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Press to Enter
          </button>
        </div>
      )}

      {/* Exit classroom button */}
      {viewMode === 'classroom' && (
        <button
          onClick={handleExitClassroom}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "#ff4dff",
            color: "#000",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            zIndex: 100,
          }}
        >
          Exit Classroom
        </button>
      )}

      {/* FPS Crosshair */}
      {viewMode === 'hallway' && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "20px",
            height: "20px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "4px",
              height: "4px",
              background: "#ff4dff",
              borderRadius: "50%",
              boxShadow: "0 0 10px rgba(255, 77, 255, 0.5)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "16px",
              height: "2px",
              background: "transparent",
              borderLeft: "1px solid #ff4dff",
              borderRight: "1px solid #ff4dff",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "2px",
              height: "16px",
              background: "transparent",
              borderTop: "1px solid #ff4dff",
              borderBottom: "1px solid #ff4dff",
            }}
          />
        </div>
      )}

      {/* Controls overlay */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#ff4dff",
          fontFamily: "monospace",
          fontSize: "14px",
          textAlign: "center",
          background: "rgba(0, 0, 0, 0.7)",
          padding: "15px 25px",
          borderRadius: "10px",
          border: "1px solid #ff4dff",
          zIndex: 10,
        }}
      >
        <div>🎮 WASD/Arrows: Move | 🖱️ Mouse: Look Around</div>
        <div style={{ marginTop: "5px" }}>🚪 Face doors to enter classrooms</div>
        <div style={{ marginTop: "5px", fontSize: "12px", opacity: 0.8 }}>
          Explore the L-shaped hallway with multiple departments
        </div>
      </div>

      {/* Map indicator */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          background: "rgba(0, 0, 0, 0.7)",
          border: "1px solid #ff4dff",
          borderRadius: "8px",
          padding: "10px",
          color: "#ff4dff",
          fontSize: "12px",
          fontFamily: "monospace",
          zIndex: 10,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>MAP</div>
        <div>┌─────────────┐</div>
        <div>│ L-Shaped    │</div>
        <div>│   Wing →    │</div>
        <div>│             │</div>
        <div>│ Main Corridor</div>
        <div>└─────────────┘</div>
      </div>
    </div>
  );
}
