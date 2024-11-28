import { GameCard } from "./GameCard";
import { FindMatch } from "./FindMatch";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import React from 'react';
import { FiMic, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

export function MainSection({ cards }: { cards: { id: number; name: string; role: string; avatar: string; rating: number; frameworks: { asset: string; url: string }[]; backgroundImage: string }[] }) {
  return (
    <div id="main-section" className="w-screen h-screen flex flex-col pt-20 relative">
      {/* Header */}
      <h2 className="text-2xl font-bold text-white text-center py-4">SR · Ranked Projects</h2>

      {/* Swiper Section */}
      <div className="flex-1 relative group">
        <Swiper
          spaceBetween={25} // Adding some gap between slides here
          centeredSlides={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: true,
          }}
          loop={true} // Disable looping
          resistance={true} // Enable bounce-back resistance
          resistanceRatio={0.85} // Set resistance strength
          modules={[Navigation, Autoplay]}
          breakpoints={{
            640: { slidesPerView: 1 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 5 },
          }}
          className="w-full h-full"
        >
          {cards.map((card) => (
            <SwiperSlide
              key={card.id}
              className="flex justify-center items-center h-full"
            >
              <GameCard
                name={card.name}
                role={card.role}
                avatar={card.avatar}
                rating={card.rating}
                frameworks={card.frameworks}
                backgroundImage={card.backgroundImage}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Find Match Button and Custom Buttons */}
      <div className="py-8 flex justify-center items-center space-x-4">
        <button className="bg-[#1E2328] text-[#A09B8C] p-2 rounded-full hover:bg-[#252931] transition-colors">
          <FiArrowLeft className="size-4" />
        </button>
        <FindMatch />
        <button className="bg-[#1E2328] text-[#A09B8C] p-2 rounded-full hover:bg-[#252931] transition-colors">
          <FiMic className="size-4" />
        </button>
        <button className="bg-[#1E2328] text-[#A09B8C] p-2 rounded-full hover:bg-[#252931] transition-colors">
          <FiArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}