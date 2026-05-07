'use client';

import { useState, useEffect } from 'react';

const NAV_LINKS = ['Fitur', 'Cara Kerja', 'FAQ'];

const FEATURES = [
  { icon: '⚡', title: 'Donasi Real-Time', desc: 'Alert donasi muncul langsung di layar streaming kamu dengan animasi yang bisa dikustomisasi.' },
  { icon: '🎨', title: 'Layout Overlay', desc: 'Leaderboard, running text, media share, QR code — siap pakai tanpa satu baris kode pun.' },
  { icon: '💸', title: 'Cashout Instan', desc: 'Cairkan saldo kapan saja ke rekening bank atau dompet digital pilihanmu.' },
  { icon: '📊', title: 'Analitik Lengkap', desc: 'Pantau donatur, total pendapatan, dan tren pertumbuhan channelmu secara real-time.' },
  { icon: '🔒', title: 'Aman & Terpercaya', desc: 'Transaksi dienkripsi end-to-end. Dana streamer terlindungi penuh setiap saat.' },
  { icon: '🌐', title: 'Multi Platform', desc: 'Kompatibel dengan OBS, Streamlabs, dan semua software streaming populer.' },
];

const OVERLAYS = [
  { name: 'Leaderboard', desc: 'Top donatur bulan ini', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  { name: 'Alert Donasi', desc: 'Notifikasi real-time', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { name: 'Running Text', desc: 'Ticker berjalan custom', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { name: 'Media Share', desc: 'Putar video dari donatur', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { name: 'QR Code', desc: 'Donasi scan & go', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  { name: 'Goal Bar', desc: 'Progress donasi harian', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
];

const PLANS = [
  {
    name: 'Starter',
    price: 'Gratis',
    sub: 'Selamanya',
    features: ['Alert donasi basic', '1 overlay aktif', 'Cashout mingguan', 'Support email'],
    cta: 'Mulai Gratis',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'Rp 49.000',
    sub: 'per bulan',
    features: ['Alert animasi premium', 'Semua overlay aktif', 'Cashout harian', 'Media share', 'Analitik lengkap', 'Priority support'],
    cta: 'Coba 14 Hari Gratis',
    highlight: true,
  },
  {
    name: 'Elite',
    price: 'Rp 99.000',
    sub: 'per bulan',
    features: ['Semua fitur Pro', 'Custom branding', 'API access', 'Dedicated support', 'Early access fitur baru'],
    cta: 'Hubungi Kami',
    highlight: false,
  },
];

const STEPS = [
  { n: '01', title: 'Daftar Akun', desc: 'Buat akun NexaLive dalam 30 detik. Gratis, tanpa kartu kredit.' },
  { n: '02', title: 'Pasang Overlay', desc: 'Copy URL browser source dan paste ke OBS atau Streamlabs.' },
  { n: '03', title: 'Mulai Terima Donasi', desc: 'Share link donasi ke penonton dan mulai streaming.' },
];

const FAQS = [
  { q: 'Apakah NexaLive gratis?', a: 'Ya, paket Starter gratis selamanya dengan fitur dasar. Kamu bisa upgrade kapan saja ke paket Pro atau Elite.' },
  { q: 'Berapa lama proses cashout?', a: 'Cashout diproses dalam 1x24 jam untuk paket Starter, dan instan untuk paket Pro ke atas.' },
  { q: 'Platform streaming apa saja yang didukung?', a: 'NexaLive kompatibel dengan OBS Studio, Streamlabs, XSplit, dan semua software yang mendukung browser source.' },
  { q: 'Apakah ada biaya transaksi?', a: 'Kami mengambil komisi 5% dari setiap donasi yang masuk. Tidak ada biaya tersembunyi lainnya.' },
];

const STATS = [
  { value: '12.000+', label: 'Streamer aktif' },
  { value: 'Rp 4,8 M', label: 'Total donasi tersalur' },
  { value: '99,9%', label: 'Uptime terjamin' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left border-b border-zinc-800 py-5 group"
    >
      <div className="flex items-start justify-between gap-6">
        <p className="text-[15px] text-zinc-200 font-medium leading-snug pr-4">{q}</p>
        <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center transition-all duration-300 ${open ? 'bg-indigo-500 border-indigo-500 rotate-45' : 'group-hover:border-zinc-500'}`}>
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M4.5 1v7M1 4.5h7" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-32 pt-3' : 'max-h-0'}`}>
        <p className="text-[14px] text-zinc-500 leading-relaxed">{a}</p>
      </div>
    </button>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white antialiased overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .anim-1 { animation: fadein 0.7s ease both; }
        .anim-2 { animation: fadein 0.7s 0.1s ease both; }
        .anim-3 { animation: fadein 0.7s 0.2s ease both; }
        .anim-4 { animation: fadein 0.7s 0.3s ease both; }
        .live-pulse { animation: blink 2.4s ease-in-out infinite; }
        .ticker-track { animation: ticker 18s linear infinite; }

        .serif-italic { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; }

        .feature-row:hover { background: rgba(255,255,255,0.02); }
        .btn-cta:hover { background: #4f46e5; transform: translateY(-1px); }
        .btn-cta:active { transform: translateY(0); }

        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0a0b; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
      `}</style>

      {/* Subtle ambient top gradient */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 h-[500px] z-0" style={{ background: 'radial-gradient(ellipse 900px 400px at 50% -100px, rgba(99,102,241,0.09) 0%, transparent 70%)' }} />

      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-white/[0.05]' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="serif-italic text-white text-sm leading-none">N</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight">NexaLive</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`}
                className="text-[13px] text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/[0.04]">
                {l}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-[13px] text-zinc-500 hover:text-zinc-200 transition-colors">Masuk</a>
            <a href="/register" className="btn-cta text-[13px] font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/20">
              Daftar Gratis
            </a>
          </div>

          <button className="md:hidden text-zinc-400 p-1" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#0c0c0e]/98 backdrop-blur-xl border-t border-white/[0.05] px-6 pt-4 pb-6 flex flex-col gap-1">
            {NAV_LINKS.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-[14px] text-zinc-400 hover:text-white py-3 border-b border-white/[0.05]" onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <div className="flex flex-col gap-2 pt-4">
              <a href="/login" className="text-[14px] text-zinc-500 py-2 text-center">Masuk</a>
              <a href="/register" className="btn-cta text-[14px] font-medium bg-indigo-600 text-white px-4 py-3 rounded-lg text-center">Daftar Gratis</a>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative z-10 pt-40 pb-24 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">

          {/* Label */}
          <div className="anim-1 inline-flex items-center gap-2 mb-7 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03]">
            <span className="live-pulse w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[12px] text-zinc-400 tracking-wide">Platform donasi streaming #1 Indonesia</span>
          </div>

          {/* Headline */}
          <h1 className="anim-2 mb-6 text-white leading-[1.04] tracking-tight" style={{ fontSize: 'clamp(42px, 6.5vw, 80px)' }}>
            Monetisasi stream<br />
            <span className="serif-italic" style={{ color: 'rgba(165,180,252,0.9)', fontSize: 'clamp(44px, 6.8vw, 84px)' }}>tanpa batas.</span>
          </h1>

          {/* Subtext */}
          <p className="anim-3 text-[17px] text-zinc-500 max-w-lg leading-relaxed mb-10 font-light">
            NexaLive hadir untuk streamer Indonesia — terima donasi, pasang overlay, dan cairkan penghasilan kapan saja.
          </p>

          {/* CTA */}
          <div className="anim-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <a href="/register" className="btn-cta inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3.5 rounded-xl text-[14px] transition-all duration-200 shadow-xl shadow-indigo-600/25">
              Mulai Gratis Sekarang
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4m4-4H3" /></svg>
            </a>
            <a href="#cara-kerja" className="inline-flex items-center gap-2 text-[14px] text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-3.5">
              <span className="w-7 h-7 rounded-full border border-zinc-700 flex items-center justify-center">
                <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
              </span>
              Lihat Demo
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap gap-10 border-t border-white/[0.06] pt-10">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-2xl font-semibold text-white tracking-tight tabular-nums">{s.value}</p>
              <p className="text-[12px] text-zinc-600 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Stream Preview Window */}
        <div className="mt-20 relative">
          <div className="absolute -inset-10 z-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 80%, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
          <div className="relative z-10 rounded-2xl border border-white/[0.07] overflow-hidden bg-[#0e0e12]" style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02)' }}>
            {/* Chrome bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.05] bg-[#0c0c10]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-[11px] text-zinc-600 bg-white/[0.03] border border-white/[0.05] rounded px-4 py-1">
                  app.nexalive.id/overlay/preview
                </span>
              </div>
            </div>

            {/* Stream body */}
            <div className="relative overflow-hidden h-64 md:h-80 bg-[#0d0d16]">
              {/* LIVE badge */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-red-600/90 rounded-md px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white live-pulse" />
                <span className="text-[10px] font-bold text-white tracking-widest">LIVE</span>
              </div>

              {/* Leaderboard overlay */}
              <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-3 min-w-[150px]">
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2 font-medium">Top Donatur</p>
                {['RizkyGG — Rp 50.000', 'AyuFan — Rp 35.000', 'BimoBro — Rp 20.000'].map((d, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1.5 last:mb-0">
                    <span className="text-[10px] text-zinc-600 w-3">{i + 1}</span>
                    <span className="text-[11px] text-zinc-300">{d}</span>
                  </div>
                ))}
              </div>

              {/* Alert card */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-black/70 backdrop-blur-xl border border-white/[0.10] rounded-2xl px-8 py-5 text-center" style={{ boxShadow: '0 0 0 1px rgba(99,102,241,0.15), 0 24px 48px rgba(0,0,0,0.6)' }}>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2">Donasi Baru</p>
                  <p className="text-3xl font-bold text-white mb-1 tabular-nums" style={{ letterSpacing: '-0.02em' }}>Rp 100.000</p>
                  <p className="text-[12px] text-indigo-400 font-medium mb-2">dari SuperFan99</p>
                  <p className="text-[12px] text-zinc-500 italic">"Mantap jiwa, terus streaming!"</p>
                </div>
              </div>

              {/* Ticker */}
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-lg px-4 py-2 overflow-hidden">
                  <div className="flex">
                    <p className="ticker-track text-[11px] text-zinc-500 whitespace-nowrap">
                      🎉 RizkyGG donasi Rp 50.000 — "Semangat terus!" &nbsp;·&nbsp; 🎉 AyuFan donasi Rp 35.000 — "GG!" &nbsp;·&nbsp; 🎉 SuperFan99 donasi Rp 100.000 — "Lanjutkan!" &nbsp;&nbsp;&nbsp;&nbsp;
                      🎉 RizkyGG donasi Rp 50.000 — "Semangat terus!" &nbsp;·&nbsp; 🎉 AyuFan donasi Rp 35.000 — "GG!" &nbsp;·&nbsp; 🎉 SuperFan99 donasi Rp 100.000 — "Lanjutkan!" &nbsp;&nbsp;&nbsp;&nbsp;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="relative z-10 py-12 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-8">Dipercaya ribuan streamer Indonesia</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'RizkyGG', game: 'Mobile Legends', total: 'Rp 12,4 jt', color: 'bg-violet-500/10 text-violet-400' },
              { name: 'AyuStream', game: 'Valorant', total: 'Rp 8,9 jt', color: 'bg-pink-500/10 text-pink-400' },
              { name: 'BimoBroadcast', game: 'Free Fire', total: 'Rp 21,2 jt', color: 'bg-indigo-500/10 text-indigo-400' },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-3 border border-white/[0.06] rounded-xl px-5 py-3.5 hover:border-white/[0.10] transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold ${s.color} border border-current/20`}>
                  {s.name[0]}
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-medium text-zinc-200">{s.name}</p>
                  <p className="text-[11px] text-zinc-600">{s.game} · <span className="text-emerald-500">{s.total}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="fitur" className="relative z-10 py-28 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Sticky label */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="text-[11px] text-indigo-400 uppercase tracking-widest mb-4">Fitur Platform</p>
              <h2 className="text-white mb-5 leading-[1.08] tracking-tight" style={{ fontSize: 'clamp(30px, 4vw, 44px)' }}>
                Semua tools,<br />
                <span className="serif-italic text-indigo-300/80">satu platform.</span>
              </h2>
              <p className="text-[15px] text-zinc-500 leading-relaxed font-light">
                Dari overlay hingga analitik, NexaLive punya semua yang dibutuhkan untuk menumbuhkan channel.
              </p>
            </div>
          </div>

          {/* Feature list */}
          <div className="lg:col-span-8 divide-y divide-white/[0.05]">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-row flex gap-5 py-7 px-2 rounded-lg transition-colors duration-200 -mx-2">
                <span className="text-xl shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <h3 className="text-[14px] font-semibold text-zinc-100 mb-1.5">{f.title}</h3>
                  <p className="text-[13px] text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OVERLAYS ─── */}
      <section className="relative z-10 py-28 px-6 border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div>
              <p className="text-[11px] text-purple-400 uppercase tracking-widest mb-4">Overlay System</p>
              <h2 className="text-white leading-[1.08] tracking-tight" style={{ fontSize: 'clamp(30px, 4vw, 44px)' }}>
                Overlay siap pakai,<br />
                <span className="serif-italic text-purple-300/80">tanpa coding.</span>
              </h2>
            </div>
            <p className="text-[14px] text-zinc-500 max-w-xs leading-relaxed font-light md:text-right">
              Copy-paste URL ke OBS dan langsung aktif dalam hitungan detik.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {OVERLAYS.map(o => (
              <div key={o.name} className="group border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-5 transition-all duration-200 cursor-default">
                <div className={`inline-flex items-center gap-2 text-[11px] font-medium px-2.5 py-1 rounded-md border mb-4 ${o.color}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {o.name}
                </div>
                <p className="text-[13px] text-zinc-500">{o.desc}</p>
                <p className="mt-4 text-[11px] text-zinc-700 group-hover:text-zinc-500 transition-colors flex items-center gap-1">
                  Lihat preview
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4m4-4H3" /></svg>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="cara-kerja" className="relative z-10 py-28 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[11px] text-emerald-400 uppercase tracking-widest mb-4">Cara Kerja</p>
          <h2 className="text-white leading-[1.08] tracking-tight" style={{ fontSize: 'clamp(30px, 4vw, 44px)' }}>
            Mulai dalam <span className="serif-italic text-emerald-300/80">3 langkah.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative border border-white/[0.06] rounded-xl p-7 bg-white/[0.01]">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-3 z-10">
                  <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                    <path d="M0 5h16M12 1l4 4-4 4" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <span className="serif-italic text-4xl text-indigo-500/40 mb-5 block leading-none">{s.n}</span>
              <h3 className="text-[15px] font-semibold text-zinc-100 mb-2">{s.title}</h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>      

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center">
                  <span className="serif-italic text-white text-xs">N</span>
                </div>
                <span className="text-[14px] font-semibold text-white">NexaLive</span>
              </div>
              <p className="text-[12px] text-zinc-600 leading-relaxed">Platform donasi dan overlay streaming untuk kreator konten Indonesia.</p>
            </div>

            <div className="grid grid-cols-3 gap-10 text-[13px]">
              {[
                { title: 'Produk', links: ['Fitur', 'Harga', 'Overlay', 'API'] },
                { title: 'Perusahaan', links: ['Tentang', 'Blog', 'Karir', 'Pers'] },
                { title: 'Dukungan', links: ['Dokumentasi', 'Discord', 'Status', 'Kontak'] },
              ].map(col => (
                <div key={col.title}>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-4">{col.title}</p>
                  <ul className="space-y-3">
                    {col.links.map(l => (
                      <li key={l}><a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors text-[12px]">{l}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-zinc-700">© 2025 NexaLive. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {['Privasi', 'Syarat & Ketentuan', 'Cookie'].map(l => (
                <a key={l} href="#" className="text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}