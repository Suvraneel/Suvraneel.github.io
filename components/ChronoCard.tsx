/* eslint-disable @next/next/no-img-element */
import { tasaOrbiter } from "@font";
import { ExperienceEntry } from "@api/workData";

const ChronoCard = ({
  curElem,
  variant = "work",
}: {
  curElem: ExperienceEntry;
  variant?: "work" | "community";
}) => {
  const isWork = variant === "work";
  const isRoundMark = ["Web3ConfIndia23.png", "HyperEdgeWoB23.png"].includes(
    curElem.image ?? ""
  );

  return (
    <article
      className={`group relative grid gap-4 border-b border-white/10 py-8 transition-colors duration-300 motion-reduce:transition-none sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8 ${
        isWork ? "sm:py-10" : "sm:py-7"
      }`}
    >
      <div className="flex items-start gap-3 sm:block">
        {curElem.image && (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] p-2 sm:mb-5">
            <img
              className={`h-full w-full opacity-80 transition-opacity duration-300 group-hover:opacity-100 ${
                isRoundMark ? "rounded-full object-cover" : "object-contain"
              }`}
              src={`/images/work-assets/${curElem.image}`}
              alt={`${curElem.company} mark`}
              width={56}
              height={56}
            />
          </div>
        )}
        <p className="pt-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/40 sm:pt-0">
          {curElem.duration}
        </p>
      </div>

      <div className={`relative ${isWork ? "sm:pl-7" : "sm:pl-5"}`}>
        <div
          aria-hidden="true"
          className={`absolute left-0 top-1 h-2 w-2 rounded-full transition-transform duration-300 group-hover:scale-150 ${
            isWork ? "bg-cyan-200 shadow-[0_0_18px_rgba(165,243,252,0.9)]" : "bg-white/50"
          }`}
        />
        <p className={`text-[0.68rem] font-medium uppercase tracking-[0.2em] ${isWork ? "text-cyan-100/70" : "text-white/45"}`}>
          {curElem.company}
        </p>
        <h3 className={`mt-2 max-w-3xl font-semibold leading-tight tracking-[-0.035em] text-white ${isWork ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}>
          {curElem.role}
        </h3>
        <p className={`mt-4 max-w-2xl text-[0.98rem] leading-7 text-white/70 ${tasaOrbiter.className}`}>
          {curElem.summary}
        </p>
        <ul className={`mt-5 max-w-3xl space-y-2 text-sm leading-6 text-white/55 ${tasaOrbiter.className}`}>
          {curElem.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-3">
              <div aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-100/60" />
              <div className="min-w-0 flex-1">{highlight}</div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
};

export default ChronoCard;
