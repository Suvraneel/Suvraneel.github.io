"use client";
import { IconProp, SizeProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useSoundEffects } from "@components/SoundEffectsContext";

interface FontAwesomeObjProps {
  icon: IconProp;
  brandColor: string;
  title?: string;
  titleClassName?: string;
  size?: SizeProp;
  className?: string;
  iconClassName?: string;
}

export const FontAwesomeObj = (props: FontAwesomeObjProps) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const {
    icon,
    brandColor,
    title,
    titleClassName,
    size = "1x",
    className,
    iconClassName,
  } = props;
  const [hasTitle] = useState(title);
  const { playSnap, stopSnap, playConfirm } = useSoundEffects();
  return (
    <div
      className={`text-sm flex w-full gap-2 items-center ${className}`}
      onMouseEnter={() => {
        setIsFocused(true);
        playSnap();
      }}
      onMouseLeave={() => {
        setIsFocused(false);
        stopSnap();
      }}
      onClick={() => playConfirm()}
    >
      <FontAwesomeIcon
        icon={icon}
        size={size}
        className={iconClassName || "w-5 h-5"}
        color={isFocused ? brandColor : "white"}
      />
      {hasTitle && (
        <div className={`${titleClassName} hover:text-cyan-400`}>{title}</div>
      )}
    </div>
  );
};
