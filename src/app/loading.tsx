import React from "react";
import HamsterLoader from "@components/HamsterLoader";

const Loading = () => {
  return (
    <div className="fixed h-full w-full flex flex-row justify-center items-center z-0">
      <HamsterLoader loaderTitle="Loading 3D scene..." />
    </div>
  );
};

export default Loading;
