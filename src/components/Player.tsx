import { useRef, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

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
}

export function Player({
  onPositionChange,
  portals,
  walls = [],
  onPortalProximity,
  onPortalEnter,
}: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const lastPortalCheck = useRef(0);
  const nearPortal = useRef<string | null>(null);

  const forward = useKeyboardControls((state) => state.forward);
  const backward = useKeyboardControls((state) => state.backward);
  const left = useKeyboardControls((state) => state.left);
  const right = useKeyboardControls((state) => state.right);

  // ✅ Load local Mixamo model
  const gltf = useLoader(GLTFLoader, "/models/character.glb");

  useEffect(() => {
    if (gltf && groupRef.current) {
      gltf.scene.scale.set(1.5, 1.5, 1.5);
      gltf.scene.position.set(0, 0, 0);
      groupRef.current.add(gltf.scene);
    }
  }, [gltf]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    direction.current.set(0, 0, 0);
    if (forward) direction.current.z -= 1;
    if (backward) direction.current.z += 1;
    if (left) direction.current.x -= 1;
    if (right) direction.current.x += 1;

    // Smooth movement
    const speed = 8;
    if (direction.current.length() > 0) {
      direction.current.normalize();
      velocity.current.lerp(direction.current.multiplyScalar(speed), 0.15);

      // Rotate player
      const targetAngle = Math.atan2(direction.current.x, direction.current.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerpAngle(
        groupRef.current.rotation.y,
        targetAngle,
        0.15
      );
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.1);
    }

    const newX = groupRef.current.position.x + velocity.current.x * delta;
    const newZ = groupRef.current.position.z + velocity.current.z * delta;

    // Collision detection
    let collided = false;
    for (const wall of walls) {
      const halfW = wall.width / 2;
      const halfD = wall.depth / 2;
      const buffer = 1;
      if (
        newX > wall.position[0] - halfW - buffer &&
        newX < wall.position[0] + halfW + buffer &&
        newZ > wall.position[2] - halfD - buffer &&
        newZ < wall.position[2] + halfD + buffer
      ) {
        collided = true;
        break;
      }
    }

    if (!collided) {
      groupRef.current.position.x = newX;
      groupRef.current.position.z = newZ;
    }

    // ✅ Smooth TPS camera follow
    const camOffset = new THREE.Vector3(0, 3, 6);
    const rotatedOffset = camOffset
      .clone()
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), groupRef.current.rotation.y);
    const camPos = groupRef.current.position.clone().add(rotatedOffset);

    state.camera.position.lerp(camPos, 0.1);
    state.camera.lookAt(groupRef.current.position);

    // ✅ Portal proximity & interaction
    const currentTime = state.clock.elapsedTime;
    let closestPortal: string | null = null;
    let shouldEnter = false;
    let enterPortal: Portal | null = null;

    for (const portal of portals) {
      const distance = groupRef.current.position.distanceTo(
        new THREE.Vector3(...portal.position)
      );
      if (distance < 5 && !closestPortal) closestPortal = portal.label;
      if (distance < 2.5 && currentTime - lastPortalCheck.current > 1.5) {
        shouldEnter = true;
        enterPortal = portal;
        lastPortalCheck.current = currentTime;
        break;
      }
    }

    if (closestPortal !== nearPortal.current) {
      nearPortal.current = closestPortal;
      onPortalProximity?.(closestPortal);
    }

    if (shouldEnter && enterPortal) {
      onPortalEnter?.(enterPortal.route, enterPortal.label);
    }

    onPositionChange?.(groupRef.current.position);
  });

  return <group ref={groupRef} position={[0, 0, 0]} />;
}
