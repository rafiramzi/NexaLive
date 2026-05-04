import ObsQrOverlay from "../components/qr";

export default function OverlayPage() {
  return (
    <main className="w-screen h-screen bg-transparent overflow-hidden relative">
      <ObsQrOverlay
        url="https://your-link.com"
      />
    </main>
  );
}