import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  createdAt: Date;
}

interface UseChatProps {
  roomType: 'hallway' | 'classroom';
  roomId?: string;
  username: string;
}

export const useChat = ({ roomType, roomId = '', username }: UseChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Load recent messages
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_type', roomType)
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data && !error) {
        setMessages(
          data.reverse().map((msg) => ({
            id: msg.id,
            userId: msg.user_id,
            username: msg.username,
            message: msg.message,
            createdAt: new Date(msg.created_at),
          }))
        );
      }
    };

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat_${roomType}_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_type=eq.${roomType}${roomId ? `,room_id=eq.${roomId}` : ''}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => [
            ...prev,
            {
              id: newMsg.id,
              userId: newMsg.user_id,
              username: newMsg.username,
              message: newMsg.message,
              createdAt: new Date(newMsg.created_at),
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomType, roomId]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const { error } = await supabase.from('chat_messages').insert({
      user_id: username,
      username,
      room_type: roomType,
      room_id: roomId,
      message: message.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  return { messages, sendMessage };
};
