import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadImage } from '../api.js';
import { useToast } from './Toast.jsx';

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function ImageUpload({ value, onChange, label = 'Upload image', shape = 'wide' }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try { onChange(await uploadImage(file)); } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };
  return (
    <div className={`upload upload-${shape}`} style={value ? { backgroundImage: `url(${value})` } : undefined}>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={onFile} />
      {!value && (
        <button type="button" className="upload-btn" onClick={() => input.current.click()} disabled={busy}>
          {busy ? <Loader2 className="spin" size={22} /> : <ImagePlus size={22} />}
          <span>{busy ? 'Uploading…' : label}</span>
        </button>
      )}
      {value && (
        <div className="upload-actions">
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => input.current.click()} disabled={busy}>
            {busy ? <Loader2 className="spin" size={14} /> : 'Change'}
          </button>
          <button type="button" className="btn btn-icon btn-sm" aria-label="Remove image" onClick={() => onChange(null)}><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="spinner-wrap" role="status">
      <div className="spinner"><span /><span /><span /></div>
      <span className="mono muted">{label}…</span>
    </div>
  );
}

export function StatusBadge({ status }) {
  const labels = { pending: 'Pending review', approved: 'Live', rejected: 'Needs changes' };
  return <span className={`badge badge-${status}`}><span className="badge-dot" />{labels[status] || status}</span>;
}
