"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function GlobalRope() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<SVGPathElement>(null)
  const outlineRef = useRef<SVGPathElement>(null)
  const [svgHeight, setSvgHeight] = useState(0)
  const [svgWidth, setSvgWidth] = useState(0)
  const [strokeW, setStrokeW] = useState(120)
  const [isMobile, setIsMobile] = useState(false)

  // Dynamic Path Builder that intersects the anchors in a straight line
  const buildRopePath = (anchors: {x: number, y: number}[], totalWidth: number) => {
    if (!anchors || anchors.length < 2) return "";

    const midX = totalWidth / 2;
    let d = `M ${midX},${anchors[0].y}`;

    for (let i = 1; i < anchors.length; i++) {
      d += ` L ${midX},${anchors[i].y}`;
    }

    return d;
  };

  const updateRopeAndAnimation = useCallback(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;
    const wrapper = document.querySelector('.features-rope-container') as HTMLElement;
    if (!wrapper) return; 
    
    const wrapperRect = wrapper.getBoundingClientRect();
    const totalHeight = wrapper.scrollHeight;
    const totalWidth = wrapperRect.width; 
    const mobile = window.innerWidth < 768;

    setIsMobile(mobile);
    setSvgHeight(totalHeight);
    setSvgWidth(totalWidth);

    const anchors = document.querySelectorAll('[data-rope-anchor]');
    if (anchors.length < 2) return;

    const wrapperPageTop = wrapperRect.top + window.scrollY;
    
    const rawAnchors = Array.from(anchors).map(anchor => {
         const rect = anchor.getBoundingClientRect();
         return {
             x: (rect.left + rect.width / 2) - wrapperRect.left,
             y: (rect.top + rect.height / 2 + window.scrollY) - wrapperPageTop
         };
    });

    setStrokeW(mobile ? 20 : 120);

    // Ensure they are ordered top-to-bottom
    rawAnchors.sort((a, b) => a.y - b.y);
    
    // Generate the static fully-extended path
    const d = buildRopePath(rawAnchors, totalWidth);
    pathEl.setAttribute('d', d);
    if (glowRef.current) glowRef.current.setAttribute('d', d);
    if (outlineRef.current) outlineRef.current.setAttribute('d', d);

    // Fully extend stroke natively without dashoffset animation
    pathEl.style.strokeDasharray = "none";
    pathEl.style.strokeDashoffset = "0";
    if (glowRef.current) {
      glowRef.current.style.strokeDasharray = "none";
      glowRef.current.style.strokeDashoffset = "0";
    }
    if (outlineRef.current) {
      outlineRef.current.style.strokeDasharray = "none";
      outlineRef.current.style.strokeDashoffset = "0";
    }

    if (containerRef.current) {
      containerRef.current.style.opacity = "1";
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let isScheduled = false;
    const scheduleUpdate = () => {
      if (isScheduled) return;
      isScheduled = true;
      requestAnimationFrame(() => {
        updateRopeAndAnimation();
        isScheduled = false;
      });
    };

    if (document.readyState === 'complete') {
        setTimeout(scheduleUpdate, 0);
    } else {
        window.addEventListener('load', scheduleUpdate);
    }

    scheduleUpdate();
    const timer = setTimeout(scheduleUpdate, 500);

    const wrapper = document.querySelector('.features-rope-container') as HTMLElement;
    let resizeObserver: ResizeObserver | null = null;
    
    if (wrapper) {
      resizeObserver = new ResizeObserver(() => {
        scheduleUpdate();
      });
      resizeObserver.observe(wrapper);
    }

    window.addEventListener('resize', scheduleUpdate, { passive: true });
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', scheduleUpdate);
      if (resizeObserver && wrapper) resizeObserver.disconnect();
    };
  }, [updateRopeAndAnimation]);

  return (
    <div 
        ref={containerRef}
        className="absolute top-0 left-0 w-full pointer-events-none opacity-100 transform-gpu"
        style={{ zIndex: 10, height: `${svgHeight}px`, transform: 'translateZ(0)' }}
    >
        <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            className="absolute top-0 left-0 w-full overflow-visible pointer-events-none transform-gpu"
            style={{ height: `${svgHeight}px`, zIndex: 50, transform: 'translateZ(0)' }}
        >
            <defs>
                <linearGradient id="rope-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={svgHeight}>
                    <stop stopColor="#B4C179"/>
                    <stop offset="1" stopColor="#2B4C3B"/>
                </linearGradient>
            </defs>

            {/* Glow behind the rope - Omitted on mobile for 60 FPS performance */}
            {!isMobile && (
              <path
                ref={glowRef}
                d=""
                fill="none"
                stroke="#B4C179"
                strokeWidth={strokeW * 1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-20 blur-xl hidden sm:block"
                style={{ willChange: "stroke-dashoffset" }}
              />
            )}
            
            {/* White outline path */}
            <path 
                ref={outlineRef}
                d=""
                fill="none" 
                stroke="#FFFFFF" 
                strokeWidth={strokeW + (isMobile ? 6 : 16)}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ willChange: "stroke-dashoffset" }}
            />

            {/* Main gradient rope */}
            <path 
                ref={pathRef}
                fill="none" 
                stroke="url(#rope-gradient)" 
                strokeWidth={strokeW}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isMobile ? "" : "drop-shadow-2xl"}
                style={{
                  willChange: 'stroke-dashoffset'
                }}
            />
        </svg>
    </div>
  )
}
