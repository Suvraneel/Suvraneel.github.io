import Link from "next/link";
import { FontAwesomeObj } from "@components/FontAwesomeObj";
import { faEnvelopesBulk, faMobile } from "@fortawesome/free-solid-svg-icons";

const ContactInfo = () => {
  return (
    <div className="w-1/2 h-full p-10">
      <div className="text-xl text-white gap-1 flex flex-col">
        <div className="flex gap-5 justify-start">
          <div className="flex flex-col items-start gap-2 pointer-events-auto">
            <Link
              target="_blank"
              href={"https://suvraneel.bio.link"}
              className="text-white flex flex-row gap-3 hover:text-cyan-300"
              legacyBehavior
            >
              <div className="flex justify-start">
                <FontAwesomeObj
                  icon={faMobile}
                  brandColor="cyan"
                  title="suvraneel.bio.link"
                  titleClassName="text-md"
                  size="xs"
                />
              </div>
            </Link>
            <Link
              href={"mailto:official@suvraneel.tech"}
              className="text-white flex flex-row gap-3 hover:text-cyan-300"
              target="_blank"
              legacyBehavior
            >
              <div className="flex justify-start">
                <FontAwesomeObj
                  icon={faEnvelopesBulk}
                  brandColor="cyan"
                  title="official@suvraneel.tech"
                  size="xs"
                />{" "}
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full h-full py-10 hidden md:block">
        <iframe
          id="map"
          title="map"
          src="https://maps.google.com/maps?width=100%25&amp;height=400&amp;hl=en&amp;q=Prabhuram%20Sarkar%20Lane,%20Kolkata,%20India+(My%20Business%20Name)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
          loading="lazy"
          className="invert opacity-60 hover:opacity-100 w-full h-full pointer-events-auto"
        />
      </div>
    </div>
  );
};

export default ContactInfo;
