'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@components/animate-ui/icons/icon';

// Not in the animate-ui registry: Lucide's calendar-days glyph on animate-ui's
// icon primitive, so it matches the other icons' stroke and hover trigger.
// Hover: the binder rings bob, then the date dots pop in one by one.

type CalendarDaysProps = IconProps<keyof typeof animations>;

const DOTS = [
  'M8 14h.01',
  'M12 14h.01',
  'M16 14h.01',
  'M8 18h.01',
  'M12 18h.01',
  'M16 18h.01',
] as const;

const ring = (delay: number): Variants => ({
  initial: { y: 0 },
  animate: {
    y: [0, -1.5, 0],
    transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1], delay },
  },
});

const dot = (index: number): Variants => ({
  initial: { opacity: 1, scale: 1 },
  animate: {
    opacity: [0, 1],
    scale: [0.3, 1],
    transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1], delay: 0.15 + index * 0.06 },
  },
});

const animations = {
  default: {
    ring1: ring(0),
    ring2: ring(0.08),
    ...Object.fromEntries(DOTS.map((_, index) => [`dot${index + 1}`, dot(index)])),
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CalendarDaysProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.path d="M8 2v4" variants={variants.ring1} initial="initial" animate={controls} />
      <motion.path d="M16 2v4" variants={variants.ring2} initial="initial" animate={controls} />
      <rect width={18} height={18} x={3} y={4} rx={2} />
      <path d="M3 10h18" />
      {DOTS.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          variants={variants[`dot${index + 1}`]}
          initial="initial"
          animate={controls}
        />
      ))}
    </motion.svg>
  );
}

function CalendarDays(props: CalendarDaysProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  CalendarDays,
  CalendarDays as CalendarDaysIcon,
  type CalendarDaysProps,
  type CalendarDaysProps as CalendarDaysIconProps,
};
