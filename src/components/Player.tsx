import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

interface Portal {
  position: [number, number, number];
  route: string;
}

interface PlayerProps {
  onPositionChange?: (position: THREE.Vector3) => void;
  portals: Portal[];
  walls?: { position: [number, number, number]; width: number; depth: number }[];
}

export function Player({ onPositionChange, portals, walls = [] }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const navigate = useNavigate();
  const lastPortalCheck = useRef(0);

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

    // Calculate new position
    const newX = meshRef.current.position.x + velocity.current.x * delta;
    const newZ = meshRef.current.position.z + velocity.current.z * delta;

    // Wall collision detection
    let collided = false;
    for (const wall of walls) {
      const halfWidth = wall.width / 2;
      const halfDepth = wall.depth / 2;
      const buffer = 1; // Collision buffer

      if (
        newX > wall.position[0] - halfWidth - buffer &&
        newX < wall.position[0] + halfWidth + buffer &&
        newZ > wall.position[2] - halfDepth - buffer &&
        newZ < wall.position[2] + halfDepth + buffer
      ) {
        collided = true;
        break;
      }
    }

    // Update position if no collision
    if (!collided) {
      meshRef.current.position.x = newX;
      meshRef.current.position.z = newZ;
    }

    // Rotate torus for visual effect
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.3;

    // Check portal collisions (with cooldown to prevent rapid navigation)
    const currentTime = state.clock.elapsedTime;
    if (currentTime - lastPortalCheck.current > 0.5) {
      for (const portal of portals) {
        const distance = meshRef.current.position.distanceTo(
          new THREE.Vector3(portal.position[0], portal.position[1], portal.position[2])
        );
        
        // If within 2 units of portal center, trigger navigation
        if (distance < 2.5) {
          lastPortalCheck.current = currentTime;
          navigate(portal.route);
          break;
        }
      }
    }

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
