import React, { useState } from 'react';
import { MessageSquare, ChevronUp, Send } from 'lucide-react';

interface ChatMessage {
  id: number;
  user: string;
  message: string;
  timestamp: string;
}

const mockMessages: ChatMessage[] = [
  { id: 1, user: "Tewtsmageswts", message: "gg wp", timestamp: "2:31" },
  { id: 2, user: "Riot kuniso", message: "nice game everyone!", timestamp: "2:32" },
  { id: 3, user: "doublelift", message: "thanks for carry", timestamp: "2:33" },
];

export function ChatBox() {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimized = () => setIsMinimized(!isMinimized);

  return (
    <div className="fixed mb-4 ml-4 bottom-0 left-0 sm:w-64 w-full hidden sm:block z-50">
      {!isMinimized ? (
        <div className="bg-[#1E2328]/50 backdrop-blur-lg rounded-t-lg shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b border-[#111111] bg-[#1E2328]/60 backdrop-blur-lg rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#A09B8C]" />
              <span className="text-[#F0E6D2] text-sm">GENERAL (18/66)</span>
            </div>
            <button
              onClick={toggleMinimized}
              className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-48 overflow-y-auto p-2 space-y-2 bg-[#1E2328]/40 backdrop-blur-md">
            {mockMessages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className="text-[#C8AA6E]">{msg.user}: </span>
                <span className="text-[#A09B8C]">{msg.message}</span>
                <span className="text-[#5B5A56] text-xs ml-2">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Input Section */}
          <div className="p-2 border-t border-[#111111] bg-[#1E2328]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full bg-[#111111] text-[#A09B8C] text-sm rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C8AA6E]"
              />
              <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Minimized View
        <div
          onClick={toggleMinimized}
          className="flex items-center justify-center h-12 bg-[#1E2328]/50 backdrop-blur-lg cursor-pointer border-t border-[#111111] rounded-t-lg"
        >
          <MessageSquare className="w-5 h-5 text-[#A09B8C]" />
        </div>
      )}
    </div>
  );
}
