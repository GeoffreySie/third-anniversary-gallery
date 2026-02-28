"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { timelineEvents } from "./data/timeline-events";

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
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const musicTimerRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollDelay, setScrollDelay] = useState(1800);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(45);

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

  const stopMockMusic = () => {
    if (musicTimerRef.current !== null) {
      window.clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state === "running") {
      audioContextRef.current.suspend();
    }
  };

  const startMockMusic = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const context = audioContextRef.current;
    if (context.state !== "running") {
      await context.resume();
    }

    if (!masterGainRef.current) {
      const masterGain = context.createGain();
      masterGain.gain.value = musicVolume / 100;
      masterGain.connect(context.destination);
      masterGainRef.current = masterGain;
    }

    const notes = [261.63, 329.63, 392.0, 349.23];
    let noteIndex = 0;

    const playNote = () => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = notes[noteIndex % notes.length];
      noteIndex += 1;

      gainNode.gain.setValueAtTime(0.0001, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.06, context.currentTime + 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.55);

      oscillator.connect(gainNode);
      gainNode.connect(masterGainRef.current!);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.6);
    };

    playNote();
    musicTimerRef.current = window.setInterval(playNote, 700);
  };

  const toggleMockMusic = async () => {
    if (isMusicPlaying) {
      stopMockMusic();
      setIsMusicPlaying(false);
      return;
    }

    await startMockMusic();
    setIsMusicPlaying(true);
  };

  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      const context = audioContextRef.current;
      const normalizedVolume = Math.max(0.0001, musicVolume / 100);
      masterGainRef.current.gain.cancelScheduledValues(context.currentTime);
      masterGainRef.current.gain.setTargetAtTime(
        normalizedVolume,
        context.currentTime,
        0.05,
      );
    }
  }, [musicVolume]);

  useEffect(() => {
    return () => {
      stopMockMusic();
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-background px-6 py-12 text-foreground md:px-10">
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

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <h1 className="mb-5 text-center text-4xl font-bold tracking-tight md:text-6xl">
          Happy 3rd Anniversary!!
        </h1>

        <div className="mb-9 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="rounded-full border border-foreground/20 px-5 py-2 text-sm font-semibold transition hover:bg-foreground/10"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <div className="flex items-center gap-3 rounded-full border border-foreground/20 px-4 py-2">
            <label htmlFor="speed" className="text-sm font-medium">
              Scroll Speed
            </label>
            <input
              id="speed"
              type="range"
              min={1200}
              max={5000}
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
              onClick={toggleMockMusic}
              className="rounded-full border border-foreground/20 px-5 py-2 text-sm font-semibold transition hover:bg-foreground/10"
            >
              {isMusicPlaying ? "Music Off" : "Music On"}
            </button>

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

        <section className="relative">
          <div
            ref={scrollRef}
            className="timeline-scroll max-h-[72vh] snap-y snap-mandatory overflow-auto pr-2 pt-3 md:max-h-none md:snap-x md:pb-6 md:pt-6"
          >
            <div className="relative flex flex-col gap-10 md:w-max md:flex-row md:items-stretch md:gap-8">
              <div className="absolute left-4 top-0 h-full w-1 rounded-full bg-foreground/20 md:left-0 md:top-1/2 md:h-1 md:w-full md:-translate-y-1/2" />

              {timelineEvents.map((event, index) => (
                <article
                  key={`${event.title}-${event.date}`}
                  className="timeline-card relative ml-10 snap-start rounded-2xl border border-foreground/10 bg-background/80 p-4 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-0.5 md:ml-0 md:w-[320px] md:shrink-0 md:hover:-translate-y-1"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <span className="timeline-dot absolute -left-[2.15rem] top-6 h-4 w-4 rounded-full bg-foreground md:left-1/2 md:top-0 md:-translate-x-1/2 md:-translate-y-1/2" />

                  <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/65">
                    {event.date}
                  </div>

                  <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-foreground/10">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  </div>

                  <h2 className="mb-2 text-xl font-semibold">{event.title}</h2>
                  <p className="text-sm leading-relaxed text-foreground/75">
                    {event.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

