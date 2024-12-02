import React from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

export function ProjectDescription({ isOpen, onClose, project }) {
  const { name, role, avatar, frameworks, images } = project;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Panel className="relative bg-gray-900 rounded-lg p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex gap-4">
            <img src={avatar} alt={name} className="w-12 h-12 rounded-full" />
            <div>
              <h2 className="text-lg font-bold text-white">{name}</h2>
              <p className="text-sm text-gray-400">{role}</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-bold text-gray-300">Frameworks:</h3>
            <ul className="list-none p-0 mt-2">
              {frameworks.map((fw, idx) => (
                <li key={idx} className="text-sm text-gray-400">
                  <a href={fw.url} target="_blank" rel="noopener noreferrer">
                    {fw.asset}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-bold text-gray-300">Project Images:</h3>
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={50}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              className="mt-4"
            >
              {images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img src={img} alt={`Project ${idx}`} className="rounded-lg" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
