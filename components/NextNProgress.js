import React from 'react';
import NProgress from 'nprogress';
import Router from "next/router";
import PropTypes from 'prop-types';

/* eslint-disable react/prefer-stateless-function */
class NextNProgress extends React.Component {
  static defaultProps = {
    color: '#29D',
    startPosition: 0.3,
    stopDelayMs: 200,
    height: 3,
  };

  timer = null;

  routeChangeStart = () => {
    NProgress.set(this.props.startPosition);
    NProgress.start();
  };

  routeChangeEnd = () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      NProgress.done(true);
    }, this.props.stopDelayMs);
  };

  render() {
    const { color, height } = this.props;

    return (
      <style jsx global>{`
        #nprogress {
          pointer-events: none;
        }
        #nprogress .bar {
          background: ${color};
          position: fixed;
          z-index: 1051;
          top: 0;
          left: 0;
          width: 100%;
          height: ${height}px;
        }
        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          box-shadow: 0 0 10px ${color}, 0 0 5px ${color};
          opacity: 1;
          -webkit-transform: rotate(3deg) translate(0px, -4px);
          -ms-transform: rotate(3deg) translate(0px, -4px);
          transform: rotate(3deg) translate(0px, -4px);
        }
        #nprogress .spinner {
          display: "block";
          position: fixed;
          z-index: 1051;
          top: 15px;
          right: 15px;
        }
        #nprogress .spinner-icon {
          width: 18px;
          height: 18px;
          box-sizing: border-box;
          border: solid 2px transparent;
          border-top-color: ${color};
          border-left-color: ${color};
          border-radius: 50%;
          -webkit-animation: nprogresss-spinner 400ms linear infinite;
          animation: nprogress-spinner 400ms linear infinite;
        }
        #nprogress .logo-center {
          display: "flex";
          position: fixed;
          z-index: 1041;
          top: 20%;
          right: 40%;
        }
        #nprogress .contemplating {
          display: "block";
          position: fixed;
          bottom: 22vh;
          left: 42vw;
          font-size: 1.2em;
          color: #00ffff;
        }
        #nprogress .SB-logo {
          display: "block";
          position: fixed;
          top: 35vh;
          left: 45vw;
          z-index: 1061;
          height: 30%;
        }

        .nprogress-custom-parent {
          overflow: hidden;
          position: relative;
        }
        .nprogress-custom-parent #nprogress .spinner,
        .nprogress-custom-parent #nprogress .bar {
          position: absolute;
        }
        #load-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #1d2630aa;
          z-index: 1040;
          opacity: 0.9;
        }
        @-webkit-keyframes nprogress-spinner {
          0% {
            -webkit-transform: rotate(0deg);
          }
          100% {
            -webkit-transform: rotate(360deg);
          }
        }
        @keyframes nprogress-spinner {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @import url(https://fonts.googleapis.com/css?family=Roboto+Condensed);

        .loader {
          position: absolute;
          bottom: 0;
          left: 40vw;
          margin: auto;
          width: 350px;
          color: white;
          font-family: "Roboto Condensed", sans-serif;
          font-size: 250%;
          background: linear-gradient(180deg, #222 0, #444 100%);
          box-shadow: inset 0 5px 20px black;
          text-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
          z-index: 1080;
        }

        .loader:after {
          content: "";
          display: table;
          clear: both;
        }

        span {
          float: left;
          height: 100px;
          line-height: 120px;
          width: 50px;
        }

        .loader > span {
          border-left: 1px solid #444;
          border-right: 1px solid #222;
        }

        .covers {
          position: absolute;
          height: 100%;
          width: 100%;
        }

        .covers span {
          background: linear-gradient(180deg, white 0, #ddd 100%);
          animation: up 2s infinite;
        }

        @keyframes up {
          0% {
            margin-bottom: 0;
          }
          16% {
            margin-bottom: 100%;
            height: 20px;
          }
          50% {
            margin-bottom: 0;
          }
          100% {
            margin-bottom: 0;
          }
        }

        .covers span:nth-child(2) {
          animation-delay: 0.142857s;
        }
        .covers span:nth-child(3) {
          animation-delay: 0.285714s;
        }
        .covers span:nth-child(4) {
          animation-delay: 0.428571s;
        }
        .covers span:nth-child(5) {
          animation-delay: 0.571428s;
        }
        .covers span:nth-child(6) {
          animation-delay: 0.714285s;
        }
        .covers span:nth-child(7) {
          animation-delay: 0.857142s;
        }

        @media only screen and (max-width: 768px) {
          /* For mobile phones: */
          #nprogress .SB-logo {
            top: 25vh;
            left: 25vw;
            z-index: 1061;
            height: 22%;
          }
          span {
            display: none;
          }
          loader{
            left: 10vw;
            top: 10vh;
            width: 200px;
          }
          #nprogress .contemplating {
            left: 20vw;
          }
          #nprogress .SB-logo {
            display: "block";
            position: fixed;
            top: 35vh;
            left: 25vw;
            z-index: 1061;
            height: 30%;
          }
        }
      `}</style>
    );
  }

  componentDidMount() {
    const { options } = this.props;

    NProgress.configure({
      template: '<img id="load-canvas" src="./images/loading-gif.gif"></img><div class="bar" role="bar"><div class="peg"></div></div><div class="logo-center"><div class="contemplating">Suvraneel is contemplating...</div></div><img class="SB-logo" src="./images/Logo-SB.png"/><div class="loader"><span>L</span><span>O</span><span>A</span><span>D</span><span>I</span><span>N</span><span>G</span><div class="covers"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div></div>'
    });

    // Trigger progress bar on initial page load
    if (Router.pathname === '/') {
      this.routeChangeStart()
      setTimeout(this.routeChangeEnd, 500);
    }

    Router.events.on('routeChangeStart', this.routeChangeStart);
    Router.events.on('routeChangeComplete', this.routeChangeEnd);
    Router.events.on('routeChangeError', this.routeChangeEnd);
  }
}

NextNProgress.propTypes = {
  color: PropTypes.string,
  startPosition: PropTypes.number,
  stopDelayMs: PropTypes.number,
  options: PropTypes.object,
};

export default NextNProgress;