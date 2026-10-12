export default function TimelineDate({ duration }: Readonly<{ duration: string }>) {
  const [startDate, endDate] = duration.split(" - ");

  return (
    <div className="hidden sm:block">
      <span className="sr-only">Period: {duration}</span>
      <div aria-hidden="true" className="relative mt-1 flex flex-col gap-2 pl-4 font-mono text-xs leading-4 tabular-nums text-white/55">
        <span className="absolute bottom-2 left-1 top-2 w-px bg-white/25" />
        <span className="absolute left-[1px] top-[5px] size-1.5 rounded-full bg-accent/70" />
        <span className="absolute bottom-[5px] left-[1px] size-1.5 rounded-full bg-white/45" />
        <span>{endDate ?? duration}</span>
        <span>{startDate}</span>
      </div>
    </div>
  );
}