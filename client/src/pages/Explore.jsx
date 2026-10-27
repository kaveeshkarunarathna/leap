import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { api, qs } from '../api.js';
import { PageTransition } from '../components/Motion.jsx';
import BusinessCard, { CardSkeleton } from '../components/BusinessCard.jsx';
import CategoryIcon from '../components/Icon.jsx';

const TYPES = [['', 'All'], ['product', 'Products'], ['service', 'Services']];
const SORTS = [['newest', 'Newest'], ['popular', 'Most viewed'], ['name', 'A to Z']];

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => ({
    q: params.get('q') || '',
    category: params.get('category') || '',
    district: params.get('district') || '',
    type: params.get('type') || '',
    sort: params.get('sort') || 'newest',
  }), [params]);

  const [meta, setMeta] = useState({ categories: [], districts: [] });
  const [query, setQuery] = useState(filters.q);
  const [items, setItems] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { api('/meta').then(setMeta).catch(() => {}); }, []);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };

  // Debounce the search box into the URL.
  useEffect(() => {
    const t = setTimeout(() => { if (query !== filters.q) update('q', query.trim()); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    api(`/businesses${qs({ ...filters, page: 1, limit: 12 })}`).then((r) => {
      if (cancelled) return;
      setItems(r.items); setTotal(r.total); setPage(1); setPages(r.pages);
    }).catch(() => !cancelled && setItems([]));
    return () => { cancelled = true; };
  }, [filters]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const r = await api(`/businesses${qs({ ...filters, page: page + 1, limit: 12 })}`);
      setItems((prev) => [...prev, ...r.items]); setPage(page + 1); setPages(r.pages);
    } finally { setLoadingMore(false); }
  };

  const activeCount = ['category', 'district', 'type'].filter((k) => filters[k]).length;
  const clearAll = () => { setQuery(''); setParams({}, { replace: true }); };

  return (
    <PageTransition>
      <section className="container page-head">
        <span className="eyebrow mono">// Directory</span>
        <h1>Explore Leo businesses</h1>
        <p className="muted">Filter by category, district or what they offer.</p>
      </section>

      <section className="container explore">
        <div className="explore-bar card">
          <div className="search-bar search-bar-compact">
            <Search size={18} className="search-icon" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, product, service or town" aria-label="Search" />
            {query && <button className="btn btn-icon btn-sm" aria-label="Clear search" onClick={() => setQuery('')}><X size={14} /></button>}
          </div>
          <div className="segmented" role="tablist">
            {TYPES.map(([v, l]) => (
              <button key={v} role="tab" aria-selected={filters.type === v} className={filters.type === v ? 'active' : ''} onClick={() => update('type', v)}>
                {filters.type === v && <motion.span layoutId="seg" className="segmented-pill" />}
                <span>{l}</span>
              </button>
            ))}
          </div>
          <select value={filters.district} onChange={(e) => update('district', e.target.value)} aria-label="District">
            <option value="">All districts</option>
            {meta.districts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={filters.sort} onChange={(e) => update('sort', e.target.value)} aria-label="Sort">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm filter-toggle" onClick={() => setShowFilters((s) => !s)}>
            <SlidersHorizontal size={16} /> Categories {activeCount > 0 && <span className="count-dot">{activeCount}</span>}
          </button>
        </div>

        <div className={`cat-chips ${showFilters ? 'open' : ''}`}>
          <button className={`chip ${!filters.category ? 'chip-active' : ''}`} onClick={() => update('category', '')}>All categories</button>
          {meta.categories.map((c) => (
            <button key={c.id} className={`chip ${filters.category === c.slug ? 'chip-active' : ''}`} onClick={() => update('category', filters.category === c.slug ? '' : c.slug)}>
              <CategoryIcon name={c.icon} size={13} /> {c.name}
            </button>
          ))}
        </div>

        <div className="results-head mono">
          <span>{items ? `${total} result${total === 1 ? '' : 's'}` : 'Scanning…'}</span>
          {(activeCount > 0 || filters.q) && <button className="link-btn" onClick={clearAll}>Clear filters</button>}
        </div>

        <motion.div layout className="biz-grid">
          {items === null && Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
          <AnimatePresence mode="popLayout">
            {items?.map((b, i) => (
              <motion.div key={b.id} layout initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.35, delay: (i % 12) * 0.03 }}>
                <BusinessCard b={b} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {items?.length === 0 && (
          <div className="empty card">
            <Search size={28} />
            <h3>No matches yet</h3>
            <p className="muted">Try a different search or clear some filters.</p>
            <button className="btn btn-ghost" onClick={clearAll}>Clear filters</button>
          </div>
        )}

        {items && page < pages && (
          <div className="center">
            <button className="btn btn-ghost" onClick={loadMore} disabled={loadingMore}>{loadingMore ? 'Loading…' : 'Load more'}</button>
          </div>
        )}
      </section>
    </PageTransition>
  );
}
