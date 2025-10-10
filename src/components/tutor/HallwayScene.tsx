import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { KeyboardControls, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { TutorPlayer } from "./TutorPlayer";
import { Door } from "./Door";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

const rooms = [
  { name: "Class A", position: [-9.85, 1.2, -20], side: "left" },
  { name: "Class B", position: [9.85, 1.2, -20], side: "right" },
  { name: "Class C", position: [-9.85, 1.2, -10], side: "left" },
  { name: "Class D", position: [9.85, 1.2, -10], side: "right" },
  { name: "Class E", position: [-9.85, 1.2, 0], side: "left" },
  { name: "Class F", position: [9.85, 1.2, 0], side: "right" },
  { name: "Class G", position: [-9.85, 1.2, 10], side: "left" },
  { name: "Class H", position: [9.85, 1.2, 10], side: "right" },
];

function Hallway() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#d9e0e8" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#f5f5f5" roughness={1} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-10, 5, 0]}>
        <boxGeometry args={[0.3, 10, 60]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[10, 5, 0]}>
        <boxGeometry args={[0.3, 10, 60]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Doors */}
      {rooms.map((room, i) => (
        <Door
          key={i}
          position={room.position as [number, number, number]}
          rotation={[
            0,
            room.side === "left" ? Math.PI / 2 : -Math.PI / 2, // faces sideways
            0,
          ]}
          label={room.name}
          isClassInSession={Math.random() > 0.5}
        />
      ))}

      {/* Lights */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 20, 5]} intensity={1} castShadow />
      <Environment preset="apartment" />
    </group>
  );
}

// === PLAYER MOVEMENT + CAMERA FOLLOW ===
function PlayerController() {
  const playerRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const move = useRef({ forward: false, backward: false, left: false, right: false });
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") move.current.forward = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") move.current.backward = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft") move.current.left = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") move.current.right = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") move.current.forward = false;
      if (e.code === "KeyS" || e.code === "ArrowDown") move.current.backward = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft") move.current.left = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") move.current.right = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const speed = 5;
    const player = playerRef.current;
    const camera = state.camera;

    if (!player) return;

    direction.set(0, 0, 0);
    if (move.current.forward) direction.z -= 1;
    if (move.current.backward) direction.z += 1;
    if (move.current.left) direction.x -= 1;
    if (move.current.right) direction.x += 1;

    direction.normalize();
    direction.applyEuler(camera.rotation); // move relative to camera
    player.position.addScaledVector(direction, speed * delta);

    // Rotate player to face movement direction
    if (direction.lengthSq() > 0.001) {
      const targetAngle = Math.atan2(direction.x, direction.z);
      player.rotation.y = targetAngle;
    }

    // Camera follows from behind
    const cameraOffset = new THREE.Vector3(0, 2, 5).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
    camera.position.copy(player.position.clone().add(cameraOffset));
    camera.lookAt(player.position);
  });

  return (
    <group ref={playerRef} position={[0, 1, 20]}>
      <TutorPlayer modelUrl="/models/character.glb" />
    </group>
  );
}

export function HallwayScene() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0 }}>
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 75 }}>
        <Hallway />
        <PlayerController />
        <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}



