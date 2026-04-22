import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase.js';
import { loadPricing, savePricing, loadUserRole } from './lib/db.js';
import iwsLogo from './assets/IWS-Symbol-color.png';
import operatorMap from './assets/operator newsletter 2026.04.07.png';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

const DEFAULT_PRICING = { id: 1, tier1Price: 0, tier2Price: 0, tier3Price: 0, notes: '', periodStart: '', periodEnd: '' };

const BRAND = {
  blue: '#1A6FB5',
  teal: '#14B8A6',
  gradient: 'linear-gradient(135deg, #1A6FB5 0%, #1DAA7A 100%)',
};

const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const TABNUM = { fontVariantNumeric: 'tabular-nums' };

function SectionLabel({ children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ width: 24, height: 2, background: BRAND.teal, borderRadius: 1, marginBottom: 8 }} />
      <div style={{ fontSize: 11, fontWeight: 600, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</div>
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', error: '', loading: false });
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [editingPricing, setEditingPricing] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState('pricing');
  const [scrolled, setScrolled] = useState(false);
  const spySuppressed = React.useRef(false);
  const observerRef = React.useRef(null);

  // IntersectionObserver scroll-spy + scrolled shadow + bottom-of-page edge case
  // Re-runs when session/userRole change so sections are in the DOM
  useEffect(() => {
    if (!session || !userRole) return;

    // Small delay to ensure DOM has rendered after state update
    const timer = setTimeout(() => {
      const sectionIds = ['pricing', 'service-area', 'quality', 'terms', 'contact', 'disclosures'];
      const visibleSet = new Set();

      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleSet.add(entry.target.id);
          else visibleSet.delete(entry.target.id);
        }
        if (spySuppressed.current) return;
        for (let i = sectionIds.length - 1; i >= 0; i--) {
          if (visibleSet.has(sectionIds[i])) { setActiveAnchor(sectionIds[i]); return; }
        }
      }, { rootMargin: '-100px 0px -60% 0px', threshold: 0 });

      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });

      observerRef.current = { observer };
    }, 50);

    // Scroll listener for shadow + bottom-of-page edge case
    const scrollHandler = () => {
      setScrolled(window.scrollY > 60);
      if (spySuppressed.current) return;
      const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 4);
      if (atBottom) setActiveAnchor('disclosures');
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });

    return () => {
      clearTimeout(timer);
      observerRef.current?.observer?.disconnect();
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [session, userRole]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => { setSession(s); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const email = session.user?.email;
      const [pricingData, role] = await Promise.all([loadPricing(), loadUserRole(email)]);
      setUserRole(role);
      setPricing(pricingData || DEFAULT_PRICING);
    })();
  }, [session]);

  function handleSavePricing() { savePricing(pricing); setEditingPricing(false); }

  async function signIn(e) {
    e.preventDefault();
    setLoginForm(p => ({ ...p, loading: true, error: '' }));
    const { error } = await supabase.auth.signInWithPassword({ email: loginForm.email, password: loginForm.password });
    if (error) setLoginForm(p => ({ ...p, loading: false, error: error.message }));
    else setLoginForm(p => ({ ...p, loading: false }));
  }

  function signOut() { supabase.auth.signOut(); setSession(null); setUserRole(null); }

  // ── LOADING ─────────────────────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{ fontSize: 14, color: '#94A3B8' }}>Loading…</div>
    </div>
  );

  // ── LOGIN ───────────────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: isMobile ? 32 : 48, width: isMobile ? '90%' : 400, border: '0.5px solid #E2E8F0' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src={iwsLogo} alt="IWS" style={{ height: 48, width: 'auto', marginBottom: 20 }} />
            <div style={{ fontSize: 24, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em' }}>Infinity Water Solutions</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#64748B', marginTop: 6, letterSpacing: '0.04em' }}>Operator Portal</div>
          </div>
          <form onSubmit={signIn} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="email" placeholder="Email" required value={loginForm.email}
              onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
              style={{ width: '100%', padding: '12px 16px', fontSize: 15, color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', fontFamily: FONT }} />
            <input type="password" placeholder="Password" required value={loginForm.password}
              onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
              style={{ width: '100%', padding: '12px 16px', fontSize: 15, color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', fontFamily: FONT }} />
            {loginForm.error && <div style={{ color: '#EF4444', fontSize: 13, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA' }}>{loginForm.error}</div>}
            <button type="submit" disabled={loginForm.loading} style={{
              width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 600,
              background: '#0F172A', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
              opacity: loginForm.loading ? 0.5 : 1, marginTop: 4, fontFamily: FONT,
            }}>
              {loginForm.loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── MAIN ────────────────────────────────────────────────────────────────────
  const canEdit = userRole === 'owner';
  const bestPrice = pricing.tier3Price || pricing.tier2Price || pricing.tier1Price;

  const TIERS = [
    { label: '< 500,000 barrels', key: 'tier1Price', dot: '#94A3B8' },
    { label: '500,000 – 1,000,000 barrels', key: 'tier2Price', dot: BRAND.blue },
    { label: '> 1,000,000 barrels', key: 'tier3Price', dot: BRAND.teal, best: true },
  ];

  const sp = isMobile ? 40 : 56;



  return (
    <div style={{ minHeight: '100vh', background: '#fafbfc', fontFamily: FONT, color: '#0F172A' }}>

      {/* ── TOPBAR (scrolls away) ── */}
      <div style={{ height: 3, background: BRAND.gradient }} />
      <nav style={{
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #E2E8F0', height: 52, padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={iwsLogo} alt="IWS" style={{ height: isMobile ? 26 : 30, width: 'auto' }} />
          {!isMobile && <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Infinity Water Solutions</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16 }}>
          {!isMobile && <span style={{ fontSize: 13, color: '#64748B' }}>{session?.user?.email}</span>}
          <button onClick={signOut} style={{ fontSize: 13, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT }}>Sign out</button>
        </div>
      </nav>

      {/* ── STICKY UNIT: STATUS BAR + ANCHOR NAV ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: scrolled ? '0 1px 3px rgba(15,23,42,0.06)' : 'none',
        transition: 'box-shadow 0.2s ease',
      }}>
        {/* Status bar */}
        <div style={{
          background: '#F8FAFC', borderBottom: '1px solid rgba(15,23,42,0.06)',
          height: 40, padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 11, fontWeight: 500, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase',
          ...TABNUM,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
            <span>LIVE · MILLS RANCH · EDDY COUNTY, NM</span>
          </div>
          {!isMobile && pricing.periodStart && pricing.periodEnd && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>CYCLE: {formatDateShort(pricing.periodStart)} – {formatDateShort(pricing.periodEnd)}</span>
              <span style={{ color: '#CBD5E1' }}> · </span>
              <span>NEXT REFRESH: {formatDateShort(pricing.periodEnd)}</span>
            </div>
          )}
          {isMobile && pricing.periodStart && pricing.periodEnd && (
            <span style={{ fontSize: 10 }}>{formatDateShort(pricing.periodStart)} – {formatDateShort(pricing.periodEnd)}</span>
          )}
        </div>

        {/* Anchor nav */}
        <div style={{
          background: '#F8FAFC', borderBottom: '1px solid rgba(15,23,42,0.06)',
          height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
        }}>
          {[
            { id: 'pricing', label: 'Pricing' },
            { id: 'service-area', label: 'Service Area' },
            { id: 'quality', label: 'Water Quality' },
            { id: 'terms', label: 'Terms' },
            { id: 'contact', label: 'Contact' },
            { id: 'disclosures', label: 'Disclosures' },
          ].map((item, i) => {
            const isActive = activeAnchor === item.id;
            return (
              <span key={item.id} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                {i > 0 && <span style={{ color: '#CBD5E1', margin: '0 10px', fontSize: 13 }}>&middot;</span>}
                <a
                  href={`#${item.id}`}
                  onClick={e => {
                    e.preventDefault();
                    setActiveAnchor(item.id);
                    spySuppressed.current = true;
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setTimeout(() => { spySuppressed.current = false; }, 600);
                  }}
                  style={{
                    fontSize: 13, fontWeight: 500, letterSpacing: '0.05em', textDecoration: 'none', cursor: 'pointer',
                    color: isActive ? BRAND.teal : '#475569',
                    borderBottom: isActive ? `2px solid ${BRAND.teal}` : '2px solid transparent',
                    paddingBottom: 6, transition: 'color 0.15s, border-color 0.15s',
                  }}
                >{item.label}</a>
              </span>
            );
          })}
        </div>
      </div>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: isMobile ? '24px 20px 48px' : '48px 24px 80px', scrollMarginTop: 100 }}>

        {/* ── ORIENTATION BLOCK ── */}
        <section aria-labelledby="portal-title" style={{ marginBottom: 48 }}>
          <div style={{ width: 24, height: 2, background: BRAND.teal, borderRadius: 1, marginBottom: 8 }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
            Operator Portal
          </div>
          <h1 id="portal-title" style={{ fontSize: isMobile ? 26 : 32, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em', lineHeight: 1.15, margin: '0 0 12px', maxWidth: 640 }}>
            IWS Water Availability &amp; Pricing Dashboard
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: '#334155', fontWeight: 400, margin: 0, maxWidth: 640 }}>
            Live spot pricing and availability for treated produced water from Infinity Water Solutions&apos; facilities. Rates refresh every two weeks. Contact us directly to confirm volumes and execute purchases.
          </p>
        </section>

        {/* ── DARK HERO ── */}
        <div id="pricing" style={{
          background: '#0B1220', borderRadius: 20,
          padding: isMobile ? '28px 24px' : '36px 40px',
          marginBottom: isMobile ? 28 : 36, color: '#fff',
          scrollMarginTop: 100,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', flexWrap: 'wrap', gap: isMobile ? 28 : 40 }}>
            {/* Left */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 2, height: 24, background: BRAND.teal, borderRadius: 1 }} />
                <h2 style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                  SPOT PRICING · TREATED PRODUCED WATER
                </h2>
              </div>
              <div style={{ fontSize: 15, color: '#E2E8F0', fontWeight: 400, marginBottom: 14 }}>Mills Ranch · Eddy County, NM</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>Pickup at pond</span>
                <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>Transfer available on request</span>
              </div>
              {canEdit && (
                <div style={{ marginTop: 20 }}>
                  <button onClick={() => editingPricing ? handleSavePricing() : setEditingPricing(true)} style={{
                    padding: '8px 18px', fontSize: 13, fontWeight: 500, borderRadius: 8, cursor: 'pointer', fontFamily: FONT,
                    background: editingPricing ? '#fff' : 'transparent',
                    color: editingPricing ? '#0B1220' : '#fff',
                    border: editingPricing ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  }}>
                    {editingPricing ? '✓ Save pricing' : '✎ Edit pricing'}
                  </button>
                </div>
              )}
              {editingPricing && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Pricing period</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="date" value={pricing.periodStart} onChange={e => setPricing(p => ({ ...p, periodStart: e.target.value }))}
                      style={{ padding: '8px 12px', fontSize: 14, color: '#0F172A', background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 8, fontFamily: FONT, ...TABNUM }} />
                    <span style={{ fontSize: 13, color: '#475569' }}>to</span>
                    <input type="date" value={pricing.periodEnd} onChange={e => setPricing(p => ({ ...p, periodEnd: e.target.value }))}
                      style={{ padding: '8px 12px', fontSize: 14, color: '#0F172A', background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 8, fontFamily: FONT, ...TABNUM }} />
                  </div>
                </div>
              )}
            </div>
            {/* Right — best price */}
            <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Best available rate</div>
              <div style={{ ...TABNUM }}>
                <span style={{ fontSize: isMobile ? 56 : 72, fontWeight: 600, color: '#fff', lineHeight: 1 }}>
                  ${bestPrice > 0 ? bestPrice.toFixed(2) : '—'}
                </span>
                {bestPrice > 0 && <span style={{ fontSize: isMobile ? 22 : 28, fontWeight: 400, color: '#64748B', marginLeft: 4 }}>/bbl</span>}
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 6, ...TABNUM }}>≥ 1,000,000 barrels tier</div>
            </div>
          </div>
        </div>

        {/* ── CHANGE 2: PRICING TABLE ── */}
        <div style={{ marginBottom: sp }}>
          {/* Column headers */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', padding: '0 0 10px', marginBottom: 4,
            fontSize: 11, fontWeight: 600, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <span>Volume</span>
            <span>Rate</span>
          </div>

          {TIERS.map((tier) => {
            const price = pricing[tier.key];
            return (
              <div key={tier.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: isMobile ? '18px 0' : '22px 0',
              }}>
                {/* Volume */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: tier.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 15, fontWeight: 400, color: '#0F172A', ...TABNUM }}>{tier.label}</span>
                </div>

                {/* Price + best tag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {editingPricing ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                      <span style={{ fontSize: 20, fontWeight: 500, color: '#0F172A' }}>$</span>
                      <input type="number" step="0.01" min="0" value={price || ''}
                        onChange={e => setPricing(p => ({ ...p, [tier.key]: parseFloat(e.target.value) || 0 }))}
                        style={{ width: 70, padding: '4px 6px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 20, fontWeight: 600, color: '#0F172A', background: '#F8FAFC', textAlign: 'right', outline: 'none', fontFamily: FONT, ...TABNUM }}
                      />
                    </div>
                  ) : (
                    <span style={{ fontSize: 22, fontWeight: 600, color: '#0F172A', ...TABNUM }}>
                      {price > 0 ? (
                        <>${price.toFixed(2)}<span style={{ fontSize: 13, fontWeight: 400, color: '#0F172A', opacity: 0.4, marginLeft: 2 }}>/bbl</span></>
                      ) : (
                        <span style={{ color: '#CBD5E1' }}>—</span>
                      )}
                    </span>
                  )}
                  {tier.best && price > 0 && !editingPricing && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: BRAND.teal, textTransform: 'uppercase', letterSpacing: '0.06em' }}>BEST</span>
                  )}
                </div>
              </div>
            );
          })}

          <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, marginTop: 12 }}>
            Rates shown are for pickup at the facility pond. Transfer services are available upon request. Pricing is published on a two-week cycle.
          </div>
        </div>

        <div style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', marginBottom: sp }} />

        {/* ── SERVICE AREA ── */}
        <div id="service-area" style={{ marginBottom: sp, scrollMarginTop: 100 }}>
          <SectionLabel>Service Area</SectionLabel>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: '#334155', margin: '0 0 24px', maxWidth: 640 }}>
            Current supply is sourced from Infinity Water Solutions&apos; Mills Ranch 1 and Fed 128 facilities in Eddy and Lea County, New Mexico. Rates are quoted for pickup at the facility pond. Transfer services are available upon request and quoted separately.
          </p>
          <img src={operatorMap} alt="Operator service area map" style={{ width: '100%', borderRadius: 20 }} />
        </div>

        <div style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', marginBottom: sp }} />

        {/* ── WATER QUALITY SPECIFICATIONS ── */}
        <div id="quality" style={{ marginBottom: sp, scrollMarginTop: 100 }}>
          <SectionLabel>Water Quality Specifications</SectionLabel>

          {/* Column headers */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', padding: '0 0 10px', marginBottom: 4,
            fontSize: 11, fontWeight: 600, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <span>Parameter</span>
            <span>Value</span>
          </div>

          {[
            { param: 'pH', value: '6.00 – 6.50', unit: '' },
            { param: 'Iron (Fe)', value: '< 2', unit: 'mg/L' },
            { param: 'Turbidity', value: '< 10', unit: 'NTU' },
            { param: 'ORP', value: '> 350', unit: 'mV' },
            { param: 'TDS', value: '160,000 – 200,000', unit: 'ppm' },
          ].map((row) => (
            <div key={row.param} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: isMobile ? '18px 0' : '22px 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: BRAND.teal, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 500, color: '#0F172A' }}>{row.param}</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 500, color: '#0F172A', ...TABNUM }}>
                {row.value}
                {row.unit && <span style={{ fontSize: 13, fontWeight: 400, color: '#0F172A', opacity: 0.6, marginLeft: 4 }}>{row.unit}</span>}
              </span>
            </div>
          ))}

          <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginTop: 16 }}>
            Values are representative and may vary by source and over time. Full analytical reports available upon request.
          </div>
        </div>

        <div style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', marginBottom: sp }} />

        {/* ── PURCHASE & TRANSFER TERMS ── */}
        <div id="terms" style={{ marginBottom: sp, scrollMarginTop: 100 }}>
          <SectionLabel>Purchase &amp; Transfer Terms</SectionLabel>
          <div style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 12px' }}><strong style={{ color: '#0F172A', fontWeight: 500 }}>Pricing cycle.</strong> Rates are fixed for a two-week period and refreshed at the start of each new cycle.</p>
            <p style={{ margin: '0 0 12px' }}><strong style={{ color: '#0F172A', fontWeight: 500 }}>Pickup window.</strong> Confirmed purchases must be withdrawn from the designated facility pond within 45 days of execution, either by the buyer directly or through arranged transfer services.</p>
            <p style={{ margin: '0 0 12px' }}><strong style={{ color: '#0F172A', fontWeight: 500 }}>Transfer.</strong> Transfer from the facility pond to the buyer&apos;s designated location is available upon request and quoted separately.</p>
            <p style={{ margin: 0 }}><strong style={{ color: '#0F172A', fontWeight: 500 }}>Title &amp; custody.</strong> Title and custody transfer to the buyer at the withdrawal point &mdash; the buyer&apos;s point of pickup at the designated facility pond (e.g., Mills Ranch 1 Facility or Fed128 Facility) &mdash; unless otherwise agreed in writing.</p>
          </div>
        </div>

        {/* ── MARKET NOTES (only shown when notes exist or editing) ── */}
        {(editingPricing || pricing.notes) ? (
          <>
            <div style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', marginBottom: sp }} />
            <div style={{ marginBottom: sp }}>
              <SectionLabel>Market Notes</SectionLabel>
              {editingPricing ? (
                <textarea value={pricing.notes}
                  onChange={e => setPricing(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Current supply levels, expected changes, seasonal notes..."
                  style={{ width: '100%', minHeight: 100, padding: '14px 16px', fontSize: 15, color: '#0F172A', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, outline: 'none', resize: 'vertical', lineHeight: 1.6, fontFamily: FONT }}
                />
              ) : (
                <div style={{ fontSize: 15, color: '#64748B', lineHeight: 1.7 }}>{pricing.notes}</div>
              )}
            </div>
          </>
        ) : null}

        <div style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', marginBottom: sp }} />

        {/* ── CONTACT ── */}
        <div id="contact" style={{ textAlign: 'center', marginBottom: sp, paddingTop: 8, scrollMarginTop: 100 }}>
          <div style={{ width: 24, height: 2, background: BRAND.teal, borderRadius: 1, margin: '0 auto 10px' }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Volume inquiries</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A' }}>Christian Padilla</div>
          <div style={{ fontSize: 13, fontWeight: 400, color: '#64748B', letterSpacing: '0.01em', marginTop: 4 }}>Commercial &amp; Operations Manager</div>
          <div style={{ fontSize: 15, color: '#64748B', marginTop: 8, ...TABNUM }}>713-591-1132 · christian@water.energy</div>
        </div>

        <div style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', marginBottom: sp }} />

        {/* ── COMMERCIAL TERMS ── */}
        <div id="disclosures" style={{ marginBottom: sp, scrollMarginTop: 100 }}>
          <SectionLabel>Commercial Terms &amp; Disclosures</SectionLabel>
          <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.8 }}>
            <p style={{ margin: '0 0 12px' }}>Pricing is indicative and refreshed on a two-week cycle. All rates and volumes are subject to real-time availability, water quality, system conditions, and prevailing market dynamics, and are not guaranteed until confirmed in a fully executed agreement.</p>
            <p style={{ margin: '0 0 12px' }}>All pricing is quoted FOB at the facility pond, with title and custody transferring to the buyer at the withdrawal point. Transfer services from the pond to a buyer-designated location are available upon request and governed by separate terms and fees. Confirmed purchases must be withdrawn within 45 days of execution.</p>
            <p style={{ margin: '0 0 12px' }}>Water quality specifications are representative and may vary by source and over time; full specifications are available upon request. Displayed volumes reflect current operational visibility and are subject to change without notice due to system fluctuations, maintenance, or third-party activity.</p>
            <p style={{ margin: 0 }}>Nothing contained herein constitutes a binding offer. All transactions are subject to contract, availability, and final confirmation by Infinity Water Solutions.</p>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ textAlign: 'center', paddingBottom: 20 }}>
          <img src={iwsLogo} alt="IWS" style={{ height: 24, width: 'auto', opacity: 0.25 }} />
          <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 8, ...TABNUM }}>&copy; {new Date().getFullYear()} Infinity Water Solutions</div>
        </div>
      </main>

      <style>{`
        *{box-sizing:border-box;}
        body{margin:0;font-family:${FONT};}
        input:focus,select:focus,textarea:focus{outline:2px solid ${BRAND.blue}!important;outline-offset:1px;border-color:${BRAND.blue}!important;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
        .pulse-dot{animation:pulse 2s ease-in-out infinite;}
        .anchor-nav::-webkit-scrollbar{display:none;}
        @media(max-width:768px){body{font-size:14px;}}
      `}</style>
    </div>
  );
}
