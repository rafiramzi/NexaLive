"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar";

type BankName = {
  id: string;
  bank_name: string;
  is_active: boolean;
  bank_type: "bank" | "ewallet" | string;
};

function formatPhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 15);
}

export default function CreateWalletPage() {
  const router = useRouter();

  const [banks, setBanks] = useState<BankName[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedBankType, setSelectedBankType] = useState<"bank" | "ewallet" | string>("");
  const [ccNumber, setCcNumber] = useState("");
  const [vaNumber, setVaNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUserId(d?.user?.id ?? null))
      .catch(() => setUserId(null));
  }, []);

  useEffect(() => {
    setBanksLoading(true);
    fetch("/api/bank/get-all")
      .then((r) => r.json())
      .then((d) => setBanks(d.bank_name ?? []))
      .catch(() => setBanks([]))
      .finally(() => setBanksLoading(false));
  }, []);

  const handleBankChange = (id: string) => {
    setSelectedBankId(id);
    const bank = banks.find((b) => b.id === id);
    setSelectedBankType(bank?.bank_type ?? "");
    setCcNumber("");
    setVaNumber("");
    setPhoneNumber("");
    setError(null);
  };

  const isBank = selectedBankType === "bank";
  const isEwallet = selectedBankType === "ewallet";

  const isFormValid = () => {
    if (!selectedBankId || !userId) return false;
    if (isBank) return ccNumber.replace(/\D/g, "").length >= 10;
    if (isEwallet) return vaNumber.length >= 10;
    return false;
  };

  const handleSubmit = async () => {
    if (!isFormValid() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, string | null> = {
        user_id: userId,
        bank_name_id: selectedBankId,
        bank_type: selectedBankType,
        cc_number: isBank ? ccNumber : null,
        va_number: isEwallet ? vaNumber : null,
        phone_number: phoneNumber || null,
      };

      const res = await fetch("/api/wallet/create-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal membuat wallet.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const bankOptions = banks.filter((b) => b.bank_type === "bank");
  const ewalletOptions = banks.filter((b) => b.bank_type === "ewallet");

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20";

  const labelClass = "block text-sm font-medium text-zinc-300";

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-zinc-950 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Buat Wallet</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Tambahkan rekening atau e-wallet untuk menerima pembayaran donasi.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
          <div className="px-8 py-7 space-y-6">

            {/* Bank / E-wallet Select */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                Bank / E-wallet <span className="text-red-400">*</span>
              </label>

              {banksLoading ? (
                <div className="w-full h-11 rounded-xl bg-zinc-800 animate-pulse" />
              ) : (
                <select
                  value={selectedBankId}
                  onChange={(e) => handleBankChange(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 appearance-none cursor-pointer"
                >
                  <option value="" disabled className="text-zinc-500">Pilih bank atau e-wallet…</option>

                  {bankOptions.length > 0 && (
                    <optgroup label="Bank" className="text-zinc-400">
                      {bankOptions.map((b) => (
                        <option key={b.id} value={b.id} className="text-zinc-100 bg-zinc-800">
                          {b.bank_name}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {ewalletOptions.length > 0 && (
                    <optgroup label="E-wallet" className="text-zinc-400">
                      {ewalletOptions.map((b) => (
                        <option key={b.id} value={b.id} className="text-zinc-100 bg-zinc-800">
                          {b.bank_name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              )}
            </div>

            {/* Nomor Rekening — Bank */}
            {isBank && (
              <div className="space-y-1.5">
                <label className={labelClass}>
                  Nomor Rekening <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={ccNumber}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 19);
                    setCcNumber(raw);
                  }}
                  placeholder="Masukkan nomor rekening"
                  maxLength={19}
                  className={inputClass}
                />
                <p className="text-xs text-zinc-500">
                  {ccNumber.length}/19 karakter · minimal 10 digit
                </p>
              </div>
            )}

            {/* Nomor VA — E-wallet */}
            {isEwallet && (
              <div className="space-y-1.5">
                <label className={labelClass}>
                  Nomor Akun <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={vaNumber}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 19);
                    setVaNumber(raw);
                  }}
                  placeholder="Masukkan nomor akun"
                  maxLength={19}
                  className={inputClass}
                />
                <p className="text-xs text-zinc-500">
                  {vaNumber.length}/19 karakter · minimal 10 digit
                </p>
              </div>
            )}

            {/* Nomor HP — opsional */}
            {selectedBankType && (
              <div className="space-y-1.5">
                <label className={labelClass}>
                  Nomor HP{" "}
                  <span className="text-zinc-500 font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium pointer-events-none">
                    +62
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                    placeholder="81234567890"
                    className={`${inputClass} pl-12`}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 font-medium">
                ✓ Wallet berhasil dibuat! Mengarahkan ke dashboard…
              </div>
            )}

            {/* Submit */}
            <div className="pt-1 space-y-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid() || loading || success}
                className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Menyimpan…" : success ? "Tersimpan ✓" : "Buat Wallet"}
              </button>
              <p className="text-center text-xs text-zinc-600">
                Data kamu disimpan dengan aman dan hanya digunakan untuk keperluan pencairan dana.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
</>
  );
}