import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/Authenticate';
import './home.css';

/* ── Category data ── */
const categoryData = [
  { icon: '💻', name: 'Engineering', count: '2 Jobs', slug: 'Engineering' },
  { icon: '🎨', name: 'Design',      count: '1 Job',  slug: 'Design'      },
  { icon: '☁️', name: 'DevOps',      count: '1 Job',  slug: 'DevOps'      },
  { icon: '📊', name: 'Data',        count: '1 Job',  slug: 'Data'        },
  { icon: '📱', name: 'Mobile',      count: '1 Job',  slug: 'Mobile'      },
];

/* ── Steps ── */
const steps = [
  { number:'1', title:'Create an Account',      desc:'Sign up free and build your profile for personalised job matches.' },
  { number:'2', title:'Search & Discover',      desc:'Use smart semantic search to find roles that fit your skills.' },
  { number:'3', title:'Apply with One Click',   desc:'Submit a polished application in seconds with our streamlined form.' },
  { number:'4', title:'Track Your Progress',    desc:'Monitor every application and stay updated on each opportunity.' },
];

/* ── Features bar ── */
const features = [
  { icon:'🔍', label:'Smart Search',       desc:'Semantic matching' },
  { icon:'📋', label:'Application Tracker', desc:'Real-time status' },
  { icon:'🌐', label:'Remote Roles',        desc:'Work from anywhere' },
  { icon:'⚡', label:'Instant Apply',       desc:'One-click submit' },
];

/* ── Ticker items (doubled for seamless loop) ── */
const tickerItems = [
  { label:'Frontend Developer @ TechNova',  type:'Full-Time' },
  { label:'Cloud Engineer @ SkyArch',        type:'Full-Time' },
  { label:'UI/UX Designer @ CreativeEdge',   type:'Part-Time' },
  { label:'Data Scientist @ InsightAI',      type:'Full-Time' },
  { label:'Backend Developer @ DataBridge',  type:'Full-Time' },
  { label:'Mobile Developer @ AppVenture',   type:'Full-Time' },
];

/* ── CountUp hook ── */
function useCountUp(target, duration = 1400, delay = 600) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => {
      const numeric = parseInt(target.replace(/\D/g, '')) || 0;
      if (numeric === 0) { setCount(target); return; }
      let start = 0;
      const step = numeric / (duration / 16);
      const interval = setInterval(() => {
        start += step;
        if (start >= numeric) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(
            target.replace(/\d+/, Math.floor(start).toString())
          );
        }
      }, 16);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [started, target, duration, delay]);

  return [count || '0', ref];
}

/* ── Stat item with count-up ── */
const StatItem = ({ number, label, delay }) => {
  const [count, ref] = useCountUp(number, 1200, delay);
  return (
    <div className="hero-stat" ref={ref}>
      <span className="hero-stat-number">{count || number}</span>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
};

/* ── IntersectionObserver for underline ── */
function useSectionReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ════════════════════════════════════════════
   HOME COMPONENT
   ════════════════════════════════════════════ */
const Home = () => {
  const { user } = useAuth();
  const catTitleRef = useSectionReveal();
  const howTitleRef = useSectionReveal();

  return (
    <div>
      {/* ══════════ HERO ══════════ */}
      <section className="hero-section">
        {/* Background layers */}
        <div className="hero-bg">
          <div className="hero-bg-layer-1" />
          <div className="hero-blob" />
        </div>
        <div className="hero-grid-overlay" />

        {/* Floating particles */}
        <div className="hero-particles">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`particle p${i + 1}`} />
          ))}
        </div>

        {/* Orbiting rings */}
        <div className="hero-rings">
          <div className="hero-ring hero-ring-1" />
          <div className="hero-ring hero-ring-2" />
          <div className="hero-ring hero-ring-3" />
        </div>

        {/* Main content */}
        <div className="hero-content">
          {/* Eyebrow */}
          
          {/* Heading with animated underlines */}
          <h1 className="hero-title">
            <span className="hero-title-line1">Find Your Dream</span>{' '}
            <span className="hero-title-line2">
              Career
            </span>
          </h1>

          {/* Description */}
          <p className="hero-description">
            Browse curated job listings, apply with a single click, and track every
            application — all in one intelligent, beautifully crafted platform.
          </p>

          {/* CTA buttons */}
          <div className="hero-actions">
            <Link to="/jobs" className="hero-btn-primary">
              🔍 Browse Jobs
            </Link>
            {user ? (
              <Link to="/applications" className="hero-btn-secondary">
                📋 My Applications
              </Link>
            ) : (
              <Link to="/signup" className="hero-btn-secondary">
                Get Started
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <StatItem number="6+" label="Open Positions" delay={100} />
            <StatItem number="5"  label="Categories"     delay={200} />
            <StatItem number="3"  label="Remote Roles"   delay={300} />
            <StatItem number="100%" label="Free to Apply" delay={400} />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
          <span className="scroll-text">Scroll</span>
        </div>

        {/* Ticker */}
        <div className="hero-ticker">
          <div className="hero-ticker-track">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="hero-ticker-item">
                <span>{item.label}</span>
                <span className="hero-ticker-sep">·</span>
                <span style={{ color: 'var(--accent-emerald)' }}>{item.type}</span>
                <span className="hero-ticker-sep" style={{ marginLeft: 16 }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURE BAR ══════════ */}
      <div className="home-feature-bar">
        {features.map((f, i) => (
          <div key={f.label} className="feature-item" style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="feature-icon">{f.icon}</span>
            <div className="feature-text">
              <strong>{f.label}</strong>
              {f.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ══════════ CATEGORIES ══════════ */}
      <section className="categories-section">
        <div className="section-tag">Explore by Category</div>
        <div className="section-header">
          <h2 className="section-title">
            Browse by{' '}
            <span ref={catTitleRef} className="section-title-underline">Field</span>
          </h2>
          <p className="section-subtitle">Find the role that matches your expertise and passion</p>
        </div>
        <div className="categories-grid">
          {categoryData.map((cat, idx) => (
            <Link
              key={cat.slug}
              to={`/jobs?category=${cat.slug}`}
              className="category-card"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <span className="category-icon">{cat.icon}</span>
              <div className="category-name">{cat.name}</div>
              <div className="category-count">{cat.count}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="how-section">
        <div className="section-tag">How It Works</div>
        <div className="section-header">
          <h2 className="section-title">
            Land a Job in{' '}
            <span ref={howTitleRef} className="section-title-underline">4 Simple Steps</span>
          </h2>
          <p className="section-subtitle">Our streamlined process makes job hunting effortless</p>
        </div>
        <div className="how-grid">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="how-step"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="how-step-number">{step.number}</div>
              <div className="how-step-title">{step.title}</div>
              <p className="how-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;