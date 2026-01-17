"use client";

import Image from "next/image";
import { useRef } from "react";
import { BestSelective } from "@prisma/client";

function SelectiveCard({
  image,
  title,
  subtitle,
}: {
  image: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-5 min-w-[260px] snap-start transition hover:scale-[1.02] duration-300">
      <div className="rounded-[30px] h-[310px] overflow-hidden shadow-lg relative group bg-[#181818]">
        <img
          src={image}
          className="w-full h-[310px] object-cover"
          alt={title}
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
      </div>
      <div className="flex gap-[14px] items-center">
        <div className="flex shrink-0 w-8 h-8">
          <img
            src="/assets/images/icons/crown-white.svg"
            className="w-8 h-8"
            alt="icon"
          />
        </div>
        <div className="flex flex-col gap-[2px]">
          <p className="font-bold text-lg text-white">{title}</p>
          <p className="text-flysha-off-purple">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

interface BestSelectiveSectionProps {
  selectives: BestSelective[];
}

export default function BestSelectiveSection({
  selectives,
}: BestSelectiveSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fallback data if DB is empty
  const defaultItems = [
    {
      id: "f1",
      title: "First Lounge",
      subtitle: "Manhanggattan",
      image: "/assets/images/thumbnail/thumbnail1.png",
    },
    {
      id: "f2",
      title: "Business First",
      subtitle: "Gulfstream 109-BB",
      image: "/assets/images/thumbnail/thumbnail2.png",
    },
    {
      id: "f3",
      title: "Pickup at Home",
      subtitle: "Bentley Banta",
      image: "/assets/images/thumbnail/thumbnail3.png",
    },
    {
      id: "f4",
      title: "Fly Roam",
      subtitle: "Capung A19-22",
      image: "/assets/images/thumbnail/thumbnail4.png",
    },
    {
      id: "f5",
      title: "Luxury Seat",
      subtitle: "Comfort Max",
      image: "/assets/images/thumbnail/thumbnail2.png",
    },
  ];

  const itemsToRender = [...defaultItems, ...selectives];

  const scroll = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section
      id="Discover"
      className="container max-w-[1130px] mx-auto flex flex-col pt-[100px] gap-[30px] px-4 md:px-0"
    >
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-[32px] leading-[48px] text-center text-white">
          Discover Destinations
        </h2>
        <div className="flex gap-[10px]">
          <button
            onClick={() => scroll(-290)}
            className="flex shrink-0 w-10 h-10 items-center justify-center bg-white rounded-full hover:bg-flysha-light-purple transition-colors group cursor-pointer"
          >
            <img
              src="/assets/images/icons/arrow-right.svg"
              className="rotate-180 group-hover:brightness-0 group-hover:invert duration-200 w-5 h-5"
              alt="prev"
            />
          </button>
          <button
            onClick={() => scroll(290)}
            className="flex shrink-0 w-10 h-10 items-center justify-center bg-white rounded-full hover:bg-flysha-light-purple transition-colors group cursor-pointer"
          >
            <img
              src="/assets/images/icons/arrow-right.svg"
              alt="next"
              className="group-hover:brightness-0 group-hover:invert duration-200 w-5 h-5"
            />
          </button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-[30px] overflow-x-auto pb-8 -mx-4 px-4 snap-x hide-scrollbar scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {itemsToRender.map((item: any) => (
          <SelectiveCard
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            image={item.image}
          />
        ))}
      </div>
    </section>
  );
}
