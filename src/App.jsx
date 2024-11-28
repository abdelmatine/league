import React, { useState } from 'react';
import { Navbar } from './components/Navbar/Navbar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { GameList } from './components/MainSection/GameList';
import { MatchControls } from './components/MainSection/MatchControls';
import { ChatBox } from './components/Chat/ChatBox';
import { MainSection } from './components/MainSection/MainSection';
import Hero from './components/Hero/Hero';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#010A13] bg-gradient-to-br from-[#010A13] via-[#062033] to-[#010A13]">

      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Hero />
      <MainSection />
      <ChatBox />
    </div>
  );
}

export default App;