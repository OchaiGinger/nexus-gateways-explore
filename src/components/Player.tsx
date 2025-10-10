// Player.tsx
import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

interface Portal {
  position: [number, number, number];
  route: string;
  label: string;
}

interface PlayerProps {
  modelUrl?: string; // public Ready Player Me GLB URL (optional)
  onPositionChange?: (position: THREE.Vector3) => void;
  portals: Portal[];
  walls?: { position: [number, number, number]; width: number; depth: number }[];
  onPortalProximity?: (portalName: string | null) => void;
  onPortalEnter?: (route: string, label: string) => void;
  cameraRotation?: number; // kept for compatibility but NOT used
}

export function Player({
  modelUrl,
  onPositionChange,
  portals,
  walls = [],
  onPortalProximity,
  onPortalEnter,
}: PlayerProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const velocity = useRef(new THREE.Vector3());
  const lastPortalCheck = useRef(0);
  const nearPortal = useRef<string | null>(null);

  // keyboard state
  const forward = useKeyboardControls((s) => s.forward);
  const backward = useKeyboardControls((s) => s.backward);
  const left = useKeyboardControls((s) => s.left);
  const right = useKeyboardControls((s) => s.right);

  // glTF model state (loaded via GLTFLoader so we can conditionally load)
  const [gltfScene, setGltfScene] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    if (!modelUrl) {
      setGltfScene(null);
      return;
    }
    const loader = new GLTFLoader();
    let mounted = true;
    loader.load(
      modelUrl,
      (gltf) => {
        if (!mounted) return;
        // enable shadows on meshes
        gltf.scene.traverse((child) => {
          // @ts-ignore
          if (child.isMesh) {
            // @ts-ignore
            child.castShadow = true;
            // @ts-ignore
            child.receiveShadow = true;
          }
        });
        setGltfScene(gltf.scene);
      },
      undefined,
      (err) => {
        console.error("Failed to load GLTF:", err);
        setGltfScene(null);
      }
    );
    return () => {
      mounted = false;
    };
  }, [modelUrl]);

  // main frame loop
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // input axes (forward positive)
    const inputX = (right ? 1 : 0) - (left ? 1 : 0);
    const inputZ = (forward ? 1 : 0) - (backward ? 1 : 0);

    // compute movement basis from camera orientation (so rotating camera changes movement direction instantly)
    const camera = state.camera;
    const forwardVec = new THREE.Vector3();
    camera.getWorldDirection(forwardVec); // points where camera looks
    forwardVec.y = 0;
    forwardVec.normalize();

    const rightVec = new THREE.Vector3();
    rightVec.crossVectors(forwardVec, camera.up).normalize(); // camera right

    const moveDir = new THREE.Vector3();
    moveDir.copy(forwardVec).multiplyScalar(inputZ).addScaledVector(rightVec, inputX);

    const speed = 6; // units / sec
    if (moveDir.lengthSq() > 0.0001) {
      moveDir.normalize();
      const targetVel = moveDir.multiplyScalar(speed);
      velocity.current.lerp(targetVel, 0.15); // smoothing
    } else {
      // smooth stop
      velocity.current.lerp(new THREE.Vector3(), 0.12);
    }

    // Predict new position (x,z)
    const predictedX = groupRef.current.position.x + velocity.current.x * delta;
    const predictedZ = groupRef.current.position.z + velocity.current.z * delta;

    // Wall collision detection (using predicted position)
    let collided = false;
    for (const wall of walls) {
      const halfWidth = wall.width / 2;
      const halfDepth = wall.depth / 2;
      const buffer = 0.9; // collision buffer (adjust if needed)

      if (
        predictedX > wall.position[0] - halfWidth - buffer &&
        predictedX < wall.position[0] + halfWidth + buffer &&
        predictedZ > wall.position[2] - halfDepth - buffer &&
        predictedZ < wall.position[2] + halfDepth + buffer
      ) {
        collided = true;
        break;
      }
    }

    // apply if no collision
    if (!collided) {
      groupRef.current.position.x = predictedX;
      groupRef.current.position.z = predictedZ;
    } else {
      // if collided, gently zero out velocity on the colliding axis
      velocity.current.set(0, velocity.current.y, 0);
    }

    // make player face movement direction smoothly
    if (velocity.current.lengthSq() > 0.0001) {
      // compute yaw from velocity vector
      const yaw = Math.atan2(velocity.current.x, velocity.current.z);
      // easing rotation
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        yaw,
        6,
        delta
      );
    }

    // simple small idle rotation on X for a subtle living feel (only if fallback torus)
    if (!gltfScene) {
      groupRef.current.rotation.x += delta * 0.5;
      groupRef.current.rotation.z += delta * 0.2;
    }

    // Portals proximity & enter logic (same timings as before)
    const currentTime = state.clock.elapsedTime;
    let closestPortal: string | null = null;
    let shouldEnter = false;
    let enterPortal: Portal | null = null;

    for (const portal of portals) {
      const distance = groupRef.current.position.distanceTo(
        new THREE.Vector3(portal.position[0], portal.position[1], portal.position[2])
      );

      if (distance < 5 && !closestPortal) {
        closestPortal = portal.label;
      }

      if (distance < 2.5 && currentTime - lastPortalCheck.current > 1.5) {
        shouldEnter = true;
        enterPortal = portal;
        lastPortalCheck.current = currentTime;
        break;
      }
    }

    if (closestPortal !== nearPortal.current) {
      nearPortal.current = closestPortal;
      if (onPortalProximity) onPortalProximity(closestPortal);
    }

    if (shouldEnter && enterPortal && onPortalEnter) {
      onPortalEnter(enterPortal.route, enterPortal.label);
    }

    // notify parent of position
    if (onPositionChange) onPositionChange(groupRef.current.position);
  });

  // final render group: either loaded gltf or fallback torus
  return (
    <group ref={groupRef} position={[0, 1, 0]} castShadow>
      {gltfScene ? (
        // adjust this scale if the model is too big/small
        <primitive object={gltfScene} scale={[1.1, 1.1, 1.1]} />
      ) : (
        <mesh castShadow>
          <torusGeometry args={[0.5, 0.2, 16, 32]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.4}
            metalness={0.6}
            roughness={0.2}
          />
        </mesh>
      )}
    </group>
  );
}

