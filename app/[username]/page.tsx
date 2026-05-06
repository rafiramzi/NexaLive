"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import Script from "next/script";
import { useParams } from "next/navigation";
import NoUser from "../components/no_user";

declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: Record<string, unknown>) => void;
    };
  }
}

type Creator = {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
};

interface User {
  id: string;
  email: string;
  username: string;
}

type QuickAmountPreference = {
  price_1?: number | null;
  price_2?: number | null;
  price_3?: number | null;
  price_4?: number | null;
  price_5?: number | null;
};

const DEFAULT_QUICK_AMOUNTS = [10000, 25000, 50000, 100000];

function resolveQuickAmounts(pref: QuickAmountPreference | null): number[] {
  if (!pref) return DEFAULT_QUICK_AMOUNTS;
  const values = [pref.price_1, pref.price_2, pref.price_3, pref.price_4, pref.price_5]
    .filter((v): v is number => typeof v === "number" && v > 0);
  return values.length > 0 ? values : DEFAULT_QUICK_AMOUNTS;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function ConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${
          connected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
        }`}
      />
      <span className={`text-xs font-medium ${connected ? "text-emerald-600" : "text-amber-500"}`}>
        {connected ? "Live" : "Connecting…"}
      </span>
    </div>
  );
}

function ThankYouDialog({
  open,
  creatorUsername,
  donorName,
  amount,
  onClose,
}: {
  open: boolean;
  creatorUsername: string;
  donorName: string;
  amount: number;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />
        <div className="px-8 py-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center text-3xl select-none">
            🎉
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-zinc-900">
              Terimakasih, {donorName}!
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Donasi{" "}
              <span className="font-semibold text-zinc-700">{formatRupiah(amount)}</span>{" "}
              kamu untuk{" "}
              <span className="font-semibold text-violet-600">@{creatorUsername}</span>{" "}
              sudah terkirim. Alert akan muncul di stream mereka sebentar lagi!
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-700 active:scale-[0.99]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TopupPage() {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [creatorLoading, setCreatorLoading] = useState(true);
  const [quickAmountPref, setQuickAmountPref] = useState<QuickAmountPreference | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState(25000);
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const param = useParams();
  const username = param.username as string;

  useEffect(() => {
    const channel = supabase.channel("donation-alerts");
    channel.subscribe((status) => setConnected(status === "SUBSCRIBED"));
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, []);

    useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('User have not logged in');
        return res.json();
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch creator profile
  useEffect(() => {
    setCreatorLoading(true);
    fetch("/api/users/get-username/" + username)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setCreator(data.user))
      .catch(() => setCreator(null))
      .finally(() => setCreatorLoading(false));
  }, [username]);

  // Fetch quick amount preferences after creator is loaded
  useEffect(() => {
    if (!creator?.id) return;
    fetch("/api/quick-amount/get-user/" + creator.id)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setQuickAmountPref(data.quick_amount_preference ?? null))
      .catch(() => setQuickAmountPref(null));
  }, [creator?.id]);

  const quickAmounts = resolveQuickAmounts(quickAmountPref);

  const sendAlert = async () => {
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
    setShowThankYou(true);
  };

  const storeTransaction = async () => {
    try {
      await fetch("/api/transactions/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamer_username: username,
          donator_user_id: user?.id || null, 
          donator_name: name,
          amount,
          mediashare_link: mediaUrl.trim() || null,
          message: message.trim() || null,
        }),
      });
    } catch (err) {
      console.error("Failed to store transaction:", err);
    }
  }

  const sendDonation = async () => {
    if (!name || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/midtrans/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, amount, message, mediaUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      window.snap.pay(data.token, {
        onSuccess: () => { sendAlert(); storeTransaction(); },
        onPending: () => console.log("Pending"),
        onError: (err: unknown) => console.error("Error", err),
        onClose: () => console.log("Closed"),
      });
    } catch (err) {
      console.error(err);
      alert("Gagal membuat transaksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const snapUrl =
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

  const isReady = connected && !!name && !loading;

  const initials = creator?.display_name
    ? creator.display_name.slice(0, 2).toUpperCase()
    : creator?.username?.slice(0, 2).toUpperCase() ?? "??";

  const gridCols =
    quickAmounts.length <= 3
      ? `grid-cols-${quickAmounts.length}`
      : quickAmounts.length === 4
      ? "grid-cols-4"
      : "grid-cols-5";

  // Tunggu fetch selesai — jangan render NoUser saat masih loading
  if (creatorLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
          <p className="text-sm text-zinc-400">Memuat halaman…</p>
        </div>
      </div>
    );
  }

  // Fetch selesai tapi creator tidak ditemukan
  if (!creator) {
    return <NoUser />;
  }

  return (
    <>
      <Script
        src={snapUrl}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />

      <ThankYouDialog
        open={showThankYou}
        creatorUsername={creator.username}
        donorName={name}
        amount={amount}
        onClose={() => setShowThankYou(false)}
      />

      <div className="min-h-screen bg-zinc-50 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">

            {/* ── Creator Header ── */}
            <div className="px-8 pt-8 pb-6 border-b border-zinc-100 flex items-center gap-4">
              {creator.avatar_url ? (
                <img
                  src={creator.avatar_url}
                  alt={creator.display_name ?? creator.username}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-zinc-100 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-zinc-900 truncate">
                  {creator.display_name ?? creator.username}
                </p>
                <p className="text-sm text-zinc-400">@{creator.username}</p>
                {creator.bio && (
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed line-clamp-2">
                    {creator.bio}
                  </p>
                )}
              </div>
              <div className="ml-auto flex-shrink-0">
                <ConnectionBadge connected={connected} />
              </div>
            </div>

            {/* ── Form ── */}
            <div className="px-8 py-7 space-y-6">

              {/* Donor name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700">
                  Nama kamu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">
                  Jumlah donasi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={amount}
                    min={1000}
                    step={1000}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </div>
                <div className={`grid ${gridCols} gap-2`}>
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(value)}
                      className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                        amount === value
                          ? "border-violet-400 bg-violet-50 text-violet-700"
                          : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      {formatRupiah(value)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700">
                  Pesan{" "}
                  <span className="text-zinc-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis pesan untuk streamer…"
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100 resize-none"
                />
              </div>

              {/* Media URL */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700">
                  Media Share{" "}
                  <span className="text-zinc-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Link YouTube atau TikTok"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              {/* Submit */}
              <div className="pt-1 space-y-3">
                <button
                  type="button"
                  onClick={sendDonation}
                  disabled={!isReady}
                  className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-violet-700 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Memproses pembayaran…"
                    : !connected
                    ? "Menghubungkan…"
                    : !name
                    ? "Masukkan nama dulu"
                    : `Bayar ${formatRupiah(amount)} & Kirim Alert`}
                </button>
                <p className="text-center text-xs text-zinc-400">
                  Pembayaran aman melalui{" "}
                  <span className="font-medium text-zinc-500">Midtrans</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}