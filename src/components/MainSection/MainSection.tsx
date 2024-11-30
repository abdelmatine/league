import { GameCard } from "./GameCard";
import { FindMatch } from "./FindMatch";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay,Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import React, { useRef, useState, useEffect } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import SwiperCore from 'swiper';

export function MainSection({ projects }: { projects: { id: number; name: string; role: string; avatar: string; rating: number; frameworks: { asset: string; url: string }[]; backgroundImage: string }[] }) {
  const swiperRef = useRef<SwiperCore | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);


  const handleSlideClick = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.autoplay.stop();
      swiperRef.current.slideToLoop(index, 500); // Slide to the clicked index with a smooth transition
    }
    setClickedIndex(clickedIndex === index ? null : index);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (swiperRef.current && !event.composedPath().includes(swiperRef.current.el)) {
      swiperRef.current.autoplay.start();
      setClickedIndex(null);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div id="main-section" className="w-screen h-screen flex flex-col relative overflow-hidden">
      {/* Header */}
      <h2 className="text-2xl font-bold text-white text-center pt-20 py-4">SR · Ranked Projects</h2>

      {/* Swiper Section */}
      <div className="flex-1 mr-20  ml-20 relative group overflow-hidden">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          spaceBetween={25} // Adding some gap between slides here
          centeredSlides={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true} // Enable looping
          resistance={true} // Enable bounce-back resistance
          resistanceRatio={0.85} // Set resistance strength
          modules={[Navigation, Autoplay]}
          breakpoints={{
            640: { slidesPerView: 1 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 5 },
          }}
          pagination={{ clickable: true }}
          className="w-full h-full"
        >
          {projects.map((card, index) => (
            <SwiperSlide
              key={card.id}
              className="flex justify-center items-center h-full"
              onClick={() => handleSlideClick(index)}
            >
              <GameCard
                name={card.name}
                role={card.role}
                avatar={card.avatar}
                rating={card.rating}
                frameworks={card.frameworks}
                backgroundImage={card.backgroundImage}
                isClicked={index === clickedIndex}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Find Match Button and Custom Buttons */}
      <div className="py-8 flex justify-center items-center space-x-4">
        <button
          className="bg-[#1E2328] text-[#A09B8C] p-2 rounded-full hover:bg-[#252931] transition-colors"
          onClick={() => (swiperRef.current as SwiperCore).slidePrev()}
        >
          <FiArrowLeft className="size-4" />
        </button>
        <FindMatch />

        <button
          className="bg-[#1E2328] text-[#A09B8C] p-2 rounded-full hover:bg-[#252931] transition-colors"
          onClick={() => (swiperRef.current as SwiperCore).slideNext()}
        >
          <FiArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
