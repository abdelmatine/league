import { ProjectCard } from "./ProjectCard";
import { FindMatch } from "./FindMatch";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import React, { useRef, useState, useEffect } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import SwiperCore from "swiper";
import { ProjectDescription } from "./ProjectDescription";

type Project = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  link: string;
  frameworks: { asset: string; url: string }[];
  backgroundImage?: string; // Optional if not always present
};

export function MainSection({ projects }: { projects: Project[] }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const swiperRef = useRef<SwiperCore | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleCardClick = (project) => {
    setSelectedProject(project);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedProject(null);
  };

  const handleSlideClick = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.autoplay.stop();
      swiperRef.current.slideToLoop(index, 500);
    }
    setClickedIndex(clickedIndex === index ? null : index);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      swiperRef.current &&
      !event.composedPath().includes(swiperRef.current.el)
    ) {
      swiperRef.current.autoplay.start();
      setClickedIndex(null);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div
      id="main-section"
      className="w-screen h-screen flex flex-col relative overflow-hidden"
    >
      {/* Header */}
      <h2 className="text-2xl font-bold text-white text-center pt-20 py-4">
        SR · Ranked Projects
      </h2>

      {/* Swiper Section */}
      <div className="flex-1 mr-20 ml-20 relative group overflow-hidden">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          spaceBetween={25}
          centeredSlides={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          resistance={true}
          resistanceRatio={0.85}
          modules={[Navigation, Autoplay]}
          breakpoints={{
            640: { slidesPerView: 1 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 5 },
          }}
          pagination={{ clickable: true }}
          className="w-full h-full"
        >
          {projects.map((project, index) => (
            <SwiperSlide
              key={project.id}
              className="flex justify-center items-center h-full"
              onClick={() => handleSlideClick(index)}
            >
              <ProjectCard
                key={project.id}
                name={project.name}
                role={project.role}
                avatar={project.avatar}
                rating={project.rating}
                frameworks={project.frameworks}
                isClicked={selectedProject?.id === project.id}
                onSelect={() => setSelectedProject(project)} backgroundImage={""}              />
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
        <FindMatch projectLink={selectedProject?.link} />
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
