"use client";
import React, { createContext, useContext } from "react";
import useSound from "use-sound";

const snapSfx = "./sounds/snap.wav";
const popSfx = "./sounds/pop.wav";
const confirmSfx = "./sounds/confirm.wav";
const bgMusicSfx = "./sounds/RoadsideFlowers.mp3";

const SoundEffectsContext = createContext({
  playSnap: () => {},
  stopSnap: () => {},
  playPop: () => {},
  stopPop: () => {},
  playConfirm: () => {},
  playBGM: () => {},
  stopBGM: () => {},
});

export const SoundEffectsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [playSnap, { stop: stopSnap }] = useSound(snapSfx, { volume: 0.25 });
  const [playPop, { stop: stopPop }] = useSound(popSfx, { volume: 0.25 });
  const [playConfirm] = useSound(confirmSfx, { volume: 0.25 });
  const [playBGM, { stop: stopBGM }] = useSound(bgMusicSfx, { volume: 0.25 });
  // console when sound is played
  return (
    <SoundEffectsContext.Provider
      value={{
        playSnap,
        stopSnap,
        playPop,
        stopPop,
        playConfirm,
        playBGM,
        stopBGM,
      }}
    >
      {children}
    </SoundEffectsContext.Provider>
  );
};

export const useSoundEffects = () => useContext(SoundEffectsContext);
