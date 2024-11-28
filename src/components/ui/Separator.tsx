import React from 'react';

interface SeparatorProps {
  className?: string;
}

const Separator: React.FC<SeparatorProps> = ({ className }) => {
  return (
    <div
      className={`h-10 w-px bg-gradient-to-b from-gray-300 to-yellow-400 ${className}`}
    />
  );
};

export default Separator;