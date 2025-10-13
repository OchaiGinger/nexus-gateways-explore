import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { Desk } from "./Desk";
import { Door } from "./Door";
import { Button } from "@/components/ui/button";
import ClassroomPlayer from "./ClassroomPlayer";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { OtherPlayer } from "./OtherPlayer";
import { useProximityChat } from "@/hooks/useProximityChat";
import { ProximityChat } from "./ProximityChat";

export function Classroom({ roomName, onExit }: { roomName: string; onExit: () => void }) {
  const [nearSeatIndex, setNearSeatIndex] = useState<number | null>(null);
  const [isSitting, setIsSitting] = useState(false);
  const [sittingPosition, setSittingPosition] = useState<THREE.Vector3 | null>(null);
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 0, 5));
  const [playerRotation, setPlayerRotation] = useState(Math.PI);

  // Multiplayer integration
  const { otherPlayers } = useMultiplayer({
    roomType: 'classroom',
    roomId: roomName,
    localPosition: playerPosition,
    localRotation: playerRotation,
    isSitting,
    seatIndex: nearSeatIndex,
  });

  const {
    nearbyPlayer,
    chatOpen,
    messages,
    openChat,
    closeChat,
    sendMessage,
  } = useProximityChat(playerPosition, otherPlayers);

  // Dynamic desk generation - always have 2 base desks + 1 extra
  const [seatPositions, setSeatPositions] = useState<{ position: [number, number, number] }[]>([
    { position: [-3, 0, 3] },
    { position: [3, 0, 3] },
  ]);

  useEffect(() => {
    const activePlayers = otherPlayers.size + 1;
    const neededSeats = Math.max(2, activePlayers + 1);
    
    if (neededSeats !== seatPositions.length) {
      const newSeats: { position: [number, number, number] }[] = [];
      const rowSpacing = 3;
      const colSpacing = 3;
      const seatsPerRow = 3;
      
      for (let i = 0; i < neededSeats; i++) {
        const row = Math.floor(i / seatsPerRow);
        const col = (i % seatsPerRow) - 1;
        newSeats.push({
          position: [col * colSpacing, 0, 3 - row * rowSpacing]
        });
      }
      
      setSeatPositions(newSeats);
    }
  }, [otherPlayers.size]);

  const handleSitDown = () => {
    if (nearSeatIndex !== null) {
      const seat = seatPositions[nearSeatIndex];
      setSittingPosition(new THREE.Vector3(...seat.position));
      setIsSitting(true);
    }
  };

  const handleStandUp = () => {
    setIsSitting(false);
    setSittingPosition(null);
  };

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-gray-900 to-gray-800">
      <Canvas shadows camera={{ position: [0, 3, 8], fov: 75 }}>
        <fog attach="fog" args={["#1a1a2e", 10, 50]} />
        <Stars radius={100} depth={50} count={1000} factor={2} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <hemisphereLight color="#a0a0ff" intensity={0.4} />

        {/* Classroom geometry */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#2a2a4a" />
        </mesh>

        <ClassroomPlayer
          seats={seatPositions}
          onSeatProximity={setNearSeatIndex}
          isSitting={isSitting}
          sittingPosition={sittingPosition}
          onSitRequest={handleSitDown}
          onStandRequest={handleStandUp}
          onPositionChange={setPlayerPosition}
          onRotationChange={setPlayerRotation}
        />
        
        {Array.from(otherPlayers.values()).map((otherPlayer) => (
          <OtherPlayer
            key={otherPlayer.userId}
            position={otherPlayer.position}
            rotationY={otherPlayer.rotationY}
            color={otherPlayer.color}
          />
        ))}

        {seatPositions.map((seat, i) => (
          <Desk
            key={i}
            position={seat.position}
            isHighlighted={nearSeatIndex === i && !isSitting}
          />
        ))}

        <Door position={[0, 0, -9]} label="Exit" isClassInSession={false} />
      </Canvas>

      <Button onClick={onExit} className="absolute top-4 left-4 z-50" variant="secondary">
        Exit Classroom
      </Button>
      
      <ProximityChat
        nearbyPlayerId={nearbyPlayer?.id || null}
        chatOpen={chatOpen}
        messages={messages}
        onOpenChat={openChat}
        onCloseChat={closeChat}
        onSendMessage={sendMessage}
      />

      {nearSeatIndex !== null && !isSitting && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 px-6 py-3 rounded-lg">
          <p className="text-sm font-semibold">Press E to sit</p>
        </div>
      )}
    </div>
  );
}
