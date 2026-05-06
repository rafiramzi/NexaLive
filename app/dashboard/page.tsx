'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WalletCard from '../components/wallet_layout/wallet_card';

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
    bank_name: string;
  } | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [cashOutLoading, setCashOutLoading] = useState(false);
  const [cashOutError, setCashOutError] = useState<string | null>(null);
  const [cashOutSuccess, setCashOutSuccess] = useState(false);
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

  const handleCashOut = async () => {
    if (!wallet || wallet.balance <= 0 || cashOutLoading) return;
    setCashOutLoading(true);
    setCashOutError(null);
    setCashOutSuccess(false);
    try {
      const res = await fetch('/api/wallet/cashout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setCashOutError(data.error ?? 'Gagal melakukan cash out.');
        return;
      }
      setCashOutSuccess(true);
      const walletRes = await fetch('/api/wallet/get-wallet');
      const walletData = await walletRes.json();
      setWallet(walletData.wallet);
    } catch {
      setCashOutError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setCashOutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

  const canCashOut = wallet && wallet.balance > 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
        <span className="text-sm font-mono text-gray-500 tracking-widest uppercase">NexaLive</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-semibold text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 border border-gray-300 rounded-md hover:border-gray-400"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-gray-500 text-sm mb-1">Selamat datang kembali</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {user?.username} <span className="text-gray-400">👋</span>
          </h1>
        </div>
        
        <WalletCard/>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Donasi', value: 'Rp 0' },
            { label: 'Donatur', value: '0' },
            { label: 'Transaksi', value: '0' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-sm text-gray-500 uppercase tracking-widest mb-4">Layout Overlay</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['Leaderboard', 'Top Up', 'Alert', 'Running Text', 'Media Share', 'QR Code'].map((layout) => (
              <div
                key={layout}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-500 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-indigo-100 mb-3 transition-colors" />
                <p className="text-sm font-medium">{layout}</p>
                <p className="text-xs text-gray-500 mt-1">Konfigurasi overlay</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}