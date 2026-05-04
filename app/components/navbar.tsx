'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
}
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };


export default function Navbar() {
  return (
    <>
    <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-mono text-zinc-400 tracking-widest uppercase">LiveLayout</span>
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
    </>
  );
}