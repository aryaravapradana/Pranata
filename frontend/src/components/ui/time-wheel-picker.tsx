"use client";
import * as React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export interface TimeWheelPickerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  value?: string; // "HH:MM" e.g. "08:30"
  onChange: (time: string) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  stepMinute?: number;
}

const ITEM_HEIGHT = 38;
const VISIBLE_ITEMS = 5;

const sizeConfig = {
  sm: {
    height:
      ITEM_HEIGHT * VISIBLE_ITEMS * 0.8,
    itemHeight: ITEM_HEIGHT * 0.8,
    fontSize: "text-xs sm:text-sm",
    gap: "gap-2",
  },
  md: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    itemHeight: ITEM_HEIGHT,
    fontSize: "text-base",
    gap: "gap-4",
  },
  lg: {
    height:
      ITEM_HEIGHT * VISIBLE_ITEMS * 1.2,
    itemHeight: ITEM_HEIGHT * 1.2,
    fontSize: "text-lg",
    gap: "gap-6",
  },
};

interface WheelItemProps {
  item: string;
  index: number;
  y: MotionValue<number>;
  itemHeight: number;
  visibleItems: number;
  isSelected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function WheelItem({
  item,
  index,
  y,
  itemHeight,
  visibleItems,
  isSelected,
  disabled,
  onClick,
}: WheelItemProps) {
  // Relative position to the center highlight bar
  const itemY = useTransform(
    y,
    (latest) => index * itemHeight + latest,
  );

  const rotateX = useTransform(
    itemY,
    [-itemHeight * 2, 0, itemHeight * 2],
    [40, 0, -40],
  );

  const scale = useTransform(
    itemY,
    [-itemHeight * 2, 0, itemHeight * 2],
    [0.85, 1.05, 0.85],
  );

  const opacity = useTransform(
    itemY,
    [
      -itemHeight * 2,
      -itemHeight,
      0,
      itemHeight,
      itemHeight * 2,
    ],
    [0.3, 0.65, 1, 0.65, 0.3],
  );

  return (
    <motion.div
      style={{
        height: itemHeight,
        rotateX,
        scale,
        opacity,
      }}
      onClick={
        disabled ? undefined : onClick
      }
      className={cn(
        "flex items-center justify-center font-bold cursor-pointer select-none transition-colors duration-150 rounded-xl px-2 relative z-10",
        isSelected
          ? "text-white font-black drop-shadow-sm"
          : "text-[#5A635B] hover:text-[#1C241E]",
        disabled &&
          "opacity-30 cursor-not-allowed",
      )}
    >
      {item}
    </motion.div>
  );
}

interface ColumnProps {
  items: string[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  itemHeight: number;
  height: number;
  fontSize: string;
  disabled?: boolean;
  label?: string;
}

function Column({
  items,
  selectedIndex,
  onSelectIndex,
  itemHeight,
  height,
  fontSize,
  disabled,
  label,
}: ColumnProps) {
  const y = useMotionValue(
    -selectedIndex * itemHeight,
  );
  const isDragging = React.useRef(false);

  const centerOffset =
    height / 2 - itemHeight / 2;

  React.useEffect(() => {
    if (!isDragging.current) {
      animate(
        y,
        -selectedIndex * itemHeight,
        {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      );
    }
  }, [selectedIndex, itemHeight, y]);

  const snapToClosest = React.useCallback(
    (currentY: number) => {
      const targetIndex = Math.round(
        -currentY / itemHeight,
      );
      const clampedIndex = Math.max(
        0,
        Math.min(
          items.length - 1,
          targetIndex,
        ),
      );
      onSelectIndex(clampedIndex);
      animate(
        y,
        -clampedIndex * itemHeight,
        {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      );
    },
    [
      itemHeight,
      items.length,
      onSelectIndex,
      y,
    ],
  );

  return (
    <div className="flex flex-col items-center flex-1 min-w-[65px]">
      {label && (
        <span
          className={cn(
            "text-[10px] font-black uppercase",
            "text-[#7A8678] tracking-widest mb-1.5",
            "select-none",
          )}
        >
          {label}
        </span>
      )}
      <div
        style={{ height }}
        className={cn(
          "relative w-full overflow-hidden touch-none cursor-grab active:cursor-grabbing rounded-2xl bg-[#F8F6F0]/80 border border-[#E8E3D2]/60",
          fontSize,
          disabled &&
            "pointer-events-none opacity-50",
        )}
      >
        {/* Selection Glass Bar Highlight */}
        <div
          style={{
            top: centerOffset,
            height: itemHeight,
          }}
          className={cn(
            "absolute inset-x-1 rounded-xl",
            "bg-[#2B4C3B] shadow-md shadow-[#2B4C3B]/20",
            "pointer-events-none z-0",
          )}
        />

        {/* Scroll Container with exact centerOffset padding */}
        <motion.div
          drag="y"
          dragConstraints={{
            top:
              -(items.length - 1) *
              itemHeight,
            bottom: 0,
          }}
          dragElastic={0.15}
          style={{
            y,
            paddingTop: centerOffset,
            paddingBottom: centerOffset,
          }}
          onDragStart={() => {
            isDragging.current = true;
          }}
          onDragEnd={(_, info) => {
            isDragging.current = false;
            const currentY =
              y.get() +
              info.velocity.y * 0.15;
            snapToClosest(currentY);
          }}
          className="relative z-10"
        >
          {items.map((item, idx) => (
            <WheelItem
              key={idx}
              item={item}
              index={idx}
              y={y}
              itemHeight={itemHeight}
              visibleItems={VISIBLE_ITEMS}
              isSelected={
                selectedIndex === idx
              }
              disabled={disabled}
              onClick={() => {
                onSelectIndex(idx);
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

const TimeWheelPicker = React.forwardRef<
  HTMLDivElement,
  TimeWheelPickerProps
>(
  (
    {
      value = "08:00",
      onChange,
      size = "md",
      disabled = false,
      stepMinute = 5,
      className,
      ...props
    },
    ref,
  ) => {
    const hours = React.useMemo(
      () =>
        Array.from({ length: 24 }, (_, i) =>
          String(i).padStart(2, "0"),
        ),
      [],
    );

    const minutes = React.useMemo(() => {
      const step = Math.max(
        1,
        Math.min(30, stepMinute),
      );
      const arr: string[] = [];
      for (let i = 0; i < 60; i += step) {
        arr.push(String(i).padStart(2, "0"));
      }
      return arr;
    }, [stepMinute]);

    // Parse value "HH:MM"
    const parsedTime = React.useMemo(() => {
      const parts = (value || "08:00").split(
        ":",
      );
      const hStr = parts[0] || "08";
      const mStr = parts[1] || "00";

      let hIdx = hours.indexOf(
        hStr.padStart(2, "0"),
      );
      if (hIdx === -1) hIdx = 8;

      let mIdx = minutes.indexOf(
        mStr.padStart(2, "0"),
      );
      if (mIdx === -1) {
        const mVal = parseInt(mStr, 10) || 0;
        let closest = 0;
        let minDiff = 999;
        minutes.forEach((mItem, idx) => {
          const diff = Math.abs(
            parseInt(mItem, 10) - mVal,
          );
          if (diff < minDiff) {
            minDiff = diff;
            closest = idx;
          }
        });
        mIdx = closest;
      }

      return { hIdx, mIdx };
    }, [value, hours, minutes]);

    const handleHourSelect = (
      idx: number,
    ) => {
      const newH = hours[idx];
      const curM =
        minutes[parsedTime.mIdx] || "00";
      onChange(`${newH}:${curM}`);
    };

    const handleMinuteSelect = (
      idx: number,
    ) => {
      const curH =
        hours[parsedTime.hIdx] || "08";
      const newM = minutes[idx];
      onChange(`${curH}:${newM}`);
    };

    const config = sizeConfig[size];

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center p-3.5 bg-white rounded-3xl border border-[#E8E3D2] shadow-xl w-full max-w-[240px] select-none",
          className,
        )}
        {...props}
      >
        {/* Top Time Display Header */}
        <div className="flex items-center justify-center w-full mb-3 px-1">
          <div
            className={cn(
              "flex items-center gap-1.5",
              "text-[#32452C] font-black text-xs",
            )}
          >
            <Clock
              size={14}
              className="text-[#C25939]"
            />
            <span>Pilih Jam</span>
          </div>
        </div>

        {/* 3D Wheel Column Picker */}
        <div
          className={cn(
            "flex items-center justify-center w-full",
            config.gap,
          )}
        >
          <Column
            items={hours}
            selectedIndex={parsedTime.hIdx}
            onSelectIndex={handleHourSelect}
            itemHeight={config.itemHeight}
            height={config.height}
            fontSize={config.fontSize}
            disabled={disabled}
            label="Jam"
          />

          <div
            className={cn(
              "flex items-center justify-center",
              "text-[#2B4C3B] font-black text-xl",
              "pt-4 animate-pulse",
            )}
          >
            :
          </div>

          <Column
            items={minutes}
            selectedIndex={parsedTime.mIdx}
            onSelectIndex={
              handleMinuteSelect
            }
            itemHeight={config.itemHeight}
            height={config.height}
            fontSize={config.fontSize}
            disabled={disabled}
            label="Menit"
          />
        </div>
      </div>
    );
  },
);

TimeWheelPicker.displayName =
  "TimeWheelPicker";

export { TimeWheelPicker };
