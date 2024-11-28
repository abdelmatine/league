import { Headphones, Mic, Settings } from "lucide-react";
import React from "react";

export function FloatingGrid() {
  return (
    <div className="grid grid-cols-4 gap-2">
      <button className="bg-[#1E2328] text-[#A09B8C] p-2 rounded hover:bg-[#252931] transition-colors">
        <Mic className="w-4 h-4 mx-auto" />
      </button>
      <button className="bg-[#1E2328] text-[#A09B8C] p-2 rounded hover:bg-[#252931] transition-colors">
        <Headphones className="w-4 h-4 mx-auto" />
      </button>
      <div className=" relative items-center justify-center mx-auto">
      <p className="font-medium text-white">V1.0</p>
      </div>
      <button className="bg-[#1E2328] text-[#A09B8C] p-2 rounded hover:bg-[#252931] transition-colors">
        <Settings className="w-4 h-4 mx-auto" />
      </button>
    </div>
  );
}
