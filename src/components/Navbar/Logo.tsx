import React from 'react';
import { Menu } from 'lucide-react';



export function Logo() {
  return (
    <div className="flex items-center gap-3 ml-6 mt-2">
      <button 
        className="lg:hidden text-[#A09B8C] hover:text-[#C8AA6E] transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>
      <div className="relative flex items-center ">
        <div className="w-10 h-10 rounded-full border-2 hover:bg-[#ad3c07] border-[#C8AA6E] bg-[#091428] flex items-center justify-center">
          <span className="text-[#C8AA6E] font-bold text-xl">L</span>
        </div>
      </div>
      <div className="relative flex items-center">
      <button className="bg-[#1E2328] text-[#C8AA6E] px-6 py-2 rounded-r-full font-semibold text-sm transition-colors duration-200 hover:bg-[#ad3c07] hover:text-white">
  PLAY
</button>
      </div>
    </div>
  );
}