import React from 'react';

export function UserProfile() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#C8AA6E] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop"
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <p className="text-[#F0E6D2] text-sm font-medium">Tewtsmageswts</p>
        <p className="text-[#A09B8C] text-xs">Creating Ranked...</p>
      </div>
    </div>
  );
}