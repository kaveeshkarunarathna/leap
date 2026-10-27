import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, ExternalLink, Eye, Package, Store } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { PageTransition } from '../components/Motion.jsx';
import { Avatar } from '../components/BusinessCard.jsx';
import { Spinner, StatusBadge, Field } from '../components/Form.jsx';
import { useToast } from '../components/Toast.jsx';

function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', leo_club: user.leo_club, leo_id: user.leo_id || '', current_password: '', new_password: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...form };
      if (!body.new_password) { delete body.new_password; delete body.current_password; }
      const { user: u } = await api('/auth/me', { method: 'PUT', body });
      setUser(u); setForm({ ...form, current_password: '', new_password: '' });
      toast('Profile saved');
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };
  return (
    <form className="card panel form" onSubmit={save}>
      <h2 className="panel-title">Your profile</h2>
      <Field label="Full name"><input required value={form.name} onChange={set('name')} /></Field>
      <Field label="Phone"><input value={form.phone} onChange={set('phone')} /></Field>
      <Field label="Leo club"><input required value={form.leo_club} onChange={set('leo_club')} /></Field>
      <Field label="Leo membership ID"><input value={form.leo_id} onChange={set('leo_id')} /></Field>
      <details className="details">
        <summary className="mono">Change password</summary>
        <Field label="Current password"><input type="password" value={form.current_password} onChange={set('current_password')} autoComplete="current-password" /></Field>
        <Field label="New password"><input type="password" minLength={8} value={form.new_password} onChange={set('new_password')} autoComplete="new-password" /></Field>
      </details>
      <button className="btn btn-ghost" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState(null);

  const load = () => api('/my/businesses').then((r) => setItems(r.items)).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const remove = async (b) => {
    if (!window.confirm(`Delete "${b.name}"? This also removes its products and services.`)) return;
    try { await api(`/my/businesses/${b.id}`, { method: 'DELETE' }); toast('Listing deleted'); load(); } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <PageTransition>
      <section className="container page-head page-head-row">
        <div>
          <span className="eyebrow mono">// Dashboard</span>
          <h1>Hi {user.name.split(' ')[0]}</h1>
          <p className="muted">Manage your businesses and what they offer.</p>
        </div>
        <Link to="/dashboard/new" className="btn btn-primary"><Plus size={18} /> Add a business</Link>
      </section>
      <section className="container dash-grid">
        <div className="dash-list">
          {items === null && <Spinner />}
          {items?.length === 0 && (
            <div className="empty card">
              <Store size={30} />
              <h3>No businesses yet</h3>
              <p className="muted">Add your first business to get it in front of the community.</p>
              <Link to="/dashboard/new" className="btn btn-primary"><Plus size={16} /> Add a business</Link>
            </div>
          )}
          {items?.map((b, i) => (
            <motion.div key={b.id} className="card dash-item" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <Avatar src={b.logo_url} name={b.name} size={56} />
              <div className="dash-item-body">
                <div className="dash-item-title"><h3>{b.name}</h3><StatusBadge status={b.status} /></div>
                <span className="muted">{b.category || 'No category'}</span>
                {b.status === 'rejected' && b.review_note && <p className="form-error">Reviewer note: {b.review_note}</p>}
                <div className="dash-item-meta mono"><span><Eye size={12} /> {b.views}</span><span><Package size={12} /> {b.offering_count} offerings</span></div>
              </div>
              <div className="dash-item-actions">
                <Link className="btn btn-icon" title="View" to={`/b/${b.slug}`}><ExternalLink size={16} /></Link>
                <Link className="btn btn-icon" title="Edit" to={`/dashboard/${b.id}`}><Pencil size={16} /></Link>
                <button className="btn btn-icon btn-danger" title="Delete" onClick={() => remove(b)}><Trash2 size={16} /></button>
              </div>
            </motion.div>
          ))}
        </div>
        <Profile />
      </section>
    </PageTransition>
  );
}
