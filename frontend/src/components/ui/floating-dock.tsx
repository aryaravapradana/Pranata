"use client";
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import { useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
  }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop
        items={items}
        className={desktopClassName}
      />
      <FloatingDockMobile
        items={items}
        className={mobileClassName}
      />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
  }[];
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-white/80 backdrop-blur-3xl backdrop-saturate-150 border-t border-white/80 pb-safe shadow-[0_-15px_40px_rgba(14,165,233,0.15)]",
        className,
      )}
    >
      <div className="flex items-center justify-around p-2">
        {items.map((item) => (
          <a
            href={item.href}
            key={item.title}
            className={cn(
              "relative p-2 flex",
              "flex-col items-center gap-1",
              "w-16 group",
            )}
          >
            <div
              className={cn(
                "h-6 w-6 text-slate-500",
                "group-hover:text-sky-500 transition-colors",
              )}
            >
              {item.icon}
            </div>
            <span
              className={cn(
                "text-[10px] font-bold text-slate-500",
                "group-hover:text-sky-600 transition-colors line-clamp-1",
                "text-center",
              )}
            >
              {item.title}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
  }[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) =>
        mouseX.set(e.pageX)
      }
      onMouseLeave={() =>
        mouseX.set(Infinity)
      }
      className={cn(
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-white/60 backdrop-blur-3xl backdrop-saturate-150 border border-white/80 shadow-[0_25px_50px_-12px_rgba(14,165,233,0.4),0_0_20px_rgba(255,255,255,0.8)_inset] px-4 pb-3 md:flex",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer
          mouseX={mouseX}
          key={item.title}
          {...item}
        />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(
    mouseX,
    (val) => {
      const bounds =
        ref.current?.getBoundingClientRect() ?? {
          x: 0,
          width: 0,
        };

      return (
        val - bounds.x - bounds.width / 2
      );
    },
  );

  const widthTransform = useTransform(
    distance,
    [-150, 0, 150],
    [40, 80, 40],
  );
  const heightTransform = useTransform(
    distance,
    [-150, 0, 150],
    [40, 80, 40],
  );

  const widthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  );
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  );

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(
    widthTransformIcon,
    {
      mass: 0.1,
      stiffness: 150,
      damping: 12,
    },
  );
  const heightIcon = useSpring(
    heightTransformIcon,
    {
      mass: 0.1,
      stiffness: 150,
      damping: 12,
    },
  );

  const [hovered, setHovered] =
    useState(false);

  return (
    <a href={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() =>
          setHovered(false)
        }
        className={cn(
          "relative flex aspect-square",
          "items-center justify-center rounded-full",
          "bg-white/80 border border-slate-100",
          "shadow-sm",
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
                x: "-50%",
              }}
              animate={{
                opacity: 1,
                y: 0,
                x: "-50%",
              }}
              exit={{
                opacity: 0,
                y: 2,
                x: "-50%",
              }}
              className={cn(
                "absolute -top-8 left-1/2",
                "w-fit rounded-md border",
                "border-slate-200 bg-white px-3",
                "py-1 text-xs font-bold",
                "whitespace-pre text-slate-700 shadow-sm",
              )}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{
            width: widthIcon,
            height: heightIcon,
          }}
          className="flex items-center justify-center text-slate-600"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}
