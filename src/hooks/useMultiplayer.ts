import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as THREE from 'three';

export interface OtherPlayer {
  userId: string;
  position: THREE.Vector3;
  rotationY: number;
  isSitting: boolean;
  seatIndex: number | null;
}

interface UseMultiplayerProps {
  roomType: 'hallway' | 'classroom';
  roomId?: string;
  localPosition: THREE.Vector3;
  localRotation: number;
  isSitting?: boolean;
  seatIndex?: number | null;
}

export const useMultiplayer = ({
  roomType,
  roomId = '',
  localPosition,
  localRotation,
  isSitting = false,
  seatIndex = null,
}: UseMultiplayerProps) => {
  const [otherPlayers, setOtherPlayers] = useState<Map<string, OtherPlayer>>(new Map());
  const userId = useRef(`user_${Math.random().toString(36).substr(2, 9)}`);
  const updateInterval = useRef<NodeJS.Timeout>();
  const channelRef = useRef<ReturnType<typeof supabase.channel>>();

  useEffect(() => {
    const channel = supabase.channel(`room_${roomType}_${roomId}`);
    channelRef.current = channel;

    // Subscribe to presence changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const newPlayers = new Map<string, OtherPlayer>();

        Object.entries(state).forEach(([key, presences]: [string, any[]]) => {
          const presence = presences[0];
          if (key !== userId.current && presence) {
            newPlayers.set(key, {
              userId: key,
              position: new THREE.Vector3(
                presence.position_x,
                presence.position_y,
                presence.position_z
              ),
              rotationY: presence.rotation_y,
              isSitting: presence.is_sitting || false,
              seatIndex: presence.seat_index,
            });
          }
        });

        setOtherPlayers(newPlayers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId.current,
            position_x: localPosition.x,
            position_y: localPosition.y,
            position_z: localPosition.z,
            rotation_y: localRotation,
            is_sitting: isSitting,
            seat_index: seatIndex,
          });
        }
      });

    // Update presence every 100ms
    updateInterval.current = setInterval(async () => {
      if (channel) {
        await channel.track({
          user_id: userId.current,
          position_x: localPosition.x,
          position_y: localPosition.y,
          position_z: localPosition.z,
          rotation_y: localRotation,
          is_sitting: isSitting,
          seat_index: seatIndex,
        });
      }
    }, 100);

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      channel.unsubscribe();
    };
  }, [roomType, roomId, localPosition.x, localPosition.y, localPosition.z, localRotation, isSitting, seatIndex]);

  return { otherPlayers, userId: userId.current };
};
