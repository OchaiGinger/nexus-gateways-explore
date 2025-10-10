import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Stars, OrbitControls } from "@react-three/drei";

/**
 * HallwayScene-FPS-L.tsx
 *
 * Single-file drop-in that implements:
 * - first-person (FPS) TutorPlayer using free camera controls (no pointer lock)
 * - doors that are rotated/back-against-wall (flush to wall)
 * - door proximity that requires both distance + player facing the door
 * - an L-shaped hallway (main corridor + side branch) with doors on both legs
 * - ground collision to prevent falling through floor
 *
 * How to use:
 * - Drop this file into your React app and import `HallwaySceneFPS` where you want the scene.
 * - It expects you already have a separate `Classroom` component for the classroom view (the scene will render a simple placeholder).
 * - If you want the classroom to open when entering a door, wire `onEnterDoor(index)` to your router or parent state.
 */

// -----------------------------
// Helper types & data
// -----------------------------

type DoorInfo = {
  index: number;
  label: string;
  originalPosition: [number, number, number]; // our input positions (used to decide which wall the door belongs to)
  isInSession: boolean;
};

const classroomsInput: DoorInfo[] = [
  { index: 0, label: "Mathematics", originalPosition: [-6, 2, -20], isInSession: true },
  { index: 1, label: "Physics", originalPosition: [6, 2, -20], isInSession: false },
  { index: 2, label: "Computer Science", originalPosition: [-6, 2, -10], isInSession: true },
  { index: 3, label: "Chemistry", originalPosition: [6, 2, -10], isInSession: false },
  { index: 4, label: "Biology", originalPosition: [-6, 2, 0], isInSession: true },
  { index: 5, label: "Literature", originalPosition: [6, 2, 0], isInSession: false },
  { index: 6, label: "History", originalPosition: [-6, 2, 10], isInSession: false },
  { index: 7, label: "Art & Design", originalPosition: [6, 2, 10], isInSession: true },
  // L-branch doors (on the right branch)
  { index: 8, label: "Robotics Lab", originalPosition: [20, 2, -8], isInSession: true },
  { index: 9, label: "Media Room", originalPosition: [26, 2, -8], isInSession: false },
];

// Corridor / geometry config
const MAIN_AREA = { minX: -9.5, maxX: 9.5, minZ: -30, maxZ: 30, minY: 0, maxY: 10 };
const BRANCH_AREA = { minX: 9.5, maxX: 30.5, minZ: -20, maxZ: 4, minY: 0, maxY: 10 };

// door appearance
const DOOR_THICKNESS = 0.2;
const DOOR_WIDTH = 1.2;
const DOOR_HEIGHT = 2.2;

// -----------------------------
// Door component (flush to nearest wall)
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
      {/* door slab */}
      <mesh
        position={[0, DOOR_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick(info.index);
        }}
      >
        {/* thin slab oriented so its 'face' is facing the corridor */}
        <boxGeometry args={[DOOR_THICKNESS, DOOR_HEIGHT, DOOR_WIDTH]} />
        <meshStandardMaterial
          color={info.isInSession ? "#ff4dff" : "#00ffff"}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>

      {/* door label */}
      <Text
        position={[0, DOOR_HEIGHT + 0.35, 0]}
        fontSize={0.22}
        anchorX="center"
        anchorY="middle"
        color="#ffffff"
      >
        {info.label}
      </Text>

      {/* small indicator in front when hovered / available */}
      {hovered && (
        <mesh position={[0, DOOR_HEIGHT / 2 - 0.1, (DOOR_WIDTH / 2 + 0.05)]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial emissive={new THREE.Color("#ff4dff")} emissiveIntensity={0.9} />
        </mesh>
      )}
    </group>
  );
}

