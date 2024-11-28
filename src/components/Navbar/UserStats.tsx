import React from 'react';
import { Hexagon, Crown, Coins } from 'lucide-react';

export function UserStats() {
  return (
    <div className="flex items-center gap-4 ">
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 relative">
            <Hexagon className="w-4 h-4 text-[#C8AA6E] absolute" fill="#C8AA6E" />
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-black font-bold">RP</span>
          </div>
          <span className="text-[#C8AA6E] font-medium">999</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 relative">
            <Hexagon className="w-4 h-4 text-blue-400 absolute" fill="#0AC8B9" />
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-black font-bold">LP</span>
          </div>
          <span className="text-[#0AC8B9] font-medium">9999</span>
        </div>
      </div>
    </div>
  );
}