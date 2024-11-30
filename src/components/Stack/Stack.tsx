import React, { useState, useEffect } from "react";
import { IconScene } from "./IconScene";
import { GridItem } from "./GridItem";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import AOS from "aos";
import "aos/dist/aos.css";

interface StackProps {
  stacks: {
    id: string;
    icon: string;
    count: number;
    title: string;
    description: string;
  }[];
}

export default function Stack({ stacks }: StackProps) {
  const [selectedItem, setSelectedItem] = useState(stacks[0]);

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800, // Animation duration
      once: false, // Whether animation should happen only once
      easing: "ease-in-out", // Default easing for AOS animations
    });
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen p-6">
      {/* Top Div */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-4"
      >
        <h2 className="text-4xl pt-20 font-bold text-white text-center">
          Stack Overview
        </h2>
      </motion.div>

      {/* Bottom Divs */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Grid Section */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-4">
          {stacks.map((item, index) => (
            <div
              key={item.id}
              data-aos="fade-up"
              data-aos-delay={`${index * 100}`}
              data-aos-duration="800"
            >
              <GridItem
                icon={item.icon}
                title={item.title}
                index={index}
                onClick={() => setSelectedItem(item)}
              />
            </div>
          ))}
        </div>

        {/* Right Detail Section */}
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          data-aos-duration="800"
          className="flex-1 flex flex-col gap-4 p-4"
        >
          <motion.div
            key={selectedItem.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="h-[400px] w-full"
          >
            <IconScene iconUrl={selectedItem.icon} />
          </motion.div>
          <motion.div
            key={`title-${selectedItem.id}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center mt-4"
          >
            <h2 className="text-4xl font-bold text-yellow-400 mb-4">
              {selectedItem.title}
            </h2>
            <div className="mt-2 flex items-center justify-center">
              <p className="mt-8 mx-auto text-sm md:text-xl text-gray-300">
                <Typewriter
                  loop={false}
                  cursor
                  cursorStyle="|"
                  typeSpeed={50}
                  words={[selectedItem.description]}
                />
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
