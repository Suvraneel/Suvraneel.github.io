"use client";
import styles from "./DownloadResumeBtn.module.css";
import { spaceBoards } from "@font";
import { useSoundEffects } from "@components/SoundEffectsContext";

const DownloadResumeBtn = () => {
  const { playSnap, stopSnap, playConfirm } = useSoundEffects();
  return (
    <button
      className={`${styles.resumeButton} h-fit w-fit px-5 py-2 text-md text-accent shadow-md font-semibold mb-3 ${spaceBoards.className}`}
      onMouseEnter={() => playSnap()}
      onMouseLeave={() => stopSnap()}
      onClick={() => playConfirm()}
    >
      Download Resume
    </button>
  );
};

export default DownloadResumeBtn;
