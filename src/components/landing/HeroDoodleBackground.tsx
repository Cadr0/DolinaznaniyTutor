/**
 * Full-screen hand-drawn logo / constellation (prototype).
 * Single teal stroke network: main hub top-right, nodes + wobbly connectors.
 */
export function HeroDoodleBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          stroke="var(--accent)"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.32"
        >
          {/* Connecting lines — drawn first, under nodes */}
          <g strokeWidth="2" opacity="0.85">
            <path d="M 780 195 Q 680 240 590 310" />
            <path d="M 780 195 Q 850 250 920 340" />
            <path d="M 780 195 Q 720 120 660 95" />
            <path d="M 590 310 Q 480 380 390 430" />
            <path d="M 590 310 Q 640 420 620 520" />
            <path d="M 390 430 Q 280 500 200 560" />
            <path d="M 390 430 Q 450 520 520 600" />
            <path d="M 200 560 Q 120 620 95 700" />
            <path d="M 200 560 Q 260 640 310 710" />
            <path d="M 620 520 Q 720 580 820 620" />
            <path d="M 920 340 Q 1020 400 1080 500" />
            <path d="M 1080 500 Q 1140 580 1100 680" />
            <path d="M 520 600 Q 600 680 680 740" />
            <path d="M 660 95 Q 560 140 480 200" />
          </g>

          {/* Main hub — large rounded blob, top-right */}
          <path
            d="M 700 95
               Q 820 75 910 130
               Q 940 210 895 275
               Q 830 320 745 305
               Q 665 290 680 210
               Q 688 140 700 95 Z"
            strokeWidth="2.8"
            fill="var(--accent-soft)"
            fillOpacity="0.35"
          />

          {/* Satellite nodes */}
          <ellipse cx="590" cy="310" rx="48" ry="44" strokeWidth="2.4" transform="rotate(-6 590 310)" />
          <ellipse cx="390" cy="430" rx="38" ry="42" strokeWidth="2.2" transform="rotate(10 390 430)" />
          <circle cx="200" cy="560" r="40" strokeWidth="2.3" />
          <circle cx="95" cy="700" r="30" strokeWidth="2" />
          <circle cx="310" cy="710" r="26" strokeWidth="1.9" />
          <ellipse cx="620" cy="520" rx="36" ry="34" strokeWidth="2.1" transform="rotate(8 620 520)" />
          <ellipse cx="520" cy="600" rx="32" ry="36" strokeWidth="2" transform="rotate(-12 520 600)" />
          <circle cx="920" cy="340" r="34" strokeWidth="2.2" />
          <ellipse cx="1080" cy="500" rx="40" ry="36" strokeWidth="2.3" transform="rotate(5 1080 500)" />
          <circle cx="1100" cy="680" r="28" strokeWidth="1.9" />
          <circle cx="680" cy="740" r="22" strokeWidth="1.8" />
          <circle cx="660" cy="95" r="24" strokeWidth="1.9" />
          <ellipse cx="480" cy="200" rx="28" ry="26" strokeWidth="1.8" transform="rotate(-8 480 200)" />
          <circle cx="820" cy="620" r="20" strokeWidth="1.6" />
        </g>

        {/* Soft vignette so text stays readable */}
        <defs>
          <radialGradient id="hero-doodle-fade" cx="35%" cy="40%" r="75%">
            <stop offset="0%" stopColor="var(--background)" stopOpacity="0" />
            <stop offset="55%" stopColor="var(--background)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--background)" stopOpacity="0.55" />
          </radialGradient>
          <linearGradient id="hero-doodle-bottom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--background)" stopOpacity="0" />
            <stop offset="85%" stopColor="var(--background)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--background)" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#hero-doodle-fade)" />
        <rect width="1440" height="900" fill="url(#hero-doodle-bottom)" />
      </svg>
    </div>
  );
}
