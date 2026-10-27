import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Logo showTagline />
          <p className="muted footer-blurb">
            A showcase for businesses run by Leos. An initiative of the Leo Club of Biyagama Alliance.
          </p>
        </div>
        <div className="footer-links">
          <Link to="/explore">Explore businesses</Link>
          <Link to="/register">List your business</Link>
          <Link to="/about">About LEAP</Link>
        </div>
      </div>
      <div className="container footer-bottom mono">
        <span>© {new Date().getFullYear()} LEAP · Leo Club of Biyagama Alliance</span>
        <span className="footer-status"><span className="pulse-dot" /> All systems go</span>
      </div>
    </footer>
  );
}
