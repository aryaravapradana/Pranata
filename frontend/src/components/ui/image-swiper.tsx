import { cn } from "@/lib/utils";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

interface ImageSwiperProps {
  images: string | string[];
  cardWidth?: number;
  cardHeight?: number;
  className?: string;
  onImageClick?: (
    imageUrl: string,
    index: number,
  ) => void;
}

export const ImageSwiper: React.FC<
  ImageSwiperProps
> = ({
  images,
  cardWidth = 256, // 16rem = 256px
  cardHeight = 352, // 22rem = 352px
  className = "",
  onImageClick,
}) => {
  const cardStackRef =
    useRef<HTMLDivElement>(null);
  const isSwiping = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const animationFrameId = useRef<
    number | null
  >(null);

  const imageList = Array.isArray(images)
    ? images
        .map((img) =>
          typeof img === "string"
            ? img.trim()
            : "",
        )
        .filter(Boolean)
    : typeof images === "string"
      ? images
          .split(",")
          .map((img) => img.trim())
          .filter(Boolean)
      : [];

  const canSwipe = imageList.length > 1;

  const [cardOrder, setCardOrder] = useState<
    number[]
  >(() =>
    Array.from(
      { length: imageList.length },
      (_, i) => i,
    ),
  );

  // Sync cardOrder if imageList changes dynamically (e.g. backend fetch completes)
  useEffect(() => {
    setCardOrder(
      Array.from(
        { length: imageList.length },
        (_, i) => i,
      ),
    );
  }, [images, imageList.length]);

  const getDurationFromCSS = useCallback(
    (
      variableName: string,
      element?: HTMLElement | null,
    ): number => {
      const targetElement =
        element || document.documentElement;
      const value = getComputedStyle(
        targetElement,
      )
        ?.getPropertyValue(variableName)
        ?.trim();
      if (!value) return 0;
      if (value.endsWith("ms"))
        return parseFloat(value);
      if (value.endsWith("s"))
        return parseFloat(value) * 1000;
      return parseFloat(value) || 0;
    },
    [],
  );

  const getCards =
    useCallback((): HTMLElement[] => {
      if (!cardStackRef.current) return [];
      return [
        ...cardStackRef.current.querySelectorAll(
          ".image-card",
        ),
      ] as HTMLElement[];
    }, []);

  const getActiveCard =
    useCallback((): HTMLElement | null => {
      const cards = getCards();
      return cards[0] || null;
    }, [getCards]);

  const updatePositions = useCallback(() => {
    const cards = getCards();
    cards.forEach((card, i) => {
      card.style.setProperty(
        "--i",
        (i + 1).toString(),
      );
      card.style.setProperty(
        "--swipe-x",
        "0px",
      );
      card.style.setProperty(
        "--swipe-rotate",
        "0deg",
      );
      card.style.opacity = "1";
    });
  }, [getCards]);

  const applySwipeStyles = useCallback(
    (deltaX: number) => {
      if (!canSwipe) return;
      const card = getActiveCard();
      if (!card) return;
      card.style.setProperty(
        "--swipe-x",
        `${deltaX}px`,
      );
      card.style.setProperty(
        "--swipe-rotate",
        `${deltaX * 0.2}deg`,
      );
      card.style.opacity = (
        1 -
        Math.min(Math.abs(deltaX) / 100, 1) *
          0.75
      ).toString();
    },
    [getActiveCard, canSwipe],
  );

  const handleStart = useCallback(
    (clientX: number) => {
      if (!canSwipe || isSwiping.current)
        return;
      isSwiping.current = true;
      startX.current = clientX;
      currentX.current = clientX;
      const card = getActiveCard();
      if (card)
        card.style.transition = "none";
    },
    [getActiveCard, canSwipe],
  );

  const handleEnd = useCallback(() => {
    if (!canSwipe || !isSwiping.current)
      return;
    if (animationFrameId.current) {
      cancelAnimationFrame(
        animationFrameId.current,
      );
      animationFrameId.current = null;
    }

    const deltaX =
      currentX.current - startX.current;
    const threshold = 50;
    const duration = getDurationFromCSS(
      "--card-swap-duration",
      cardStackRef.current,
    );
    const card = getActiveCard();

    if (card) {
      card.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

      if (Math.abs(deltaX) > threshold) {
        const direction = Math.sign(deltaX);
        card.style.setProperty(
          "--swipe-x",
          `${direction * 300}px`,
        );
        card.style.setProperty(
          "--swipe-rotate",
          `${direction * 20}deg`,
        );

        setTimeout(() => {
          if (getActiveCard() === card) {
            card.style.setProperty(
              "--swipe-rotate",
              `${-direction * 20}deg`,
            );
          }
        }, duration * 0.5);

        setTimeout(() => {
          setCardOrder((prev) => {
            if (prev.length === 0) return [];
            return [
              ...prev.slice(1),
              prev[0],
            ];
          });
        }, duration);
      } else {
        applySwipeStyles(0);
      }
    }

    isSwiping.current = false;
  }, [
    getDurationFromCSS,
    getActiveCard,
    applySwipeStyles,
    canSwipe,
  ]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!canSwipe || !isSwiping.current)
        return;
      if (animationFrameId.current) {
        cancelAnimationFrame(
          animationFrameId.current,
        );
      }
      animationFrameId.current =
        requestAnimationFrame(() => {
          currentX.current = clientX;
          const deltaX =
            currentX.current -
            startX.current;
          applySwipeStyles(deltaX);

          if (Math.abs(deltaX) > 50) {
            handleEnd();
          }
        });
    },
    [applySwipeStyles, handleEnd, canSwipe],
  );

  useEffect(() => {
    const cardStackElement =
      cardStackRef.current;
    if (!cardStackElement || !canSwipe)
      return;

    const handlePointerDown = (
      e: PointerEvent,
    ) => {
      handleStart(e.clientX);
    };
    const handlePointerMove = (
      e: PointerEvent,
    ) => {
      handleMove(e.clientX);
    };
    const handlePointerUp = (
      e: PointerEvent,
    ) => {
      handleEnd();
    };

    cardStackElement.addEventListener(
      "pointerdown",
      handlePointerDown,
    );
    cardStackElement.addEventListener(
      "pointermove",
      handlePointerMove,
    );
    cardStackElement.addEventListener(
      "pointerup",
      handlePointerUp,
    );

    return () => {
      cardStackElement.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
      cardStackElement.removeEventListener(
        "pointermove",
        handlePointerMove,
      );
      cardStackElement.removeEventListener(
        "pointerup",
        handlePointerUp,
      );
      if (animationFrameId.current) {
        cancelAnimationFrame(
          animationFrameId.current,
        );
      }
    };
  }, [
    handleStart,
    handleMove,
    handleEnd,
    canSwipe,
  ]);

  useEffect(() => {
    if (canSwipe) {
      updatePositions();
    }
  }, [cardOrder, updatePositions, canSwipe]);

  const handleCardClickInternal = (
    imgUrl: string,
    origIdx: number,
  ) => {
    const deltaX = Math.abs(
      currentX.current - startX.current,
    );
    if (
      (!canSwipe || deltaX < 10) &&
      onImageClick
    ) {
      onImageClick(imgUrl, origIdx);
    }
  };

  if (imageList.length === 0) {
    return (
      <div
        className={cn(
          "rounded-3xl bg-white border",
          "border-[#E8E3D2] flex items-center",
          "justify-center shadow-sm",
        )}
        style={{
          width: cardWidth,
          height: cardHeight,
        }}
      >
        <span className="text-xs text-[#5A635B] font-bold">
          Tidak ada foto
        </span>
      </div>
    );
  }

  return (
    <section
      className={`relative grid place-content-center select-none ${className}`}
      ref={cardStackRef}
      style={
        {
          width: cardWidth + 32,
          height: cardHeight + 32,
          touchAction: canSwipe
            ? "none"
            : "auto",
          transformStyle: "preserve-3d",
          "--card-perspective": "700px",
          "--card-z-offset": canSwipe
            ? "12px"
            : "0px",
          "--card-y-offset": canSwipe
            ? "7px"
            : "0px",
          "--card-max-z-index":
            imageList.length.toString(),
          "--card-swap-duration": "0.3s",
        } as React.CSSProperties
      }
    >
      {cardOrder.map(
        (originalIndex, displayIndex) => (
          <article
            key={`${imageList[originalIndex]}-${originalIndex}`}
            onClick={() =>
              handleCardClickInternal(
                imageList[originalIndex],
                originalIndex,
              )
            }
            className={`image-card absolute place-self-center border border-[#E8E3D2] rounded-3xl
                     shadow-lg overflow-hidden bg-white will-change-transform flex items-center justify-center p-0 ${
                       canSwipe
                         ? "cursor-grab active:cursor-grabbing"
                         : "cursor-pointer"
                     }`}
            style={
              {
                "--i": (
                  displayIndex + 1
                ).toString(),
                zIndex:
                  imageList.length -
                  displayIndex,
                width: cardWidth,
                height: cardHeight,
                transform: canSwipe
                  ? `perspective(var(--card-perspective))
                 translateZ(calc(-1 * var(--card-z-offset) * var(--i)))
                 translateY(calc(var(--card-y-offset) * var(--i)))
                 translateX(var(--swipe-x, 0px))
                 rotateY(var(--swipe-rotate, 0deg))`
                  : "none",
              } as React.CSSProperties
            }
          >
            <img
              src={imageList[originalIndex]}
              alt={`Swiper image ${originalIndex + 1}`}
              className={cn(
                "w-full h-full object-cover",
                "object-center scale-[1.08] select-none",
                "pointer-events-none",
              )}
              draggable={false}
            />
          </article>
        ),
      )}
    </section>
  );
};
