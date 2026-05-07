'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import WalletCard from '../components/wallet_layout/wallet_card';
import LayoutCards from '../components/layout_cards/layout_cards';

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!meRes.ok) throw new Error('Unauthorized');
      const meData = await meRes.json();
      setUser(meData.user);

      const walletRes = await fetch('/api/wallet/get-wallet', { cache: 'no-store' });
      const walletData = await walletRes.json();
      setWallet(walletData.wallet);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle bfcache restore — fires when browser navigates back/forward from cache
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) fetchData();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [fetchData]);

  // Handle tab refocus (back from another tab or window)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchData();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [fetchData]);

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
      const walletRes = await fetch('/api/wallet/get-wallet', { cache: 'no-store' });
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
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f11]">
        <div className="w-6 h-6 border-2 border-[#e8e8ea] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="min-h-screen bg-[#0f0f11] text-[#e8e8ea]">
      <nav className="border-b border-[#2a2a30] px-6 py-4 flex items-center justify-between bg-[#131316]">
        <span className="text-sm font-mono text-[#6b6b78] tracking-widest uppercase">NexaLive</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-semibold text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-[#b0b0bc]">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-[#6b6b78] hover:text-[#e8e8ea] transition-colors px-3 py-1.5 border border-[#2e2e38] rounded-md hover:border-[#4a4a58]"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-[#6b6b78] text-sm mb-1">Selamat datang kembali</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {user?.username} <span className="text-[#4a4a58]">👋</span>
          </h1>
        </div>

        <WalletCard />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Donasi', value: 'Rp 0' },
            { label: 'Donatur', value: '0' },
            { label: 'Transaksi', value: '0' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#1a1a20] border border-[#2a2a30] rounded-xl p-4">
              <p className="text-xs text-[#6b6b78] mb-1">{stat.label}</p>
              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        <LayoutCards />
      </main>
    </div>
  );
}