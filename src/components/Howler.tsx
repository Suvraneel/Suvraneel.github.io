"use client";
import React from 'react'
import useSound from 'use-sound';

const Howler = (props: any) => {
    const { className, role, onClick, children } = props;
    const snapSfx = "./sounds/snap.wav";
    const confirmSfx = "./sounds/confirm.wav";
    const [playSnap, { stop: stopSnap }] = useSound(snapSfx, { volume: 0.25 });
    const [playConfirm] = useSound(confirmSfx, { volume: 0.25 });
    return (
        <button
            type={role}
            className={className}
            role="button"
            onMouseEnter={() => playSnap()}
            onMouseLeave={() => stopSnap()}
            onClick={() => {
                playConfirm();
                onClick
            }}
        >
            {children}
        </button>
    )
}

export default Howler