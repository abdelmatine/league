import React from 'react';
import { Shield, Crown } from 'lucide-react';

interface GameCardProps {
  isActive?: boolean;
  playerName: string;
  rank: string;
  role: string;
  badges: Array<'mvp' | 'skilled' | 'veteran'>;
}

export function GameCard({ isActive = false, playerName, rank, role, badges }: GameCardProps) {
  return (
    <div className={`relative ${isActive ? 'w-64 h-96 md:w-72 md:h-[420px]' : 'w-48 h-80 md:w-56 md:h-[360px]'} transition-all duration-300`}>
      <div className="absolute inset-0 bg-[#1E2328] rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-4 left-4">
          {badges.includes('mvp') && (
            <div className="w-8 h-8 rounded-full bg-[#C8AA6E] flex items-center justify-center">
              <Crown className="w-5 h-5 text-black" />
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-[#C8AA6E]" />
            <span className="text-[#F0E6D2] text-sm font-medium">{playerName}</span>
          </div>
          <p className="text-[#A09B8C] text-xs mb-2">{rank}</p>
          <div className="flex items-center gap-2">
            <span className="text-[#0AC8B9] text-xs uppercase">{role}</span>
            <div className="flex gap-1">
              {badges.map((badge, index) => (
                <div
                  key={badge}
                  className="w-3 h-3 rounded-full border border-[#C8AA6E]"
                  style={{
                    backgroundColor: index === 0 ? '#C8AA6E' : 'transparent'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}