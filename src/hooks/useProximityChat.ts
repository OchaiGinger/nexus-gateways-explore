import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OtherPlayer } from './useMultiplayer';

const CHAT_DISTANCE_THRESHOLD = 5; // Distance to enable chat
const DISCONNECT_DISTANCE = 10; // Distance to disconnect chat

export const useProximityChat = (
  localPosition: THREE.Vector3,
  otherPlayers: Map<string, OtherPlayer>
) => {
  const [nearbyPlayer, setNearbyPlayer] = useState<{ id: string; player: OtherPlayer } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([]);

  useEffect(() => {
    // Find closest player within chat distance
    let closestPlayer: { id: string; player: OtherPlayer; distance: number } | null = null;

    otherPlayers.forEach((player, id) => {
      const distance = localPosition.distanceTo(player.position);
      
      if (distance < CHAT_DISTANCE_THRESHOLD) {
        if (!closestPlayer || distance < closestPlayer.distance) {
          closestPlayer = { id, player, distance };
        }
      }
    });

    // If we have a nearby player
    if (closestPlayer) {
      setNearbyPlayer({ id: closestPlayer.id, player: closestPlayer.player });
      
      // Check if we should disconnect from current chat
      if (chatOpen && closestPlayer.distance > DISCONNECT_DISTANCE) {
        setChatOpen(false);
        setMessages([]);
      }
    } else {
      setNearbyPlayer(null);
      if (chatOpen) {
        setChatOpen(false);
        setMessages([]);
      }
    }
  }, [localPosition, otherPlayers, chatOpen]);

  const openChat = () => {
    if (nearbyPlayer) {
      setChatOpen(true);
    }
  };

  const closeChat = () => {
    setChatOpen(false);
    setMessages([]);
  };

  const sendMessage = (text: string) => {
    if (nearbyPlayer) {
      // In real implementation, send via websocket
      setMessages(prev => [...prev, { sender: 'You', text }]);
      // Simulate response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          sender: nearbyPlayer.id.substring(0, 8), 
          text: `Echo: ${text}` 
        }]);
      }, 500);
    }
  };

  return {
    nearbyPlayer,
    chatOpen,
    messages,
    openChat,
    closeChat,
    sendMessage,
  };
};
