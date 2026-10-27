import { Link } from 'react-router-dom';
import { PageTransition, ScrambleText } from '../components/Motion.jsx';

export default function NotFound() {
  return (
    <PageTransition>
      <section className="container center-page">
        <span className="glitch mono" data-text="404">404</span>
        <h1><ScrambleText text="Signal lost" /></h1>
        <p className="muted">We couldn't find that page or business.</p>
        <Link to="/explore" className="btn btn-primary">Explore businesses</Link>
      </section>
    </PageTransition>
  );
}
