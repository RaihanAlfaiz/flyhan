"use client";

import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import SearchForm from "./search-form";
import LogoSlider from "./logo-slider";

interface LandingHeroProps {
  navbar: React.ReactNode;
  cities: any[];
}

export default function LandingHero({ navbar, cities }: LandingHeroProps) {
  const ref = useRef(null);

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  const bgX = useSpring(useTransform(mouseX, [-0.5, 0.5], ["-3%", "3%"]), {
    stiffness: 100,
    damping: 30,
  });
  const bgY = useSpring(useTransform(mouseY, [-0.5, 0.5], ["-3%", "3%"]), {
    stiffness: 100,
    damping: 30,
  });

  const textX = useSpring(useTransform(mouseX, [-0.5, 0.5], ["1%", "-1%"]), {
    stiffness: 100,
    damping: 30,
  });
  const textY = useSpring(useTransform(mouseY, [-0.5, 0.5], ["1%", "-1%"]), {
    stiffness: 100,
    damping: 30,
  });

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden min-h-[100vh] bg-[#080318] flex flex-col"
    >
      {/* Animated Background */}
      <motion.div
        style={{ x: bgX, y: bgY, scale: 1.1 }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/assets/images/background/airplane.png"
          alt="Background"
          fill
          className="object-cover object-left-top opacity-60 pointer-events-none"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080318] via-[#080318]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080318]" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col h-full">
        {navbar}

        <div className="container max-w-[1130px] w-full mx-auto flex flex-col gap-[40px] mt-[60px] md:mt-[100px] px-4 md:px-0 flex-1 justify-center">
          <motion.div
            style={{ x: textX, y: textY }}
            initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="title flex flex-col gap-[20px] md:gap-[30px]"
          >
            <h1 className="font-extrabold text-5xl md:text-[80px] leading-tight md:leading-[90px] text-white tracking-tight">
              Best Flights. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-flysha-light-purple to-pink-500 animate-gradient bg-300%">
                Cheaper Budget.
              </span>
            </h1>
            <p className="font-medium text-lg text-gray-300 leading-[36px] max-w-lg">
              No more long queue, get more delicious heavy meals. <br />
              Crafted by skilled people around the world.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <SearchForm cities={cities} />
          </motion.div>

          <div className="mt-8">
            <LogoSlider />
          </div>
        </div>
      </div>
    </section>
  );
}
