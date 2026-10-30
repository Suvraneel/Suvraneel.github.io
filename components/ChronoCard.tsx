/* eslint-disable @next/next/no-img-element */
import { tasaOrbiter } from "@font";
import { ExperienceEntry } from "@api/workData";
import TimelineDate from "@components/TimelineDate";

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
  // Dates | details from sm, once Work's text column (a size container) has room;
  // beside the md plant it is too narrow, and entries stack as on phones.
  return (
    <article
      data-reveal
      className={`group relative grid gap-4 border-b border-white/10 py-8 transition-colors duration-300 motion-reduce:transition-none sm:[@container(min-width:28rem)]:grid-cols-[6rem_minmax(0,1fr)] sm:[@container(min-width:28rem)]:gap-6 ${
        isWork ? "sm:py-10" : "sm:py-7"
      }`}
    >
      <div className="flex items-start gap-3 sm:[@container(min-width:28rem)]:flex-col sm:items-start sm:[@container(min-width:28rem)]:gap-4">
        {curElem.image && (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] p-2">
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
        <div className="pt-2 sm:[@container(min-width:28rem)]:hidden">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/60">
            {curElem.duration}
          </p>
          <p className={`mt-1 text-[0.68rem] font-medium uppercase tracking-[0.2em] ${isWork ? "text-accent/70" : "text-white/55"} ${tasaOrbiter.className}`}>
            {curElem.company}
          </p>
        </div>
        <TimelineDate duration={curElem.duration} />
      </div>

      <div className="relative sm:[@container(min-width:28rem)]:pl-5">
        {/* Lights (dim -> its colour) as the entry passes the middle of the view. */}
        <div
          aria-hidden="true"
          data-timeline-dot
          className="absolute left-0 top-1 hidden h-2 w-2 sm:[@container(min-width:28rem)]:block transition-transform duration-300 group-hover:scale-150 motion-reduce:transition-none"
        >
          <span className="timeline-dot-dim absolute inset-0 rounded-full bg-white/25" />
          <span
            className={`timeline-dot-lit absolute inset-0 rounded-full ${
              isWork ? "bg-accent shadow-[0_0_18px_rgb(var(--accent)/0.9)]" : "bg-accent shadow-[0_0_12px_rgb(var(--accent)/0.6)]"
            }`}
          />
        </div>
        <p className={`hidden text-[0.68rem] font-medium uppercase tracking-[0.2em] sm:[@container(min-width:28rem)]:block ${isWork ? "text-accent/70" : "text-white/55"} ${tasaOrbiter.className}`}>
          {curElem.company}
        </p>
        <h3 className={`mt-2 max-w-3xl font-semibold leading-tight tracking-[-0.035em] text-white ${isWork ? "text-2xl sm:text-3xl/tight" : "text-xl sm:text-2xl/tight"}`}>
          {curElem.role}
        </h3>
        <p className={`mt-4 max-w-2xl text-[0.98rem] leading-7 text-white/70 ${tasaOrbiter.className}`}>
          {curElem.summary}
        </p>
        <ul className={`mt-5 max-w-3xl space-y-2 text-sm leading-6 text-white/55 ${tasaOrbiter.className}`}>
          {curElem.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-3">
              <div aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/30" />
              <div className="min-w-0 flex-1">{highlight}</div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
};

export default ChronoCard;
