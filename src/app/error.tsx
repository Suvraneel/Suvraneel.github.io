"use client"; // Error components must be Client Components

import { useEffect } from "react";
import SplineObj from "@components/SplineObject";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
      <SplineObj
        scene={"https://prod.spline.design/h5DMGX7w9GKC9o8y/scene.splinecode"}
      />
    </div>
  );
};

export default Error;
