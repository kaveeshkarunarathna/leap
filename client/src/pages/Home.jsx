import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, UserPlus, Store, Rocket, Zap } from 'lucide-react';
import { api } from '../api.js';
import { PageTransition, Reveal, ScrambleText, CountUp } from '../components/Motion.jsx';
import { LeapMark } from '../components/Logo.jsx';
import BusinessCard, { CardSkeleton } from '../components/BusinessCard.jsx';
import CategoryIcon from '../components/Icon.jsx';
import PartnerStrip from '../components/Partners.jsx';

const STEPS = [
  { icon: UserPlus, title: 'Join as a Leo', text: 'Create your account with your Leo club details in under a minute.' },
  { icon: Store, title: 'Build your listing', text: 'Add your business, logo, cover and every product or service you offer.' },
  { icon: Rocket, title: 'Go live', text: 'Once the LEAP team approves it, the public can find and contact you.' },
];

export default function Home() {
  const [q, setQ] = useState('');
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api('/stats').then(setStats).catch(() => {});
    api('/meta').then((m) => setCategories(m.categories)).catch(() => {});
    api('/businesses?limit=6&sort=popular').then((r) => setFeatured(r.items)).catch(() => setFeatured([]));
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/explore${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
  };

  return (
    <PageTransition>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <motion.span className="chip chip-glow mono" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Zap size={13} /> Leo Entrepreneurs Advancement Platform
            </motion.span>
            <h1 className="hero-title">
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
                Where Leo businesses
              </motion.span>
              <ScrambleText text="LEAP FORWARD" className="gradient-text hero-scramble" duration={1300} />
            </h1>
            <motion.p className="hero-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              Discover products and services from young entrepreneurs across the Leo movement in Sri Lanka, and support the businesses your community builds.
            </motion.p>
            <motion.form className="search-bar" onSubmit={search} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
              <Search size={20} className="search-icon" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search businesses, products or services…" aria-label="Search" />
              <button className="btn btn-primary">Search <ArrowRight size={16} /></button>
            </motion.form>
            <motion.div className="hero-tags" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
              {categories.slice(0, 5).map((c) => (
                <Link key={c.id} to={`/explore?category=${c.slug}`} className="chip"><CategoryIcon name={c.icon} size={13} /> {c.name}</Link>
              ))}
            </motion.div>
          </div>
          <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <div className="orbit orbit-1"><span /></div>
            <div className="orbit orbit-2"><span /></div>
            <div className="orbit orbit-3"><span /></div>
            <div className="hero-mark"><LeapMark size={190} /></div>
            <div className="hero-hud hud-1 mono">// LISTINGS <b>{stats ? stats.businesses : '--'}</b></div>
            <div className="hero-hud hud-2 mono">// DISTRICTS <b>{stats ? stats.districts : '--'}</b></div>
          </motion.div>
        </div>
        <div className="hero-floor" aria-hidden="true" />
      </section>

      <section className="container stats">
        {[
          ['Businesses live', stats?.businesses],
          ['Products & services', stats?.offerings],
          ['Leo entrepreneurs', stats?.entrepreneurs],
          ['Districts reached', stats?.districts],
        ].map(([label, value], i) => (
          <Reveal key={label} delay={i * 0.08} className="stat card">
            <span className="stat-value gradient-text"><CountUp value={value || 0} /></span>
            <span className="stat-label mono">{label}</span>
          </Reveal>
        ))}
      </section>

      <section className="container section family">
        <Reveal className="section-head">
          <span className="eyebrow mono">// Part of the Leo &amp; Lions family</span>
          <p className="muted family-lead">
            LEAP is an initiative of the Leo Club of Biyagama Alliance, Leo District 306 D4.
          </p>
        </Reveal>
        <Reveal delay={0.1}><PartnerStrip /></Reveal>
      </section>

      <section className="container section">
        <Reveal className="section-head">
          <span className="eyebrow mono">01 / Browse by category</span>
          <h2>Find what you need</h2>
        </Reveal>
        <div className="cat-grid">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={(i % 6) * 0.05}>
              <Link to={`/explore?category=${c.slug}`} className="cat-tile card">
                <span className="cat-icon"><CategoryIcon name={c.icon} size={22} /></span>
                <span className="cat-name">{c.name}</span>
                <span className="cat-count mono">{c.count} listed</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container section">
        <Reveal className="section-head section-head-row">
          <div>
            <span className="eyebrow mono">02 / Trending now</span>
            <h2>Popular Leo businesses</h2>
          </div>
          <Link to="/explore" className="btn btn-ghost">View all <ArrowRight size={16} /></Link>
        </Reveal>
        <div className="biz-grid">
          {featured === null && Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}
          {featured?.map((b, i) => <Reveal key={b.id} delay={(i % 3) * 0.08}><BusinessCard b={b} /></Reveal>)}
          {featured?.length === 0 && <p className="muted">No businesses are live yet. Be the first to list yours.</p>}
        </div>
      </section>

      <section className="container section">
        <Reveal className="section-head">
          <span className="eyebrow mono">03 / For Leos</span>
          <h2>Get your business on LEAP</h2>
        </Reveal>
        <div className="steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1} className="step card">
              <span className="step-num mono">0{i + 1}</span>
              <span className="step-icon"><s.icon size={24} /></span>
              <h3>{s.title}</h3>
              <p className="muted">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container section">
        <Reveal className="cta card">
          <div className="cta-glow" />
          <h2>Ready to take the leap?</h2>
          <p className="muted">Listing is free for every Leo. Showcase what you make and let the community find you.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn btn-primary btn-lg">List your business <ArrowRight size={18} /></Link>
            <Link to="/explore" className="btn btn-ghost btn-lg">Explore first</Link>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  );
}
