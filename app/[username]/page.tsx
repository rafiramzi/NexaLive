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

type DonationPageTheme = {
  id: string;
  user_id: string;
  layout_type: string;
  bg_color: string | null;
  border_color: string | null;
  shadow_color: string | null;
  text_color: string | null;
  card_color: string | null;
  theme_mode: "light" | "dark" | null;
  description: string | null;
  created_at: string;
  updated_at: string;
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

// Derive readable colors from theme
function resolveThemeVars(theme: DonationPageTheme | null) {
  const isDark = theme?.theme_mode === "dark";

  const bg = theme?.bg_color ?? (isDark ? "#18181b" : "#f4f4f5");
  const card = theme?.card_color ?? (isDark ? "#27272a" : "#ffffff");
  const border = theme?.border_color ?? (isDark ? "#3f3f46" : "#e4e4e7");
  const text = theme?.text_color ?? (isDark ? "#fafafa" : "#09090b");
  const subtext = isDark ? "#a1a1aa" : "#71717a";
  const inputBg = isDark ? "#18181b" : "#ffffff";
  const inputBorder = isDark ? "#3f3f46" : "#d4d4d8";
  const accentFocus = isDark ? "#7c3aed" : "#7c3aed";
  const quickBtnBg = isDark ? "#3f3f46" : "#f4f4f5";
  const quickBtnText = isDark ? "#d4d4d8" : "#52525b";
  const divider = isDark ? "#3f3f46" : "#e4e4e7";
  const shadow = theme?.shadow_color
    ? `0 4px 32px 0 ${theme.shadow_color}`
    : isDark
    ? "0 4px 32px 0 rgba(0,0,0,0.5)"
    : "0 2px 16px 0 rgba(0,0,0,0.08)";

  return { bg, card, border, text, subtext, inputBg, inputBorder, accentFocus, quickBtnBg, quickBtnText, divider, shadow, isDark };
}

function ConnectionBadge({ connected, isDark }: { connected: boolean; isDark: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
      <span
        className="text-xs font-medium"
        style={{ color: connected ? "#10b981" : "#f59e0b" }}
      >
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
  theme,
}: {
  open: boolean;
  creatorUsername: string;
  donorName: string;
  amount: number;
  onClose: () => void;
  theme: DonationPageTheme | null;
}) {
  const vars = resolveThemeVars(theme);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: vars.card,
          border: `1px solid ${vars.border}`,
          boxShadow: vars.shadow,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />
        <div className="px-8 py-8 flex flex-col items-center text-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl select-none"
            style={{ background: vars.isDark ? "#3f3f46" : "#f3f4f6" }}
          >
            🎉
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold" style={{ color: vars.text }}>
              Terimakasih, {donorName}!
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: vars.subtext }}>
              Donasi{" "}
              <span className="font-semibold" style={{ color: vars.text }}>
                {formatRupiah(amount)}
              </span>{" "}
              kamu untuk{" "}
              <span className="font-semibold" style={{ color: "#7c3aed" }}>
                @{creatorUsername}
              </span>{" "}
              sudah terkirim. Alert akan muncul di stream mereka sebentar lagi!
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99]"
            style={{ background: "#7c3aed" }}
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
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pageTheme, setPageTheme] = useState<DonationPageTheme | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState(25000);
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const param = useParams();
  const username = param.username as string;

  // Realtime channel
  useEffect(() => {
    const channel = supabase.channel("donation-alerts");
    channel.subscribe((status) => setConnected(status === "SUBSCRIBED"));
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Optional auth — guest donors allowed
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
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

  // Fetch quick amount preferences
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

  // Fetch donation page theme
  useEffect(() => {
    if (!creator?.id) return;
    fetch(`/api/customize/donation-page/get-theme/${creator.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Theme not found");
        return res.json();
      })
      .then((data) => setPageTheme(data.preference ?? null))
      .catch(() => setPageTheme(null));
  }, [creator?.id]);

  const quickAmounts = resolveQuickAmounts(quickAmountPref);
  const vars = resolveThemeVars(pageTheme);

  const sendDonation = async () => {
    if (!name || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/midtrans/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount,
          message,
          mediaUrl,
          streamerUsername: username,
          donatorUserId: user?.id ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setOrderId(data.order_id);

      window.snap.pay(data.token, {
        onSuccess: () => {
          setShowThankYou(true);
        },
        onPending: () => console.log("Pending"),
        onError: (err: unknown) => console.error("Snap error", err),
        onClose: () => setLoading(false),
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

  if (creatorLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: vars.bg }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
          <p className="text-sm" style={{ color: vars.subtext }}>Memuat halaman…</p>
        </div>
      </div>
    );
  }

  if (!creator) return <NoUser />;

  return (
    <>
      <Script
        src={snapUrl}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onError={() => console.error("Snap gagal dimuat")}
      />

      <ThankYouDialog
        open={showThankYou}
        creatorUsername={creator.username}
        donorName={name}
        amount={amount}
        onClose={() => setShowThankYou(false)}
        theme={pageTheme}
      />

      {/* Page background from theme */}
      <div
        className="min-h-screen flex items-start justify-center px-4 py-10 transition-colors duration-300"
        style={{ background: vars.bg }}
      >
        <div className="w-full max-w-lg">
          <div
            className="rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              background: vars.card,
              border: `1px solid ${vars.border}`,
              boxShadow: vars.shadow,
            }}
          >
            {/* Creator Header */}
            <div
              className="px-8 pt-8 pb-6 flex items-center gap-4"
              style={{ borderBottom: `1px solid ${vars.divider}` }}
            >
              {creator.avatar_url ? (
                <img
                  src={creator.avatar_url}
                  alt={creator.display_name ?? creator.username}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  style={{ border: `2px solid ${vars.border}` }}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold truncate" style={{ color: vars.text }}>
                  {creator.display_name ?? creator.username}
                </p>
                <p className="text-sm" style={{ color: vars.subtext }}>@{creator.username}</p>
                {creator.bio && (
                  <p className="text-xs mt-0.5 leading-relaxed line-clamp-2" style={{ color: vars.subtext }}>
                    {creator.bio}
                  </p>
                )}
              </div>
              <div className="ml-auto flex-shrink-0">
                <ConnectionBadge connected={connected} isDark={vars.isDark} />
              </div>
            </div>

            {/* Form */}
            <div className="px-8 py-7 space-y-6">
              {/* Nama */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: vars.text }}>
                  Nama kamu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: vars.inputBg,
                    border: `1px solid ${vars.inputBorder}`,
                    color: vars.text,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = vars.accentFocus;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${vars.isDark ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.12)"}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = vars.inputBorder;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Jumlah */}
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: vars.text }}>
                  Jumlah donasi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none"
                    style={{ color: vars.subtext }}
                  >
                    Rp
                  </span>
                  <input
                    type="number"
                    value={amount}
                    min={1000}
                    step={1000}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                    style={{
                      background: vars.inputBg,
                      border: `1px solid ${vars.inputBorder}`,
                      color: vars.text,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = vars.accentFocus;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${vars.isDark ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.12)"}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = vars.inputBorder;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                <div className={`grid ${gridCols} gap-2`}>
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(value)}
                      className="rounded-lg py-2 text-xs font-medium transition-all"
                      style={
                        amount === value
                          ? {
                              background: vars.isDark ? "rgba(124,58,237,0.2)" : "#ede9fe",
                              border: "1px solid #7c3aed",
                              color: "#7c3aed",
                            }
                          : {
                              background: vars.quickBtnBg,
                              border: `1px solid ${vars.border}`,
                              color: vars.quickBtnText,
                            }
                      }
                    >
                      {formatRupiah(value)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pesan */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: vars.text }}>
                  Pesan{" "}
                  <span className="font-normal" style={{ color: vars.subtext }}>
                    (opsional)
                  </span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis pesan untuk streamer…"
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                  style={{
                    background: vars.inputBg,
                    border: `1px solid ${vars.inputBorder}`,
                    color: vars.text,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = vars.accentFocus;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${vars.isDark ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.12)"}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = vars.inputBorder;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Media Share */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: vars.text }}>
                  Media Share{" "}
                  <span className="font-normal" style={{ color: vars.subtext }}>
                    (opsional)
                  </span>
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Link YouTube atau TikTok"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: vars.inputBg,
                    border: `1px solid ${vars.inputBorder}`,
                    color: vars.text,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = vars.accentFocus;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${vars.isDark ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.12)"}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = vars.inputBorder;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Submit */}
              <div className="pt-1 space-y-3">
                <button
                  type="button"
                  onClick={sendDonation}
                  disabled={!isReady}
                  className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#7c3aed" }}
                >
                  {loading
                    ? "Memproses pembayaran…"
                    : !connected
                    ? "Menghubungkan…"
                    : !name
                    ? "Masukkan nama dulu"
                    : `Bayar ${formatRupiah(amount)} & Kirim Alert`}
                </button>
                <p className="text-center text-xs" style={{ color: vars.subtext }}>
                  Pembayaran aman melalui{" "}
                  <span className="font-medium" style={{ color: vars.isDark ? "#d4d4d8" : "#52525b" }}>
                    Midtrans
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}