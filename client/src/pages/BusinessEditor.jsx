import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Pencil, Save, Package, Wrench, ExternalLink, Loader2 } from 'lucide-react';
import { api } from '../api.js';
import { PageTransition } from '../components/Motion.jsx';
import { Field, ImageUpload, Spinner, StatusBadge } from '../components/Form.jsx';
import { useToast } from '../components/Toast.jsx';

const EMPTY = { name: '', tagline: '', description: '', category_id: '', district: '', city: '', address: '', phone: '', whatsapp: '', email: '', website: '', facebook: '', instagram: '', logo_url: null, cover_url: null };
const EMPTY_OFFER = { type: 'product', title: '', description: '', price: '', image_url: null };

function OfferingForm({ initial, onSave, onCancel }) {
  const [o, setO] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setO({ ...o, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await onSave(o); } finally { setBusy(false); }
  };
  return (
    <motion.form className="offer-form" onSubmit={submit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
      <div className="offer-form-grid">
        <ImageUpload value={o.image_url} onChange={(url) => setO({ ...o, image_url: url })} label="Photo" shape="square" />
        <div className="form">
          <div className="segmented segmented-sm">
            {[['product', 'Product'], ['service', 'Service']].map(([v, l]) => (
              <button type="button" key={v} className={o.type === v ? 'active' : ''} onClick={() => setO({ ...o, type: v })}>
                {o.type === v && <motion.span layoutId={`seg-type-${initial.id || 'new'}`} className="segmented-pill" />}<span>{l}</span>
              </button>
            ))}
          </div>
          <div className="form-row">
            <Field label="Title"><input required value={o.title} onChange={set('title')} /></Field>
            <Field label="Price" hint="Free text, e.g. LKR 1,500 or Quote on request"><input value={o.price || ''} onChange={set('price')} /></Field>
          </div>
          <Field label="Description"><textarea rows={2} value={o.description || ''} onChange={set('description')} /></Field>
          <div className="row-actions">
            {onCancel && <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>}
            <button className="btn btn-primary btn-sm" disabled={busy}>{busy ? <Loader2 className="spin" size={14} /> : <><Save size={14} /> Save</>}</button>
          </div>
        </div>
      </div>
    </motion.form>
  );
}

function Offerings({ businessId, initial }) {
  const toast = useToast();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState(null); // offering id or 'new'

  const create = async (o) => {
    try {
      const { offering } = await api(`/my/businesses/${businessId}/offerings`, { method: 'POST', body: { ...o, sort_order: items.length } });
      setItems([...items, offering]); setEditing(null); toast('Added');
    } catch (err) { toast(err.message, 'error'); }
  };
  const update = async (o) => {
    try {
      const { offering } = await api(`/my/offerings/${o.id}`, { method: 'PUT', body: o });
      setItems(items.map((x) => (x.id === o.id ? offering : x))); setEditing(null); toast('Saved');
    } catch (err) { toast(err.message, 'error'); }
  };
  const remove = async (o) => {
    if (!window.confirm(`Remove "${o.title}"?`)) return;
    try { await api(`/my/offerings/${o.id}`, { method: 'DELETE' }); setItems(items.filter((x) => x.id !== o.id)); } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div className="card panel">
      <div className="panel-title-row">
        <h2 className="panel-title">Products & services</h2>
        {editing !== 'new' && <button className="btn btn-ghost btn-sm" onClick={() => setEditing('new')}><Plus size={14} /> Add item</button>}
      </div>
      <AnimatePresence>{editing === 'new' && <OfferingForm key="new" initial={EMPTY_OFFER} onSave={create} onCancel={() => setEditing(null)} />}</AnimatePresence>
      {items.length === 0 && editing !== 'new' && <p className="muted">Add the products you sell or the services you provide.</p>}
      <div className="offer-list">
        {items.map((o) => (
          <div key={o.id}>
            <AnimatePresence mode="wait">
              {editing === o.id ? (
                <OfferingForm key="edit" initial={o} onSave={update} onCancel={() => setEditing(null)} />
              ) : (
                <motion.div key="row" className="offer-row" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {o.image_url ? <img src={o.image_url} alt="" className="offer-thumb" /> : <span className="offer-thumb offer-img-empty">{o.type === 'product' ? <Package size={18} /> : <Wrench size={18} />}</span>}
                  <div className="offer-row-body">
                    <strong>{o.title}</strong>
                    <span className="muted mono">{o.type}{o.price ? ` · ${o.price}` : ''}</span>
                  </div>
                  <button className="btn btn-icon btn-sm" title="Edit" onClick={() => setEditing(o.id)}><Pencil size={14} /></button>
                  <button className="btn btn-icon btn-sm btn-danger" title="Remove" onClick={() => remove(o)}><Trash2 size={14} /></button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BusinessEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const [meta, setMeta] = useState({ categories: [], districts: [] });
  const [form, setForm] = useState(isNew ? EMPTY : null);
  const [record, setRecord] = useState(null);
  const [offerings, setOfferings] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api('/meta').then(setMeta).catch(() => {}); }, []);
  useEffect(() => {
    if (isNew) { setForm(EMPTY); setRecord(null); return; }
    api(`/my/businesses/${id}`).then(({ business, offerings }) => {
      const f = {};
      Object.keys(EMPTY).forEach((k) => { f[k] = business[k] ?? (k.endsWith('_url') ? null : ''); });
      setForm(f); setRecord(business); setOfferings(offerings);
    }).catch(() => navigate('/dashboard', { replace: true }));
  }, [id, isNew, navigate]);

  if (!form) return <PageTransition><Spinner /></PageTransition>;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isNew) {
        const { business } = await api('/my/businesses', { method: 'POST', body: form });
        toast('Business created. Now add your products and services.');
        navigate(`/dashboard/${business.id}`, { replace: true });
      } else {
        const { business } = await api(`/my/businesses/${id}`, { method: 'PUT', body: form });
        setRecord(business);
        toast(business.status === 'pending' && record?.status === 'rejected' ? 'Saved and sent back for review' : 'Changes saved');
      }
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <PageTransition>
      <section className="container page-head page-head-row">
        <div>
          <Link to="/dashboard" className="back-link mono"><ArrowLeft size={14} /> Dashboard</Link>
          <h1>{isNew ? 'Add your business' : form.name || 'Edit business'}</h1>
          {record && <div className="row-gap"><StatusBadge status={record.status} />{record.status === 'pending' && <span className="muted">The LEAP team will review it soon.</span>}</div>}
          {record?.status === 'rejected' && record.review_note && <p className="form-error">Reviewer note: {record.review_note}</p>}
        </div>
        {record && <Link to={`/b/${record.slug}`} className="btn btn-ghost"><ExternalLink size={16} /> Preview</Link>}
      </section>

      <section className="container editor">
        <form className="card panel form" onSubmit={save}>
          <h2 className="panel-title">Branding</h2>
          <div className="brand-uploads">
            <div><span className="field-label">Logo</span><ImageUpload value={form.logo_url} onChange={(url) => setForm({ ...form, logo_url: url })} label="Logo" shape="square" /></div>
            <div className="grow"><span className="field-label">Cover image</span><ImageUpload value={form.cover_url} onChange={(url) => setForm({ ...form, cover_url: url })} label="Cover image (wide)" /></div>
          </div>

          <h2 className="panel-title">Details</h2>
          <Field label="Business name"><input required value={form.name} onChange={set('name')} /></Field>
          <Field label="Tagline" hint="One line about what you do"><input maxLength={200} value={form.tagline || ''} onChange={set('tagline')} /></Field>
          <Field label="Description"><textarea rows={5} value={form.description || ''} onChange={set('description')} /></Field>
          <div className="form-row">
            <Field label="Category">
              <select value={form.category_id || ''} onChange={set('category_id')}>
                <option value="">Choose a category</option>
                {meta.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="District">
              <select value={form.district || ''} onChange={set('district')}>
                <option value="">Choose a district</option>
                {meta.districts.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
          </div>
          <div className="form-row">
            <Field label="Town / city"><input value={form.city || ''} onChange={set('city')} /></Field>
            <Field label="Address"><input value={form.address || ''} onChange={set('address')} /></Field>
          </div>

          <h2 className="panel-title">Contact</h2>
          <div className="form-row">
            <Field label="Phone"><input value={form.phone || ''} onChange={set('phone')} /></Field>
            <Field label="WhatsApp"><input value={form.whatsapp || ''} onChange={set('whatsapp')} /></Field>
          </div>
          <div className="form-row">
            <Field label="Email"><input type="email" value={form.email || ''} onChange={set('email')} /></Field>
            <Field label="Website"><input value={form.website || ''} onChange={set('website')} placeholder="yourbusiness.lk" /></Field>
          </div>
          <div className="form-row">
            <Field label="Facebook page"><input value={form.facebook || ''} onChange={set('facebook')} placeholder="facebook.com/…" /></Field>
            <Field label="Instagram"><input value={form.instagram || ''} onChange={set('instagram')} placeholder="instagram.com/…" /></Field>
          </div>
          <div className="row-actions">
            <button className="btn btn-primary" disabled={busy}>{busy ? <Loader2 className="spin" size={16} /> : <><Save size={16} /> {isNew ? 'Create business' : 'Save changes'}</>}</button>
          </div>
        </form>

        {isNew ? (
          <div className="card panel muted">Save your business first, then you can add products and services.</div>
        ) : (
          <Offerings businessId={Number(id)} initial={offerings} />
        )}
      </section>
    </PageTransition>
  );
}
