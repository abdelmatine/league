import React, { useState } from 'react';
import { ChatBox } from './components/Chat/ChatBox';
import Hero from './components/Hero/Hero';
import { MainSection } from './components/MainSection/MainSection';
import { Navbar } from './components/Navbar/Navbar';
import { Sidebar } from './components/Sidebar/Sidebar';
import Stack from './components/Stack/Stack';
import {FiGrid, FiClock, FiBox, FiPlusCircle} from 'react-icons/fi';

function App() {

  const items = [
    {
      id: '1',
      icon: "/icons/angular.svg",
      count: 10,
      title: 'Angular',
      description: 'A platform for building mobile and desktop web applications.',
    },
    {
      id: '2',
      icon: "/icons/react.svg",
      count: 5,
      title: 'React',
      description: 'A JavaScript library for building user interfaces.',
    },
    {
      id: '3',
      icon: "/icons/springboot.svg",
      count: 8,
      title: 'SpringBoot',
      description: 'A framework for building production-ready Spring applications.',
    },
    {
      id: '4',
      icon: "/icons/react-native.svg",
      count: 12,
      title: 'React Native',
      description: 'A framework for building native apps using React.',
    },
    {
      id: '5',
      icon: "/icons/flutter.svg",
      count: 7,
      title: 'Flutter',
      description: 'An open-source UI software development toolkit by Google.',
    },
    {
      id: '6',
      icon: "/icons/qt.svg",
      count: 3,
      title: 'Qt',
      description: 'A free and open-source widget toolkit for creating graphical user interfaces.',
    },
    {
      id: '8',
      icon: "/icons/js.svg",
      count: 11,
      title: 'JavaScript',
      description: 'A high-level, often just-in-time compiled, and multi-paradigm programming language.',
    },
    {
      id: '9',
      icon: "/icons/ts.svg",
      count: 6,
      title: 'TypeScript',
      description: 'A strict syntactical superset of JavaScript and adds optional static typing to the language.',
    },
    {
      id: '10',
      icon: "/icons/java.svg",
      count: 4,
      title: 'Java',
      description: 'A high-level, class-based, object-oriented programming language.',
    },
    {
      id: '11',
      icon: "/icons/c.svg",
      count: 2,
      title: 'C',
      description: 'A general-purpose, procedural computer programming language.',
    },
    {
      id: '12',
      icon: "/icons/c++.svg",
      count: 13,
      title: 'C++',
      description: 'A general-purpose programming language created as an extension of the C programming language.',
    },
    {
      id: '13',
      icon: "/icons/python.svg",
      count: 1,
      title: 'Python',
      description: 'An interpreted, high-level, general-purpose programming language.',
    },
  ];
  

  const cards = [
    {
      id: 1,
      name: "Fixed APP",
      role: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.",
      avatar: "src/assets/ord.png",
      rating: 4.5,
      frameworks: [
        { asset: "/icons/postgresql.svg", url: "https://postgresql.org/" },
        { asset: "/icons/angular.svg", url: "https://angular.io/" },
        { asset: "/icons/springboot.svg", url: "https://spring.io/projects/spring-boot/" },
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
        { asset: "/icons/nextjs.svg", url: "https://nextjs.org/" },
        { asset: "/icons/react-native.svg", url: "https://reactnative.dev/" },
      ],
    },
    {
      id: 3,
      name: "Uber Clone",
      role: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here',",
      avatar: "src/assets/uber.png",
      rating: 4.2,
      frameworks: [
        { asset: "/icons/nodejs.svg", url: "https://nodejs.org/" },
        { asset: "/icons/angular.svg", url: "https://angular.io/" },
      ],
    },
    {
      id: 5,
      name: "Gym Park",
      role: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness.",
      avatar: "src/assets/gym.jpg",
      rating: 4.2,
      frameworks: [
        { asset: "/icons/springboot.svg", url: "https://spring.io/projects/spring-boot/" },
        { asset: "/icons/react.svg", url: "https://reactjs.org/" },
      ],
    },
    {
      id: 6,
      name: "Ktebi Tn",
      role: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia,",
      avatar: "src/assets/book.png",
      rating: 4.2,
      frameworks: [
        { asset: "/icons/springboot.svg", url: "https://spring.io/projects/spring-boot/" },
        { asset: "/icons/angular.svg", url: "https://angular.io/" },
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
    <Stack items={items} timeRemaining={120}/>      
<ChatBox />
    </div>
  );
}

export default App;