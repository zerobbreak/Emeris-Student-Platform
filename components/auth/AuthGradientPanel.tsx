"use client";

/**
 * Animated gradient panel for auth pages.
 *
 * Three layered radial gradients orbit at different speeds,
 * creating a slow, organic color-wash effect. The palette
 * is drawn from HIVE Showcase's teal / gold / sage identity.
 */
export function AuthGradientPanel() {
  return (
    <div className="relative h-full overflow-hidden bg-[#072b24]" aria-hidden="true">
      {/* Layered gradient orbs */}
      <div
        className="auth-orb absolute -left-[10%] -top-[15%] h-[600px] w-[600px] rounded-full blur-[100px] will-change-transform animate-[auth-orbit-teal_18s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, #0d5c4d 0%, transparent 70%)" }}
      />
      <div
        className="auth-orb absolute -bottom-[20%] -right-[10%] h-[500px] w-[500px] rounded-full opacity-60 blur-[100px] will-change-transform animate-[auth-orbit-gold_22s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, #c6a45b 0%, transparent 70%)" }}
      />
      <div
        className="auth-orb absolute left-[30%] top-[40%] h-[450px] w-[450px] rounded-full opacity-45 blur-[100px] will-change-transform animate-[auth-orbit-sage_26s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, #7ec8a4 0%, transparent 70%)" }}
      />

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Branding overlay */}
      <div className="relative z-10 flex h-full flex-col justify-center p-12 text-white/[0.92]">
        <div className="mb-8 text-white/70">
          {/* Hexagon mark — a nod to "HIVE" */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 2L44 13.5V36.5L24 48L4 36.5V13.5L24 2Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="currentColor"
              fillOpacity="0.08"
            />
            <path
              d="M24 10L36 17V31L24 38L12 31V17L24 10Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="currentColor"
              fillOpacity="0.05"
            />
          </svg>
        </div>

        <h1 className="mb-3 text-4xl font-bold leading-tight tracking-[-0.03em]">
          HIVE Showcase
        </h1>
        <p className="max-w-[280px] text-lg leading-relaxed text-white/60">
          Build your portfolio. <br />
          Share your craft.
        </p>

        <div className="mt-auto pt-8">
          <span className="inline-block rounded-full border border-white/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/50">
            EMERIS
          </span>
        </div>
      </div>
    </div>
  );
}
