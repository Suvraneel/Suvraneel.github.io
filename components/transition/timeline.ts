// ---------------------------------------------------------------------------
// One timeline per transition. Every layer animation (WAAPI) is registered
// with its offset from the transition origin, so the whole choreography can be
// driven from a single progress value p in [0, 1]: played normally, seeked
// for deterministic frames, and (next phase) scrubbed by scroll.
// ---------------------------------------------------------------------------

type Track = {
  animation: Animation;
  /** Start of this animation's local time, in ms from the timeline origin. */
  offset: number;
  /** Total active length (delay + duration) in ms. */
  length: number;
  /** Drop the animation on settle (layers that stay must carry no transform). */
  cancelOnSettle: boolean;
};

export class TransitionTimeline {
  private originTime: number;
  private tracks: Track[] = [];
  private paused = false;
  private lastSeek: number | null = null;

  constructor(origin: number) {
    this.originTime = origin;
  }

  get origin() {
    return this.originTime;
  }

  /**
   * Moves the origin while nothing has been scheduled yet, so time spent
   * waiting for the route to commit is not part of the choreography.
   */
  rebase(origin: number) {
    if (this.tracks.length === 0) this.originTime = origin;
  }

  /**
   * Adds an animation that starts `offset` ms after the timeline origin.
   * Its start time is pinned so every track shares one clock and stays in
   * lockstep regardless of which frame created it.
   */
  add(animation: Animation, offset: number, cancelOnSettle: boolean) {
    const timing = animation.effect?.getComputedTiming();
    const length = Number(timing?.endTime ?? 0);
    this.tracks.push({ animation, offset, length, cancelOnSettle });
    // A paused timeline re-seeks every track: the new one may have changed its length.
    if (this.paused) this.seek(this.lastSeek ?? 0);
    else animation.startTime = this.origin + offset;
    return animation;
  }

  get duration() {
    return this.tracks.reduce((max, track) => Math.max(max, track.offset + track.length), 0);
  }

  get isPaused() {
    return this.paused;
  }

  get finished(): Promise<unknown> {
    return Promise.all(this.tracks.map((track) => track.animation.finished));
  }

  private localTime(p: number, offset: number) {
    return Math.max(0, Math.min(1, p)) * this.duration - offset;
  }

  /** Pauses every track at overall progress p. */
  seek(p: number) {
    this.paused = true;
    this.lastSeek = p;
    for (const track of this.tracks) {
      track.animation.pause();
      track.animation.currentTime = this.localTime(p, track.offset);
    }
  }

  /**
   * Plays on from the last seek. Start times are re-pinned rather than calling
   * play(), which would rewind a track that has not reached its offset yet.
   */
  resume() {
    if (!this.paused) return;
    const elapsed = Math.max(0, Math.min(1, this.lastSeek ?? 0)) * this.duration;
    const now = Number(document.timeline.currentTime);
    const base = (Number.isFinite(now) ? now : performance.now()) - elapsed;
    this.paused = false;
    this.lastSeek = null;
    for (const track of this.tracks) track.animation.startTime = base + track.offset;
  }

  /** Lands every track on its final frame; tracks that must not persist are dropped. */
  finish() {
    for (const track of this.tracks) {
      try {
        track.animation.finish();
      } catch {
        // An animation without a resolvable end cannot finish; dropping it is equivalent.
      }
      if (track.cancelOnSettle) track.animation.cancel();
    }
    this.tracks = [];
  }

  cancel() {
    for (const track of this.tracks) track.animation.cancel();
    this.tracks = [];
  }
}
