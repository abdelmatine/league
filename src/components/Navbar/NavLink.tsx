import React from 'react';

interface NavLinkProps {
  children: React.ReactNode;
  isActive?: boolean;
}

export function NavLink({ children, isActive = false }: NavLinkProps) {
  return (
    <a
      href="#"
      className={`px-6 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'text-[#C8AA6E] border-b-2 border-[#C8AA6E]'
          : 'text-[#A09B8C] hover:text-[#C8AA6E]'
      }`}
    >
      {children}
    </a>
  );
}