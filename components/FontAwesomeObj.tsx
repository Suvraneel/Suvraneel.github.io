import { IconProp, SizeProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import useSound from "use-sound";

interface Props {
  icon: IconProp;
  brandColor: string;
  title?: string;
  titleClassName?: string;
  size?: SizeProp;
  className?: string;
};

export const FontAwesomeObj = (props: Props) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const { icon, brandColor, title, titleClassName, size="1x", className } = props;
  const [hasTitle] = useState(title);
  const snapSfx = "./sounds/snap.wav";
  const confirmSfx = "./sounds/confirm.wav";
  const [playSnap, { stop: stopSnap }] = useSound(snapSfx, { volume: 0.25 });
  const [playConfirm] = useSound(confirmSfx, { volume: 0.25 });
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
        className="w-6 h-6"
        color={isFocused ? brandColor : "white"}
      />
      {hasTitle &&
        <div className={`${titleClassName} ${isFocused && 'text-cyan-400'}`}>
          {title}
        </div>
      }
    </div>
  );
};
