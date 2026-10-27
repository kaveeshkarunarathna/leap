import { Link } from 'react-router-dom';
import { Target, Users, ShieldCheck } from 'lucide-react';
import { PageTransition, Reveal } from '../components/Motion.jsx';
import { LeapMark } from '../components/Logo.jsx';

const POINTS = [
  { icon: Target, title: 'Visibility', text: 'Young Leo entrepreneurs get a credible place to showcase what they make and do.' },
  { icon: Users, title: 'Community first', text: 'Leos, Lions and the public can find and support businesses from within the movement.' },
  { icon: ShieldCheck, title: 'Verified listings', text: 'Every listing is reviewed by the LEAP team before it goes live.' },
];

export default function About() {
  return (
    <PageTransition>
      <section className="container about">
        <Reveal className="about-hero">
          <LeapMark size={96} />
          <span className="eyebrow mono">// About LEAP</span>
          <h1>Leo Entrepreneurs <span className="gradient-text">Advancement Platform</span></h1>
          <p className="hero-sub">
            LEAP is a project of the Leo Club of Biyagama Alliance. It gives Leo-owned businesses a home online,
            so customers can discover their products and services and the Leo community can rally behind its own.
          </p>
        </Reveal>
        <div className="steps">
          {POINTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1} className="step card">
              <span className="step-icon"><p.icon size={24} /></span>
              <h3>{p.title}</h3>
              <p className="muted">{p.text}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="cta card">
          <div className="cta-glow" />
          <h2>Are you a Leo with a business?</h2>
          <p className="muted">Listing is free. Create an account and submit your business for review.</p>
          <div className="cta-actions"><Link to="/register" className="btn btn-primary btn-lg">Get started</Link></div>
        </Reveal>
      </section>
    </PageTransition>
  );
}
