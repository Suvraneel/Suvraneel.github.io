"use client";
import React, { useState } from "react";
import Equalizer from "@components/Equalizer/Equalizer";
import { FontAwesomeObj } from "@components/FontAwesomeObj";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { useSoundEffects } from "@components/SoundEffectsContext";

const MusicToggler = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const { playBGM, stopBGM } = useSoundEffects();
  return (
    <button
      onClick={() => {
        isPlaying ? stopBGM() : playBGM();
        setIsPlaying(!isPlaying);
      }}
      id="music"
      aria-label="Music"
    >
      {isPlaying ? (
        <Equalizer className="flex justify-start p-[12px] overflow-clip" />
      ) : (
        <FontAwesomeObj
          icon={faMusic}
          brandColor="cyan"
          size="sm"
          className="group-hover:flex justify-start p-[12px] overflow-clip"
          iconClassName="w-5 h-5"
        />
      )}
    </button>
  );
};

export default MusicToggler;
