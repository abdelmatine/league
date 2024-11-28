import React from 'react';
import { Users, Shield, Settings } from 'lucide-react';

export function MatchControls() {
  return (
    <div className="fixed bottom-80 left-1/2 -translate-x-1/2 flex items-center gap-4">
      <button className="bg-[#1E2328] p-2 rounded hover:bg-[#252931] transition-colors">
        <Users className="w-5 h-5 text-[#A09B8C]" />
      </button>
      <button className="bg-[#0AC8B9] px-8 py-3 rounded-full text-black font-semibold hover:bg-[#0DDECF] transition-colors">
        FIND MATCH
      </button>
      <div className="flex items-center gap-2">
        <button className="bg-[#1E2328] p-2 rounded hover:bg-[#252931] transition-colors">
          <Shield className="w-5 h-5 text-[#A09B8C]" />
        </button>
        <button className="bg-[#1E2328] p-2 rounded hover:bg-[#252931] transition-colors">
          <Settings className="w-5 h-5 text-[#A09B8C]" />
        </button>
      </div>
    </div>
  );
}