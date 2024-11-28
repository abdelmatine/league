import React, { useState } from 'react';
import { FloatingGrid } from './FloatingGrid';
import { UserProfile } from './UserProfile';
import { ChevronUp, ChevronDown, Github, Linkedin, Facebook, Instagram } from 'lucide-react';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true); // Tracks if sidebar is fully open
  const [isMinimized, setIsMinimized] = useState(false); // Tracks if sidebar is minimized

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(true); // Ensure it's visible even when minimized
  };

  const handleReopen = () => {
    setIsMinimized(false);
  };

  return (
    <div
      className={`fixed ${
        isMinimized ? 'bottom-0 left-0 right-0 h-16' : 'right-0 top-0 h-screen w-72'
      } bg-[#111111] border-l border-[#1E282D] transform transition-transform duration-300 ease-in-out z-50`}
    >
      {!isMinimized && (
        <div className="pt-12 p-4">
          <UserProfile onClose={handleClose} onMinimize={handleMinimize} />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#F0E6D2] font-medium">SOCIAL</h2>
            <div className="flex gap-3">
            <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
              <Github className="w-4 h-4" />
            </button>
            <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
              <Linkedin className="w-4 h-4" />
            </button>
            <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
              <Facebook className="w-4 h-4" />
            </button>
            <button className="text-[#A09B8C] hover:text-[#C8AA6E] transition-colors">
              <Instagram className="w-4 h-4" />
            </button>
          </div>
          </div>
        </div>
      )}

      <div
        className={`absolute ${
          isMinimized ? 'top-0' : 'bottom-0'
        } left-0 right-0 p-4 border-t border-[#1E282D] bg-[#0A0A0A]`}
      >
        <FloatingGrid />
      </div>

      {/* Minimize or Reopen Button */}
      <div
        className={`absolute ${isMinimized ? 'bottom-16' : 'bottom-4'} right-4`}
      >
        <button
          onClick={isMinimized ? handleReopen : handleMinimize}
          className="bg-[#1E2328] text-[#A09B8C] p-2 rounded-full hover:bg-[#252931] transition-colors"
        >
          {isMinimized ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
