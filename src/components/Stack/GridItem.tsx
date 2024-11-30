import { motion } from 'framer-motion';
import React from 'react';

interface GridItemProps {
  icon: string;
  title: string;
  index: number;
  onClick: () => void;
}

export function GridItem({ icon, title, index, onClick }: GridItemProps) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.1
      }}
      className="border-gold flex justify-center items-center"
      onClick={onClick}
    >
      <div className="flex flex-col items-center cursor-pointer p-4 hover:shadow-[0_0_5px_#FFD700] active:shadow-[0_0_10px_#FFD700] transition-shadow duration-300">
        <img
          src={icon}
          alt={title}
          className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20"
        />
      </div>
    </motion.div>
  );
}