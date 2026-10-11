import Image from "next/image";
import { Scales } from "@components/ui/scales";

const verticalFade = "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)";
const horizontalFade = "linear-gradient(to right, transparent, black 8%, black 92%, transparent)";
const railMask = {
  maskImage: `${verticalFade}, ${verticalFade}, ${horizontalFade}, ${horizontalFade}`,
  maskSize: "1rem 100%, 1rem 100%, 100% 1rem, 100% 1rem",
  maskPosition: "calc(12% + 0.12rem) 0, calc(88% - 0.12rem) 0, 0 calc(12% + 0.12rem), 0 calc(88% - 0.12rem)",
  maskRepeat: "no-repeat",
  WebkitMaskImage: `${verticalFade}, ${verticalFade}, ${horizontalFade}, ${horizontalFade}`,
  WebkitMaskSize: "1rem 100%, 1rem 100%, 100% 1rem, 100% 1rem",
  WebkitMaskPosition: "calc(12% + 0.12rem) 0, calc(88% - 0.12rem) 0, 0 calc(12% + 0.12rem), 0 calc(88% - 0.12rem)",
  WebkitMaskRepeat: "no-repeat",
};

export default function ScalesWithImageDemo() {
  return (
    <div className="relative isolate grid aspect-square w-[18rem] max-w-full -translate-x-4 place-items-center max-[360px]:w-[14rem] max-[319px]:w-[12rem] max-[319px]:translate-y-2">
      <div className="pointer-events-none absolute inset-0" style={railMask}>
        <Scales size={8} color="rgb(255 255 255 / 0.12)" />
      </div>
      <div className="relative z-10 aspect-square w-[60%] max-w-40 overflow-hidden">
        <Image
          src="/images/Suvraneel_DP.jpeg"
          alt="Sketch portrait of Suvraneel Bhuin wearing headphones"
          fill
          priority
          sizes="(max-width: 340px) 60vw, 180px"
          className="object-cover grayscale"
        />
      </div>
    </div>
  );
}