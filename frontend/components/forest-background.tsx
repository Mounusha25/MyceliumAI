"use client"

export function ForestBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(160_84%_39%_/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_100%,hsl(160_84%_39%_/0.04),transparent_60%)]" />

      {/* Abstract green waves - visible but soft */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1200 800">
        <path
          d="M0 180 Q300 100 600 180 T1200 180 V800 H0 Z"
          fill="hsl(160 84% 39% / 0.12)"
        />
        <path
          d="M0 380 Q400 300 800 380 T1200 360 V800 H0 Z"
          fill="hsl(160 84% 39% / 0.1)"
        />
        <path
          d="M0 580 Q250 500 600 580 T1200 540 V800 H0 Z"
          fill="hsl(160 84% 39% / 0.08)"
        />
      </svg>
    </div>
  )
}
