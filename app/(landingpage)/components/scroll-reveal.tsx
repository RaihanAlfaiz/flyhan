"use client";

import { motion, useInView, useAnimation, Variant } from "framer-motion";
import { useEffect, useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export default function ScrollReveal({
  children,
  width = "fit-content",
  delay = 0,
  direction = "up",
  className = "",
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 75 : direction === "down" ? -75 : 0,
      x: direction === "left" ? 75 : direction === "right" ? -75 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.5, delay: delay, ease: "easeOut" },
    },
  };

  return (
    <div
      ref={ref}
      style={{ position: "relative", width, overflow: "hidden" }}
      className={className}
    >
      <motion.div
        variants={variants}
        initial="hidden"
        animate={mainControls}
        style={{ width: "100%" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
