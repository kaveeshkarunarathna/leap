import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, Star, ExternalLink, Trash2, Plus, Clock, CheckCircle2, XCircle, Users, Eye } from 'lucide-react';
import { api } from '../api.js';
import { PageTransition, CountUp } from '../components/Motion.jsx';
import { Avatar } from '../components/BusinessCard.jsx';
import { Spinner, Field } from '../components/Form.jsx';
import CategoryIcon, { ICON_NAMES } from '../components/Icon.jsx';
import { useToast } from '../components/Toast.jsx';

const TABS = [['pending', 'Review queue'], ['approved', 'Live'], ['rejected', 'Rejected'], ['users', 'Members'], ['categories', 'Categories']];

function Listings({ status, onChange }) {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [note, setNote] = useState('');

  const load = () => api(`/admin/businesses?status=${status}`).then((r) => setItems(r.items));
  useEffect(() => { setItems(null); load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = async (b, body, msg) => {
    try {
      await api(`/admin/businesses/${b.id}`, { method: 'PATCH', body });
      toast(msg); setRejecting(null); setNote(''); load(); onChange();
    } catch (err) { toast(err.message, 'error'); }
  };

  if (!items) return <Spinner />;
  if (!items.length) return <div className="empty card"><CheckCircle2 size={28} /><h3>Nothing here</h3><p className="muted">{status === 'pending' ? 'All caught up. No listings waiting for review.' : 'No listings in this state.'}</p></div>;

  return (
    <div className="admin-list">
      <AnimatePresence>
        {items.map((b) => (
          <motion.div key={b.id} layout className="card admin-item" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60 }}>
            <Avatar src={b.logo_url} name={b.name} size={52} />
            <div className="admin-item-body">
              <div className="dash-item-title"><h3>{b.name}</h3>{!!b.featured && <span className="chip chip-gold"><Star size={12} /> Featured</span>}</div>
              {b.tagline && <span className="muted">{b.tagline}</span>}
              <span className="mono admin-meta">{b.category || 'No category'} · {[b.city, b.district].filter(Boolean).join(', ') || 'No location'}</span>
              <span className="mono admin-meta">By {b.owner_name} ({b.owner_email}) · {b.owner_club}{b.owner_leo_id ? ` · ID ${b.owner_leo_id}` : ''}</span>
              {b.review_note && <span className="form-error">Note: {b.review_note}</span>}
              <AnimatePresence>
                {rejecting === b.id && (
                  <motion.div className="reject-box" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <Field label="What should the owner change?"><input autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Please add a clear logo and contact number" /></Field>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setRejecting(null)}>Cancel</button>
                      <button className="btn btn-danger-solid btn-sm" onClick={() => patch(b, { status: 'rejected', review_note: note }, 'Listing sent back')}>Send back</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="admin-item-actions">
              <Link className="btn btn-icon" title="Preview" to={`/b/${b.slug}`} target="_blank"><ExternalLink size={16} /></Link>
              {status !== 'approved' && <button className="btn btn-sm btn-success" onClick={() => patch(b, { status: 'approved' }, 'Listing approved')}><Check size={14} /> Approve</button>}
              {status !== 'rejected' && <button className="btn btn-sm btn-ghost" onClick={() => { setRejecting(b.id); setNote(''); }}><X size={14} /> Reject</button>}
              {status === 'approved' && (
                <button className="btn btn-sm btn-ghost" onClick={() => patch(b, { featured: !b.featured }, b.featured ? 'Removed from featured' : 'Marked as featured')}>
                  <Star size={14} /> {b.featured ? 'Unfeature' : 'Feature'}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Members() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const load = () => api('/admin/users').then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);
  const patch = async (u, body) => {
    try { await api(`/admin/users/${u.id}`, { method: 'PATCH', body }); toast('Member updated'); load(); } catch (err) { toast(err.message, 'error'); }
  };
  if (!items) return <Spinner />;
  return (
    <div className="card table-wrap">
      <table className="table">
        <thead><tr><th>Name</th><th>Leo club</th><th>Listings</th><th>Role</th><th>Status</th><th /></tr></thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id}>
              <td><strong>{u.name}</strong><div className="muted mono small">{u.email}{u.phone ? ` · ${u.phone}` : ''}</div></td>
              <td>{u.leo_club}{u.leo_id && <div className="muted mono small">ID {u.leo_id}</div>}</td>
              <td className="mono">{u.business_count}</td>
              <td><span className={`badge ${u.role === 'admin' ? 'badge-approved' : ''}`}>{u.role}</span></td>
              <td><span className={`badge ${u.status === 'active' ? 'badge-approved' : 'badge-rejected'}`}><span className="badge-dot" />{u.status}</span></td>
              <td className="table-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => patch(u, { status: u.status === 'active' ? 'suspended' : 'active' })}>{u.status === 'active' ? 'Suspend' : 'Reactivate'}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => patch(u, { role: u.role === 'admin' ? 'leo' : 'admin' })}>{u.role === 'admin' ? 'Remove admin' : 'Make admin'}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Categories() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('sparkles');
  const load = () => api('/meta').then((m) => setItems(m.categories));
  useEffect(() => { load(); }, []);
  const add = async (e) => {
    e.preventDefault();
    try { await api('/admin/categories', { method: 'POST', body: { name, icon } }); setName(''); toast('Category added'); load(); } catch (err) { toast(err.message, 'error'); }
  };
  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"? Businesses in it will become uncategorised.`)) return;
    try { await api(`/admin/categories/${c.id}`, { method: 'DELETE' }); load(); } catch (err) { toast(err.message, 'error'); }
  };
  if (!items) return <Spinner />;
  return (
    <div className="cat-admin">
      <form className="card panel form" onSubmit={add}>
        <h2 className="panel-title">Add category</h2>
        <Field label="Name"><input required value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <span className="field-label">Icon</span>
        <div className="icon-picker">
          {ICON_NAMES.map((n) => (
            <button type="button" key={n} className={`btn btn-icon ${icon === n ? 'icon-active' : ''}`} onClick={() => setIcon(n)} title={n}><CategoryIcon name={n} size={16} /></button>
          ))}
        </div>
        <button className="btn btn-primary"><Plus size={16} /> Add</button>
      </form>
      <div className="card panel">
        <h2 className="panel-title">Categories</h2>
        <div className="offer-list">
          {items.map((c) => (
            <div key={c.id} className="offer-row">
              <span className="cat-icon"><CategoryIcon name={c.icon} size={18} /></span>
              <div className="offer-row-body"><strong>{c.name}</strong><span className="muted mono">{c.count} live</span></div>
              <button className="btn btn-icon btn-sm btn-danger" title="Delete" onClick={() => remove(c)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('pending');
  const [overview, setOverview] = useState(null);
  const loadOverview = () => api('/admin/overview').then(setOverview).catch(() => {});
  useEffect(() => { loadOverview(); }, []);

  const tiles = [
    [Clock, 'Pending', overview?.pending],
    [CheckCircle2, 'Live', overview?.approved],
    [XCircle, 'Rejected', overview?.rejected],
    [Users, 'Leos', overview?.leos],
    [Eye, 'Total views', overview?.views],
  ];

  return (
    <PageTransition>
      <section className="container page-head">
        <span className="eyebrow mono">// Control room</span>
        <h1>Admin</h1>
      </section>
      <section className="container">
        <div className="admin-tiles">
          {tiles.map(([Icon, label, value]) => (
            <div key={label} className="card stat stat-sm">
              <Icon size={18} className="stat-icon" />
              <span className="stat-value gradient-text">{overview ? <CountUp value={value} duration={800} /> : '--'}</span>
              <span className="stat-label mono">{label}</span>
            </div>
          ))}
        </div>
        <div className="tabs">
          {TABS.map(([v, l]) => (
            <button key={v} className={`tab ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>
              {l}{v === 'pending' && overview?.pending > 0 && <span className="count-dot">{overview.pending}</span>}
              {tab === v && <motion.span layoutId="admin-tab" className="tab-underline" />}
            </button>
          ))}
        </div>
        {['pending', 'approved', 'rejected'].includes(tab) && <Listings status={tab} onChange={loadOverview} />}
        {tab === 'users' && <Members />}
        {tab === 'categories' && <Categories />}
      </section>
    </PageTransition>
  );
}
