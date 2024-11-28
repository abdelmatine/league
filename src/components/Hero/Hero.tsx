import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative text-white min-h-screen flex items-center justify-center">
      {/* Background Animation or Decoration */}


      {/* Hero Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Hi, I'm <span className="text-purple-500">[Your Name]</span>
        </h1>
        <p className="mt-4 text-lg md:text-2xl text-gray-300">
          I’m a passionate <span className="text-purple-400">[Your Role]</span> crafting digital experiences and solving complex problems.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="#portfolio"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition duration-300"
          >
            See My Work
          </a>
          <a
            href="#contact"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow-md border border-gray-600 transition duration-300"
          >
            Contact Me
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
