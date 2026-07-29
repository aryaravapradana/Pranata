"use client";
import { cn } from "@/lib/utils";

import {
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive(
      (prev) =>
        (prev + 1) % testimonials.length,
    );
  };

  const handlePrev = () => {
    setActive(
      (prev) =>
        (prev - 1 + testimonials.length) %
        testimonials.length,
    );
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(() => {
        handleNext();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  // Deterministic rotations to prevent Next.js hydration errors caused by Math.random()
  const rotations = [
    -7, 5, -3, 8, -5, 4, -9, 6, -2, 7,
  ];
  const getRotation = (index: number) => {
    return rotations[
      index % rotations.length
    ];
  };

  return (
    <div
      className={cn(
        "mx-auto max-w-sm px-4",
        "py-20 font-sans antialiased",
        "md:max-w-4xl md:px-8 lg:px-12",
      )}
    >
      <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonials.map(
                (testimonial, index) => (
                  <motion.div
                    key={testimonial.src}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                      z: -100,
                      rotate:
                        getRotation(index),
                    }}
                    animate={{
                      opacity: isActive(
                        index,
                      )
                        ? 1
                        : 0.7,
                      scale: isActive(index)
                        ? 1
                        : 0.95,
                      z: isActive(index)
                        ? 0
                        : -100,
                      rotate: isActive(index)
                        ? 0
                        : getRotation(index),
                      zIndex: isActive(index)
                        ? 40
                        : testimonials.length +
                          2 -
                          index,
                      y: isActive(index)
                        ? [0, -80, 0]
                        : 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      z: 100,
                      rotate:
                        getRotation(index),
                    }}
                    transition={{
                      duration: 0.4,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 origin-bottom"
                  >
                    <img
                      src={testimonial.src}
                      alt={testimonial.name}
                      width={500}
                      height={500}
                      draggable={false}
                      className={cn(
                        "h-full w-full rounded-3xl",
                        "object-cover object-center",
                      )}
                      loading="lazy"
                      decoding="async"
                    />
                  </motion.div>
                ),
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-col justify-between py-4">
          <motion.div
            key={active}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            <h3 className="text-2xl font-bold text-slate-800">
              {testimonials[active].name}
            </h3>
            <p className="text-sm text-slate-500">
              {
                testimonials[active]
                  .designation
              }
            </p>
            <motion.p
              className={cn(
                "mt-8 text-lg sm:text-xl",
                "font-rustic text-slate-700",
              )}
              style={{
                fontFamily:
                  "'Rustic Delight', serif",
              }}
            >
              {testimonials[active].quote
                .split(" ")
                .map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{
                      filter: "blur(10px)",
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                      delay: 0.02 * index,
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
            </motion.p>
          </motion.div>
          <div className="flex gap-4 pt-12 md:pt-0">
            <button
              onClick={handlePrev}
              className={cn(
                "group/button flex h-10",
                "w-10 items-center justify-center",
                "rounded-full bg-slate-100 hover:bg-slate-200",
                "transition-colors",
              )}
            >
              <IconArrowLeft
                className={cn(
                  "h-5 w-5 text-slate-800",
                  "transition-transform duration-300 group-hover/button:rotate-12",
                )}
              />
            </button>
            <button
              onClick={handleNext}
              className={cn(
                "group/button flex h-10",
                "w-10 items-center justify-center",
                "rounded-full bg-slate-100 hover:bg-slate-200",
                "transition-colors",
              )}
            >
              <IconArrowRight
                className={cn(
                  "h-5 w-5 text-slate-800",
                  "transition-transform duration-300 group-hover/button:-rotate-12",
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
