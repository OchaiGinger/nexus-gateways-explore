import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Stars, OrbitControls } from "@react-three/drei";

/**
 * Fixed HallwayScene - Removed gradient background and ensured 3D scene renders
 */

// -----------------------------
// Helper types & data
// -----------------------------

type DoorInfo = {
  index: number;
  label: string;
  originalPosition: [number, number, number];
  isInSession: boolean;
};

const classroomsInput: DoorInfo[] = [
  { index: 0, label: "Mathematics", originalPosition: [-6, 0, -20], isInSession: true },
  { index: 1, label: "Physics", originalPosition: [6, 0, -20], isInSession: false },
  { index: 2, label: "Computer Science", originalPosition: [-6, 0, -10], isInSession: true },
  { index: 3, label: "Chemistry", originalPosition: [6, 0, -10], isInSession: false },
  { index: 4, label: "Biology", originalPosition: [-6, 0, 0], isInSession: true },
  { index: 5, label: "Literature", originalPosition: [6, 0, 0], isInSession: false },
  { index: 6, label: "History", originalPosition: [-6, 0, 10], isInSession: false },
  { index: 7, label: "Art & Design", originalPosition: [6, 0, 10], isInSession: true },
  { index: 8, label: "Robotics Lab", originalPosition: [20, 0, -8], isInSession: true },
  { index: 9, label: "Media Room", originalPosition: [26, 0, -8], isInSession: false },
];

// Corridor / geometry config
const MAIN_AREA = { minX: -9.5, maxX: 9.5, minZ: -30, maxZ: 30, minY: 0, maxY: 10 };
const BRANCH_AREA = { minX: 9.5, maxX: 30.5, minZ: -20, maxZ: 4, minY: 0, maxY: 10 };

// door appearance - lowered height
const DOOR_THICKNESS = 0.15;
const DOOR_WIDTH = 1.8;
const DOOR_HEIGHT = 2.4;

// -----------------------------
// Simple Door component
// -----------------------------

