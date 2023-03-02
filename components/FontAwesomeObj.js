import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import useSound from "use-sound";
export const FontAwesomeObj = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  const { icon, brandColor, title, titleClassName, size, className } = props;
  const [hasTitle] = useState(title === undefined ? false : true);
  const snapSfx = "./sounds/snap.wav";
  const confirmSfx = "./sounds/confirm.wav";
  const [playSnap, { stop: stopSnap }] = useSound(snapSfx, { volume: 0.25 });
  const [playConfirm] = useSound(confirmSfx, { volume: 0.25 });
  return (
    <div
      className={"text-sm flex w-full gap-2 items-center " + className}
      onMouseEnter={() => {
        setIsFocused(true);
        playSnap();
      }}
      onMouseLeave={() => {
        setIsFocused(false);
        stopSnap();
      }}
      onClick={() => playConfirm()}
      aria-label="music-button"
    >
      <FontAwesomeIcon
        icon={icon}
        size={size ? size : "1x"}
        className="w-6 h-6"
        color={isFocused ? brandColor : "white"}
      />
      {hasTitle ? (
        isFocused ? (
          <div className={titleClassName + " text-cyan-400"}>
            {title}
          </div>
        ) : (
          <div className={titleClassName}>{title}</div>
        )
      ) : null}
    </div>
  );
};
