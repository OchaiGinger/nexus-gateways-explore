import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Stars } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { Player } from "./Player";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#0a0a1f" roughness={0.8} metalness={0.2} />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
      <pointLight position={[0, 10, 0]} intensity={1.2} color="#00ffff" />
    </>
  );
}

export function Scene3D() {
  const navigate = useNavigate();
  const [nearPortal, setNearPortal] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitioningPortal, setTransitioningPortal] = useState("");
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 1, 0));

  const portals = [
    { position: [10, 0, 0] as [number, number, number], route: "/about", label: "About" },
    { position: [-10, 0, 0] as [number, number, number], route: "/shop", label: "Shop" },
  ];

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
    <div style={{ width: "100vw", height: "100vh", position: "fixed" }}>
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 3, 10], fov: 60 }}>
          <color attach="background" args={["#000010"]} />
          <Lights />
          <Stars radius={100} depth={50} count={5000} factor={4} fade />
          <Ground />
          <Player
            onPositionChange={setPlayerPos}
            portals={portals}
            onPortalProximity={setNearPortal}
            onPortalEnter={handlePortalEnter}
          />
        </Canvas>
      </KeyboardControls>

      {/* ✅ Portal proximity indicator */}
      {nearPortal && !isTransitioning && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.8)",
            color: "#00ffff",
            padding: "20px 40px",
            border: "2px solid #00ffff",
            borderRadius: "15px",
            fontSize: "1.5rem",
            fontWeight: "bold",
            textAlign: "center",
            boxShadow: "0 0 30px rgba(0,212,255,0.5)",
          }}
        >
          🚪 {nearPortal}
        </div>
      )}
    </div>
  );
}

