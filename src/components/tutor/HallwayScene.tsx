import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Environment, Text } from "@react-three/drei";
import { KeyboardControls } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { Door } from "./Door";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { OtherPlayer } from "./OtherPlayer";
import { ProximityChat } from "./ProximityChat";
import { useProximityChat } from "@/hooks/useProximityChat";
import { useGLTF } from "@react-three/drei";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

const classrooms = [
  { label: "Mathematics", position: [-6, 0, -20] as [number, number, number] },
  { label: "Physics", position: [6, 0, -20] as [number, number, number] },
  { label: "Computer Science", position: [-6, 0, -10] as [number, number, number] },
  { label: "Chemistry", position: [6, 0, -10] as [number, number, number] },
  { label: "Biology", position: [-6, 0, 0] as [number, number, number] },
  { label: "Literature", position: [6, 0, 5] as [number, number, number] },
];

function HallwayPlayer({
  onPositionChange,
  doors,
  onDoorProximity,
}: {
  onPositionChange: (pos: THREE.Vector3) => void;
  doors: Array<{ position: [number, number, number] }>;
  onDoorProximity: (doorIndex: number | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef<Record<string, boolean>>({});
  const nearDoor = useRef<number | null>(null);

  const { scene } = useGLTF("/models/character.glb");
  const model = scene.clone();

  useEffect(() => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [model]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const forward = keys.current["KeyW"] || keys.current["ArrowUp"];
    const backward = keys.current["KeyS"] || keys.current["ArrowDown"];
    const left = keys.current["KeyA"] || keys.current["ArrowLeft"];
    const right = keys.current["KeyD"] || keys.current["ArrowRight"];

    const inputX = (right ? 1 : 0) - (left ? 1 : 0);
    const inputZ = (forward ? 1 : 0) - (backward ? 1 : 0);

    // camera-relative movement
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

    groupRef.current.position.x += velocity.current.x * delta;
    groupRef.current.position.z += velocity.current.z * delta;

    // simple bounds
    groupRef.current.position.x = Math.max(-8, Math.min(8, groupRef.current.position.x));
    groupRef.current.position.z = Math.max(-25, Math.min(25, groupRef.current.position.z));

    // rotate toward movement
    if (velocity.current.lengthSq() > 0.0001) {
      const yaw = Math.atan2(velocity.current.x, velocity.current.z);
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        yaw,
        6,
        delta
      );
    }

    // camera follow
    const camOffset = new THREE.Vector3(0, 3, 6);
    const camTarget = groupRef.current.position.clone().add(camOffset);
    state.camera.position.lerp(camTarget, 0.05);
    state.camera.lookAt(groupRef.current.position.clone().add(new THREE.Vector3(0, 1.5, 0)));

    // check door proximity
    let closestDoor: number | null = null;
    let minDist = Infinity;
    doors.forEach((door, i) => {
      const d = groupRef.current!.position.distanceTo(
        new THREE.Vector3(door.position[0], door.position[1], door.position[2])
      );
      if (d < 3 && d < minDist) {
        closestDoor = i;
        minDist = d;
      }
    });

    if (closestDoor !== nearDoor.current) {
      nearDoor.current = closestDoor;
      onDoorProximity(closestDoor);
    }

    onPositionChange(groupRef.current.position);
  });

  return (
    <group ref={groupRef} position={[0, 1, 20]}>
      <primitive object={model} scale={1.2} />
    </group>
  );
}

