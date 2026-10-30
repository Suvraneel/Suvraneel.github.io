'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  pathClassName,
  type IconProps,
} from '@components/animate-ui/icons/icon';
import { cn } from '@lib/utils';

type VolumeProps = IconProps<keyof typeof animations> & {
  /** Sound off: the speaker's waves give way to a cross. */
  muted?: boolean;
};

const animations = {
  default: {
    speaker: {},
    wave1: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    wave2: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.4, delay: 0.15, ease: 'easeInOut' },
      },
    },
    line1: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    line2: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.3, delay: 0.1, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, muted = false, className, ...props }: VolumeProps) {
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
      className={cn(pathClassName, className)}
      {...props}
    >
      <motion.path
        d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"
        variants={variants.speaker}
        initial="initial"
        animate={controls}
      />
      {muted ? (
        <>
          <motion.line
            key="line1"
            x1="22"
            y1="9"
            x2="16"
            y2="15"
            variants={variants.line1}
            initial="initial"
            animate={controls}
          />
          <motion.line
            key="line2"
            x1="16"
            y1="9"
            x2="22"
            y2="15"
            variants={variants.line2}
            initial="initial"
            animate={controls}
          />
        </>
      ) : (
        <>
          <motion.path
            key="wave1"
            d="M16 9a5 5 0 0 1 0 6"
            variants={variants.wave1}
            initial="initial"
            animate={controls}
          />
          <motion.path
            key="wave2"
            d="M19.364 5.636a9 9 0 0 1 0 12.728"
            variants={variants.wave2}
            initial="initial"
            animate={controls}
          />
        </>
      )}
    </motion.svg>
  );
}

function Volume(props: VolumeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Volume,
  Volume as VolumeIcon,
  type VolumeProps,
  type VolumeProps as VolumeIconProps,
};
