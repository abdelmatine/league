import React from 'react';
import { Menu } from 'lucide-react';

interface LogoProps {
  onMenuClick: () => void;
}

export function Logo({ onMenuClick }: LogoProps) {
  return (
    <div className="flex items-center gap-3 ml-6 mt-2">
      <button 
        onClick={onMenuClick}
        className="lg:hidden text-[#A09B8C] hover:text-[#C8AA6E] transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>
      <div className="relative flex items-center mr-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#C8AA6E] bg-[#091428] flex items-center justify-center">
          <span className="text-[#C8AA6E] font-bold text-xl">L</span>
        </div>
      </div>
      <div className="relative flex items-center">
        <div className="absolute -left-4 w-4 h-full bg-[#1E2328] -rounded-l-full" />
        <button className="bg-[#1E2328] text-[#C8AA6E] px-6 py-2 rounded-r-md font-semibold text-sm transition-colors duration-200 hover:bg-[#252931]">
          PLAY
        </button>
      </div>
    </div>
  );
}