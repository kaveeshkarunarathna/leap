import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Globe, MessageCircle, Facebook, Instagram, Eye, ArrowLeft, Package, Wrench, AlertTriangle } from 'lucide-react';
import { api } from '../api.js';
import { PageTransition, Reveal } from '../components/Motion.jsx';
import { Avatar } from '../components/BusinessCard.jsx';
import BusinessCard from '../components/BusinessCard.jsx';
import CategoryIcon from '../components/Icon.jsx';
import { Spinner, StatusBadge } from '../components/Form.jsx';
import NotFound from './NotFound.jsx';

function waLink(num) {
  let digits = String(num).replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `94${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

export default function BusinessPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    setData(null); setError(null);
    api(`/businesses/${slug}`).then(setData).catch(setError);
  }, [slug]);

  if (error) return <NotFound />;
  if (!data) return <PageTransition><Spinner /></PageTransition>;

  const { business: b, offerings, related } = data;
  const shown = offerings.filter((o) => tab === 'all' || o.type === tab);
  const hasProducts = offerings.some((o) => o.type === 'product');
  const hasServices = offerings.some((o) => o.type === 'service');

  const contacts = [
    b.phone && { icon: Phone, label: b.phone, href: `tel:${b.phone.replace(/\s/g, '')}` },
    b.whatsapp && { icon: MessageCircle, label: 'WhatsApp', href: waLink(b.whatsapp) },
    b.email && { icon: Mail, label: b.email, href: `mailto:${b.email}` },
    b.website && { icon: Globe, label: 'Website', href: b.website },
    b.facebook && { icon: Facebook, label: 'Facebook', href: b.facebook },
    b.instagram && { icon: Instagram, label: 'Instagram', href: b.instagram },
  ].filter(Boolean);

  return (
    <PageTransition>
      {b.status !== 'approved' && (
        <div className="container"><div className="notice card"><AlertTriangle size={18} /> Preview only. <StatusBadge status={b.status} /> {b.review_note && <span className="muted">Note: {b.review_note}</span>}</div></div>
      )}
      <section className="container">
        <Link to="/explore" className="back-link mono"><ArrowLeft size={14} /> Back to directory</Link>
        <motion.div className="profile-cover" style={b.cover_url ? { backgroundImage: `url(${b.cover_url})` } : undefined}
          initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}>
          {!b.cover_url && <div className="profile-cover-fx"><CategoryIcon name={b.category_icon} size={90} /></div>}
          <div className="scanline" />
        </motion.div>
        <div className="profile-head">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
            <Avatar src={b.logo_url} name={b.name} size={108} />
          </motion.div>
          <div className="profile-title">
            <h1>{b.name}</h1>
            {b.tagline && <p className="profile-tagline">{b.tagline}</p>}
            <div className="profile-meta mono">
              {b.category && <Link to={`/explore?category=${b.category_slug}`} className="chip"><CategoryIcon name={b.category_icon} size={13} /> {b.category}</Link>}
              {(b.city || b.district) && <span className="chip"><MapPin size={13} /> {[b.city, b.district].filter(Boolean).join(', ')}</span>}
              <span className="chip"><Eye size={13} /> {b.views} views</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container profile-grid">
        <div className="profile-main">
          {b.description && (
            <Reveal className="card panel">
              <h2 className="panel-title">About</h2>
              <p className="prewrap">{b.description}</p>
            </Reveal>
          )}
          <Reveal className="card panel">
            <div className="panel-title-row">
              <h2 className="panel-title">Products & services</h2>
              {hasProducts && hasServices && (
                <div className="segmented segmented-sm">
                  {[['all', 'All'], ['product', 'Products'], ['service', 'Services']].map(([v, l]) => (
                    <button key={v} className={tab === v ? 'active' : ''} onClick={() => setTab(v)}>
                      {tab === v && <motion.span layoutId="seg-profile" className="segmented-pill" />}<span>{l}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {offerings.length === 0 && <p className="muted">Nothing listed yet.</p>}
            <div className="offer-grid">
              <AnimatePresence mode="popLayout">
                {shown.map((o) => (
                  <motion.div key={o.id} layout className="offer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {o.image_url ? <img src={o.image_url} alt="" className="offer-img" /> : (
                      <div className="offer-img offer-img-empty">{o.type === 'product' ? <Package size={26} /> : <Wrench size={26} />}</div>
                    )}
                    <div className="offer-body">
                      <span className={`offer-type mono offer-${o.type}`}>{o.type}</span>
                      <h3>{o.title}</h3>
                      {o.description && <p className="muted">{o.description}</p>}
                      {o.price && <span className="offer-price mono">{o.price}</span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>

        <aside className="profile-side">
          <Reveal className="card panel" delay={0.1}>
            <h2 className="panel-title">Get in touch</h2>
            {contacts.length === 0 && <p className="muted">No contact details yet.</p>}
            <div className="contact-list">
              {contacts.map((c) => (
                <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="contact">
                  <span className="contact-icon"><c.icon size={16} /></span><span className="contact-label">{c.label}</span>
                </a>
              ))}
            </div>
            {b.address && <p className="muted address"><MapPin size={14} /> {b.address}</p>}
          </Reveal>
          <Reveal className="card panel owner" delay={0.15}>
            <span className="eyebrow mono">Run by</span>
            <strong>{b.owner_name}</strong>
            <span className="muted">{b.owner_club}</span>
          </Reveal>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="container section">
          <div className="section-head"><span className="eyebrow mono">// Similar</span><h2>More like this</h2></div>
          <div className="biz-grid">{related.map((r) => <BusinessCard key={r.id} b={r} />)}</div>
        </section>
      )}
    </PageTransition>
  );
}
