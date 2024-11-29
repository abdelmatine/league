import React from 'react';
import { UserStats } from './UserStats';
import { Logo } from './Logo';
import { Shield, Star, Trophy, Gift } from 'lucide-react';
import Separator from '../ui/Separator';

interface NavbarProps {
  isSidebarMinimized: boolean;
}

export function Navbar({ isSidebarMinimized }: NavbarProps) {
  return (
    <nav className="bg-[#111111]/90 backdrop-blur-sm border-b border-[#1E282D] py-2 fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-between pr-4 lg:mr-8 max-w-[2000px] mx-auto">
        <div className="flex items-center space-x-8">
          <Logo />
          <div className="hidden md:flex items-center">
            <a
              href="#home"
              className="px-6 py-2 text-sm font-medium transition-colors duration-200 text-[#A09B8C] hover:text-[#C8AA6E]"
            >
              HOME
            </a>
            <a
              href="#projects"
              className="px-6 py-2 text-sm font-medium transition-colors duration-200 text-[#A09B8C] hover:text-[#C8AA6E]"
            >
              PROJECTS
            </a>
            <a
              href="#stack"
              className="px-6 py-2 text-sm font-medium transition-colors duration-200 text-[#A09B8C] hover:text-[#C8AA6E]"
            >
              STACK
            </a>
            <a
              href="#contact"
              className="px-6 py-2 text-sm font-medium transition-colors duration-200 text-[#A09B8C] hover:text-[#C8AA6E]"
            >
              CONTACT
            </a>
          </div>
        </div>

        <div className={`hidden lg:flex items-center space-x-8 ${isSidebarMinimized ? '' : 'lg:pr-72'}`}>
          {isSidebarMinimized && (
            <div className="flex items-center gap-4">
              <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
                <Shield className="w-5 h-5" />
              </button>
              <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
                <Star className="w-5 h-5" />
              </button>
              <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
                <Trophy className="w-5 h-5" />
              </button>
              <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
                <Gift className="w-5 h-5" />
              </button>
            </div>
          )}
          <Separator className="mx-4" />
          <UserStats />
        </div>
      </div>
    </nav>
  );
}
