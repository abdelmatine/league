import { GameCard } from "./GameCard";
import { FindMatch } from "./FindMatch";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import React from 'react';

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
    delay: 2000,
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
      className="flex  justify-center items-center h-full"
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


        {/* Custom Next/Prev Buttons */}

      </div>

      {/* Find Match Button */}
      <div className="py-4">
        <FindMatch />
      </div>
    </div>
  );
}
