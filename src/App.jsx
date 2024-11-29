import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChatBox } from './components/Chat/ChatBox';
import Hero from './components/Hero/Hero';
import { MainSection } from './components/MainSection/MainSection';
import { Navbar } from './components/Navbar/Navbar';
import { Sidebar } from './components/Sidebar/Sidebar';
import Stack from './components/Stack/Stack';
import { projects } from './data/projects'; // Import projects data
import { stacks } from './data/stacks'; // Import stacks data
import { Contact } from './components/Contact/Contact';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarMinimize = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#010A13] bg-gradient-to-br from-[#010A13] via-[#062033] to-[#010A13]">
        <Navbar onMenuClick={handleMenuClick} isSidebarMinimized={isSidebarMinimized} />
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onMinimize={toggleSidebarMinimize}
          isMinimized={isSidebarMinimized}
        />
        <div id="home">
          <Hero />
        </div>
        <div id="projects">
          <MainSection projects={projects} />
        </div>
        <div id="stack">
          <Stack stacks={stacks} timeRemaining={120} />
        </div>
        <div id="contact" className="pt-16">
          <Contact />
        </div>
        <ChatBox />
      </div>
    </Router>
  );
}


export default App;