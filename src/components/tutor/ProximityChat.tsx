// src/components/ProximityChat.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, MessageCircle } from "lucide-react";

interface ProximityChatProps {
  nearbyPlayerId: string | null;
  chatOpen: boolean;
  messages: Array<{ sender: string; text: string }>;
  unreadCount: number;
  onOpenChat: () => void;
  onCloseChat: () => void;
  onSendMessage: (text: string) => void;
}

export const ProximityChat = ({
  nearbyPlayerId,
  chatOpen,
  messages,
  unreadCount,
  onOpenChat,
  onCloseChat,
  onSendMessage,
}: ProximityChatProps) => {
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!chatOpen) setInput("");
  }, [chatOpen]);

  const handleSend = () => {
    const txt = input.trim();
    if (!txt) return;
    onSendMessage(txt);
    setInput("");
  };

  if (nearbyPlayerId && !chatOpen) {
    return (
      <div className="fixed bottom-24 right-4 z-20">
        <Button onClick={onOpenChat} className="bg-primary hover:bg-primary/90 text-white shadow-lg animate-pulse relative" size="lg">
          <MessageCircle className="mr-2 h-5 w-5" />
          Chat {nearbyPlayerId.substring(0,8)}
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>
    );
  }

  if (chatOpen) {
    return (
      <Card className="fixed bottom-24 right-4 w-96 h-96 z-20 flex flex-col bg-background/95 backdrop-blur border-primary/50">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Chat</h3>
          <Button variant="ghost" size="sm" onClick={onCloseChat}><X className="h-4 w-4" /></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && <div className="text-sm text-muted-foreground">Say hi 👋</div>}
          {messages.map((m, i) => (
            <div key={i} className={`p-2 rounded ${m.sender === "You" ? "bg-primary text-primary-foreground ml-8 text-right" : "bg-muted text-muted-foreground mr-8 text-left"}`}>
              <div className="text-xs font-semibold mb-1">{m.sender}</div>
              <div>{m.text}</div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Input value={input} onChange={(e:any)=>setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type a message..." className="flex-1" />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </Card>
    );
  }

  return null;
};

