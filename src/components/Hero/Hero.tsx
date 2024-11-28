import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative text-white min-h-screen flex items-center justify-center">
      {/* Background Animation or Decoration */}


      {/* Hero Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Hi, I'm <span className="text-[#0AC8B9]">Abdelmatine Sfar</span>
        </h1>
        <p className="mt-8 mr-4 ml-4 mx-auto text-sm md:text-xl text-gray-300">
          I&apos;m a fresh graduate <span className="text-[#20ecdb]">Software Engineer</span>, a passionate problem-solver with a knack for turning complex challenges into elegant solutions. Seeking opportunities to leverage my technical skills and creativity to deliver impactful results.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="#portfolio"
            className="px-6 py-3 bg-[#0AC8B9] hover:bg-[#044e48] text-white rounded-lg shadow-md transition duration-300"
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
