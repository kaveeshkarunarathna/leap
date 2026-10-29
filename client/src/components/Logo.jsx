import { motion } from 'framer-motion';

// The LEAP mark: an "L" whose base sweeps up into an arrow, inside a hexagon.
export function LeapMark({ size = 40, animate = true }) {
  const draw = animate
    ? { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 } }
    : {};
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="leap-lg" x1="10" y1="110" x2="110" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1FC3E0" />
          <stop offset="0.55" stopColor="#309CD8" />
          <stop offset="1" stopColor="#3D7FD6" />
        </linearGradient>
      </defs>
      <motion.path d="M60 6 L106.8 33 L106.8 87 L60 114 L13.2 87 L13.2 33 Z" stroke="url(#leap-lg)" strokeWidth="5" strokeLinejoin="round"
        {...draw} transition={{ duration: 1.2, ease: 'easeInOut' }} />
      <motion.path d="M40 32 V84 H56 C70 84 79 62 85 42" stroke="url(#leap-lg)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"
        {...draw} transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }} />
      <motion.path d="M72.5 50 L86 38 L91 55" stroke="url(#leap-lg)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
        {...draw} transition={{ duration: 0.4, delay: 1.2 }} />
      <circle cx="60" cy="27" r="3" fill="#FCCC00" className="mark-spark" />
    </svg>
  );
}

export default function Logo({ size = 34, showTagline = false }) {
  return (
    <span className="logo">
      <LeapMark size={size} />
      <span className="logo-text">
        <span className="logo-word">LEAP</span>
        {showTagline && <span className="logo-tag">Leo Entrepreneurs Advancement Platform</span>}
      </span>
    </span>
  );
}
