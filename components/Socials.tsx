import Link from "next/link";
import { useRef, useState, type ElementType } from "react";
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
  const snapAudioRef = useRef<HTMLAudioElement | null>(null);

  const playEffect = (source: string) => {
    const audio = new Audio(source);
    audio.volume = 0.25;
    void audio.play().catch(() => undefined);
    return audio;
  };

  const startInteraction = () => {
    setIsHovered(true);
    snapAudioRef.current?.pause();
    snapAudioRef.current = playEffect("/sounds/snap.wav");
    iconRef.current?.startAnimation();
  };

  const endInteraction = () => {
    setIsHovered(false);
    snapAudioRef.current?.pause();
    snapAudioRef.current = null;
    iconRef.current?.stopAnimation();
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={name}
      onMouseEnter={startInteraction}
      onMouseLeave={endInteraction}
      onFocus={startInteraction}
      onBlur={endInteraction}
      onClick={() => playEffect("/sounds/confirm.wav")}
      className="transition-colors duration-200"
      style={{ color: isHovered ? brandColor : "white" }}
    >
      <Icon ref={iconRef} size={24} className="grid h-6 w-6 place-items-center" aria-hidden="true" />
    </Link>
  );
}

const Socials = () => {
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
    </div>
  );
};

export default Socials;
