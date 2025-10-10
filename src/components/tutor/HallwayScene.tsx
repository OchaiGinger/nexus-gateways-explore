import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Stars } from "@react-three/drei";
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

const classrooms = [
  { name: "Mathematics", position: [-6, 2, -20], inSession: true },
  { name: "Physics", position: [6, 2, -20], inSession: false },
  { name: "Computer Science", position: [-6, 2, -10], inSession: true },
  { name: "Chemistry", position: [6, 2, -10], inSession: false },
  { name: "Biology", position: [-6, 2, 0], inSession: true },
  { name: "Literature", position: [6, 2, 0], inSession: false },
  { name: "History", position: [-6, 2, 10], inSession: false },
  { name: "Art & Design", position: [6, 2, 10], inSession: true },
];

function Hallway({ onDoorClick, nearDoorIndex }: { onDoorClick: (index: number) => void; nearDoorIndex: number | null }) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#0a0a1f" />
      </mesh>

      {/* Grid overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[20, 60, 20, 60]} />
        <meshBasicMaterial color="#ff4dff" wireframe transparent opacity={0.1} />
      </mesh>

      {/* Walls */}
      {/* Left wall */}
      <mesh position={[-10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Right wall */}
      <mesh position={[10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 5, -30]} receiveShadow>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, 5, 30]} receiveShadow>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#050510" />
      </mesh>

      {/* Doors */}
      {classrooms.map((classroom, index) => (
        <Door
          key={index}
          position={classroom.position as [number, number, number]}
          label={classroom.name}
          isClassInSession={classroom.inSession}
          onClick={() => onDoorClick(index)}
        />
      ))}

      {/* Ceiling lights */}
      {Array.from({ length: 8 }).map((_, i) => (
        <pointLight
          key={i}
          position={[0, 9, -25 + i * 7]}
          intensity={0.8}
          distance={15}
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
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1, 20));
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
          doors={classrooms.map(c => ({ position: c.position as [number, number, number] }))}
        />
        <Camera target={playerPosition} onCameraRotation={setCameraRotation} />
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
        doors={classrooms.map(c => ({ position: c.position as [number, number, number] }))}
      />
      <Camera target={playerPosition} onCameraRotation={setCameraRotation} />
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
        <Canvas shadows camera={{ position: [0, 5, 25], fov: 75 }}>
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
        <div>🎮 WASD/Arrows: Move | 🖱️ Mouse: Rotate Camera</div>
        <div style={{ marginTop: "5px" }}>🚪 Approach doors to enter classrooms</div>
      </div>
    </div>
  );
}