// -----------------------------
// TutorPlayer (FPS) - free camera controls + movement + proximity checks
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
  
  // Camera rotation state
  const [cameraRotation, setCameraRotation] = useState({ y: 0, x: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);

  const keyState = useRef({ forward: false, backward: false, left: false, right: false });
  
  // Mouse move handler for camera rotation
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
      if (e.button === 0) { // Left click
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

  // Keyboard controls
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

  // to signal hovered door index (for small indicator/tooltip)
  const [hoveredDoorIndex, setHoveredDoorIndex] = useState<number | null>(null);

  // reused vectors
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const tmpVec = new THREE.Vector3();
  const cameraDir = new THREE.Vector3();

  // proximity logic thresholds
  const DIST_THRESHOLD = 2.2; // how close to a door
  const FACING_THRESHOLD = 0.6; // how much the player must be facing the door (dot product)

  useFrame((state, delta) => {
    // Update camera rotation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = cameraRotation.y;
    camera.rotation.x = cameraRotation.x;

    // store previous position so we can revert if collision
    const prevPos = camera.position.clone();

    // build movement vector in local space
    frontVector.set(0, 0, Number(keyState.current.backward) - Number(keyState.current.forward));
    sideVector.set(Number(keyState.current.right) - Number(keyState.current.left), 0, 0);
    direction.copy(frontVector).add(sideVector);
    
    if (direction.lengthSq() > 0) {
      direction.normalize();
      
      // Apply movement relative to camera direction
      const moveX = direction.x * Math.cos(cameraRotation.y) - direction.z * Math.sin(cameraRotation.y);
      const moveZ = direction.x * Math.sin(cameraRotation.y) + direction.z * Math.cos(cameraRotation.y);
      
      camera.position.x += moveX * speed * delta;
      camera.position.z += moveZ * speed * delta;

      // Ground collision - prevent going below floor (y=0)
      if (camera.position.y < 1.6) {
        camera.position.y = 1.6;
      }

      // Wall collision - clamp to allowed areas
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
        // revert movement if collision
        camera.position.copy(prevPos);
      }
    }

    // update parent/state about position
    onPositionChange(camera.position.clone());

    // Door proximity: require closeness AND that the player is looking at the door
    state.camera.getWorldDirection(cameraDir); // pointing vector

    let closestIndex: number | null = null;
    let closestDist = Infinity;

    doors.forEach((d, i) => {
      tmpVec.set(d.position[0], d.position[1], d.position[2]);
      const toDoor = tmpVec.clone().sub(camera.position);
      const dist = toDoor.length();
      if (dist <= DIST_THRESHOLD) {
        toDoor.normalize();
        const facing = cameraDir.dot(toDoor); // how much camera looks at door
        if (facing >= FACING_THRESHOLD) {
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = i;
          }
        }
      }
    });

    // only call callback when value changes
    onDoorProximity(closestIndex);
    setHoveredDoorIndex(closestIndex);
  });

  return null; // No visual component needed - we're controlling the camera directly
}

// -----------------------------
// Hallway with floors + walls + doors (L shaped)
// -----------------------------

