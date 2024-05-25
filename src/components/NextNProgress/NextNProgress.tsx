import React from "react";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import "@styles/NProgress.css";

const NextNProgress = () => {
  return (
    <ProgressBar
      height="var(--nprogress-height)"
      color="var(--nprogress-color)"
      options={{
        showSpinner: false,
        speed: 300,
        template: `
                <div>
                  <video autoPlay loop muted playsInline id="load-canvas" src="./images/loading-gif.webm" class="myVideo"></video>
                  <div class="bar" role="tab">
                    <div class="peg"></div>
                  </div>
                  <div class="logo-center">
                    <div class="contemplating">Suvraneel is contemplating...</div>
                  </div>
                  <img class="SB-logo" src="./images/Logo-SB.png" alt="SB-logo"/>
                  <div class="loader">
                    <span>L</span>
                    <span>O</span>
                    <span>A</span>
                    <span>D</span>
                    <span>I</span>
                    <span>N</span>
                    <span>G</span>
                    <div class="covers">
                      <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              `,
      }}
      shallowRouting
    />
  );
};

export default NextNProgress;
