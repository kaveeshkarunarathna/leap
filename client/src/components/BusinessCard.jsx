import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowUpRight } from 'lucide-react';
import { TiltCard } from './Motion.jsx';
import CategoryIcon from './Icon.jsx';

export function Avatar({ src, name, size = 56 }) {
  const initials = (name || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return src ? (
    <img className="avatar" src={src} alt="" style={{ width: size, height: size }} />
  ) : (
    <span className="avatar avatar-initials" style={{ width: size, height: size, fontSize: size * 0.34 }}>{initials}</span>
  );
}

export default function BusinessCard({ b }) {
  return (
    <TiltCard className="card biz-card">
      <Link to={`/b/${b.slug}`} className="biz-card-link">
        <div className="biz-cover" style={b.cover_url ? { backgroundImage: `url(${b.cover_url})` } : undefined}>
          {!b.cover_url && <div className="biz-cover-fx"><CategoryIcon name={b.category_icon} size={44} /></div>}
          {!!b.featured && <span className="chip chip-glow biz-featured"><Star size={12} /> Featured</span>}
        </div>
        <div className="biz-body">
          <div className="biz-head">
            <Avatar src={b.logo_url} name={b.name} size={48} />
            <div className="biz-title">
              <h3>{b.name}</h3>
              {b.category && <span className="biz-cat"><CategoryIcon name={b.category_icon} size={13} /> {b.category}</span>}
            </div>
            <ArrowUpRight className="biz-arrow" size={18} />
          </div>
          {b.tagline && <p className="biz-tagline">{b.tagline}</p>}
          <div className="biz-meta mono">
            {(b.city || b.district) && <span><MapPin size={12} /> {[b.city, b.district].filter(Boolean).join(', ')}</span>}
            {b.offering_count > 0 && <span>{b.offering_count} offering{b.offering_count > 1 ? 's' : ''}</span>}
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}

export function CardSkeleton() {
  return (
    <div className="card biz-card skeleton">
      <div className="biz-cover shimmer" />
      <div className="biz-body">
        <div className="shimmer sk-line" style={{ width: '60%' }} />
        <div className="shimmer sk-line" style={{ width: '90%' }} />
        <div className="shimmer sk-line" style={{ width: '40%' }} />
      </div>
    </div>
  );
}