function Hallway({ onDoorClick, doorWorldInfos, nearDoorIndex }: { onDoorClick: (i: number) => void; doorWorldInfos: (DoorInfo & { worldPosition: [number, number, number]; rotationY: number })[]; nearDoorIndex: number | null; }) {
  return (
    <group>
      {/* Main floor (long) - with collision */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#0a0a1f" />
      </mesh>

      {/* L-branch floor (attached to right side, near z = -8) - with collision */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[19.75, 0, -8]} 
        receiveShadow
      >
        {/* width along X, depth along Z - this gives a "branch" to the right */}
        <planeGeometry args={[22, 24]} />
        <meshStandardMaterial color="#071028" />
      </mesh>

      {/* Invisible collision walls to prevent going through floors */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
        visible={false} // Make invisible but still have collision
      >
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[19.75, -0.5, -8]}
        visible={false} // Make invisible but still have collision
      >
        <planeGeometry args={[22, 24]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Main corridor side walls */}
      <mesh position={[-10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[10, 5, 0]} receiveShadow>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Branch walls: branch runs roughly from x=9.5 to x=30 */}
      {/* back wall of branch (connecting to main corridor) */}
      <mesh position={[19.75, 5, -20]} receiveShadow>
        <boxGeometry args={[22, 10, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* outer right wall of branch */}
      <mesh position={[30.5, 5, -8]} receiveShadow>
        <boxGeometry args={[0.5, 10, 24]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {/* inner partition between main corridor and branch (visual only) */}
      <mesh position={[10, 5, -8]} receiveShadow>
        <boxGeometry args={[0.5, 10, 24]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Floor grid (subtle) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[20, 60, 20, 60]} />
        <meshBasicMaterial color="#ff4dff" wireframe transparent opacity={0.06} />
      </mesh>

      {/* Doors (computed world positions passed in) */}
      {doorWorldInfos.map((d) => (
        <Door key={d.index} info={d} onClick={onDoorClick} hovered={nearDoorIndex === d.index} />
      ))}

      {/* Lighting */}
      {Array.from({ length: 8 }).map((_, i) => (
        <pointLight key={i} position={[0, 9, -25 + i * 7]} intensity={0.6} distance={18} color="#ff4dff" />
      ))}

      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={0.5} castShadow />
    </group>
  );
}

// -----------------------------
// Main exported scene wrapper
// -----------------------------

export function HallwaySceneFPS({ onEnterClassroom }: { onEnterClassroom?: (index: number) => void }) {
  // compute door world positions so they're flush against the nearest wall (left/right/front/back)
  const doorWorldInfos = classroomsInput.map((c) => {
    const [xRaw, yRaw, zRaw] = c.originalPosition;

    // Decide which wall the door belongs to by which side it's closer to
    // (left/right prioritized; if near center we assume front/back)
    const side = Math.abs(xRaw) >= Math.abs(zRaw) ? (xRaw < 0 ? "left" : "right") : (zRaw < 0 ? "back" : "front");

    let worldPos: [number, number, number] = [xRaw, yRaw, zRaw];
    let rotationY = 0;

    if (side === "left") {
      worldPos = [-9.75, yRaw, zRaw];
      rotationY = Math.PI / 2 * -1; // -90deg so the door "back" is against wall and face points into corridor
    } else if (side === "right") {
      worldPos = [9.75, yRaw, zRaw];
      rotationY = Math.PI / 2; // 90deg
    } else if (side === "back") {
      worldPos = [xRaw, yRaw, -29.75];
      rotationY = Math.PI; // facing forward into corridor
    } else {
      // front
      worldPos = [xRaw, yRaw, 29.75];
      rotationY = 0;
    }

    return { ...c, worldPosition: worldPos, rotationY };
  });

  // doors prop for TutorPlayer should contain simple positions (y is not important for proximity checks)
  const doorPositionsForPlayer = doorWorldInfos.map((d) => ({ position: d.worldPosition }));

  const [nearDoorIndex, setNearDoorIndex] = useState<number | null>(null);
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 1.6, 20));

  const handleDoorClick = (index: number) => {
    // enter classroom: call parent or default behaviour
    if (onEnterClassroom) onEnterClassroom(index);
    else {
      // default: just log and teleport to a simple classroom placeholder
      console.log("Enter classroom", index, "- implement routing or state change in parent");
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "fixed", inset: 0 }}>
      <Canvas shadows camera={{ position: [0, 1.6, 20], fov: 75 }}>
        <fog attach="fog" args={["#000015", 10, 220]} />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

        <Hallway onDoorClick={handleDoorClick} doorWorldInfos={doorWorldInfos} nearDoorIndex={nearDoorIndex} />

        <TutorPlayer
          doors={doorPositionsForPlayer}
          onPositionChange={(p) => setPlayerPos(p)}
          onDoorProximity={(idx) => setNearDoorIndex(idx)}
          speed={6}
        />

        {/* Optional: Add OrbitControls for debugging (hold right mouse to orbit) */}
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          mouseButtons={{
            LEFT: null, // Disable left click orbit
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
          }}
        />
      </Canvas>

      {/* HUD overlay */}
      {nearDoorIndex !== null && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.8)",
            color: "#ff4dff",
            padding: "14px 22px",
            borderRadius: 12,
            border: "2px solid #ff4dff",
            zIndex: 50,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{classroomsInput[nearDoorIndex].label}</div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            {classroomsInput[nearDoorIndex].isInSession ? "🟢 Class in session" : "🔴 Available"}
          </div>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => handleDoorClick(nearDoorIndex)}
              style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#ff4dff", color: "#000", fontWeight: 700 }}
            >
              Enter
            </button>
          </div>
        </div>
      )}

      {/* small controls hint */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.7)",
          padding: "10px 18px",
          color: "#ff4dff",
          borderRadius: 10,
          border: "1px solid #ff4dff",
          zIndex: 40,
          fontFamily: "monospace",
        }}
      >
        <div>Click + Drag to look around • WASD / Arrows to move • Look at a door + get close to interact</div>
      </div>
    </div>
  );
}

export default HallwaySceneFPS;
