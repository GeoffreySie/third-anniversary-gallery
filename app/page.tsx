"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { timelineEvents, musicTracks } from "./data/timeline-events";

const heartDecorations = [
  { left: "6%", size: 14, delay: "0s", duration: "13s", drift: "-18px", rotate: "-12deg", opacity: 0.28 },
  { left: "13%", size: 20, delay: "1.6s", duration: "16s", drift: "24px", rotate: "8deg", opacity: 0.43 },
  { left: "20%", size: 12, delay: "2.4s", duration: "11s", drift: "-14px", rotate: "-6deg", opacity: 0.33 },
  { left: "28%", size: 18, delay: "0.8s", duration: "14s", drift: "20px", rotate: "15deg", opacity: 0.4 },
  { left: "36%", size: 15, delay: "3.1s", duration: "15s", drift: "-22px", rotate: "-9deg", opacity: 0.31 },
  { left: "44%", size: 22, delay: "4.3s", duration: "18s", drift: "28px", rotate: "11deg", opacity: 0.46 },
  { left: "50%", size: 13, delay: "1.2s", duration: "12s", drift: "-16px", rotate: "-14deg", opacity: 0.35 },
  { left: "56%", size: 19, delay: "2.9s", duration: "17s", drift: "19px", rotate: "7deg", opacity: 0.41 },
  { left: "64%", size: 16, delay: "0.4s", duration: "13.5s", drift: "-21px", rotate: "-10deg", opacity: 0.36 },
  { left: "72%", size: 23, delay: "3.7s", duration: "19s", drift: "26px", rotate: "13deg", opacity: 0.45 },
  { left: "80%", size: 14, delay: "1.9s", duration: "12.5s", drift: "-15px", rotate: "-7deg", opacity: 0.32 },
  { left: "88%", size: 18, delay: "2.2s", duration: "15.5s", drift: "17px", rotate: "9deg", opacity: 0.39 },
  { left: "94%", size: 12, delay: "4.8s", duration: "14.5s", drift: "-13px", rotate: "-11deg", opacity: 0.3 },
  {
    left: "48%",
    size: 17,
    delay: "5.2s",
    duration: "16.5s",
    drift: "22px",
    rotate: "6deg",
    opacity: 0.42,
    desktopOnly: true,
  },
  {
    left: "61%",
    size: 15,
    delay: "2.6s",
    duration: "12.8s",
    drift: "-19px",
    rotate: "-8deg",
    opacity: 0.34,
    desktopOnly: true,
  },
  {
    left: "30%",
    size: 16,
    delay: "3.9s",
    duration: "15.8s",
    drift: "18px",
    rotate: "10deg",
    opacity: 0.38,
    desktopOnly: true,
  },
];

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollDelay, setScrollDelay] = useState(1800);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(45);
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      return;
    }

    const timer = window.setInterval(() => {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      if (isDesktop) {
        const atEnd =
          scrollElement.scrollLeft + scrollElement.clientWidth >=
          scrollElement.scrollWidth - 4;

        if (atEnd) {
          scrollElement.scrollTo({ left: 0, behavior: "smooth" });
          return;
        }

        scrollElement.scrollBy({ left: 320, behavior: "smooth" });
        return;
      }

      const atEnd =
        scrollElement.scrollTop + scrollElement.clientHeight >=
        scrollElement.scrollHeight - 4;

      if (atEnd) {
        scrollElement.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      scrollElement.scrollBy({ top: 300, behavior: "smooth" });
    }, scrollDelay);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPlaying, scrollDelay]);

  const toggleMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
    } else {
      audio.src = musicTracks[selectedTrack].src;
      audio.volume = musicVolume / 100;
      audio.loop = true;
      await audio.play();
      setIsMusicPlaying(true);
    }
  }, [isMusicPlaying, selectedTrack, musicVolume]);

  // Update volume when slider changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume / 100;
    }
  }, [musicVolume]);

  // Switch track when dropdown changes while playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isMusicPlaying) return;
    audio.src = musicTracks[selectedTrack].src;
    audio.volume = musicVolume / 100;
    audio.loop = true;
    audio.play();
  }, [selectedTrack]);

  // Fullscreen slideshow auto-advance
  useEffect(() => {
    if (!slideshowOpen) return;

    const timer = window.setInterval(() => {
      setSlideshowIndex((prev) =>
        prev >= timelineEvents.length - 1 ? 0 : prev + 1,
      );
    }, scrollDelay);

    return () => window.clearInterval(timer);
  }, [slideshowOpen, scrollDelay]);

  // Keyboard controls for slideshow
  useEffect(() => {
    if (!slideshowOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSlideshowOpen(false);
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setSlideshowIndex((prev) =>
          prev >= timelineEvents.length - 1 ? 0 : prev + 1,
        );
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSlideshowIndex((prev) =>
          prev <= 0 ? timelineEvents.length - 1 : prev - 1,
        );
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [slideshowOpen]);

  const openSlideshow = useCallback(async () => {
    setSlideshowIndex(0);
    setSlideshowOpen(true);
    if (!isMusicPlaying) {
      const audio = audioRef.current;
      if (audio) {
        audio.src = musicTracks[selectedTrack].src;
        audio.volume = musicVolume / 100;
        audio.loop = true;
        await audio.play();
        setIsMusicPlaying(true);
      }
    }
  }, [isMusicPlaying, selectedTrack, musicVolume]);

  const closeSlideshow = useCallback(() => {
    setSlideshowOpen(false);
  }, []);

  return (
    <main className="relative min-h-screen bg-background px-6 py-10 text-foreground md:h-screen md:overflow-hidden md:px-10 md:py-0">
      <div className="heart-field" aria-hidden="true">
        {heartDecorations.map((heart, index) => (
          <span
            key={`${heart.left}-${index}`}
            className={`falling-heart ${index % 2 === 1 || heart.desktopOnly ? "hidden md:inline-flex" : ""}`}
            style={{
              left: heart.left,
              width: `${heart.size}px`,
              height: `${heart.size}px`,
              animationDelay: heart.delay,
              animationDuration: heart.duration,
              ["--heart-drift" as string]: heart.drift,
              ["--heart-rotate" as string]: heart.rotate,
              ["--heart-opacity" as string]: String(heart.opacity),
            }}
          >
            ❤
          </span>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col md:h-full">
        <div className="hidden md:block md:flex-1"></div>
        <div className="flex w-full flex-col md:shrink-0 md:items-center md:gap-10">
          <h1 className="mb-5 text-center text-4xl font-bold tracking-tight md:mb-0 md:text-6xl">
            Geoffrey and Gemma 2025/26 Wrapped
          </h1>

          <div className="mb-8 flex flex-col items-center gap-4 md:mb-0 md:gap-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                className="rounded-full border border-foreground/20 px-5 py-2 text-sm font-semibold transition hover:bg-foreground/10"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>

              <button
                type="button"
                onClick={openSlideshow}
                className="rounded-full border border-foreground/20 px-5 py-2 text-sm font-semibold transition hover:bg-foreground/10"
              >
                Slideshow
              </button>

              <div className="flex items-center gap-3 rounded-full border border-foreground/20 px-4 py-2">
                <label htmlFor="speed" className="text-sm font-medium">
                  Scroll Speed
                </label>
                <input
                  id="speed"
                  type="range"
                  min={1000}
                  max={10000}
                  step={200}
                  value={scrollDelay}
                  onChange={(event) => setScrollDelay(Number(event.target.value))}
                  className="w-44 accent-foreground"
                />
                <span className="w-12 text-right text-sm text-foreground/70">
                  {(scrollDelay / 1000).toFixed(1)}s
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggleMusic}
                className="rounded-full border border-foreground/20 px-5 py-2 text-sm font-semibold transition hover:bg-foreground/10"
              >
                {isMusicPlaying ? "Music On" : "Music Off"}
              </button>

              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(Number(e.target.value))}
                className="rounded-full border border-foreground/20 bg-background px-4 py-2 text-sm font-medium text-foreground outline-none transition hover:bg-foreground/10"
              >
                {musicTracks.map((track, i) => (
                  <option key={track.src} value={i}>
                    {track.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-3 rounded-full border border-foreground/20 px-4 py-2">
                <label htmlFor="volume" className="text-sm font-medium">
                  Music Volume
                </label>
                <input
                  id="volume"
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={musicVolume}
                  onChange={(event) => setMusicVolume(Number(event.target.value))}
                  className="w-36 accent-foreground"
                />
                <span className="w-10 text-right text-sm text-foreground/70">
                  {musicVolume}%
                </span>
              </div>
            </div>
          </div>

          <section className="relative w-full">
            <div
              ref={scrollRef}
              className="timeline-scroll max-h-[72vh] snap-y snap-mandatory overflow-auto pr-2 pt-3 md:snap-x md:overflow-x-auto md:overflow-y-hidden md:pb-4 md:pt-4 md:max-h-none"
            >
            <div className="relative flex flex-col gap-10 md:w-max md:flex-row md:items-center md:gap-8">
              <div className="absolute left-4 top-0 h-full w-1 rounded-full bg-foreground/20 md:left-0 md:top-1/2 md:h-1 md:w-full md:-translate-y-1/2" />

              {timelineEvents.map((event, index) => (
                <article
                  key={event.image}
                  className="timeline-card relative ml-10 snap-start rounded-2xl border border-foreground/10 bg-background/80 p-4 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-0.5 md:ml-0 md:w-[320px] md:shrink-0 md:hover:-translate-y-1"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <span className="timeline-dot absolute -left-[2.15rem] top-6 h-4 w-4 rounded-full bg-foreground md:left-1/2 md:top-0 md:-translate-x-1/2 md:-translate-y-1/2" />

                  <div className="relative mb-3 aspect-4/3 overflow-hidden rounded-xl border border-foreground/10">
                    <Image
                      src={event.image}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  </div>
                  {event.caption && (
                    <p className="text-sm leading-relaxed text-foreground/75">
                      {event.caption}
                    </p>
                  )}
                </article>
              ))}
              </div>
            </div>
          </section>
        </div>
        <div className="hidden md:block md:flex-1"></div>
      </div>

      {/* Fullscreen Slideshow Overlay */}
      {slideshowOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          {/* Close button */}
          <button
            type="button"
            onClick={closeSlideshow}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Close slideshow"
          >
            &times;
          </button>

          {/* Slide counter */}
          <div className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur">
            {slideshowIndex + 1} / {timelineEvents.length}
          </div>

          {/* Image area */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            {/* Prev button */}
            <button
              type="button"
              onClick={() =>
                setSlideshowIndex((prev) =>
                  prev <= 0 ? timelineEvents.length - 1 : prev - 1,
                )
              }
              className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur transition hover:bg-white/20 md:left-6"
              aria-label="Previous photo"
            >
              &#8249;
            </button>

            <div className="relative h-full w-full">
              <Image
                key={slideshowIndex}
                src={timelineEvents[slideshowIndex].image}
                alt={`Photo ${slideshowIndex + 1}`}
                fill
                className="object-contain animate-[fade-up_0.4s_ease-out]"
                sizes="100vw"
                priority
              />
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={() =>
                setSlideshowIndex((prev) =>
                  prev >= timelineEvents.length - 1 ? 0 : prev + 1,
                )
              }
              className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur transition hover:bg-white/20 md:right-6"
              aria-label="Next photo"
            >
              &#8250;
            </button>
          </div>

          {/* Caption bar */}
          <div className="shrink-0 bg-black/80 px-6 py-4 text-center backdrop-blur">
            {timelineEvents[slideshowIndex].caption ? (
              <p className="text-base text-white">
                {timelineEvents[slideshowIndex].caption}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-white/50">
              {slideshowIndex + 1} of {timelineEvents.length}
            </p>
          </div>
        </div>
      )}

      {/* Hidden audio element for music playback */}
      <audio ref={audioRef} />
    </main>
  );
}

