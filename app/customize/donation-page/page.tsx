'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
}

interface DonationPageConfig {
  theme_mode: 'dark' | 'light';
  card_color: string;
  button_color: string;
  shadow_enabled: boolean;
  shadow_color: string;
}

const DEFAULT_CONFIG: DonationPageConfig = {
  theme_mode: 'light',
  card_color: '#ffffff',
  button_color: '#7c3aed',
  shadow_enabled: false,
  shadow_color: '#7c3aed',
};

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  const hh = h / 360, ss = s / 100, ll = l / 100;
  let r, g, b;
  if (ss === 0) { r = g = b = ll; }
  else {
    const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
    const p = 2 * ll - q;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = hue2rgb(p, q, hh + 1 / 3);
    g = hue2rgb(p, q, hh);
    b = hue2rgb(p, q, hh - 1 / 3);
  }
  return '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hsl = hexToHsl(value);
  const [h, setH] = useState(hsl.h);
  const [s, setS] = useState(hsl.s);
  const [l, setL] = useState(hsl.l);

  useEffect(() => { onChange(hslToHex(h, s, l)); }, [h, s, l]);
  useEffect(() => { const { h: ph, s: ps, l: pl } = hexToHsl(value); setH(ph); setS(ps); setL(pl); }, []);

  const Slider = ({ label, val, setVal, min, max, gradient }: {
    label: string; val: number; setVal: (n: number) => void;
    min: number; max: number; gradient: string;
  }) => (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[11px] text-zinc-600">{label}</span>
        <span className="text-[11px] font-mono text-zinc-500">{val}{label === 'Hue' ? '°' : '%'}</span>
      </div>
      <div className="relative h-2.5 rounded-full" style={{ background: gradient }}>
        <input type="range" min={min} max={max} value={val}
          onChange={e => setVal(+e.target.value)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2"
          style={{ left: `${((val - min) / (max - min)) * 100}%`, background: `hsl(${h},${s}%,${l}%)` }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-400 tracking-wide">{label}</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md border border-white/10" style={{ background: value }} />
          <span className="text-[11px] font-mono text-zinc-500">{value.toUpperCase()}</span>
        </div>
      </div>
      <Slider label="Hue" val={h} setVal={setH} min={0} max={360}
        gradient="linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" />
      <Slider label="Saturation" val={s} setVal={setS} min={0} max={100}
        gradient={`linear-gradient(to right,hsl(${h},0%,${l}%),hsl(${h},100%,${l}%))`} />
      <Slider label="Lightness" val={l} setVal={setL} min={0} max={100}
        gradient={`linear-gradient(to right,#000,hsl(${h},${s}%,50%),#fff)`} />
    </div>
  );
}

// ── Accurate donation page preview ──────────────────────────────────────────
function DonationPreview({ config, username }: { config: DonationPageConfig; username: string }) {
  const isDark = config.theme_mode === 'dark';

  const pageBg   = isDark ? '#18181b' : '#f4f4f5';
  const cardBg   = config.card_color;
  const border   = isDark ? '#3f3f46' : '#e4e4e7';
  const txtPrim  = isDark ? '#f4f4f5' : '#18181b';
  const txtSub   = isDark ? '#a1a1aa' : '#71717a';
  const txtMuted = isDark ? '#71717a' : '#a1a1aa';
  const inputBg  = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const inputBdr = isDark ? '#3f3f46' : '#e4e4e7';
  const chipBg   = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const chipBdr  = isDark ? '#3f3f46' : '#e4e4e7';

  const shadowStyle = config.shadow_enabled
    ? { boxShadow: `0 8px 40px ${config.shadow_color}50, 0 0 0 1px ${config.shadow_color}25` }
    : isDark
      ? { boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }
      : { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' };

  const initials = username?.slice(0, 2).toUpperCase() ?? 'ST';
  const QUICK = [10000, 25000, 50000, 100000];
  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="w-full flex items-start justify-center px-4 py-6 transition-colors duration-300"
      style={{ background: pageBg, minHeight: '100%' }}>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl overflow-hidden transition-all duration-300"
          style={{ background: cardBg, border: `1px solid ${border}`, ...shadowStyle }}>

          {/* Creator header — matches real page */}
          <div className="px-6 pt-6 pb-5 flex items-center gap-4" style={{ borderBottom: `1px solid ${border}` }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
              style={{ background: `linear-gradient(135deg,${config.button_color},${config.button_color}88)` }}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold truncate" style={{ color: txtPrim }}>{username}</p>
              <p className="text-[12px]" style={{ color: txtSub }}>@{username}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-emerald-500">Live</span>
            </div>
          </div>

          {/* Form — matches real page structure */}
          <div className="px-6 py-5 space-y-4">

            {/* Name field */}
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium" style={{ color: txtSub }}>
                Nama kamu <span style={{ color: '#ef4444' }}>*</span>
              </p>
              <div className="rounded-xl px-3.5 py-2.5 text-[12px]"
                style={{ background: inputBg, border: `1px solid ${inputBdr}`, color: txtMuted }}>
                Contoh: Budi Santoso
              </div>
            </div>

            {/* Amount field */}
            <div className="space-y-2">
              <p className="text-[12px] font-medium" style={{ color: txtSub }}>
                Jumlah donasi <span style={{ color: '#ef4444' }}>*</span>
              </p>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium pointer-events-none" style={{ color: txtMuted }}>Rp</span>
                <div className="rounded-xl pl-9 pr-3.5 py-2.5 text-[12px]"
                  style={{ background: inputBg, border: `1px solid ${inputBdr}`, color: txtPrim }}>
                  25.000
                </div>
              </div>
              {/* Quick amount chips */}
              <div className="grid grid-cols-4 gap-1.5">
                {QUICK.map((v, i) => (
                  <div key={v} className="rounded-lg py-2 text-center text-[10px] font-medium"
                    style={{
                      background: i === 1 ? config.button_color : chipBg,
                      border: `1px solid ${i === 1 ? config.button_color : chipBdr}`,
                      color: i === 1 ? '#fff' : txtSub,
                    }}>
                    {fmt(v)}
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium" style={{ color: txtSub }}>
                Pesan <span style={{ color: txtMuted }}>(opsional)</span>
              </p>
              <div className="rounded-xl px-3.5 py-2.5 h-[60px] text-[12px]"
                style={{ background: inputBg, border: `1px solid ${inputBdr}`, color: txtMuted }}>
                Tulis pesan untuk streamer…
              </div>
            </div>

            {/* Media share */}
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium" style={{ color: txtSub }}>
                Media Share <span style={{ color: txtMuted }}>(opsional)</span>
              </p>
              <div className="rounded-xl px-3.5 py-2.5 text-[12px]"
                style={{ background: inputBg, border: `1px solid ${inputBdr}`, color: txtMuted }}>
                Link YouTube atau TikTok
              </div>
            </div>

            {/* CTA */}
            <div className="pt-1 space-y-2">
              <div className="w-full rounded-xl py-3 text-center text-[13px] font-semibold text-white"
                style={{ background: config.button_color, boxShadow: `0 4px 16px ${config.button_color}50` }}>
                Bayar {fmt(25000)} &amp; Kirim Alert
              </div>
              <p className="text-center text-[10px]" style={{ color: txtMuted }}>
                Pembayaran aman melalui <span style={{ color: txtSub, fontWeight: 500 }}>Midtrans</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function EditDonationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<DonationPageConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'background' | 'card' | 'button' | 'shadow'>('background');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => setUser(data.user))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  const update = useCallback((patch: Partial<DonationPageConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
    setSaved(false);
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch('/api/customize/donation-page/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout_type: 'topup',
          bg_color: config.theme_mode === 'dark' ? '#18181b' : '#f4f4f5',
          card_color: config.card_color,
          button_color: config.button_color,
          shadow_color: config.shadow_enabled ? config.shadow_color : null,
          theme_mode: config.theme_mode,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* handle */ }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f11]">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
      </div>
    );
  }

  const TABS = [
    { key: 'background', label: 'Background' },
    { key: 'card',       label: 'Card' },
    { key: 'button',     label: 'Tombol' },
    { key: 'shadow',     label: 'Shadow' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0f0f11] text-[#e8e8ea]"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* ── Navbar ── */}
      <nav className="border-b border-[#2a2a30] px-6 h-14 flex items-center justify-between bg-[#131316] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="w-px h-4 bg-white/[0.08]" />
          <span className="text-[13px] font-medium text-zinc-300">Edit Donation Page</span>
          <span className="hidden sm:inline text-[11px] text-zinc-600">· top-up layout</span>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-[12px] text-emerald-400 flex items-center gap-1.5 mr-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Tersimpan
            </span>
          )}
          <a href={`/donate/${user?.username}`} target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Buka
          </a>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 text-[13px] font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg transition-all">
            {saving
              ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            }
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-56px)]">

        {/* ── Left: Controls ── */}
        <aside className="w-[268px] shrink-0 border-r border-[#2a2a30] bg-[#131316] flex flex-col overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-[#2a2a30] px-2 pt-2 gap-0.5">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 text-[11px] font-medium py-2 rounded-t-md transition-all ${activeTab === tab.key
                  ? 'text-white border-b-2 border-indigo-500 bg-indigo-500/[0.06]'
                  : 'text-zinc-600 hover:text-zinc-400'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">

            {/* BACKGROUND */}
            {activeTab === 'background' && (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-3 font-medium">Mode Tema</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['light', 'dark'] as const).map(mode => {
                      const active = config.theme_mode === mode;
                      return (
                        <button key={mode} onClick={() => update({
                          theme_mode: mode,
                          card_color: mode === 'dark' ? '#27272a' : '#ffffff',
                        })}
                          className={`flex flex-col items-center gap-2.5 py-4 px-3 rounded-xl border text-[12px] font-medium transition-all ${active
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                            : 'border-white/[0.06] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300'}`}>
                          {/* Mini mockup */}
                          <div className={`w-full h-10 rounded-lg border overflow-hidden relative ${mode === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
                            <div className={`absolute inset-x-2 top-2 bottom-2 rounded-md ${mode === 'dark' ? 'bg-zinc-700' : 'bg-white'}`} />
                          </div>
                          {mode === 'light' ? '☀️ Light' : '🌙 Dark'}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <svg className="w-3.5 h-3.5 text-zinc-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 16v-4m0-4h.01" />
                  </svg>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Warna background mengikuti mode yang dipilih secara otomatis.
                  </p>
                </div>
              </div>
            )}

            {/* CARD */}
            {activeTab === 'card' && (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-4 font-medium">Warna Card</p>
                  <ColorPicker label="Card" value={config.card_color} onChange={v => update({ card_color: v })} />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-600 mb-3">Preset cepat</p>
                  <div className="flex flex-wrap gap-2">
                    {(config.theme_mode === 'dark'
                      ? ['#27272a', '#18181b', '#1e1e2e', '#0f172a', '#1a1a20', '#1c1c27']
                      : ['#ffffff', '#f8fafc', '#fafaf9', '#f0f0f5', '#fff7ed', '#f0fdf4']
                    ).map(c => (
                      <button key={c} onClick={() => update({ card_color: c })}
                        className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                        style={{ background: c, borderColor: config.card_color === c ? '#6366f1' : 'rgba(255,255,255,0.12)' }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BUTTON */}
            {activeTab === 'button' && (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-4 font-medium">Warna Tombol & Aksen</p>
                  <ColorPicker label="Tombol" value={config.button_color} onChange={v => update({ button_color: v })} />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-600 mb-3">Preset warna</p>
                  <div className="flex flex-wrap gap-2">
                    {['#7c3aed', '#4f46e5', '#0284c7', '#0f766e', '#16a34a', '#ca8a04', '#ea580c', '#dc2626', '#db2777', '#9333ea'].map(c => (
                      <button key={c} onClick={() => update({ button_color: c })}
                        className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                        style={{ background: c, borderColor: config.button_color === c ? 'white' : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Warna ini juga digunakan untuk avatar streamer dan chip nominal yang terpilih.
                  </p>
                </div>
              </div>
            )}

            {/* SHADOW */}
            {activeTab === 'shadow' && (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-4 font-medium">Shadow Card</p>
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] mb-4">
                    <div>
                      <p className="text-[13px] font-medium text-zinc-300">Aktifkan shadow</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">Efek bayangan berwarna</p>
                    </div>
                    <button onClick={() => update({ shadow_enabled: !config.shadow_enabled })}
                      className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${config.shadow_enabled ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${config.shadow_enabled ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {config.shadow_enabled ? (
                    <div className="space-y-5">
                      <ColorPicker label="Warna Shadow" value={config.shadow_color} onChange={v => update({ shadow_color: v })} />
                      <div>
                        <p className="text-[11px] text-zinc-600 mb-3">Preset cepat</p>
                        <div className="flex flex-wrap gap-2">
                          {['#7c3aed', '#4f46e5', '#db2777', '#dc2626', '#16a34a', '#0284c7'].map(c => (
                            <button key={c} onClick={() => update({ shadow_color: c })}
                              className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                              style={{ background: c, borderColor: config.shadow_color === c ? 'white' : 'rgba(255,255,255,0.1)' }} />
                          ))}
                        </div>
                      </div>
                      {/* Preview strip */}
                      <div className="p-4 rounded-xl" style={{ background: config.theme_mode === 'dark' ? '#18181b' : '#f4f4f5' }}>
                        <div className="h-10 rounded-xl transition-all"
                          style={{ background: config.card_color, boxShadow: `0 8px 32px ${config.shadow_color}50, 0 0 0 1px ${config.shadow_color}20` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <svg className="w-3.5 h-3.5 text-zinc-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 16v-4m0-4h.01" />
                      </svg>
                      <p className="text-[11px] text-zinc-600 leading-relaxed">
                        Aktifkan shadow untuk menambahkan efek cahaya berwarna di sekitar card.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reset */}
          <div className="p-4 border-t border-[#2a2a30]">
            <button onClick={() => { setConfig(DEFAULT_CONFIG); setSaved(false); }}
              className="w-full text-[12px] text-zinc-600 hover:text-zinc-300 py-2 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all">
              Reset ke default
            </button>
          </div>
        </aside>

        {/* ── Right: Preview ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#2a2a30] bg-[#111114]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-600 uppercase tracking-widest">Preview</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md border border-white/[0.06] text-zinc-600 font-mono">top-up</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${config.theme_mode === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100/10 text-zinc-400'}`}>
                {config.theme_mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" />
              <span className="text-[11px] text-zinc-600">Live</span>
            </div>
          </div>

          {/* Preview canvas */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-8" style={{ background: '#0c0c0e' }}>
            <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-white/[0.07] shadow-2xl flex flex-col"
              style={{ maxHeight: 'calc(100vh - 168px)' }}>
              {/* Chrome bar */}
              <div className="bg-[#1a1a20] px-4 py-2.5 flex items-center gap-2 border-b border-white/[0.06] shrink-0">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-md px-3 py-1 mx-1">
                  <span className="text-[10px] text-zinc-600 font-mono">nexalive.id/donate/{user?.username}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <DonationPreview config={config} username={user?.username || 'streamer'} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}