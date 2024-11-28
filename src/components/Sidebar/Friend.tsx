import React from 'react';

interface FriendProps {
  name: string;
  status: string;
  avatarUrl: string;
}

const Friend: React.FC<FriendProps> = ({ name, status, avatarUrl }) => {
  return (
      <div className="flex items-center gap-3 p-2 mt-1 rounded-lg shadow-lg">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-[#2E2E2E] overflow-hidden border-2 border-[#C8AA6E]">
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          </div>
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111111] ${
              status === 'Online' ? 'bg-green-500' : status === 'In Game' ? 'bg-blue-500' : 'bg-gray-400'
            }`}
          />
        </div>
        <div>
          <p className="text-[#F0E6D2] text-sm font-medium">{name}</p>
          <p className="text-xs">
            {status === 'Online' ? (
              <span className="text-green-500">Online</span>
            ) : status === 'InGame' ? (
              <span className="text-blue-500">In Game</span>
            ) : (
              <span className="text-gray-400">Offline</span>
            )}
          </p>
        </div>
      </div>
  );
};

export default Friend;