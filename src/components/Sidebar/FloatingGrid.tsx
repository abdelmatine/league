import { Headphones, Mic, Settings } from "lucide-react";
import React, { useState } from "react";
import { FiMic, FiMicOff } from "react-icons/fi";
import SoundPlayer from "../../hooks/SoundPlayer";

export function FloatingGrid() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleMicClick = () => {
    setIsMuted(!isMuted);
  };

  const toggleSound = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      <button
        className="bg-[#1E2328] text-[#A09B8C] p-2 rounded hover:bg-[#252931] transition-colors"
        onClick={handleMicClick}
      >
        {isMuted ? (
          <FiMicOff className="size-4 mx-auto" />
        ) : (
          <FiMic className="size-4 mx-auto" />
        )}
      </button>
      <button
        className="bg-[#1E2328] text-[#A09B8C] p-2 rounded hover:bg-[#252931] transition-colors"
        onClick={toggleSound}
      >
        <Headphones
          className={`w-4 h-4 mx-auto ${isPlaying ? "" : "text-red-500"}`}
        />
      </button>
      <div className="relative flex items-center justify-center">
        <p className="font-medium text-white text-xs">V1.0</p>
      </div>
      <button className="bg-[#1E2328] text-[#A09B8C] p-2 rounded hover:bg-[#252931] transition-colors">
        <Settings className="w-4 h-4 mx-auto" />
      </button>
      <SoundPlayer isPlaying={isPlaying} />
    </div>
  );
}
