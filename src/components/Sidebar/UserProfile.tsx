import React from 'react';
import { X, Minus, ExternalLink } from 'lucide-react';

interface UserProfileProps {
  onClose: () => void;
  onMinimize: () => void;
}

export function UserProfile({ onClose, onMinimize }: UserProfileProps) {
  return (
    <div>
      <div className="relative -mt-14 mb-6">
        <div className="flex items-center gap-3 bg-[#111111] p-4 rounded-lg shadow-lg">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-[#2E2E2E] overflow-hidden border-2 border-[#C8AA6E]">
              <img
                src="src/assets/foto.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111111]" />
          </div>
          <div>
            <p className="text-[#F0E6D2] text-sm font-medium">Arch Efferalgon</p>
            <p className="text-green-500 text-xs">Creating Ranked...</p>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 flex items-center gap-2 p-2">
        <button
          onClick={onMinimize}
          className="text-[#A09B8C] hover:text-[#C8AA6E] p-1 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button className="text-[#A09B8C] hover:text-[#C8AA6E] p-1 transition-colors">
          <ExternalLink className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="text-[#A09B8C] hover:text-[#C8AA6E] p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
