import React from 'react';
import { useNavigate } from 'react-router-dom';

export function FindMatch({ projectLink }: { projectLink?: string }) {
  const handleClick = () => {
    if (projectLink) {
      window.open(projectLink, '_blank', 'noopener,noreferrer');
    } else {
      alert('Please select a project to find its match!');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="
        relative z-0 flex items-center gap-2 overflow-hidden rounded-lg border-[1px]
        border-[#044e48] px-4 py-2 font-semibold uppercase text-[#0AC8B9] transition-all duration-500
        hover:scale-105 hover:text-neutral-900
        active:scale-95
      "
    >
      Find Project
    </button>
  );
}
