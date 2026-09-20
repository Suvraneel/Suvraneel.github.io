import { IconProp, SizeProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";

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
  const snapAudio = useRef<HTMLAudioElement | null>(null);

  const playEffect = (source: string) => {
    const audio = new Audio(source);
    audio.volume = 0.25;
    void audio.play().catch(() => undefined);
    return audio;
  };
  return (
    <div
      className={`text-sm flex w-full gap-2 items-center ${className}`}
      onMouseEnter={() => {
        setIsFocused(true);
        snapAudio.current = playEffect("/sounds/snap.wav");
      }}
      onMouseLeave={() => {
        setIsFocused(false);
        snapAudio.current?.pause();
        snapAudio.current = null;
      }}
      onClick={() => playEffect("/sounds/confirm.wav")}
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
