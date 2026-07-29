"use client";
import React from "react";
import {
  motion,
  Variants,
} from "framer-motion";

export function AnimatedLogomark({
  className,
}: {
  className?: string;
}) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const pathVariants: Variants = {
    hidden: {
      opacity: 0,
      pathLength: 0,
      scale: 0.8,
    },
    show: {
      opacity: 1,
      pathLength: 1,
      scale: 1,
      transition: {
        duration: 2,
        ease: [1.0, 0.05, 0.15, 1],
      },
    },
  };

  const fillVariants: Variants = {
    hidden: { fillOpacity: 0 },
    show: {
      fillOpacity: 1,
      transition: {
        delay: 1.5,
        duration: 1,
        ease: [1.0, 0.05, 0.15, 1],
      },
    },
  };

  return (
    <motion.svg
      width="875"
      height="994"
      viewBox="0 0 875 994"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      <motion.path
        variants={pathVariants}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M493.798 113.5L559.334 0L745.129 107.287L679.618 220.762C668.112 240.669 685.334 264.875 707.9 260.526L833.454 236.295L874.087 446.967L748.534 471.173C545.441 510.34 390.388 292.635 493.798 113.5Z"
        stroke="#FB9502"
        strokeWidth="4"
      />
      <motion.path
        variants={fillVariants}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M493.798 113.5L559.334 0L745.129 107.287L679.618 220.762C668.112 240.669 685.334 264.875 707.9 260.526L833.454 236.295L874.087 446.967L748.534 471.173C545.441 510.34 390.388 292.635 493.798 113.5Z"
        fill="#FB9502"
      />

      <motion.path
        variants={pathVariants}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M380.289 880.503L314.753 994.003L128.933 886.741L194.469 773.241C205.975 753.335 188.753 729.129 166.162 733.478L40.6334 757.684L0 547.036L125.553 522.83C328.646 483.663 483.674 701.369 380.289 880.503Z"
        stroke="#657105"
        strokeWidth="4"
      />
      <motion.path
        variants={fillVariants}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M380.289 880.503L314.753 994.003L128.933 886.741L194.469 773.241C205.975 753.335 188.753 729.129 166.162 733.478L40.6334 757.684L0 547.036L125.553 522.83C328.646 483.663 483.674 701.369 380.289 880.503Z"
        fill="#657105"
      />

      <motion.path
        variants={pathVariants}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M488.354 880.503L553.839 994.003L739.659 886.741L674.124 773.241C662.642 753.335 679.84 729.129 702.431 733.478L827.959 757.684L868.593 547.036L743.039 522.83C539.947 483.663 384.919 701.369 488.304 880.503H488.354Z"
        stroke="#B6BD77"
        strokeWidth="4"
      />
      <motion.path
        variants={fillVariants}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M488.354 880.503L553.839 994.003L739.659 886.741L674.124 773.241C662.642 753.335 679.84 729.129 702.431 733.478L827.959 757.684L868.593 547.036L743.039 522.83C539.947 483.663 384.919 701.369 488.304 880.503H488.354Z"
        fill="#B6BD77"
      />

      <motion.path
        variants={pathVariants}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M385.962 113.5L320.452 0L134.631 107.287L200.166 220.762C211.648 240.669 194.45 264.875 171.86 260.526L46.3063 236.295L5.72266 446.967L131.251 471.173C334.369 510.34 489.422 292.635 385.987 113.5H385.962Z"
        stroke="#C35230"
        strokeWidth="4"
      />
      <motion.path
        variants={fillVariants}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M385.962 113.5L320.452 0L134.631 107.287L200.166 220.762C211.648 240.669 194.45 264.875 171.86 260.526L46.3063 236.295L5.72266 446.967L131.251 471.173C334.369 510.34 489.422 292.635 385.987 113.5H385.962Z"
        fill="#C35230"
      />
    </motion.svg>
  );
}
