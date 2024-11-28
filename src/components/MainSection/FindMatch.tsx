import { Crown } from 'lucide-react';
import React from 'react';

const FindMatch = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md bg-[#0D0D17] rounded-lg px-6 py-8">
      <div className="flex items-center mb-4">
        <Crown name="shield" className="mr-2 text-[#808CDD]" />
        <span className="text-[#808CDD] font-medium">Autopill protected</span>
      </div>
      <div className="flex justify-between w-full">
        <button className="bg-[#222231] hover:bg-[#2C2C3C] text-[#808CDD] font-medium py-3 px-6 rounded-lg transition-colors duration-300">
          X
        </button>
        <button className="bg-[#222231] hover:bg-[#2C2C3C] text-[#808CDD] font-medium py-3 px-6 rounded-lg transition-colors duration-300">
          ?
        </button>
        <button className="bg-[#222231] hover:bg-[#2C2C3C] text-[#808CDD] font-medium py-3 px-6 rounded-lg transition-colors duration-300">
          Z
        </button>
        <button className="bg-[#222231] hover:bg-[#2C2C3C] text-[#FFFFFF] font-medium py-3 px-6 rounded-lg transition-colors duration-300">
          FIND MATCH
        </button>
      </div>
    </div>
  );
};

export default FindMatch;