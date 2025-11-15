// Scene3D.tsx
import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Stars } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { Player } from "./Player";
import { Portal } from "./Portal";
import { Camera } from "./Camera";
import { Wall } from "./Wall";
import { PortalTransition } from "./PortalTransition";
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
        <meshStandardMaterial color="#071028" metalness={0.25} roughness={0.6} />
      </mesh>

      {/* Grid overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[200, 200, 40, 40]} />
        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.06} />
      </mesh>

      {/* Inner emissive circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[60, 64]} />
        <meshStandardMaterial emissive="#002533" emissiveIntensity={0.45} roughness={1} />
      </mesh>
    </>
  );
}

function Lights({ portals }: { portals: { position: [number, number, number]; color?: string }[] }) {
  return (
    <>
      <hemisphereLight color="#cde7ff" groundColor="#0a0010" intensity={0.6} />
      <directionalLight
        position={[12, 25, 10]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <spotLight
        position={[-10, 18, -8]}
        angle={0.35}
        penumbra={0.4}
        intensity={0.8}
        castShadow
        shadow-bias={-0.0005}
      />
      <pointLight position={[0, 10, 0]} intensity={0.25} />

      {portals.map((p, i) => (
        <pointLight
          key={`p-light-${i}`}
          position={p.position}
          intensity={0.9}
          distance={12}
          decay={1.5}
          color={p.color || "#00ffff"}
        />
      ))}
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

const walls = [
  { position: [0, 3, -40] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], width: 100, height: 6 },
  { position: [0, 3, 40] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], width: 100, height: 6 },
  { position: [-40, 3, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], width: 80, height: 6 },
  { position: [40, 3, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], width: 80, height: 6 },
];

const wallCollisions = walls.map((wall) => ({
  position: wall.position,
  width: wall.rotation[1] === 0 ? wall.width : 1,
  depth: wall.rotation[1] === 0 ? 1 : wall.width,
}));

function Scene({
  onPortalProximity,
  onPortalEnter,
}: {
  onPortalProximity: (name: string | null) => void;
  onPortalEnter: (route: string, label: string) => void;
}) {
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1, 0));

  return (
    <>
      <fog attach="fog" args={["#000015", 10, 220]} />
      <Lights portals={portals} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Ground />

      <Player
        onPositionChange={setPlayerPosition}
        portals={portals}
        walls={wallCollisions}
        onPortalProximity={onPortalProximity}
        onPortalEnter={onPortalEnter}
      />

      <Camera target={playerPosition} />

      {walls.map((wall, idx) => (
        <Wall key={idx} position={wall.position} rotation={wall.rotation} width={wall.width} height={wall.height} />
      ))}

      {portals.map((p, idx) => (
        <Portal key={idx} position={p.position} color={p.color} label={p.label} />
      ))}
    </>
  );
}

export function Scene3D() {
  const navigate = useNavigate();
  const [nearPortal, setNearPortal] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitioningPortal, setTransitioningPortal] = useState("");

  const handlePortalEnter = (route: string, label: string) => {
    setIsTransitioning(true);
    setTransitioningPortal(label);

    setTimeout(() => {
      navigate(route);
      setIsTransitioning(false);
      setTransitioningPortal("");
    }, 1500);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0 }}>
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 75 }} gl={{ antialias: true }}>
          <Scene onPortalProximity={setNearPortal} onPortalEnter={handlePortalEnter} />
        </Canvas>
      </KeyboardControls>

      <PortalTransition isTransitioning={isTransitioning} portalName={transitioningPortal} />

      <div
        style={{
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
          zIndex: 10,
        }}
      >
        <div>🎮 WASD / Arrows: Move | 🖱️ Mouse: Rotate Camera</div>
        <div style={{ marginTop: "5px" }}>🚪 Get close to portals to enter</div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.05);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}

