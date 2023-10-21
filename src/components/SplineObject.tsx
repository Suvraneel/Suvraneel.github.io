import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";

const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });
const SplineObj = (props: { scene: string; }) => {
  const [isDesktop, setDesktop] = useState(false);

  useEffect(() => {
    if (window.innerWidth > 550) {
      setDesktop(true);
    } else {
      setDesktop(false);
    }

    const updateMedia = () => {
      if (window.innerWidth > 550) {
        setDesktop(true);
      } else {
        setDesktop(false);
      }
    };
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, []);
  return (
    <Suspense fallback={<>Loading...</>}>
      {isDesktop&&<Spline className="absolute top-0 right-0" scene={props.scene} />}
    </Suspense>
  );
};

Spline.propTypes = {};

export default SplineObj;
