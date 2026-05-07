"use client";

import { useRouter } from "next/navigation";

const LAYOUTS = [
  {
    name: 'Leaderboard',
    desc: 'Konfigurasi overlay',
    route: '/customize/leaderboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="14" width="4" height="8" rx="1" />
        <rect x="9" y="9" width="4" height="13" rx="1" />
        <rect x="16" y="4" width="4" height="18" rx="1" />
        <path d="M2 3l4-1 4 3 4-4 4 2" />
      </svg>
    ),
  },
  {
    name: 'Top Up Page',
    desc: 'Konfigurasi overlay',
    route: '/customize/donation-page',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
        <path d="M14 15h2" />
      </svg>
    ),
  },
  {
    name: 'Alert',
    desc: 'Konfigurasi overlay',
    route: '/customize/alert',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 4 2 6 2 6H4s2-2 2-6" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        <path d="M12 2v1" />
      </svg>
    ),
  },
  {
    name: 'Running Text',
    desc: 'Konfigurasi overlay',
    route: '/customize/running-text',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18" />
        <path d="M3 6h18" />
        <path d="M3 18h10" />
        <path d="M17 15l3 3-3 3" />
      </svg>
    ),
  },
  {
    name: 'Media Share',
    desc: 'Konfigurasi overlay',
    route: '/customize/media-share',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="14" rx="2" />
        <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" opacity="0.7" />
        <path d="M8 20h8" />
        <path d="M12 18v2" />
      </svg>
    ),
  },
  {
    name: 'QR Code',
    desc: 'Konfigurasi overlay',
    route: '/customize/qr-code',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
        <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
        <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
        <path d="M14 14h3v3h-3z" />
        <path d="M17 17h4" />
        <path d="M17 21v-4" />
      </svg>
    ),
  },
  {
    name: 'Milestone',
    desc: 'Konfigurasi overlay',
    route: '/customize/milestone',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

export default function LayoutCards() {
  const router = useRouter();

  return (
    <div>
      <h2 className="text-sm text-[#6b6b78] uppercase tracking-widest mb-4">Layout Overlay</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {LAYOUTS.map((layout) => (
          <div
            key={layout.name}
            onClick={() => router.push(layout.route)}
            className="bg-[#1a1a20] border border-[#2a2a30] rounded-xl p-5 hover:border-indigo-500 transition-colors cursor-pointer group"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#222228] group-hover:bg-[#23233a] mb-3 transition-colors text-[#6b6b78] group-hover:text-indigo-400">
              {layout.icon}
            </div>
            <p className="text-sm font-medium text-[#c8c8d4]">{layout.name}</p>
            <p className="text-xs text-[#4a4a58] mt-1">{layout.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}