"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type DonationPayload = {
  user: string;
  amount: number;
  mediaUrl?: string;
  message?: string;
};

export default function AlertPage() {
  const [alert, setAlert] = useState<DonationPayload | null>(null);
  const [progress, setProgress] = useState(100);
  const queueRef = useRef<DonationPayload[]>([]);
  const isShowingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  const youtubeEmbed = useMemo(() => {
    if (!alert?.mediaUrl) return null;
    const match = alert.mediaUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (!match) return null;
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&controls=1`;
  }, [alert]);

  const getDuration = (payload: DonationPayload): number => {
    if (payload.mediaUrl) {
      if (payload.amount >= 50000) return 50000;
      if (payload.amount >= 30000) return 30000;
      if (payload.amount >= 25000) return 20000;
      return 10000;
    }
    return 5000;
  };

  const startProgressBar = (duration: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = performance.now();
    durationRef.current = duration;
    setProgress(100);

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / durationRef.current) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const stopProgressBar = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setProgress(100);
  };

  const showNext = () => {
    if (queueRef.current.length === 0) {
      isShowingRef.current = false;
      setAlert(null);
      stopProgressBar();
      return;
    }

    const next = queueRef.current.shift()!;
    isShowingRef.current = true;
    setAlert(next);

    const duration = getDuration(next);
    startProgressBar(duration);

    timerRef.current = setTimeout(() => {
      setAlert(null);
      stopProgressBar();
      setTimeout(() => showNext(), 500);
    }, duration);
  };

  const enqueue = (payload: DonationPayload) => {
    queueRef.current.push(payload);
    if (!isShowingRef.current) {
      showNext();
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("donation-alerts", {
        config: {
          broadcast: { self: true }, 
        },
      })
      .on(
        "broadcast",
        { event: "donation" },
        ({ payload }: { payload: DonationPayload }) => {
          enqueue(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-transparent flex items-center justify-center overflow-hidden p-8">
      {alert && (
        <div className="w-full max-w-2xl animate-[slideIn_0.4s_ease] rounded-[32px] border border-cyan-400/20 bg-black shadow-[0_0_80px_rgba(0,255,255,0.15)] overflow-hidden">
          <div className="flex flex-col">
            {youtubeEmbed && (
              <div className="bg-black/40 p-4 border-b border-white/10">
                <iframe
                  src={youtubeEmbed}
                  className="w-full aspect-video rounded-2xl border border-white/10"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            )}

            {youtubeEmbed ? (
              <div className="p-8 text-center">
                <p className="text-3xl font-bold text-white leading-tight">
                  <span className="text-cyan-300">{alert.user}</span>
                  <span className="text-zinc-300 font-medium"> donated </span>
                  <span className="text-cyan-300">Rp.{alert.amount.toLocaleString("id-ID")}</span>
                </p>
                {alert.message && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-zinc-200 text-lg leading-relaxed inline-block max-w-xl">
                    &quot;{alert.message}&quot;
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-6 px-8 py-7">
                <div className="h-24 w-24 rounded-[28px] bg-cyan-950 flex items-center justify-center text-5xl shrink-0">
                  💸
                </div>
                <div className="flex-1">
                  <p className="text-cyan-300 uppercase tracking-[0.35em] text-sm font-medium mb-3">
                    Donation Alert
                  </p>
                  <h2 className="text-white text-5xl font-bold leading-tight">
                    {alert.user}
                  </h2>
                  <p className="text-zinc-300 text-3xl mt-2">
                    donated <span className="text-cyan-300 font-semibold">Rp.{alert.amount.toLocaleString("id-ID")}</span>
                  </p>
                  {alert.message && (
                    <p className="text-zinc-400 text-lg mt-4 leading-relaxed max-w-2xl">
                      {alert.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="h-1 w-full bg-white/10">
              <div
                className="h-full bg-cyan-400 transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(25px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}