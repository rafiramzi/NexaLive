'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = (() => {
    if (password.length === 0) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: 'Lemah', color: '#ef4444', width: '25%' };
    if (score === 2) return { label: 'Sedang', color: '#f59e0b', width: '50%' };
    if (score === 3) return { label: 'Kuat', color: '#10b981', width: '75%' };
    return { label: 'Sangat kuat', color: '#6366f1', width: '100%' };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage('Akun berhasil dibuat! Mengalihkan...');
      window.location.href = '/dashboard';
      setEmail('');
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setIsError(true);
      setMessage(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#0a0a0b' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

        @keyframes fadein {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }

        .card-anim { animation: fadein 0.55s ease both; }
        .logo-anim { animation: fadein 0.55s ease both; }
        .shake { animation: shake 0.4s ease; }

        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 14px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .input-field::placeholder { color: rgba(255,255,255,0.25); }
        .input-field:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.04);
        }
        .input-field:disabled { opacity: 0.5; cursor: not-allowed; }

        .input-prefix {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.2s, background 0.2s;
        }
        .input-prefix:focus-within {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.04);
        }
        .input-prefix span {
          padding: 12px 12px 12px 14px;
          font-size: 14px;
          color: rgba(255,255,255,0.25);
          white-space: nowrap;
          user-select: none;
        }
        .input-prefix input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 12px 14px 12px 0;
          color: white;
          font-size: 14px;
          outline: none;
          font-family: inherit;
          min-width: 0;
        }
        .input-prefix input::placeholder { color: rgba(255,255,255,0.25); }
        .input-prefix input:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-submit {
          width: 100%;
          background: #4f46e5;
          color: white;
          font-weight: 600;
          font-size: 14px;
          padding: 13px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          font-family: inherit;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 24px rgba(79,70,229,0.3);
        }
        .btn-submit:hover:not(:disabled) {
          background: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(79,70,229,0.4);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .serif-italic {
          font-family: 'Instrument Serif', Georgia, serif;
          font-style: italic;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255,255,255,0.18);
          font-size: 12px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        .strength-bar {
          height: 3px;
          border-radius: 99px;
          background: rgba(255,255,255,0.07);
          overflow: hidden;
          margin-top: 8px;
        }
        .strength-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.3s ease, background-color 0.3s ease;
        }
      `}</style>

      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 800px 500px at 50% -100px, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-[400px]">

        {/* Logo */}
        <div className="logo-anim text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#4f46e5', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' }}
            >
              <span className="serif-italic text-white text-sm">N</span>
            </div>
            <span className="text-[17px] font-semibold text-white tracking-tight">NexaLive</span>
          </a>
        </div>

        {/* Card */}
        <div
          className="card-anim rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02)',
          }}
        >
          {/* Header */}
          <div className="mb-7">
            <h1 className="text-[22px] font-semibold text-white tracking-tight mb-1">
              Buat akun baru
            </h1>
            <p className="text-[13px] text-zinc-500">
              Gratis selamanya. Tidak perlu kartu kredit.
            </p>
          </div>

          {/* Error banner */}
          {message && isError && (
            <div
              className="shake mb-5 flex items-center gap-2.5 rounded-xl px-4 py-3"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <svg className="w-4 h-4 shrink-0" style={{ color: '#f87171' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
              </svg>
              <p className="text-[13px]" style={{ color: '#f87171' }}>{message}</p>
            </div>
          )}

          {/* Success banner */}
          {message && !isError && (
            <div
              className="mb-5 flex items-center gap-2.5 rounded-xl px-4 py-3"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <svg className="w-4 h-4 shrink-0" style={{ color: '#34d399' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-[13px]" style={{ color: '#34d399' }}>{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[12px] font-medium text-zinc-400 mb-1.5 tracking-wide">
                Email
              </label>
              <input
                type="email"
                placeholder="kamu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                required
                className="input-field"
                autoComplete="email"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-[12px] font-medium text-zinc-400 mb-1.5 tracking-wide">
                Username
              </label>
              <div className="input-prefix">
                <span>nexalive.id/</span>
                <input
                  type="text"
                  placeholder="namakamu"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  disabled={loading}
                  required
                  autoComplete="username"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </div>
              <p className="text-[11px] text-zinc-700 mt-1.5">Hanya huruf kecil, angka, dan underscore.</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-medium text-zinc-400 mb-1.5 tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={8}
                  className="input-field"
                  style={{ paddingRight: '44px' }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password strength */}
              {passwordStrength && (
                <div>
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                    />
                  </div>
                  <p className="text-[11px] mt-1.5" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Terms */}
            <p className="text-[12px] text-zinc-600 leading-relaxed pt-1">
              Dengan mendaftar, kamu menyetujui{' '}
              <a href="/terms" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2">Syarat & Ketentuan</a>
              {' '}dan{' '}
              <a href="/privacy" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2">Kebijakan Privasi</a>
              {' '}NexaLive.
            </p>

            {/* Submit */}
            <div className="pt-1">
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Membuat akun...
                  </span>
                ) : 'Buat Akun Gratis'}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="divider my-6">atau</div>

          {/* Google SSO */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Daftar dengan Google
          </button>

          {/* Login link */}
          <p className="text-center text-[13px] text-zinc-600 mt-6">
            Sudah punya akun?{' '}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Masuk di sini
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-zinc-700 mt-6">
          © 2025 NexaLive ·{' '}
          <a href="/privacy" className="hover:text-zinc-500 transition-colors">Privasi</a>
          {' '}·{' '}
          <a href="/terms" className="hover:text-zinc-500 transition-colors">Syarat</a>
        </p>
      </div>
    </div>
  );
}