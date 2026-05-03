"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export default function TopupPage() {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [connected, setConnected] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState(25);
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  useEffect(() => {
    // Bergabung ke channel Supabase Realtime "donation-alerts"
    const channel = supabase.channel("donation-alerts");

    channel.subscribe((status) => {
      setConnected(status === "SUBSCRIBED");
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendDonation = async () => {
    if (!name || !channelRef.current) return;

    await channelRef.current.send({
      type: "broadcast",
      event: "donation",
      payload: {
        user: name,
        amount,
        message: message.trim() || undefined,
        mediaUrl: mediaUrl.trim() || undefined,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="rounded-[36px] border border-zinc-200 bg-white shadow-[0_25px_60px_rgba(15,23,42,0.08)] overflow-hidden">
          <div className="border-b border-zinc-100 px-10 py-8 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 uppercase tracking-[0.25em]">
                  Creator Dashboard
                </p>
                <h1 className="text-4xl font-bold text-zinc-900 mt-3 tracking-tight">
                  Donation Alert Creator
                </h1>
                <p className="text-zinc-500 mt-3 max-w-lg leading-relaxed">
                  Build and trigger professional donation alerts for your OBS live stream in real time.
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-right">
                <p className="text-xs uppercase tracking-widest text-zinc-400">
                  Connection
                </p>
                <p
                  className={`text-sm font-semibold mt-1 ${
                    connected ? "text-emerald-600" : "text-amber-500"
                  }`}
                >
                  {connected ? "Supabase Connected" : "Connecting..."}
                </p>
              </div>
            </div>
          </div>

          <div className="px-10 py-10 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-3">
                  Donor Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Carter"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-3">
                  Donation Amount
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-5 py-4 text-zinc-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-3">
                  Donation Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Say something for the streamer..."
                  rows={4}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-3">
                  Media Share URL
                </label>
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="YouTube or TikTok URL"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 leading-relaxed">
                  Media share link is optional. Leave empty if you only want to send a donation alert without video.
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-4">
                Quick Presets
              </label>

              <div className="grid grid-cols-4 gap-4">
                {[10, 25, 50, 100].map((value) => (
                  <button
                    key={value}
                    onClick={() => setAmount(value)}
                    className={`rounded-2xl border py-4 text-sm font-semibold transition-all ${
                      amount === value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    ${value}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={sendDonation}
                disabled={!connected || !name}
                className="w-full rounded-2xl bg-zinc-900 py-5 text-base font-semibold text-white transition-all hover:bg-zinc-800 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send Live Donation Alert
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[36px] border border-zinc-200 bg-white shadow-[0_25px_60px_rgba(15,23,42,0.08)] p-8">
            <p className="text-sm font-semibold text-zinc-500 uppercase tracking-[0.2em]">
              Live Preview
            </p>

            <div className="mt-8 rounded-[28px] border border-zinc-100 bg-gradient-to-br from-slate-900 to-zinc-800 p-6 shadow-inner">
              <div className="rounded-3xl border border-cyan-400/20 bg-black/30 backdrop-blur-xl px-6 py-5 shadow-[0_0_40px_rgba(0,255,255,0.12)]">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-cyan-400/20 flex items-center justify-center text-2xl">
                    💸
                  </div>

                  <div>
                    <p className="text-cyan-300 uppercase tracking-[0.25em] text-xs">
                      Donation Alert
                    </p>
                    <h2 className="text-white text-xl font-bold mt-1">
                      {name || "Donor Name"}
                    </h2>
                    <p className="text-zinc-300 mt-1">
                      donated <span className="text-cyan-300 font-semibold">${amount}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-[0_25px_60px_rgba(15,23,42,0.06)]">
            <h3 className="text-lg font-semibold text-zinc-900">
              Recommended Workflow
            </h3>

            <div className="mt-6 space-y-5">
              {[
                "Open your OBS browser source using /alert",
                "Keep creator dashboard on /topup",
                "Trigger donations in real time via Supabase Realtime",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="mt-1 h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-zinc-600 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}