import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faYoutube,
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { SocialHandle } from "./SocialHandle";

export const Socials = () => {
  const social = [
    {
      name: "GitHub",
      icon: faGithub,
      link: "https://github.com/Suvraneel",
      brandColor: "#6e5494",
    },
    {
      name: "LinkedIn",
      icon: faLinkedin,
      link: "https://www.linkedin.com/in/suvraneel-bhuin/",
      brandColor: "#007dbb",
    },
    {
      name: "twitter",
      icon: faTwitter,
      link: "https://twitter.com/SuvraneelB",
      brandColor: "#00acee",
    },
  ];
  return (
    <div className="flex flex-col md:flex-row justify-evenly content-center gap-2">
      {social.map((item, index) => {
        return (
          <Link href={item.link} key={index}>
            <a>
              <SocialHandle icon={item.icon} brandColor={item.brandColor} />
            </a>
          </Link>
        );
      })}
    </div>
  );
};
