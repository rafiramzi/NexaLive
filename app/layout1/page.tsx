export default function OBSLeaderboardCards() {
  const leaderboard = [
    {
      rank: 1,
      name: "PixelHunter",
      score: "12,480",
      badge: "MVP",
      avatar: "PH",
    },
    {
      rank: 2,
      name: "NovaRush",
      score: "10,210",
      badge: "Elite",
      avatar: "NR",
    },
    {
      rank: 3,
      name: "ShadowByte",
      score: "9,875",
      badge: "Pro",
      avatar: "SB",
    },
    {
      rank: 4,
      name: "FrostWire",
      score: "8,940",
      badge: "Rising",
      avatar: "FW",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-10">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-transparent backdrop-blur-none overflow-hidden">
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10 bg-black/20 backdrop-blur-md rounded-t-[32px]">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-cyan-500/5 to-transparent" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
                Live Leaderboard
              </p>
              <h1 className="text-3xl font-bold text-white mt-2 tracking-tight">
                Stream Top Fans
              </h1>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-red-500/15 border border-red-400/30 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-red-300">LIVE</span>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 bg-transparent">
          {leaderboard.map((user, index) => (
            <div
              key={user.rank}
              className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/40 ${
                index === 0
                  ? "bg-yellow-500/10 border-yellow-400/20"
                  : "bg-black/20 border-white/10 backdrop-blur-md"
              }`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10" />

              <div className="relative flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-bold tracking-wide ${
                      index === 0
                        ? "bg-yellow-400/80 text-black"
                        : "bg-white/10 text-white backdrop-blur-sm"
                    }`}
                  >
                    {user.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-base">
                        {user.name}
                      </span>

                      <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cyan-200">
                        {user.badge}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm text-zinc-300">
                      <span>Rank #{user.rank}</span>
                      <span className="text-zinc-500">•</span>
                      <span>{user.score} pts</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    #{user.rank}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-zinc-400">
                    Position
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 bg-black/15 backdrop-blur-md px-6 py-4 rounded-b-[32px]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-300">Updated live from OBS overlay</span>
            <span className="font-semibold text-cyan-300">v1 Overlay</span>
          </div>
        </div>
      </div>
    </div>
  );
}