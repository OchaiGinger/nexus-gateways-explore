import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

interface Portal {
  position: [number, number, number];
  route: string;
  label: string;
}

interface PlayerProps {
  onPositionChange?: (position: THREE.Vector3) => void;
  portals: Portal[];
  walls?: { position: [number, number, number]; width: number; depth: number }[];
  onPortalProximity?: (portalName: string | null) => void;
  onPortalEnter?: (route: string, label: string) => void;
  cameraRotation?: number;
}

export function Player({ onPositionChange, portals, walls = [], onPortalProximity, onPortalEnter, cameraRotation = 0 }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const lastPortalCheck = useRef(0);
  const nearPortal = useRef<string | null>(null);

  // Get keyboard controls
  const forward = useKeyboardControls((state) => state.forward);
  const backward = useKeyboardControls((state) => state.backward);
  const left = useKeyboardControls((state) => state.left);
  const right = useKeyboardControls((state) => state.right);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Reset direction
    direction.current.set(0, 0, 0);

    // Calculate movement direction relative to camera
    const moveDirection = new THREE.Vector3();
    if (forward) moveDirection.z -= 1;
    if (backward) moveDirection.z += 1;
    if (left) moveDirection.x -= 1;
    if (right) moveDirection.x += 1;

    // Apply camera rotation to movement direction
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      
      // Rotate movement based on camera angle
      const rotatedDirection = new THREE.Vector3(
        moveDirection.x * Math.cos(cameraRotation) - moveDirection.z * Math.sin(cameraRotation),
        0,
        moveDirection.x * Math.sin(cameraRotation) + moveDirection.z * Math.cos(cameraRotation)
      );
      
      direction.current.copy(rotatedDirection);
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

    // Check portal proximity and collisions
    const currentTime = state.clock.elapsedTime;
    let closestPortal: string | null = null;
    let shouldEnter = false;
    let enterPortal: Portal | null = null;

    for (const portal of portals) {
      const distance = meshRef.current.position.distanceTo(
        new THREE.Vector3(portal.position[0], portal.position[1], portal.position[2])
      );
      
      // Show proximity indicator when within 5 units
      if (distance < 5 && !closestPortal) {
        closestPortal = portal.label;
      }

      // Enter portal when within 2.5 units (with cooldown)
      if (distance < 2.5 && currentTime - lastPortalCheck.current > 1.5) {
        shouldEnter = true;
        enterPortal = portal;
        lastPortalCheck.current = currentTime;
        break;
      }
    }

    // Update proximity indicator
    if (closestPortal !== nearPortal.current) {
      nearPortal.current = closestPortal;
      if (onPortalProximity) {
        onPortalProximity(closestPortal);
      }
    }

    // Trigger portal entry with delay
    if (shouldEnter && enterPortal && onPortalEnter) {
      onPortalEnter(enterPortal.route, enterPortal.label);
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
