// src/components/HallwayScene.tsx
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Environment, useGLTF } from "@react-three/drei";
import { KeyboardControls } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { Door } from "./Door";
import OtherPlayer from "./OtherPlayer"; // keep your OtherPlayer but we also render fallback
import { ProximityChat } from "./ProximityChat";
import { useProximityChat as useProximityChatLocal } from "@/hooks/useProximityChat"; // if you have, else we use local proximity logic
import { useWebsocketMultiplayer } from "@/hooks/useWebsocketMultiplayer"; // new hook (see above)

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

function FallbackAvatar({ color = "#00ffcc", position }: { color?: string; position: [number,number,number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 1.6, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 2.25, 0]}>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function LocalPlayer({
  onPositionChange,
  doors,
  onDoorProximity,
  cameraRef,
}: {
  onPositionChange: (pos: THREE.Vector3) => void;
  doors: Array<{ position: [number, number, number] }>;
  onDoorProximity: (doorIndex: number | null) => void;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef<Record<string, boolean>>({});
  const nearDoor = useRef<number | null>(null);

  const gltf = useGLTF("/models/character.glb", true);
  // if the model origin causes float, apply a small vertical offset
  const modelYOffset = -0.9; // tweak this if needed

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

    // clamp Y to ground height (prevents floating)
    groupRef.current.position.y = 1; // fixed player height

    // bounds
    groupRef.current.position.x = Math.max(-8, Math.min(8, groupRef.current.position.x));
    groupRef.current.position.z = Math.max(-25, Math.min(25, groupRef.current.position.z));

    // rotate toward movement
    if (velocity.current.lengthSq() > 0.0001) {
      const yaw = Math.atan2(velocity.current.x, velocity.current.z);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, yaw, 6, delta);
    }

    // camera follow (slightly behind)
    const camYaw = Math.atan2(forwardVec.x, forwardVec.z);
    const camOffset = new THREE.Vector3(0, 3, 6);
    // rotate offset by camera yaw so camera stays behind camera direction
    camOffset.applyAxisAngle(new THREE.Vector3(0,1,0), camYaw);
    const camTarget = groupRef.current.position.clone().add(camOffset);
    if (cameraRef.current) {
      cameraRef.current.position.lerp(camTarget, 0.08);
      cameraRef.current.lookAt(groupRef.current.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
    }

    // door proximity
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
      {gltf?.scene ? (
        // apply a slight negative Y offset to counter model origin
        <primitive object={gltf.scene} position={[0, modelYOffset, 0]} scale={[1.2,1.2,1.2]} />
      ) : (
        <mesh position={[0, 1, 20]}>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#00ffff" />
        </mesh>
      )}
    </group>
  );
}

export default function HallwayScene({ onEnterClassroom } : { onEnterClassroom?: (i:number)=>void }) {
  const navigate = useNavigate();
  const [nearDoorIndex, setNearDoorIndex] = useState<number | null>(null);
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 1, 20));
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const { localId, otherPlayers, sendDirectMessage } = useWebsocketMultiplayer({
    roomType: "hallway",
    localPosition: { x: playerPos.x, y: playerPos.y, z: playerPos.z },
  });

  // proximity detection to find the closest player
  const [nearbyPlayerId, setNearbyPlayerId] = useState<string | null>(null);
  useEffect(() => {
    let id: string | null = null;
    let minD = Infinity;
    otherPlayers.forEach((p, uid) => {
      const d = Math.hypot(p.position[0]-playerPos.x, p.position[2]-playerPos.z);
      if (d < 3 && d < minD) { minD = d; id = uid; }
    });
    setNearbyPlayerId(id);
  }, [otherPlayers, playerPos]);

  // chat state: map peerId -> messages
  const [conversations, setConversations] = useState<Record<string, Array<{ from:string; text:string; ts:number }>>>({});
  const [chatOpenFor, setChatOpenFor] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // incoming ws chat events
  useEffect(() => {
    const handler = (ev: CustomEvent) => {
      const detail = ev.detail as { from:string; to:string; text:string; timestamp:number };
      // ignore if message not for us
      if (detail.to !== localId) return;
      // append to conversation
      setConversations(prev => {
        const copy = { ...prev };
        copy[detail.from] = [...(copy[detail.from] || []), { from: detail.from, text: detail.text, ts: detail.timestamp }];
        return copy;
      });
      if (chatOpenFor !== detail.from) {
        setUnreadCounts(prev => ({ ...prev, [detail.from]: (prev[detail.from] || 0) + 1 }));
      }
    };
    window.addEventListener("ws:chat:message", handler as any);
    return () => window.removeEventListener("ws:chat:message", handler as any);
  }, [localId, chatOpenFor]);

  function openChatWith(peerId: string) {
    if (!peerId) return;
    setChatOpenFor(peerId);
    setUnreadCounts(prev => ({ ...prev, [peerId]: 0 }));
  }

  function closeChat() {
    setChatOpenFor(null);
  }

  function sendMessageTo(peerId: string, text: string) {
    if (!peerId || !text.trim()) return;
    // append locally
    const ts = Date.now();
    setConversations(prev => {
      const copy = { ...prev };
      copy[peerId] = [...(copy[peerId] || []), { from: localId, text, ts }];
      return copy;
    });
    // send via websocket hook
    sendDirectMessage(peerId, text);
  }

  function handleEnterDoor(i:number) {
    if (onEnterClassroom) onEnterClassroom(i);
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 3, 23], fov: 75 }} onCreated={({ camera }) => (cameraRef.current = camera)}>
          <fog attach="fog" args={["#000015", 10, 60]} />
          <hemisphereLight color="#cde7ff" groundColor="#0a0010" intensity={0.6} />
          <directionalLight position={[12, 25, 10]} intensity={1.0} castShadow />
          <Stars radius={50} depth={40} count={4000} factor={3.5} />
          <Environment preset="night" />

          <LocalPlayer
            onPositionChange={(pos) => setPlayerPos(pos.clone())}
            doors={classrooms}
            onDoorProximity={setNearDoorIndex}
            cameraRef={cameraRef}
          />

          {/* Doors */}
          {classrooms.map((d, i) => <Door key={i} position={d.position} label={d.label} isClassInSession={false} />)}

          {/* render remote players */}
          {Array.from(otherPlayers.entries()).map(([id, p]) => {
            // if you have a remote glb/ avatar url, you can load it in OtherPlayer.
            // We render OtherPlayer if available, otherwise fallback capsule.
            const pos: [number, number, number] = [p.position[0], 1, p.position[2]];
            return (
              <group key={id} position={pos}>
                {/* try to use your OtherPlayer component if it loads remote gltf */}
                {/* <OtherPlayer userId={id} position={pos} rotationY={p.rotationY} color={p.color} /> */}
                <FallbackAvatar color={p.color || "#ff6ea1"} position={[0,0,0]} />
              </group>
            );
          })}
        </Canvas>
      </KeyboardControls>

      <ProximityChat
        nearbyPlayerId={nearbyPlayerId}
        chatOpen={!!chatOpenFor}
        messages={chatOpenFor ? (conversations[chatOpenFor] || []).map(m => ({ sender: m.from === localId ? "You" : chatOpenFor, text: m.text })) : []}
        unreadCount={nearbyPlayerId ? (unreadCounts[nearbyPlayerId] || 0) : 0}
        onOpenChat={() => nearbyPlayerId && openChatWith(nearbyPlayerId)}
        onCloseChat={() => closeChat()}
        onSendMessage={(text) => chatOpenFor && sendMessageTo(chatOpenFor, text)}
      />

      {/* Door hint */}
      {nearDoorIndex !== null && (
        <div style={{ position:"absolute", bottom:120, left:"50%", transform:"translateX(-50%)", background:"rgba(255,255,255,0.9)", padding: "12px 20px", borderRadius:10, border:"2px solid #00ffff" }}>
          <div style={{ fontWeight:700 }}>{classrooms[nearDoorIndex].label}</div>
          <div>Press E to enter</div>
        </div>
      )}

      {/* Controls helper */}
      <div style={{ position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)", color:"#00ffff", fontFamily:"monospace", padding:"12px 18px", background:"rgba(0,0,0,0.7)", borderRadius:8 }}>
        <div>🎮 WASD: Move | 🖱️: Hold left mouse + move (camera rotate) | Wheel: Zoom</div>
        <div style={{ marginTop:6 }}>💬 Approach a player to chat (1:1). New players spawn with unique color avatars.</div>
      </div>
    </div>
  );
}


