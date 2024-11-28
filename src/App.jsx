import React, { useState } from 'react';
import { ChatBox } from './components/Chat/ChatBox';
import Hero from './components/Hero/Hero';
import { MainSection } from './components/MainSection/MainSection';
import { Navbar } from './components/Navbar/Navbar';
import { FloatingGrid } from './components/Sidebar/FloatingGrid';
import { Sidebar } from './components/Sidebar/Sidebar';


function App() {

  const cards = [
    {
      id: 1,
      name: "Fixed APP",
      role: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.",
      avatar: "src/assets/ord.png",
      rating: 4.5,
      frameworks: [
        { asset: "/public/icons/postgresql.svg", url: "https://postgresql.org/" },
        { asset: "/public/icons/angular.svg", url: "https://angular.io/" },
        { asset: "/public/icons/springboot.svg", url: "https://spring.io/projects/spring-boot/" },
      ],
      bgImage: "/images/card-bg.jpg",
    },
    {
      id: 2,
      name: "PlanIfy",
      role: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      avatar: "src/assets/cal.png",
      rating: 3.8,
      frameworks: [
        { asset: "/public/icons/nextjs.svg", url: "https://nextjs.org/" },
        { asset: "/public/icons/react-native.svg", url: "https://reactnative.dev/" },
      ],
    },
    {
      id: 3,
      name: "Uber Clone",
      role: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here',",
      avatar: "src/assets/uber.png",
      rating: 4.2,
      frameworks: [
        { asset: "/public/icons/nodejs.svg", url: "https://nodejs.org/" },
        { asset: "/public/icons/angular.svg", url: "https://angular.io/" },
      ],
    },
    {
      id: 5,
      name: "Gym Park",
      role: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness.",
      avatar: "src/assets/gym.jpg",
      rating: 4.2,
      frameworks: [
        { asset: "/public/icons/springboot.svg", url: "https://spring.io/projects/spring-boot/" },
        { asset: "/public/icons/react.svg", url: "https://reactjs.org/" },
      ],
    },
    {
      id: 6,
      name: "Ktebi Tn",
      role: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia,",
      avatar: "src/assets/book.png",
      rating: 4.2,
      frameworks: [
        { asset: "/public/icons/springboot.svg", url: "https://spring.io/projects/spring-boot/" },
        { asset: "/public/icons/angular.svg", url: "https://angular.io/" },
      ],
    },
  ];

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
      <div>
      <MainSection cards={cards} />
    </div>
      <ChatBox />
    </div>
  );
}

export default App;