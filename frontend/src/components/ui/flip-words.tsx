"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);

  useEffect(() => {
    // A strict mathematical interval that never drifts and doesn't wait for animations
    const interval = setInterval(() => {
      setCurrentWord((prev) => words[words.indexOf(prev) + 1] || words[0]);
    }, duration);
    
    return () => clearInterval(interval);
  }, [duration, words]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
        exit={{
          opacity: 0,
          y: -20,
        }}
        className={cn(
          "z-10 inline-block relative text-left px-2 transform-gpu",
          className
        )}
        key={currentWord}
      >
        <span className="inline-block whitespace-nowrap">
          {currentWord}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};
