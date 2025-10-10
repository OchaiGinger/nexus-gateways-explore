"use client";

import { Canvas } from "@react-three/fiber";
import { Stars, Text } from "@react-three/drei";
import { Suspense, useState } from "react";
import * as THREE from "three";
import { TutorPlayer } from "./TutorPlayer";
import { Door } from "./Door";

const classrooms = [
  { name: "Mathematics", position: [-8, 2, -20], side: "left", inSession: true },
  { name: "Physics", position: [8, 2, -10], side: "right", inSession: false },
  { name: "Biology", position: [-8, 2, 0], side: "left", inSession: true },
  { name: "Computer Science", position: [8, 2, 10], side: "right", inSession: false },
];

export function HallwayScene() {
  const [viewMode, setViewMode] = useState<"hallway" | "classroom">("hallway");
  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows camera={{ position: [0, 1.6, -20], fov: 75 }}>
        <Suspense fallback={null}>
          {/* Background */}
          <Stars radius={100} depth={50} count={2000} factor={4} fade speed={1} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
          <spotLight position={[0, 9, 0]} angle={0.5} intensity={3} distance={40} penumbra={0.5} color="#ff4dff" />

          {/* Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[20, 60]} />
            <meshStandardMaterial color="#111122" metalness={0.3} roughness={0.6} />
          </mesh>

          {/* Ceiling */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
            <planeGeometry args={[20, 60]} />
            <meshStandardMaterial color="#0a0a1a" />
          </mesh>

          {/* Walls */}
          <mesh position={[-10, 5, 0]}>
            <boxGeometry args={[0.2, 10, 60]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>
          <mesh position={[10, 5, 0]}>
            <boxGeometry args={[0.2, 10, 60]} />
            <meshStandardMaterial color="#1a1a2e" />
          </mesh>

          {/* Text */}
          <Text position={[0, 8, 0]} fontSize={1} color="#ff4dff" anchorX="center">
            ACADEMIC HALLWAY
          </Text>

          {/* Doors */}
          {classrooms.map((c, i) => (
            <group name={`Door-${i}`} key={i} position={c.position}>
              <Door position={[0, 0, 0]} label={c.name} isClassInSession={c.inSession} />
            </group>
          ))}

          {/* Player */}
          <TutorPlayer
            onEnterDoor={(i) => {
              setSelectedClassroom(i);
              setViewMode("classroom");
            }}
          />
        </Suspense>
      </Canvas>

      {/* Overlay */}
      {viewMode === "hallway" && (
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
          }}
        >
          <div>🎮 WASD to move | 🖱️ Mouse to look | E to Enter Door</div>
        </div>
      )}
    </div>
  );
}


