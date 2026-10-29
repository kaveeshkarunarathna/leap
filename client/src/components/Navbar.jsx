import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, LayoutDashboard, LogOut, ShieldCheck, Plus } from 'lucide-react';
import Logo from './Logo.jsx';
import { PartnerLogo, partner } from './Partners.jsx';
import { useAuth } from '../auth.jsx';

const club = partner('club');

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = (
    <>
      {LINKS.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end} className="nav-link">
          {({ isActive }) => (
            <>
              {l.label}
              {isActive && <motion.span layoutId="nav-underline" className="nav-underline" />}
            </>
          )}
        </NavLink>
      ))}
    </>
  );

  const actions = user ? (
    <>
      {user.role === 'admin' && (
        <Link to="/admin" className="btn btn-ghost btn-sm"><ShieldCheck size={16} /> Admin</Link>
      )}
      <Link to="/dashboard" className="btn btn-ghost btn-sm"><LayoutDashboard size={16} /> My listings</Link>
      <button className="btn btn-icon" title="Sign out" onClick={() => { navigate('/'); setTimeout(signOut, 450); }}><LogOut size={16} /></button>
    </>
  ) : (
    <>
      <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
      <Link to="/register" className="btn btn-primary btn-sm"><Plus size={16} /> List your business</Link>
    </>
  );

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="container nav-inner">
        <div className="nav-brands">
          <Link to="/" className="nav-brand" aria-label="LEAP home"><Logo /></Link>
          <span className="nav-divider" aria-hidden="true" />
          <Link to="/about" className="nav-crest" aria-label={`${club.name}, the club behind LEAP`} title={club.name}>
            <PartnerLogo partner={club} plate={false} />
          </Link>
        </div>
        <nav className="nav-links">{links}</nav>
        <div className="nav-actions">{actions}</div>
        <button className="btn btn-icon nav-toggle" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="nav-mobile" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="container nav-mobile-inner">
              {links}
              <div className="nav-mobile-actions">{actions}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
