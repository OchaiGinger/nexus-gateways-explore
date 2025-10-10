import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

interface TutorPlayerProps {
  onPositionChange?: (position: THREE.Vector3) => void;
  cameraRotation?: number;
  onDoorProximity?: (doorIndex: number | null) => void;
  doors: Array<{ position: [number, number, number] }>;
}

export function TutorPlayer({ 
  onPositionChange, 
  cameraRotation = 0,
  onDoorProximity,
  doors
}: TutorPlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const nearDoor = useRef<number | null>(null);

  const forward = useKeyboardControls((state) => state.forward);
  const backward = useKeyboardControls((state) => state.backward);
  const left = useKeyboardControls((state) => state.left);
  const right = useKeyboardControls((state) => state.right);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Calculate movement direction relative to camera
    const moveX = (right ? 1 : 0) - (left ? 1 : 0);
    const moveZ = (backward ? 1 : 0) - (forward ? 1 : 0);

    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      const normalizedX = moveX / length;
      const normalizedZ = moveZ / length;
      
      const sin = Math.sin(cameraRotation);
      const cos = Math.cos(cameraRotation);
      
      direction.current.set(
        normalizedX * cos - normalizedZ * sin,
        0,
        normalizedX * sin + normalizedZ * cos
      );
      
      velocity.current.lerp(direction.current.multiplyScalar(5), 0.1);
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.1);
    }

    meshRef.current.position.x += velocity.current.x * delta;
    meshRef.current.position.z += velocity.current.z * delta;

    // Boundary limits for hallway
    meshRef.current.position.x = Math.max(-8, Math.min(8, meshRef.current.position.x));
    meshRef.current.position.z = Math.max(-25, Math.min(25, meshRef.current.position.z));

    // Rotate torus for visual effect
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.3;

    // Check door proximity
    let closestDoor: number | null = null;
    let minDistance = Infinity;

    doors.forEach((door, index) => {
      const distance = meshRef.current!.position.distanceTo(
        new THREE.Vector3(door.position[0], door.position[1], door.position[2])
      );
      
      if (distance < 3 && distance < minDistance) {
        closestDoor = index;
        minDistance = distance;
      }
    });

    if (closestDoor !== nearDoor.current) {
      nearDoor.current = closestDoor;
      if (onDoorProximity) {
        onDoorProximity(closestDoor);
      }
    }

    if (onPositionChange) {
      onPositionChange(meshRef.current.position);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 20]} castShadow>
      <torusGeometry args={[0.5, 0.2, 16, 32]} />
      <meshStandardMaterial
        color="#ff4dff"
        emissive="#ff4dff"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}
