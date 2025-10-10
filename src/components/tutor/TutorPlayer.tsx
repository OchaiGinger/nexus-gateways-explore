import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";

export function TutorPlayer({ onEnterDoor }: { onEnterDoor: (index: number) => void }) {
  const { camera, scene } = useThree();
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const keys = useRef<{ [key: string]: boolean }>({});
  const [doorIndex, setDoorIndex] = useState<number | null>(null);

  const speed = 0.08;
  const playerHeight = 1.6;

  // Visible hands (player model)
  const handsRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    direction.set(0, 0, 0);
    if (keys.current["KeyW"]) direction.z -= 1;
    if (keys.current["KeyS"]) direction.z += 1;
    if (keys.current["KeyA"]) direction.x -= 1;
    if (keys.current["KeyD"]) direction.x += 1;
    direction.normalize();

    // Move relative to camera direction
    const move = new THREE.Vector3();
    camera.getWorldDirection(move);
    move.y = 0;
    move.normalize();

    const side = new THREE.Vector3();
    side.crossVectors(camera.up, move).normalize();

    const forwardMove = move.multiplyScalar(direction.z * speed);
    const sideMove = side.multiplyScalar(direction.x * speed);

    camera.position.add(forwardMove);
    camera.position.add(sideMove);

    // Height lock
    camera.position.y = playerHeight;

    // Simple walls
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -8.5, 8.5);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -28, 28);

    // Proximity detection
    const doors = scene.children.filter((obj) => obj.name.startsWith("Door"));
    let closestDoor = null;
    let minDist = 2;
    doors.forEach((door: any, i) => {
      const dist = camera.position.distanceTo(door.position);
      if (dist < minDist) {
        minDist = dist;
        closestDoor = i;
      }
    });

    setDoorIndex(closestDoor);
  });

  // Press E to enter door
  useEffect(() => {
    const handlePress = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && doorIndex !== null) onEnterDoor(doorIndex);
    };
    window.addEventListener("keydown", handlePress);
    return () => window.removeEventListener("keydown", handlePress);
  }, [doorIndex, onEnterDoor]);

  return (
    <>
      <PointerLockControls />
      {/* Visible hands */}
      <group ref={handsRef} position={[0, -0.3, -0.8]}>
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.6]} />
          <meshStandardMaterial color="#ff4dff" emissive="#ff00ff" emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.6]} />
          <meshStandardMaterial color="#ff4dff" emissive="#ff00ff" emissiveIntensity={0.7} />
        </mesh>
      </group>
    </>
  );
}




