import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Stars } from "@react-three/drei";
import { Player } from "./Player";
import { Portal } from "./Portal";
import { Camera } from "./Camera";
import * as THREE from "three";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

function Ground() {
  return (
    <>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200, 50, 50]} />
        <meshStandardMaterial
          color="#0a0a1f"
          metalness={0.3}
          roughness={0.7}
          wireframe={false}
        />
      </mesh>

      {/* Grid overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[200, 200, 40, 40]} />
        <meshBasicMaterial
          color="#00ffff"
          wireframe={true}
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Additional ground planes for depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#050510" />
      </mesh>
    </>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#00ffff" />
    </>
  );
}

const portals = [
  { position: [10, 2, -15] as [number, number, number], color: "#00d4ff", label: "Exams Portal", route: "/exams" },
  { position: [-15, 2, -10] as [number, number, number], color: "#b84dff", label: "Library Portal", route: "/library" },
  { position: [15, 2, 5] as [number, number, number], color: "#00ff88", label: "Campus Map", route: "/campus" },
  { position: [-12, 2, 8] as [number, number, number], color: "#ff9500", label: "3D Store", route: "/store" },
  { position: [0, 2, -25] as [number, number, number], color: "#ff4dff", label: "AI Tutor", route: "/ai-tutor" },
  { position: [20, 2, -5] as [number, number, number], color: "#ffff00", label: "Project Writer", route: "/project-writer" },
  { position: [-20, 2, -5] as [number, number, number], color: "#8a4dff", label: "Study Room", route: "/study-room" },
  { position: [0, 2, 15] as [number, number, number], color: "#00d4ff", label: "I Seek", route: "/seek" },
];

function Scene() {
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1, 0));

  return (
    <>
      <Lights />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Ground />
      <Player onPositionChange={setPlayerPosition} />
      <Camera target={playerPosition} />
      
      {portals.map((portal, index) => (
        <Portal
          key={index}
          position={portal.position}
          color={portal.color}
          label={portal.label}
          route={portal.route}
        />
      ))}
    </>
  );
}

export function Scene3D() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0 }}>
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 75 }}>
          <Scene />
        </Canvas>
      </KeyboardControls>
      
      {/* Controls overlay */}
      <div style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        color: "#00ffff",
        fontFamily: "monospace",
        fontSize: "14px",
        textAlign: "center",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "15px 25px",
        borderRadius: "10px",
        border: "1px solid #00ffff",
      }}>
        <div>🎮 Controls: WASD or Arrow Keys to move</div>
        <div style={{ marginTop: "5px" }}>🚪 Click on portals to enter</div>
      </div>
    </div>
  );
}
