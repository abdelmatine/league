import React from "react";
import { FloatingGrid } from "./FloatingGrid";
import { UserProfile } from "./UserProfile";
import {
  ChevronUp,
  ChevronDown,
  Github,
  Linkedin,
  Facebook,
  Instagram,
} from "lucide-react";
import Friend from "./Friend";
import { Link } from "react-router-dom"; // Import Link for navigation

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
}

const friends = [
  { name: 'Github', status: 'InGame', avatarUrl: 'src/assets/git.png', url:'https://github.com/abdelmatine'},
  { name: 'Facebook', status: 'Online', avatarUrl: 'src/assets/fb.png', url:'https://www.facebook.com/abdou.sfar/'},
  { name: 'LinkedIn', status: 'OffLine', avatarUrl: 'src/assets/linkedin.png', url:'https://www.linkedin.com/in/abdelmatine-sfar-91a853162/'},
  { name: 'Instagram', status: 'OffLine', avatarUrl: 'src/assets/insta.png', url:'https://www.instagram.com/abdelmatine_sfar/'},
  // ... more friends
];

export function Sidebar({
  isOpen,
  onClose,
  onMinimize,
  isMinimized,
}: SidebarProps) {
  return (
    <div
      className={`fixed right-0 bottom-0 ${
        isMinimized ? "h-16" : "h-screen"
      } w-72 bg-[#010e18] border-l border-[#1E282D] transition-all duration-300 ease-in-out z-50`}
    >
      {!isMinimized && (
        <div className="pt-12 p-4">
          <UserProfile onClose={onClose} onMinimize={onMinimize} />
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

          <div>
            {/* New section for friends list */}
            <div className="flex items-center mb-4">
              <ChevronDown className="text-[#A09B8C] mr-2" />
              <h6 className="text-[#F0E6D2] text-sm font-medium">GENERAL (2/66)</h6>
            </div>
            <ul className="">
          {friends.map((friend) => (
                <a key={friend.name} target="_blank" href={friend.url}> {/* Use a for navigation */}
                <Friend {...friend} />
              </a>
          ))}
        </ul>

          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full p-4 bg-[#0A0A0A] border-t border-[#1E282D]">
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-4 ">
            <FloatingGrid />
          </div>
          <div className="flex justify-end">
            <button
              onClick={onMinimize}
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
      </div>
    </div>
  );
}
