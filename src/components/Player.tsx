import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

interface Portal {
  position: [number, number, number];
  route: string;
  label: string;
}

interface Wall {
  position: [number, number, number];
  width: number;
  depth: number;
}

interface PlayerProps {
  onPositionChange?: (position: THREE.Vector3) => void;
  portals: Portal[];
  walls?: Wall[];
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

  // Load character model + animations
  const { scene, animations } = useGLTF("/models/character.glb");
  const { actions } = useAnimations(animations, groupRef);

  // Keyboard controls
  const forward = useKeyboardControls((state) => state.forward);
  const backward = useKeyboardControls((state) => state.backward);
  const left = useKeyboardControls((state) => state.left);
  const right = useKeyboardControls((state) => state.right);

  // Handle animation switching
  useEffect(() => {
    if (!actions) return;
    const moving = forward || backward || left || right;
    let nextAction;

    if (moving) nextAction = actions["Walk"] || actions["Run"];
    else nextAction = actions["Idle"];

    if (nextAction) {
      Object.values(actions).forEach((a) => a?.fadeOut(0.2));
      nextAction.reset().fadeIn(0.2).play();
    }
  }, [forward, backward, left, right, actions]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Calculate movement direction
    direction.current.set(0, 0, 0);
    if (forward) direction.current.z -= 1;
    if (backward) direction.current.z += 1;
    if (left) direction.current.x -= 1;
    if (right) direction.current.x += 1;

    // Apply smooth velocity
    const speed = direction.current.length() > 0 ? 5 : 0;
    if (direction.current.length() > 0) {
      direction.current.normalize();
      velocity.current.lerp(direction.current.multiplyScalar(speed), 0.1);
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.1);
    }

    // Predict new position
    const newX = groupRef.current.position.x + velocity.current.x * delta;
    const newZ = groupRef.current.position.z + velocity.current.z * delta;

    // Wall collision
    let collided = false;
    for (const wall of walls) {
      const halfWidth = wall.width / 2;
      const halfDepth = wall.depth / 2;
      const buffer = 1;
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

    if (!collided) {
      groupRef.current.position.x = newX;
      groupRef.current.position.z = newZ;
    }

    // Smooth character rotation
    if (direction.current.lengthSq() > 0) {
      const angle = Math.atan2(direction.current.x, direction.current.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        angle,
        0.2
      );
    }

    // Portal proximity & entry
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

    if (shouldEnter && enterPortal && onPortalEnter) {
      onPortalEnter(enterPortal.route, enterPortal.label);
    }

    // Notify parent of position
    onPositionChange?.(groupRef.current.position);

    // Smooth third-person camera follow
    const cameraOffset = new THREE.Vector3(0, 3, 6);
    const cameraTarget = groupRef.current.position
      .clone()
      .add(cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), groupRef.current.rotation.y));

    state.camera.position.lerp(cameraTarget, 0.05);
    state.camera.lookAt(groupRef.current.position);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} dispose={null}>
      <primitive object={scene} scale={1.0} />
    </group>
  );
}

useGLTF.preload("https://jqmapu5497.ufs.sh/f/86WEsYzUhV0NYnB7tJPFvmtf0nsaREkx1yPSNdU3V4igpuDw");
