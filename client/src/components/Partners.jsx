// The organisations behind LEAP. Logo files live in public/brand/ (originals in /brand/partners).
// Each logo sits on a light plate: the Leo emblem and MD 306 wordmark are dark artwork that
// would vanish on the dark theme, and the emblems must not be recoloured.
export const PARTNERS = [
  { key: 'club', name: 'Leo Club of Biyagama Alliance', sub: 'Leo District 306 D4', src: '/brand/club-biyagama-alliance.png', w: 397, h: 480 },
  { key: 'md306', name: 'Leo Multiple District 306', sub: 'Leos of Sri Lanka & Maldives', src: '/brand/leo-md306.png', w: 960, h: 242 },
  { key: 'leo', name: 'Leo Clubs', sub: 'Youth programme of Lions Clubs International', src: '/brand/leo-emblem.png', w: 400, h: 371 },
  { key: 'lions', name: 'Lions Clubs International', sub: 'Sponsoring organisation', src: '/brand/lions-international.png', w: 400, h: 378 },
];

export const partner = (key) => PARTNERS.find((p) => p.key === key);

export function PartnerLogo({ partner: p, plate = true, className = '' }) {
  const img = <img src={p.src} alt={p.name} width={p.w} height={p.h} loading="lazy" className={plate ? undefined : className || undefined} />;
  return plate ? <span className={`partner-plate ${className}`}>{img}</span> : img;
}

export default function PartnerStrip({ variant = 'band' }) {
  return (
    <ul className={`partners partners-${variant}`}>
      {PARTNERS.map((p) => (
        <li key={p.key} className="partner" title={variant === 'footer' ? `${p.name}, ${p.sub}` : undefined}>
          <PartnerLogo partner={p} />
          {variant === 'band' && (
            <span className="partner-caption">
              <span className="partner-name">{p.name}</span>
              <span className="partner-sub mono">{p.sub}</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
