import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { PageTransition } from '../components/Motion.jsx';
import { LeapMark } from '../components/Logo.jsx';
import { Field } from '../components/Form.jsx';

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <PageTransition>
      <section className="container auth">
        <motion.div className="card auth-card" initial={{ opacity: 0, y: 30, rotateX: 12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} style={{ transformPerspective: 1000 }}>
          <div className="auth-border" />
          <div className="auth-head">
            <LeapMark size={56} />
            <h1>{title}</h1>
            <p className="muted">{subtitle}</p>
          </div>
          {children}
          <p className="auth-footer muted">{footer}</p>
        </motion.div>
      </section>
    </PageTransition>
  );
}

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const user = await signIn(form.email, form.password);
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your listings."
      footer={<>New to LEAP? <Link to="/register">Create an account</Link></>}>
      <form className="form" onSubmit={submit}>
        <Field label="Email"><input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password"><input type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? <Loader2 className="spin" size={18} /> : <>Sign in <ArrowRight size={16} /></>}</button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', leo_club: '', leo_id: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await register(form);
      navigate('/dashboard/new', { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <AuthShell title="Join LEAP" subtitle="Create your Leo account, then add your business."
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}>
      <form className="form" onSubmit={submit}>
        <Field label="Full name"><input required value={form.name} onChange={set('name')} autoComplete="name" /></Field>
        <div className="form-row">
          <Field label="Email"><input type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></Field>
          <Field label="Phone"><input value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="07X XXX XXXX" /></Field>
        </div>
        <div className="form-row">
          <Field label="Leo club"><input required value={form.leo_club} onChange={set('leo_club')} placeholder="Leo Club of …" /></Field>
          <Field label="Leo membership ID" hint="Optional, helps us verify you"><input value={form.leo_id} onChange={set('leo_id')} /></Field>
        </div>
        <Field label="Password" hint="At least 8 characters"><input type="password" required minLength={8} value={form.password} onChange={set('password')} autoComplete="new-password" /></Field>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? <Loader2 className="spin" size={18} /> : <>Create account <ArrowRight size={16} /></>}</button>
      </form>
    </AuthShell>
  );
}