function Hallway({
  onDoorProximity,
  onEnterDoor,
  otherPlayers,
  playerPosition,
}: {
  onDoorProximity: (doorIndex: number | null) => void;
  onEnterDoor: (doorIndex: number) => void;
  otherPlayers: Map<string, any>;
  playerPosition: THREE.Vector3;
}) {
  const [nearDoor, setNearDoor] = useState<number | null>(null);

  const handleDoorProximity = (index: number | null) => {
    setNearDoor(index);
    onDoorProximity(index);
  };

  useEffect(() => {
    const handleE = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && nearDoor !== null) onEnterDoor(nearDoor);
    };
    window.addEventListener("keydown", handleE);
    return () => window.removeEventListener("keydown", handleE);
  }, [nearDoor, onEnterDoor]);

  return (
    <>
      <fog attach="fog" args={["#000015", 10, 60]} />
      <hemisphereLight color="#cde7ff" groundColor="#0a0010" intensity={0.6} />
      <directionalLight position={[12, 25, 10]} intensity={1.0} castShadow />

      <Stars radius={50} depth={40} count={4000} factor={3.5} />
      <Environment preset="night" />

      <HallwayPlayer
        onPositionChange={() => {}}
        doors={classrooms}
        onDoorProximity={handleDoorProximity}
      />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 60]} />
        <meshStandardMaterial color="#2a2a5a" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* Walls */}
      <mesh position={[-10, 5, 0]}>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial color="#3a3a6a" />
      </mesh>
      <mesh position={[10, 5, 0]}>
        <boxGeometry args={[0.5, 10, 60]} />
        <meshStandardMaterial color="#3a3a6a" />
      </mesh>
      <mesh position={[0, 5, -30]}>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#3a3a6a" />
      </mesh>
      <mesh position={[0, 5, 30]}>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#3a3a6a" />
      </mesh>

      {/* Lights */}
      {Array.from({ length: 12 }).map((_, i) => {
        const z = -28 + i * 5;
        return (
          <group key={i} position={[0, 9.8, z]}>
            <pointLight intensity={2.5} distance={15} color="#ffffff" />
            <mesh>
              <cylinderGeometry args={[0.3, 0.4, 0.2, 16]} />
              <meshStandardMaterial emissive="#ffffff" emissiveIntensity={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Doors */}
      {classrooms.map((door, i) => (
        <Door key={i} position={door.position} label={door.label} isClassInSession={false} />
      ))}

      {/* Other players */}
      {Array.from(otherPlayers.values()).map((p) => (
        <OtherPlayer
          key={p.userId}
          position={p.position}
          rotationY={p.rotationY}
          color={p.color}
        />
      ))}
    </>
  );
}

export function HallwayScene({ onEnterClassroom }: { onEnterClassroom?: (index: number) => void }) {
  const navigate = useNavigate();
  const [nearDoorIndex, setNearDoorIndex] = useState<number | null>(null);
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 1, 20));
  const [playerRot, setPlayerRot] = useState(0);

  const { otherPlayers } = useMultiplayer({
    roomType: "hallway",
    roomId: "",
    localPosition: playerPos,
    localRotation: playerRot,
  });

  const {
    nearbyPlayer,
    chatOpen,
    messages,
    unreadCount,
    openChat,
    closeChat,
    sendMessage,
  } = useProximityChat(playerPos, otherPlayers);

  const handleEnterDoor = (doorIndex: number) => {
    if (onEnterClassroom) onEnterClassroom(doorIndex);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 3, 23], fov: 75 }}>
          <Hallway
            onDoorProximity={setNearDoorIndex}
            onEnterDoor={handleEnterDoor}
            otherPlayers={otherPlayers}
            playerPosition={playerPos}
          />
        </Canvas>
      </KeyboardControls>

      <ProximityChat
        nearbyPlayerId={nearbyPlayer?.id || null}
        chatOpen={chatOpen}
        messages={messages}
        unreadCount={unreadCount}
        onOpenChat={openChat}
        onCloseChat={closeChat}
        onSendMessage={sendMessage}
      />

      {nearDoorIndex !== null && (
        <div
          style={{
            position: "absolute",
            bottom: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.9)",
            padding: "15px 25px",
            borderRadius: "10px",
            border: "2px solid #00ffff",
            zIndex: 50,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "10px" }}>
            {classrooms[nearDoorIndex].label}
          </div>
          <div style={{ fontSize: "0.9rem" }}>Press E to enter</div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.7)",
          padding: "15px 25px",
          borderRadius: "10px",
          border: "1px solid #00ffff",
          color: "#00ffff",
          fontFamily: "monospace",
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        <div>🎮 WASD / Arrows: Move | 🖱️ Move Camera Automatically</div>
        <div style={{ marginTop: "5px" }}>🚪 Get close to doors and press E to enter</div>
      </div>
    </div>
  );
}

export default HallwayScene;

