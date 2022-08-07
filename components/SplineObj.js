import React, { Suspense } from "react";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});
const SplineObj = (props) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Spline className="absolute top-0 right-0" scene={props.scene} />
    </Suspense>
  );
};

Spline.propTypes = {};

export default SplineObj;
