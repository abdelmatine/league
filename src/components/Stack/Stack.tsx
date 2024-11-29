import React, { useState } from "react";

interface StackProps {
  stacks: {
    id: string;
    icon: string;
    count: number;
    title: string;
    description: string;
  }[];
  timeRemaining: number;
}

export default function Stack({ stacks, timeRemaining }: StackProps) {
  const [selectedItem, setSelectedItem] = useState(stacks[0]);

  return (
    <div className="flex flex-col h-screen w-screen p-6">
      {/* Top Div */}
      <div className="mb-4">
        <h2 className="text-4xl pt-20 font-bold text-white text-center">
          Stack Overview
        </h2>
      </div>

      {/* Bottom Divs */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Grid Section */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-4">
          {stacks.map((item) => (
            <div key={item.id} className="border-gold flex justify-center items-center">
              <div
                className="flex flex-col items-center cursor-pointer p-4 hover:shadow-[0_0_5px_#FFD700] active:shadow-[0_0_10px_#FFD700]"
                onClick={() => setSelectedItem(item)}
              >
                <img src={item.icon} alt={item.title} className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Detail Section */}
        <div className="flex-1 flex flex-col gap-4 p-4">
          <div className="flex flex-col items-center justify-center p-4 flex-grow mt-4">
            <img
              src={selectedItem.icon}
              alt={selectedItem.title}
              className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40"
            />
          </div>
          <div className="flex flex-col items-center pb-44 mt-4">
            <h2 className="text-4xl font-bold text-yellow-400">
              {selectedItem.title}
            </h2>
            <div className="mt-2 flex items-center justify-center">
              <p className="text-lg text-gray-300">
                {selectedItem.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}