function Door({
  info,
  onClick,
  hovered,
}: {
  info: DoorInfo & { worldPosition: [number, number, number]; rotationY: number };
  onClick: (index: number) => void;
  hovered: boolean;
}) {
  const { worldPosition, rotationY } = info;

  return (
    <group position={worldPosition} rotation={[0, rotationY, 0]}>
      {/* Door slab */}
      <mesh
        position={[0, DOOR_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick(info.index);
        }}
      >
        <boxGeometry args={[DOOR_THICKNESS, DOOR_HEIGHT, DOOR_WIDTH]} />
        <meshStandardMaterial
          color={info.isInSession ? "#4a4a8a" : "#2a4a5a"}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Door handle */}
      <mesh position={[0, DOOR_HEIGHT / 2 - 0.3, DOOR_WIDTH / 2 - 0.05]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
        <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Door label */}
      <Text
        position={[0, DOOR_HEIGHT + 0.5, 0]}
        fontSize={0.15}
        anchorX="center"
        anchorY="middle"
        color="#ffffff"
      >
        {info.label}
      </Text>

      {/* Hover indicator */}
      {hovered && (
        <mesh position={[0, DOOR_HEIGHT / 2, DOOR_WIDTH / 2 + 0.1]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial 
            color="#ff4dff"
            emissive="#ff4dff"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

// -----------------------------
// Simple Hallway
// -----------------------------

function Hallway({ onDoorClick, doorWorldInfos, nearDoorIndex }: { 
  onDoorClick: (i: number) => void; 
  doorWorldInfos: (DoorInfo & { worldPosition: [number, number, number]; rotationY: number })[]; 
  nearDoorIndex: number | null; 
}) {
  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#0a0a2a" />
      </mesh>

      {/* L-branch floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[19.75, 0, -8]} receiveShadow>
        <planeGeometry args={[22, 24]} />
        <meshStandardMaterial color="#071038" />
      </mesh>

      {/* Main corridor walls */}
      <mesh position={[-10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial color="#1a1a3a" />
      </mesh>
      <mesh position={[10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial color="#1a1a3a" />
      </mesh>

      {/* Branch walls */}
      <mesh position={[19.75, 5, -20]} receiveShadow>
        <boxGeometry args={[22, 10, 0.5]} />
        <meshStandardMaterial color="#1a1a3a" />
      </mesh>
      <mesh position={[30.5, 5, -8]} receiveShadow>
        <boxGeometry args={[0.5, 10, 24]} />
        <meshStandardMaterial color="#1a1a3a" />
      </mesh>
      <mesh position={[10, 5, -8]} receiveShadow>
        <boxGeometry args={[0.5, 10, 24]} />
        <meshStandardMaterial color="#16214a" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]} receiveShadow>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#050520" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[19.75, 10, -8]} receiveShadow>
        <planeGeometry args={[22, 24]} />
        <meshStandardMaterial color="#050520" />
      </mesh>

      {/* Simple lighting */}
      {Array.from({ length: 8 }).map((_, i) => (
        <pointLight
          key={i}
          position={[0, 9, -25 + i * 7]}
          intensity={0.8}
          distance={15}
          color="#4a4aff"
        />
      ))}

      {/* Doors */}
      {doorWorldInfos.map((d) => (
        <Door key={d.index} info={d} onClick={onDoorClick} hovered={nearDoorIndex === d.index} />
      ))}

      {/* Basic lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[20, 30, 20]} intensity={0.6} castShadow />
    </group>
  );
}

// -----------------------------
// TutorPlayer (FPS)
// -----------------------------

function TutorPlayer({
  doors,
  onPositionChange,
  onDoorProximity,
  speed = 6,
}: {
  doors: { position: [number, number, number] }[];
  onPositionChange: (p: THREE.Vector3) => void;
  onDoorProximity: (index: number | null) => void;
  speed?: number;
}) {
  const { camera } = useThree();
  
  const [cameraRotation, setCameraRotation] = useState({ y: 0, x: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);

  const keyState = useRef({ forward: false, backward: false, left: false, right: false });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      setCameraRotation(prev => ({
        y: prev.y - movementX * 0.002,
        x: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, prev.x - movementY * 0.002))
      }));
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsMouseDown(true);
      }
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMouseDown]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keyState.current.forward = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") keyState.current.backward = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keyState.current.left = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") keyState.current.right = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keyState.current.forward = false;
      if (e.code === "KeyS" || e.code === "ArrowDown") keyState.current.backward = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keyState.current.left = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") keyState.current.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const [hoveredDoorIndex, setHoveredDoorIndex] = useState<number | null>(null);
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const tmpVec = new THREE.Vector3();
  const cameraDir = new THREE.Vector3();

  const DIST_THRESHOLD = 2.2;
  const FACING_THRESHOLD = 0.6;

  useFrame((state, delta) => {
    camera.rotation.order = 'YXZ';
    camera.rotation.y = cameraRotation.y;
    camera.rotation.x = cameraRotation.x;

    const prevPos = camera.position.clone();
    frontVector.set(0, 0, Number(keyState.current.backward) - Number(keyState.current.forward));
    sideVector.set(Number(keyState.current.right) - Number(keyState.current.left), 0, 0);
    direction.copy(frontVector).add(sideVector);
    
    if (direction.lengthSq() > 0) {
      direction.normalize();
      
      const moveX = direction.x * Math.cos(cameraRotation.y) - direction.z * Math.sin(cameraRotation.y);
      const moveZ = direction.x * Math.sin(cameraRotation.y) + direction.z * Math.cos(cameraRotation.y);
      
      camera.position.x += moveX * speed * delta;
      camera.position.z += moveZ * speed * delta;

      if (camera.position.y < 1.6) {
        camera.position.y = 1.6;
      }

      const px = camera.position.x;
      const pz = camera.position.z;
      const py = camera.position.y;

      const inMain = px >= MAIN_AREA.minX && px <= MAIN_AREA.maxX && 
                     pz >= MAIN_AREA.minZ && pz <= MAIN_AREA.maxZ &&
                     py >= MAIN_AREA.minY && py <= MAIN_AREA.maxY;
                     
      const inBranch = px >= BRANCH_AREA.minX && px <= BRANCH_AREA.maxX && 
                      pz >= BRANCH_AREA.minZ && pz <= BRANCH_AREA.maxZ &&
                      py >= BRANCH_AREA.minY && py <= BRANCH_AREA.maxY;

      if (!inMain && !inBranch) {
        camera.position.copy(prevPos);
      }
    }

    onPositionChange(camera.position.clone());
    state.camera.getWorldDirection(cameraDir);

    let closestIndex: number | null = null;
    let closestDist = Infinity;

    doors.forEach((d, i) => {
      tmpVec.set(d.position[0], d.position[1], d.position[2]);
      const toDoor = tmpVec.clone().sub(camera.position);
      const dist = toDoor.length();
      if (dist <= DIST_THRESHOLD) {
        toDoor.normalize();
        const facing = cameraDir.dot(toDoor);
        if (facing >= FACING_THRESHOLD) {
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = i;
          }
        }
      }
    });

    onDoorProximity(closestIndex);
    setHoveredDoorIndex(closestIndex);
  });

  return null;
}

// -----------------------------
// Main Scene - Fixed
// -----------------------------

export function HallwaySceneFPS({ onEnterClassroom }: { onEnterClassroom?: (index: number) => void }) {
  // Compute door positions with proper rotation and lowered height
  const doorWorldInfos = classroomsInput.map((c) => {
    const [xRaw, yRaw, zRaw] = c.originalPosition;

    const side = Math.abs(xRaw) >= Math.abs(zRaw) ? (xRaw < 0 ? "left" : "right") : (zRaw < 0 ? "back" : "front");

    let worldPos: [number, number, number] = [xRaw, DOOR_HEIGHT / 2, zRaw];
    let rotationY = 0;

    if (side === "left") {
      worldPos = [-9.75, DOOR_HEIGHT / 2, zRaw];
      rotationY = -Math.PI / 2; // -90deg - back against left wall
    } else if (side === "right") {
      worldPos = [9.75, DOOR_HEIGHT / 2, zRaw];
      rotationY = Math.PI / 2; // 90deg - back against right wall
    } else if (side === "back") {
      worldPos = [xRaw, DOOR_HEIGHT / 2, -29.75];
      rotationY = Math.PI; // 180deg - back against back wall
    } else {
      // front
      worldPos = [xRaw, DOOR_HEIGHT / 2, 29.75];
      rotationY = 0; // 0deg - back against front wall
    }

    return { ...c, worldPosition: worldPos, rotationY };
  });

  const doorPositionsForPlayer = doorWorldInfos.map((d) => ({ position: d.worldPosition }));
  const [nearDoorIndex, setNearDoorIndex] = useState<number | null>(null);
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 1.6, 20));

  const handleDoorClick = (index: number) => {
    if (onEnterClassroom) onEnterClassroom(index);
    else {
      console.log("Enter classroom", index);
    }
  };

  return (
    <div style={{ 
      width: "100vw", 
      height: "100vh", 
      position: "fixed", 
      top: 0, 
      left: 0,
      background: "#000000" // Simple black background instead of gradient
    }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 1.6, 20], fov: 75 }}
        gl={{ antialias: true }}
      >
        <fog attach="fog" args={["#000015", 10, 50]} />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

        <Hallway 
          onDoorClick={handleDoorClick} 
          doorWorldInfos={doorWorldInfos} 
          nearDoorIndex={nearDoorIndex} 
        />

        <TutorPlayer
          doors={doorPositionsForPlayer}
          onPositionChange={(p) => setPlayerPos(p)}
          onDoorProximity={(idx) => setNearDoorIndex(idx)}
          speed={6}
        />

        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          mouseButtons={{
            LEFT: null,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
          }}
        />
      </Canvas>

      {/* Simple HUD overlay */}
      {nearDoorIndex !== null && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.8)",
            color: "#ff4dff",
            padding: "20px 30px",
            borderRadius: "10px",
            border: "2px solid #ff4dff",
            zIndex: 50,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "10px" }}>
            {classroomsInput[nearDoorIndex].label}
          </div>
          <div style={{ marginBottom: "15px", fontSize: "1rem" }}>
            {classroomsInput[nearDoorIndex].isInSession ? "🟢 Class in Session" : "🔴 Available"}
          </div>
          <button
            onClick={() => handleDoorClick(nearDoorIndex)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#ff4dff",
              color: "#000",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Enter Classroom
          </button>
        </div>
      )}

      {/* Simple controls hint */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0, 0, 0, 0.7)",
          padding: "10px 20px",
          color: "#00ffff",
          borderRadius: "8px",
          border: "1px solid #00ffff",
          zIndex: 40,
          fontFamily: "monospace",
          fontSize: "14px",
        }}
      >
        <div>Click + Drag to look • WASD to move • Look at doors to interact</div>
      </div>
    </div>
  );
}

export default HallwaySceneFPS;
