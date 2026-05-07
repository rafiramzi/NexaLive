'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Wallet {
  id: string;
  balance: number;
  bank_type: string;
  bank_name: {
    id: string;
    bank_name: string;
  } | null;
}


interface User {
  id: string;
  email: string;
  username: string;
}

export default function WalletCard(){
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [cashOutLoading, setCashOutLoading] = useState(false);
    const [cashOutError, setCashOutError] = useState<string | null>(null);
    const [cashOutSuccess, setCashOutSuccess] = useState(false);
    const [user, setUser] = useState<User | null>(null);
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

    const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

    const canCashOut = wallet && wallet.balance > 100000;

    return(
        <>
       {wallet === null ? (
          <div className="mb-10 border border-dashed border-gray-300 rounded-xl p-6 flex items-center justify-between bg-[#1a1a20]">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Kamu belum punya wallet</p>
              <p className="text-xs text-gray-500">Setup wallet untuk mulai menerima donasi</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/wallet/setup')}
              className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg font-medium text-white"
            >
              Setup Wallet
            </button>
          </div>
        ) : (
          <div className="mb-10 border border-[#2a2a30] rounded-xl p-6 bg-[#1a1a20]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-[#6b6b78] mb-1">Saldo Wallet</p>
                <p className="text-2xl font-semibold">{formatRupiah(wallet.balance)}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleCashOut}
                  disabled={!canCashOut || cashOutLoading}
                  className="text-xs px-3 py-1.5 rounded-md font-medium transition-all bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {cashOutLoading ? (
                    <>
                      <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      Memproses…
                    </>
                  ) : (
                    'Cash Out'
                  )}
                </button>

                <button
                  onClick={() => router.push('/dashboard/wallet')}
                  className="text-xs px-3 py-1.5 border border-[#2a2a30] hover:border-[#4a4a58] rounded-md text-[#6b6b78] hover:text-[#e8e8ea] transition-colors"
                >
                  Kelola
                </button>
              </div>
            </div>

            {(cashOutError || cashOutSuccess || !canCashOut) && (
              <div className="mt-4 pt-4 border-t border-[#2a2a30]">
                {cashOutError && <p className="text-xs text-red-500">{cashOutError}</p>}
                {cashOutSuccess && <p className="text-xs text-emerald-500">✓ Cash out berhasil diproses.</p>}
                {!canCashOut && !cashOutError && !cashOutSuccess && (
                  <p className="text-xs text-gray-400">Saldo tidak cukup untuk cash out.</p>
                )}
              </div>
            )}
          </div>
        )}
        </>
    )


}