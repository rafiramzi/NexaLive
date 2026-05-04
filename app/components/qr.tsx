'use client';

import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

type Props = {
  url: string;
  title?: string;
  subtitle?: string;
};

export default function ObsQrOverlay({
  url
}: Props) {
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!qrRef.current) return;

    qrRef.current.innerHTML = '';

    const qrCode = new QRCodeStyling({
      width: 320,
      height: 320,
      data: url,
      image: 'https://images.vexels.com/media/users/3/130493/isolated/preview/d6d7e1562c266a4272d5733522705e94-gaming-console-icon.png',
      margin: 0,
      dotsOptions: {
        color: '#2a5fef',
        type: 'rounded',
      },
      backgroundOptions: {
        color: 'transparent',
      },
      cornersSquareOptions: {
        color: '#2a5fef',
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color: '#ffffff',
        type: 'dot',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 8,
      },
    });

    qrCode.append(qrRef.current);
  }, [url]);

  return (
      <div className="fixed rounded-3xl backdrop-blur-xl p-6 shadow-2xl flex flex-col items-center gap-4 w-[400px]">
        <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
          <div ref={qrRef} />
        </div>
      </div>
  );
}