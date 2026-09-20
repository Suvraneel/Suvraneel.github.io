export default function ScrollToExplore() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-3 z-10 flex justify-center"
      aria-hidden="true"
    >
      <span className="inline-flex h-8 min-w-[184px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-black/20 px-5 text-[10px] uppercase leading-none tracking-[0.22em] text-white/70 backdrop-blur-sm">
        <span>Scroll to explore</span>
        <span className="text-sm leading-none text-white">↓</span>
      </span>
    </div>
  );
}
