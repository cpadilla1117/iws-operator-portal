import React, { useState, useEffect } from 'react';
// Auth + DB helpers (signIn, signOut, loadPricing, savePricing, loadUserRole,
// supabase.auth) available in './lib/supabase.js' and './lib/db.js' if the
// auth gate or DB-driven pricing is re-enabled later.
import iwsLogo from './assets/IWS-Symbol-color.png';
import operatorMap from './assets/Pricing Dashboard Map v6 white text 2026.04.23.jpg';

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

// ═══════════════════════════════════════════════════════════════════════════
// SPOT PRICING CONFIG — authoritative values for the portal.
// Update these values and redeploy to change the rates shown on the portal.
// Refreshed every 2-week cycle.
// ═══════════════════════════════════════════════════════════════════════════
const FACILITY_PRICING = {
  mills_ranch: {
    name: 'Mills Ranch 1 Facility',
    location: 'Eddy County, NM',
    price: 0.10,
  },
  fed128: {
    name: 'Fed128 Facility',
    location: 'Eddy County, NM',
    price: 0.11,
  },
};

// Pricing cycle window shown in the sticky status bar.
// Format: YYYY-MM-DD. Update each cycle start.
const PRICING_CYCLE = {
  start: '2026-04-20',
  end:   '2026-05-04',
};

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
      <div style={{ width: 24, height: 2, background: BRAND.teal, borderRadius: 1, marginBottom: 6 }} />
      <div style={{ fontSize: 11, fontWeight: 600, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</div>
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile();
  // Open-access, code-driven pricing. To re-enable Supabase-driven pricing
  // or the auth gate, see commit history. Helpers remain in ./lib/*.
  const [activeAnchor, setActiveAnchor] = useState('pricing');
  const [scrolled, setScrolled] = useState(false);
  const spySuppressed = React.useRef(false);
  const observerRef = React.useRef(null);

  // IntersectionObserver scroll-spy + scrolled shadow + bottom-of-page edge case
  useEffect(() => {
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
  }, []);


  // ── MAIN ────────────────────────────────────────────────────────────────────
  const sp = isMobile ? 24 : 32;



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
            <span>LIVE · MILLS RANCH + FED128 · EDDY COUNTY, NM</span>
          </div>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>CYCLE: {formatDateShort(PRICING_CYCLE.start)} – {formatDateShort(PRICING_CYCLE.end)}</span>
              <span style={{ color: '#CBD5E1' }}> · </span>
              <span>NEXT REFRESH: {formatDateShort(PRICING_CYCLE.end)}</span>
            </div>
          )}
          {isMobile && (
            <span style={{ fontSize: 10 }}>{formatDateShort(PRICING_CYCLE.start)} – {formatDateShort(PRICING_CYCLE.end)}</span>
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

        {/* ── PAGE TITLE BLOCK ── */}
        <section aria-labelledby="portal-title" style={{ marginTop: 40, marginBottom: 32 }}>
          <div style={{ width: 24, height: 2, background: BRAND.teal, borderRadius: 1, marginBottom: 6 }} />
          <h1 id="portal-title" style={{
            fontSize: 11, fontWeight: 600, color: '#64748B',
            textTransform: 'uppercase', letterSpacing: '0.12em',
            margin: '0 0 16px',
          }}>
            Water Availability &amp; Pricing Dashboard
          </h1>
          <p className="justify-copy" style={{
            fontSize: 16, lineHeight: 1.6, color: '#334155', fontWeight: 400,
            margin: 0, maxWidth: 640,
          }}>
            Current availability and spot pricing for treated produced water across Infinity&apos;s facilities. Updated bi-weekly. Pricing varies based on supply, water quality, and volume.
          </p>
        </section>

        {/* ── TWO FACILITY CARDS ── */}
        <div id="pricing" style={{ scrollMarginTop: 100 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 16 : 24,
          }}>
            {Object.values(FACILITY_PRICING).map((facility) => (
              <div key={facility.name} style={{
                background: '#0B1220', borderRadius: 20,
                padding: isMobile ? '24px 24px' : '28px 28px',
                color: '#fff',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                gap: 20,
              }}>
                {/* Top — meta */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 2, height: 24, background: BRAND.teal, borderRadius: 1 }} />
                    <h2 style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                      SPOT PRICING · TREATED PRODUCED WATER
                    </h2>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{
                      fontSize: isMobile ? 16 : 18, fontWeight: 600, color: '#FFFFFF',
                      letterSpacing: '-0.01em', lineHeight: 1.3,
                    }}>
                      {facility.name}
                    </div>
                    <div style={{
                      fontSize: isMobile ? 13 : 14, fontWeight: 400, color: '#94A3B8',
                      lineHeight: 1.4, marginTop: 2,
                    }}>
                      {facility.location}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>Pickup at pond</span>
                    <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>Transfer available on request</span>
                  </div>
                </div>
                {/* Bottom — spot rate */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Spot rate</div>
                  <div style={{ ...TABNUM }}>
                    <span style={{ fontSize: isMobile ? 56 : 64, fontWeight: 600, color: '#fff', lineHeight: 1 }}>
                      ${facility.price.toFixed(2)}
                    </span>
                    <span style={{ fontSize: isMobile ? 22 : 26, fontWeight: 400, color: '#64748B', marginLeft: 4 }}>/bbl</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTNOTE BELOW CARDS ── */}
        <div style={{
          fontSize: 14, fontStyle: 'italic', lineHeight: 1.6, color: '#475569',
          fontWeight: 400, marginTop: 20, marginBottom: 32,
        }}>
          Pricing reflects spot availability. For larger volumes or longer-term arrangements, please{' '}
          <a
            href="#contact"
            onClick={e => {
              e.preventDefault();
              setActiveAnchor('contact');
              spySuppressed.current = true;
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              setTimeout(() => { spySuppressed.current = false; }, 600);
            }}
            className="contact-link"
            style={{ color: BRAND.teal, textDecoration: 'none', fontStyle: 'italic' }}
          >contact us</a> directly.
        </div>

        <div style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', marginBottom: sp }} />

        {/* ── SERVICE AREA ── */}
        <div id="service-area" style={{ marginBottom: sp, scrollMarginTop: 100 }}>
          <SectionLabel>Service Area</SectionLabel>
          <p className="justify-copy" style={{ fontSize: 15, lineHeight: 1.6, color: '#334155', margin: '0 0 16px', maxWidth: 640 }}>
            Current supply is sourced from Infinity Water Solutions&apos; Mills Ranch 1 and Fed 128 facilities in Eddy and Lea County, New Mexico. Rates are quoted for pickup at the facility pond. Transfer services are available upon request and quoted separately.
          </p>
          <img src={operatorMap} alt="Service area map showing Mills Ranch 1 and Fed128 facility locations in Eddy County, NM" style={{ width: '100%', borderRadius: 20 }} />
        </div>

        <div style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', marginBottom: sp }} />

        {/* ── WATER QUALITY SPECIFICATIONS ── */}
        <div id="quality" style={{ marginBottom: sp, scrollMarginTop: 100 }}>
          <SectionLabel>Water Quality Specifications</SectionLabel>

          {/* Page-level descriptive copy */}
          <p className="justify-copy" style={{ fontSize: 15, lineHeight: 1.6, color: '#334155', margin: '0 0 12px', maxWidth: 640 }}>
            Water quality is representative of treated produced water across Infinity Water Solutions&apos; system and may vary by source, facility, and over time. Water is treated and managed to meet operational requirements for reuse across industrial applications.
          </p>
          <p className="justify-copy" style={{ fontSize: 15, lineHeight: 1.6, color: '#334155', margin: '0 0 20px', maxWidth: 640 }}>
            Quality may be adjusted or blended based on availability and system conditions. Full analytical reports and facility-specific specifications are available upon request. Buyer is responsible for confirming suitability for intended use.
          </p>

          {/* Dark spec card */}
          <div style={{
            background: '#0B1220', borderRadius: 20,
            padding: isMobile ? '28px 24px' : '32px 36px',
            color: '#fff',
          }}>
            {/* Column headers */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '0 0 10px', marginBottom: 4,
              fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase',
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
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{row.param}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 500, color: '#fff', ...TABNUM }}>
                  {row.value}
                  {row.unit && <span style={{ fontSize: 13, fontWeight: 400, color: '#94A3B8', marginLeft: 4 }}>{row.unit}</span>}
                </span>
              </div>
            ))}

            <div className="justify-copy" style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, marginTop: 16 }}>
              Values are representative and may vary by source and over time. Full analytical reports available upon request.
            </div>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', marginBottom: sp }} />

        {/* ── PURCHASE & TRANSFER TERMS ── */}
        <div id="terms" style={{ marginBottom: sp, scrollMarginTop: 100 }}>
          <SectionLabel>Purchase &amp; Transfer Terms</SectionLabel>
          <div className="justify-copy" style={{ fontSize: 15, color: '#0F172A', lineHeight: 1.6, maxWidth: 720 }}>
            {[
              { label: 'Pricing cycle', body: 'Rates are fixed for a two-week period and refreshed at the start of each cycle.' },
              { label: 'Pickup window', body: 'Withdraw of confirmed volumes must commence within 45 days of agreement execution from the designated facility pond. Withdrawal may be performed by the buyer or through arranged transfer services.' },
              { label: 'Transfer', body: 'Transfer from the facility pond to the buyer’s designated delivery point is available upon request and quoted separately.' },
              { label: 'Title & custody', body: 'Title and custody transfer to the buyer at the point of withdrawal (i.e., the designated facility pond, including but not limited to Mills Ranch 1 or Fed128), unless otherwise agreed in writing.' },
            ].map((item, i, arr) => (
              <p key={item.label} style={{ margin: i === arr.length - 1 ? 0 : '0 0 10px', fontWeight: 400, display: 'flex', gap: 12 }}>
                <span style={{ color: '#CBD5E1', flexShrink: 0, lineHeight: 1.6 }} aria-hidden="true">&bull;</span>
                <span>
                  <span style={{ fontWeight: 500 }}>{item.label}:</span> {item.body}
                </span>
              </p>
            ))}
          </div>
        </div>

        <div style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', marginBottom: sp }} />

        {/* ── CONTACT ── */}
        <div id="contact" style={{ textAlign: 'center', marginBottom: sp, paddingTop: 8, scrollMarginTop: 100 }}>
          <div style={{ width: 24, height: 2, background: BRAND.teal, borderRadius: 1, margin: '0 auto 10px' }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Volume inquiries</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A' }}>Christian Padilla</div>
          <div style={{ fontSize: 13, fontWeight: 400, color: '#64748B', letterSpacing: '0.01em', marginTop: 4 }}>Commercial &amp; Operations Manager</div>
          <div style={{ fontSize: 15, color: '#64748B', marginTop: 12, ...TABNUM }}>
            <a href="tel:+17135911132" className="contact-link" style={{ color: '#64748B', textDecoration: 'none' }}>713-591-1132</a>
          </div>
          <div style={{ fontSize: 15, color: '#64748B', marginTop: 6 }}>
            <a href="mailto:christian@water.energy" className="contact-link" style={{ color: '#64748B', textDecoration: 'none' }}>christian@water.energy</a>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', marginBottom: sp }} />

        {/* ── COMMERCIAL TERMS ── */}
        <div id="disclosures" style={{ marginBottom: sp, scrollMarginTop: 100 }}>
          <SectionLabel>Commercial Terms &amp; Disclosures</SectionLabel>
          <div className="justify-copy" style={{ fontSize: 11, color: '#64748B', lineHeight: 1.7, fontWeight: 400, maxWidth: 720 }}>
            <p style={{ margin: '0 0 8px' }}>All pricing and volumes are indicative and subject to change based on availability, water quality, system conditions, and market dynamics. Pricing and availability are not guaranteed until confirmed in a fully executed agreement.</p>
            <p style={{ margin: '0 0 8px' }}>All pricing is quoted FOB at the facility pond.</p>
            <p style={{ margin: '0 0 8px' }}>Water quality specifications are representative and may vary by source and over time. Full specifications are available upon request.</p>
            <p style={{ margin: '0 0 8px' }}>Displayed volumes reflect current operational visibility and are subject to change without notice.</p>
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
        .contact-link:hover{color:${BRAND.teal}!important;text-decoration:underline;}
        .justify-copy{text-align:left;}
        .anchor-nav::-webkit-scrollbar{display:none;}
        @media(max-width:768px){body{font-size:14px;}}
      `}</style>
    </div>
  );
}
