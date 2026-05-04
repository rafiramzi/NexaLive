'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
}

interface Wallet {
  id: string;
  balance: number;
  bank_type: string;
  bank_name: {
    id: string;
    name: string;
  } | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        return fetch('/api/wallet/get-wallet');
      })
      .then((res) => res.json())
      .then((data) => setWallet(data.wallet))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-mono text-zinc-400 tracking-widest uppercase">NexaLive</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-zinc-300">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-zinc-500 hover:text-white transition-colors px-3 py-1.5 border border-zinc-700 rounded-md hover:border-zinc-500"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <p className="text-zinc-500 text-sm mb-1">Selamat datang kembali</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {user?.username} <span className="text-zinc-600">👋</span>
          </h1>
        </div>

        {/* Wallet Banner */}
        {wallet === null ? (
          <div className="mb-10 border border-dashed border-zinc-700 rounded-xl p-6 flex items-center justify-between bg-zinc-900/50">
            <div>
              <p className="text-sm font-medium text-zinc-300 mb-1">Kamu belum punya wallet</p>
              <p className="text-xs text-zinc-500">Setup wallet untuk mulai menerima donasi</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/wallet/setup')}
              className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg font-medium"
            >
              Setup Wallet
            </button>
          </div>
        ) : (
          <div className="mb-10 border border-zinc-800 rounded-xl p-6 bg-zinc-900 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Saldo Wallet</p>
              <p className="text-2xl font-semibold">{formatRupiah(wallet.balance)}</p>
              <p className="text-xs text-zinc-500 mt-1">
                {wallet.bank_name?.name ?? '-'} · {wallet.bank_type === 'e_wallet' ? 'E-Wallet' : 'Bank'}
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/wallet')}
              className="text-xs px-3 py-1.5 border border-zinc-700 hover:border-zinc-500 rounded-md text-zinc-400 hover:text-white transition-colors"
            >
              Kelola Wallet
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Donasi', value: 'Rp 0' },
            { label: 'Donatur', value: '0' },
            { label: 'Transaksi', value: '0' },
            { label: 'Saldo', value: wallet ? formatRupiah(wallet.balance) : 'Rp 0' },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Layouts */}
        <div>
          <h2 className="text-sm text-zinc-500 uppercase tracking-widest mb-4">Layout Overlay</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['Leaderboard', 'Top Up', 'Alert', 'Running Text', 'Media Share', 'QR Code'].map((layout) => (
              <div
                key={layout}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-indigo-500 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-indigo-500/20 mb-3 transition-colors" />
                <p className="text-sm font-medium">{layout}</p>
                <p className="text-xs text-zinc-600 mt-1">Konfigurasi overlay</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}