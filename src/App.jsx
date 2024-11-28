import React, { useState } from 'react';
import { ChatBox } from './components/Chat/ChatBox';
import Hero from './components/Hero/Hero';
import { MainSection } from './components/MainSection/MainSection';
import { Navbar } from './components/Navbar/Navbar';
import { FloatingGrid } from './components/Sidebar/FloatingGrid';
import { Sidebar } from './components/Sidebar/Sidebar';


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
    <div className="min-h-screen bg-[#010A13] bg-gradient-to-br from-[#010A13] via-[#062033] to-[#010A13]">
      <Navbar onMenuClick={handleMenuClick} isSidebarMinimized={isSidebarMinimized} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onMinimize={toggleSidebarMinimize}
        isMinimized={isSidebarMinimized}
      />
      <Hero />
      <MainSection />
      <ChatBox />
    </div>
  );
}

export default App;