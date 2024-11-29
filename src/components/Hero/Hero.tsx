import React from "react";
import { NavLink } from 'react-router-dom';

export default function Hero() {
  const handleSmoothScroll = (event, targetId) => {
    event.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative text-white min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Animation or Decoration */}

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-screen-lg mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Hi, I&apos;m <span className="text-[#0AC8B9]">Abdelmatine Sfar</span>
        </h1>
        <p className="mt-8 mx-auto text-sm md:text-xl text-gray-300">
          A fresh graduate{" "}
          <span className="text-[#20ecdb]">Software Engineer</span> with a knack for turning complex challenges into
          elegant solutions. Seeking opportunities to leverage my technical
          skills and creativity to deliver impactful results.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <NavLink
            to="#projects"
            onClick={(e) => handleSmoothScroll(e, 'projects')}
            className="relative z-0 flex items-center gap-2 overflow-hidden rounded-lg border-[1px] 
            border-[#044e48] px-4 py-2 font-semibold uppercase text-[#0AC8B9] transition-all duration-500
            
            before:absolute before:inset-0
            before:-z-10 before:translate-x-[150%]
            before:translate-y-[150%] before:scale-[2.5]
            before:rounded-[100%] before:bg-[#0AC8B9]
            before:transition-transform before:duration-1000
            before:content-['']
    
            hover:scale-105 hover:text-neutral-900
            hover:before:translate-x-[0%]
            hover:before:translate-y-[0%]
            active:scale-95"
          >
            See My Work
          </NavLink>
          <NavLink
            to="#contact"
            onClick={(e) => handleSmoothScroll(e, 'contact')}
            className="relative z-0 flex items-center gap-2 overflow-hidden rounded-lg border-[1px] 
            border-gray-600 px-4 py-2 font-semibold uppercase text-white transition-all duration-500
            
            before:absolute before:inset-0
            before:-z-10 before:translate-x-[150%]
            before:translate-y-[150%] before:scale-[2.5]
            before:rounded-[100%] before:bg-gray-600
            before:transition-transform before:duration-1000
            before:content-['']
    
            hover:scale-105 hover:text-neutral-900
            hover:before:translate-x-[0%]
            hover:before:translate-y-[0%]
            active:scale-95"
          >
            Contact Me
          </NavLink>
        </div>
      </div>
    </section>
  );
}