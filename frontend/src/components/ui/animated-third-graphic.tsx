"use client";
import { cn } from "@/lib/utils";

import React, { useId } from "react";
import {
  motion,
  Variants,
} from "framer-motion";

export function AnimatedThirdGraphic() {
  const id = useId();
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.05,
      },
    },
  };

  const item: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <motion.svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.1 }}
      className={cn(
        "w-full h-full max-w-sm",
        "mx-auto drop-shadow-xl hover:scale-105",
        "transition-transform duration-700 overflow-visible",
        "px-4 md:px-8 lg:px-12",
      )}
    >
      <g clipPath={`url(#clip0_${id})`}>
        <motion.path
          variants={item}
          d="M60.9613 404.391H71.901C77.2319 404.391 81.5537 400.069 81.5537 394.739C81.5537 389.408 77.2319 385.086 71.901 385.086H60.9613C55.6305 385.086 51.3086 389.408 51.3086 394.739C51.3086 400.069 55.6305 404.391 60.9613 404.391Z"
          fill="#FFFFFF"
        />
        <motion.path
          variants={item}
          d="M60.9613 438.524H71.901C77.2319 438.524 81.5537 434.202 81.5537 428.871C81.5537 423.541 77.2319 419.219 71.901 419.219H60.9613C55.6305 419.219 51.3086 423.541 51.3086 428.871C51.3086 434.202 55.6305 438.524 60.9613 438.524Z"
          fill="#FFFFFF"
        />
        <motion.path
          variants={item}
          d="M60.9613 472.657H71.901C77.2319 472.657 81.5537 468.335 81.5537 463.004C81.5537 457.673 77.2319 453.352 71.901 453.352H60.9613C55.6305 453.352 51.3086 457.673 51.3086 463.004C51.3086 468.335 55.6305 472.657 60.9613 472.657Z"
          fill="#FFFFFF"
        />
        <motion.path
          variants={item}
          d="M115.725 0H9.65271C4.32188 0 0 4.32188 0 9.65271C0 14.9835 4.32188 19.3054 9.65271 19.3054H115.724C121.055 19.3054 125.377 14.9835 125.377 9.65271C125.378 4.32188 121.056 0 115.725 0Z"
          fill="#FFFFFF"
        />
        <motion.path
          variants={item}
          d="M76.9857 44.559C76.9857 39.2281 72.6638 34.9062 67.333 34.9062H9.65271C4.32188 34.9062 0 39.2281 0 44.559C0 49.8908 4.32188 54.2117 9.65271 54.2117H67.332C72.6638 54.2117 76.9857 49.8908 76.9857 44.559Z"
          fill="#FFFFFF"
        />
        <motion.path
          variants={item}
          d="M502.346 457.789H396.274C390.942 457.789 386.621 462.111 386.621 467.442C386.621 472.773 390.943 477.094 396.274 477.094H502.345C507.676 477.094 511.998 472.773 511.998 467.442C511.999 462.111 507.677 457.789 502.346 457.789Z"
          fill="#FFFFFF"
        />
        <motion.path
          variants={item}
          d="M463.606 502.348C463.606 497.017 459.284 492.695 453.953 492.695H396.274C390.942 492.695 386.621 497.017 386.621 502.348C386.621 507.68 390.943 512.001 396.274 512.001H453.953C459.284 512.001 463.606 507.679 463.606 502.348Z"
          fill="#FFFFFF"
        />
        <motion.path
          variants={item}
          d="M396.274 93.3835H502.345C507.676 93.3835 511.998 89.0617 511.998 83.7308C511.998 78.4 507.676 74.0781 502.345 74.0781H396.274C390.943 74.0781 386.621 78.4 386.621 83.7308C386.621 89.0617 390.943 93.3835 396.274 93.3835Z"
          fill="#FFFFFF"
        />
        <motion.path
          variants={item}
          d="M435.012 48.8246C435.012 54.1554 439.334 58.4773 444.664 58.4773H502.344C507.675 58.4773 511.996 54.1554 511.996 48.8246C511.996 43.4928 507.675 39.1719 502.344 39.1719H444.664C439.334 39.1709 435.012 43.4928 435.012 48.8246Z"
          fill="#FFFFFF"
        />
        <motion.path
          variants={item}
          d="M268.16 255.812L388.367 376.019C419.13 345.256 438.157 302.756 438.157 255.812H268.16Z"
          fill="#3B82F6"
        />
        <motion.path
          variants={item}
          d="M268.16 255.812L388.367 376.019C419.13 345.256 438.157 302.756 438.157 255.812H268.16Z"
          fill="#3B82F6"
        />
        <motion.path
          variants={item}
          d="M268.16 72.4422V255.806H451.524C456.737 255.806 460.936 251.462 460.682 246.256C455.859 147.401 376.566 68.1082 277.71 63.2844C272.504 63.0304 268.16 67.2298 268.16 72.4422Z"
          fill="#3B82F6"
        />
        <motion.path
          variants={item}
          d="M342.183 77.7891L301.652 118.319L439.14 255.807H451.526C456.738 255.807 460.938 251.463 460.684 246.257C456.97 170.154 409.115 105.652 342.183 77.7891Z"
          fill="#22C55E"
        />
        <motion.path
          variants={item}
          d="M268.16 255.806H451.524C456.737 255.806 460.936 251.462 460.682 246.256C458.982 211.4 448.013 178.983 430.202 151.398H268.16V255.806Z"
          fill="#22C55E"
        />
        <motion.path
          variants={item}
          d="M332.411 74.0324C315.17 67.9376 296.808 64.216 277.71 63.2844C272.504 63.0304 268.16 67.2298 268.16 72.4422V255.806H332.411V74.0324Z"
          fill="#22C55E"
        />
        <motion.path
          variants={item}
          d="M398.398 429.195C361.228 457.162 314.778 473.455 264.497 472.625C145.301 470.659 49.6156 371.818 51.3353 252.619C52.9767 138.808 142.305 46.2133 254.784 39.3675C262.03 38.9268 268.159 44.6712 268.159 51.9306V255.809L401.079 388.728C412.604 400.253 411.422 419.396 398.398 429.195Z"
          fill="#EF4444"
        />
        <motion.path
          variants={item}
          d="M268.159 255.812V215.455L173.931 121.227H98.1291C69.433 157.43 52.0501 203.008 51.3353 252.622C50.9097 282.101 56.4503 310.331 66.8228 336.162H348.51L268.159 255.812Z"
          fill="#EF4444"
        />
        <motion.path
          variants={item}
          d="M264.497 472.629C314.777 473.459 361.228 457.166 398.397 429.2C411.421 419.401 412.602 400.258 401.077 388.733L268.158 255.812H51.3281C51.3462 373.579 146.366 470.68 264.497 472.629Z"
          fill="#EF4444"
        />
        <motion.path
          variants={item}
          d="M167.824 133.009H61.4918C41.6703 133.009 25.6016 116.94 25.6016 97.1186V76.2872C25.6016 72.129 28.9727 68.7578 33.131 68.7578C37.2892 68.7578 40.6604 72.129 40.6604 76.2872V97.1186C40.6604 108.624 49.9868 117.95 61.4918 117.95H167.824C171.982 117.95 175.354 121.321 175.354 125.479C175.354 129.638 171.982 133.009 167.824 133.009Z"
          fill="#FFFFFF"
        />
        <motion.path
          variants={item}
          d="M474.668 451.201C478.826 451.201 482.197 447.83 482.197 443.671V392.128C482.197 379.46 477.263 367.552 468.306 358.595L415.596 305.885C412.656 302.945 407.888 302.945 404.948 305.885C402.007 308.826 402.007 313.593 404.948 316.534L457.657 369.244C463.77 375.356 467.136 383.484 467.137 392.129V443.671C467.138 447.831 470.51 451.202 474.668 451.201Z"
          fill="#FFFFFF"
        />
        <motion.path
          variants={item}
          d="M421.144 48.5997C421.144 44.4415 417.772 41.0703 413.614 41.0703H387.89C375.222 41.0703 363.314 46.0046 354.357 54.9616L301.647 107.671C298.706 110.612 298.706 115.38 301.647 118.32C304.587 121.261 309.355 121.261 312.295 118.32L365.005 65.6102C371.118 59.4973 379.246 56.1311 387.891 56.1301H413.614C417.772 56.1291 421.144 52.758 421.144 48.5997Z"
          fill="#FFFFFF"
        />
      </g>
      <defs>
        <linearGradient
          id={`paint0_linear_${id}`}
          x1="51.3086"
          y1="394.739"
          x2="81.5537"
          y2="394.739"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FD8087" />
          <stop
            offset="1"
            stopColor="#FD3E2B"
          />
        </linearGradient>
        <linearGradient
          id={`paint1_linear_${id}`}
          x1="51.3086"
          y1="428.871"
          x2="81.5537"
          y2="428.871"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5990D" />
          <stop
            offset="1"
            stopColor="#C25939"
          />
        </linearGradient>
        <linearGradient
          id={`paint2_linear_${id}`}
          x1="51.3086"
          y1="463.004"
          x2="81.5537"
          y2="463.004"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0ea5e9" />
          <stop
            offset="1"
            stopColor="#B4C179"
          />
        </linearGradient>
        <linearGradient
          id={`paint3_linear_${id}`}
          x1="353.158"
          y1="243.622"
          x2="353.158"
          y2="354.724"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0ea5e9" />
          <stop
            offset="1"
            stopColor="#B4C179"
          />
        </linearGradient>
        <linearGradient
          id={`paint4_linear_${id}`}
          x1="353.158"
          y1="305.507"
          x2="353.158"
          y2="258.319"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            stopColor="#DC8758"
            stopOpacity="0"
          />
          <stop
            offset="0.2153"
            stopColor="#DD8654"
            stopOpacity="0.215"
          />
          <stop
            offset="0.4291"
            stopColor="#E28448"
            stopOpacity="0.429"
          />
          <stop
            offset="0.6424"
            stopColor="#EA8034"
            stopOpacity="0.642"
          />
          <stop
            offset="0.8542"
            stopColor="#F47B18"
            stopOpacity="0.854"
          />
          <stop
            offset="1"
            stopColor="#FE7701"
          />
        </linearGradient>
        <linearGradient
          id={`paint5_linear_${id}`}
          x1="305.396"
          y1="137.517"
          x2="362.619"
          y2="223.855"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5990D" />
          <stop
            offset="1"
            stopColor="#C25939"
          />
        </linearGradient>
        <linearGradient
          id={`paint6_linear_${id}`}
          x1="369.305"
          y1="135.168"
          x2="313.309"
          y2="79.1725"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            stopColor="#32452C"
            stopOpacity="0"
          />
          <stop
            offset="1"
            stopColor="#32452C"
          />
        </linearGradient>
        <linearGradient
          id={`paint7_linear_${id}`}
          x1="364.426"
          y1="221.673"
          x2="364.426"
          y2="267.951"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            stopColor="#32452C"
            stopOpacity="0"
          />
          <stop
            offset="1"
            stopColor="#32452C"
          />
        </linearGradient>
        <linearGradient
          id={`paint8_linear_${id}`}
          x1="300.286"
          y1="159.539"
          x2="258.929"
          y2="159.539"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            stopColor="#32452C"
            stopOpacity="0"
          />
          <stop
            offset="1"
            stopColor="#32452C"
          />
        </linearGradient>
        <linearGradient
          id={`paint9_linear_${id}`}
          x1="123.57"
          y1="159.878"
          x2="350.072"
          y2="386.38"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FD8087" />
          <stop
            offset="1"
            stopColor="#FD3E2B"
          />
        </linearGradient>
        <linearGradient
          id={`paint10_linear_${id}`}
          x1="154.556"
          y1="203.66"
          x2="99.5376"
          y2="66.4004"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            stopColor="#E41F2D"
            stopOpacity="0"
          />
          <stop
            offset="0.3461"
            stopColor="#DE1E2B"
            stopOpacity="0.346"
          />
          <stop
            offset="0.8036"
            stopColor="#CE1B28"
            stopOpacity="0.804"
          />
          <stop
            offset="1"
            stopColor="#C41926"
          />
        </linearGradient>
        <linearGradient
          id={`paint11_linear_${id}`}
          x1="230.165"
          y1="357.863"
          x2="230.165"
          y2="464.786"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            stopColor="#E41F2D"
            stopOpacity="0"
          />
          <stop
            offset="0.3461"
            stopColor="#DE1E2B"
            stopOpacity="0.346"
          />
          <stop
            offset="0.8036"
            stopColor="#CE1B28"
            stopOpacity="0.804"
          />
          <stop
            offset="1"
            stopColor="#C41926"
          />
        </linearGradient>
        <linearGradient
          id={`paint12_linear_${id}`}
          x1="100.477"
          y1="115.782"
          x2="100.477"
          y2="139.886"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B4C179" />
          <stop
            offset="1"
            stopColor="#767C15"
          />
        </linearGradient>
        <linearGradient
          id={`paint13_linear_${id}`}
          x1="471.404"
          y1="356.016"
          x2="450.568"
          y2="371.475"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B4C179" />
          <stop
            offset="1"
            stopColor="#767C15"
          />
        </linearGradient>
        <linearGradient
          id={`paint14_linear_${id}`}
          x1="340.28"
          y1="60.7843"
          x2="370.232"
          y2="90.7353"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B4C179" />
          <stop
            offset="1"
            stopColor="#767C15"
          />
        </linearGradient>
        <clipPath id={`clip0_${id}`}>
          <rect
            width="512"
            height="512"
            fill="white"
          />
        </clipPath>
      </defs>
    </motion.svg>
  );
}
