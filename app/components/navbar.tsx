'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
}


export default function Navbar() {
  return (
    <>
    <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-mono text-zinc-400 tracking-widest uppercase">NexaLive</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-300"></span>
          </div>
        </div>
      </nav>
    </>
  );
}