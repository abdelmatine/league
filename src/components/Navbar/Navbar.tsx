import React from 'react';
import { NavLink } from './NavLink';
import { UserStats } from './UserStats';
import { Logo } from './Logo';
import { Search, Mail, Gift, Trophy, Shield, Star, Target } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav className="bg-[#111111]/90 backdrop-blur-sm border-b border-[#1E282D] py-2 fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-between pr-4 lg:pr-72 lg:mr-8 max-w-[2000px] mx-auto">
        <div className="flex items-center space-x-8">
          <Logo onMenuClick={onMenuClick} />
          <div className="hidden md:flex items-center">
            <NavLink isActive>HOME</NavLink>
            <NavLink>TFT</NavLink>
            <NavLink>CLASH</NavLink>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-8">
          <div className="flex items-center gap-4">
            <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
              <Shield className="w-5 h-5" />
            </button>
            <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
              <Star className="w-5 h-5" />
            </button>
            <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
              <Target className="w-5 h-5" />
            </button>
            <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
              <Trophy className="w-5 h-5" />
            </button>
            <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
              <Gift className="w-5 h-5" />
            </button>
          </div>

          <UserStats />
        </div>
      </div>
    </nav>
  );
}