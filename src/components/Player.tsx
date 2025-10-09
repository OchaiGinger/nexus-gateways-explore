import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

interface PlayerProps {
  onPositionChange?: (position: THREE.Vector3) => void;
}

export function Player({ onPositionChange }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  // Get keyboard controls
  const forward = useKeyboardControls((state) => state.forward);
  const backward = useKeyboardControls((state) => state.backward);
  const left = useKeyboardControls((state) => state.left);
  const right = useKeyboardControls((state) => state.right);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Reset direction
    direction.current.set(0, 0, 0);

    // Calculate movement direction
    if (forward) direction.current.z -= 1;
    if (backward) direction.current.z += 1;
    if (left) direction.current.x -= 1;
    if (right) direction.current.x += 1;

    // Normalize and apply speed
    if (direction.current.length() > 0) {
      direction.current.normalize();
      velocity.current.lerp(direction.current.multiplyScalar(5), 0.1);
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.1);
    }

    // Update position
    meshRef.current.position.x += velocity.current.x * delta;
    meshRef.current.position.z += velocity.current.z * delta;

    // Rotate torus for visual effect
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.3;

    // Notify parent of position change
    if (onPositionChange) {
      onPositionChange(meshRef.current.position);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 0]} castShadow>
      <torusGeometry args={[0.5, 0.2, 16, 32]} />
      <meshStandardMaterial
        color="#00ffff"
        emissive="#00ffff"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}
