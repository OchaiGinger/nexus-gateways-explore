import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

function ClassroomPlayer({
  seats,
  onSeatProximity,
  isSitting,
  sittingPosition,
  onSitRequest,
  onStandRequest,
  onPositionChange,
  onRotationChange,
  cameraRef,
}: {
  seats: { position: [number, number, number] }[];
  onSeatProximity: (index: number | null) => void;
  isSitting: boolean;
  sittingPosition: THREE.Vector3 | null;
  onSitRequest: () => void;
  onStandRequest: () => void;
  onPositionChange?: (position: THREE.Vector3) => void;
  onRotationChange?: (rotation: number) => void;
  cameraRef: React.RefObject<any>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const [characterScene, setCharacterScene] = useState<THREE.Object3D | null>(null);

  // Load character model
  useEffect(() => {
    try {
      const gltf = useGLTF("/models/character.glb");
      if (gltf && gltf.scene) {
        gltf.scene.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        setCharacterScene(gltf.scene);
      }
    } catch (err) {
      console.error("❌ Failed to load character.glb:", err);
    }
  }, []);

  // Manual keyboard event listeners (exactly like Scene3D.tsx)
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyE') {
        if (isSitting) {
          onStandRequest();
        } else {
          onSitRequest();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSitting, onSitRequest, onStandRequest]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // If sitting, don't move
    if (isSitting && sittingPosition) {
      groupRef.current.position.copy(sittingPosition);
      groupRef.current.position.y = 0.5;
      onPositionChange?.(groupRef.current.position.clone());
      return;
    }

    // Get keyboard input
    const forward = keys.current['KeyW'] || keys.current['ArrowUp'];
    const backward = keys.current['KeyS'] || keys.current['ArrowDown'];
    const left = keys.current['KeyA'] || keys.current['ArrowLeft'];
    const right = keys.current['KeyD'] || keys.current['ArrowRight'];

    const inputX = (right ? 1 : 0) - (left ? 1 : 0);
    const inputZ = (forward ? 1 : 0) - (backward ? 1 : 0);

    // Camera-relative movement (exactly like Scene3D.tsx)
    const camera = state.camera;
    const forwardVec = new THREE.Vector3();
    camera.getWorldDirection(forwardVec);
    forwardVec.y = 0;
    forwardVec.normalize();

    const rightVec = new THREE.Vector3();
    rightVec.crossVectors(forwardVec, camera.up).normalize();

    const moveDir = new THREE.Vector3();
    moveDir.copy(forwardVec).multiplyScalar(inputZ).addScaledVector(rightVec, inputX);

    const speed = 6;
    if (moveDir.lengthSq() > 0.0001) {
      moveDir.normalize();
      const targetVel = moveDir.multiplyScalar(speed);
      velocity.current.lerp(targetVel, 0.15);
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.12);
    }

    // Apply velocity with boundary checks
    const predictedX = groupRef.current.position.x + velocity.current.x * delta;
    const predictedZ = groupRef.current.position.z + velocity.current.z * delta;

    // Classroom bounds
    const bounds = {
      minX: -8,
      maxX: 8,
      minZ: -8,
      maxZ: 2,
    };

    if (predictedX >= bounds.minX && predictedX <= bounds.maxX) {
      groupRef.current.position.x = predictedX;
    }
    if (predictedZ >= bounds.minZ && predictedZ <= bounds.maxZ) {
      groupRef.current.position.z = predictedZ;
    }

    // Rotate character to face movement direction
    if (velocity.current.lengthSq() > 0.0001) {
      const yaw = Math.atan2(velocity.current.x, velocity.current.z);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, yaw, 6, delta);
      onRotationChange?.(groupRef.current.rotation.y);
    }

    // Update camera target
    if (cameraRef?.current) {
      cameraRef.current.target.set(
        groupRef.current.position.x,
        groupRef.current.position.y + 1,
        groupRef.current.position.z
      );
    }

    onPositionChange?.(groupRef.current.position.clone());

    // Check proximity to seats
    let closestIndex: number | null = null;
    let closestDist = Infinity;
    const SEAT_DISTANCE_THRESHOLD = 1.5;

    seats.forEach((seat, i) => {
      const seatPos = new THREE.Vector3(...seat.position);
      const dist = seatPos.distanceTo(groupRef.current!.position);
      if (dist <= SEAT_DISTANCE_THRESHOLD && dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });

    onSeatProximity(closestIndex);
  });

  return (
    <group ref={groupRef} position={[0, 0, 5]}>
      {characterScene ? (
        <primitive object={characterScene} scale={[1.2, 1.2, 1.2]} />
      ) : (
        <mesh>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#00ffff" />
        </mesh>
      )}
    </group>
  );
}

export default ClassroomPlayer;
