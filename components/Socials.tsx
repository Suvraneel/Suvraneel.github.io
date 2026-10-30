import Link from "next/link";
import { useRef, useState, type ElementType, type ReactNode } from "react";
import { useSfx } from "@hooks/useSfx";
import { GithubIcon, type GithubIconHandle } from "./animate-ui/icons/github";
import { LinkedinIcon, type LinkedinIconHandle } from "./animate-ui/icons/linkedin";
import { TwitterIcon, type TwitterIconHandle } from "./animate-ui/icons/twitter";

type AnimatedIconHandle = GithubIconHandle | LinkedinIconHandle | TwitterIconHandle;

type AnimatedSocialLinkProps = {
  name: string;
  href: string;
  brandColor: string;
  icon: ElementType;
};

function AnimatedSocialLink({ name, href, brandColor, icon: Icon }: AnimatedSocialLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const iconRef = useRef<AnimatedIconHandle>(null);
  const [playSnap, { stop: stopSnap }] = useSfx("snap", { volume: 0.25 });
  const [playConfirm] = useSfx("confirm", { volume: 0.25 });

  // Sound is a pointer-hover flourish; keyboard focus stays silent.
  const startInteraction = (withSound = true) => {
    setIsHovered(true);
    stopSnap();
    if (withSound) playSnap();
    iconRef.current?.startAnimation();
  };

  const endInteraction = () => {
    setIsHovered(false);
    stopSnap();
    iconRef.current?.stopAnimation();
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={name}
      // A click leaves no focus behind: back from the new tab, a scroll key would
      // turn it into keyboard focus and hold the rail open.
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={() => startInteraction()}
      onMouseLeave={endInteraction}
      onFocus={() => startInteraction(false)}
      onBlur={endInteraction}
      onClick={playConfirm}
      className="rounded-md transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      style={{ color: isHovered ? brandColor : "white" }}
    >
      <Icon ref={iconRef} size={24} className="grid h-6 w-6 place-items-center" aria-hidden="true" />
    </Link>
  );
}

/** `children` join the end of the row, spaced as the links are (the drawer's sound toggle). */
const Socials = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="flex flex-row justify-evenly content-center gap-2">
      <AnimatedSocialLink
        name="GitHub"
        href="https://github.com/Suvraneel"
        brandColor="#802bfc"
        icon={GithubIcon}
      />
      <AnimatedSocialLink
        name="LinkedIn"
        href="https://www.linkedin.com/in/suvraneel-bhuin/"
        brandColor="#0062ff"
        icon={LinkedinIcon}
      />
      <AnimatedSocialLink
        name="Twitter"
        href="https://twitter.com/SuvraneelB"
        brandColor="#00bbff"
        icon={TwitterIcon}
      />
      {children}
    </div>
  );
};

export default Socials;
