import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export function GameCard({
  name,
  role,
  avatar,
  rating,
  frameworks,
  backgroundImage,
  isClicked,
}: {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  frameworks: { asset: string; url: string }[];
  backgroundImage: string;
  isClicked: boolean;
}) {
  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden border ${isClicked ? 'border-yellow-500 shadow-lg' : 'border-transparent'} hover:border-yellow-500 hover:shadow-lg shadow-gray-700 transition-all duration-300`}>
      {/* Center and maintain aspect ratio of avatar image */}
      <div
        className={`absolute size-28 mt-40 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-800 overflow-hidden ${isClicked ? 'ring-4 ring-yellow-500' : ''}`} // Adjust size as needed
      >
        <img src={avatar} alt={name} className={`w-full h-full object-cover ${isClicked ? 'animate-pulse' : ''}`} />
      </div>

      <div className=" inset-0 bg-gray-900 " />

      <div className="pt-2 md:pt-0 absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
        <h3 className="text-xl text-white font-semibold mb-2">{name}</h3>
        <p className="text-sm text-gray-400 mb-2">{role}</p>
        <div className="flex items-center gap-2">
          {frameworks.map((framework, index) => (
            <a href={framework.url} target="_blank" rel="noopener noreferrer" key={index}>
              <div className='gap-6 items-center justify-center m-2'>
                <img
                  src={framework.asset}
                  alt={framework.url}
                  className="w-6 h-6 object-contain cursor-pointer"
                />
              </div>
            </a>
          ))}
        </div>
        <div className="flex items-center justify-center gap-1">
          {/* Add rating logic here using FaStar, FaStarHalfAlt, FaRegStar */}
        </div>
      </div>
    </div>
  );
}