'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-on-surface font-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* ── TopNavBar ───────────────────────────────────── */}
      <header className="sticky top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm">
        <nav className="flex justify-between items-center h-16 px-4 md:px-12 max-w-7xl mx-auto">
          <div className="text-headline-sm font-headline-sm font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            ScholarPilot
          </div>
          <div className="hidden md:flex items-center gap-8 font-label-md text-label-md">
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="#features">Features</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="#universities">Universities</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="#pricing">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link className="hidden sm:block font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="/login">Login</Link>
            <Link href="/register" className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md text-label-md active:scale-95 transition-all shadow-sm">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 px-4 md:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full font-label-sm text-label-sm mb-6">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Next-Gen Academic Engine
              </div>
              <h1 className="font-headline-lg text-headline-lg md:text-[56px] md:leading-[1.1] text-primary mb-6">
                Your Future, <span className="ai-gradient-text">Powered by AI.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl">
                Upload your CV and let our intelligent engine match your academic profile to over <span className="font-semibold text-primary">$40M</span> in global scholarship opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="ai-button text-on-tertiary px-8 py-4 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2">
                  Get Started - Free
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <Link href="/scholarships" className="bg-surface-container text-primary px-8 py-4 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined">play_circle</span>
                  Browse Scholarships
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 glass-card rounded-xl p-2 shadow-xl ring-1 ring-outline-variant/20">
                <HeroPreview />
              </div>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary-fixed/20 blur-3xl rounded-full -z-10" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-tertiary-fixed/20 blur-3xl rounded-full -z-10" />
            </div>
          </div>
        </section>

        {/* ── Trust Bar ─────────────────────────────────── */}
        <section className="py-12 bg-surface-container-low/50" id="universities">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <p className="text-center font-label-sm text-label-sm text-outline mb-10 uppercase tracking-widest">Partnering with Global Institutions</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 mb-12">
              {['STANFORD', 'OXFORD', 'CAMBRIDGE', 'MIT', 'HARVARD'].map((name) => (
                <div key={name} className="flex items-center gap-2 font-bold text-headline-sm text-primary">{name}</div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-outline-variant/30">
              <div className="text-center">
                <div className="font-headline-md text-headline-md text-primary">12k+</div>
                <div className="font-label-md text-label-md text-on-surface-variant">Active Scholarships</div>
              </div>
              <div className="text-center">
                <div className="font-headline-md text-headline-md text-primary">$42M</div>
                <div className="font-label-md text-label-md text-on-surface-variant">Total Funding</div>
              </div>
              <div className="text-center">
                <div className="font-headline-md text-headline-md text-primary">95%</div>
                <div className="font-label-md text-label-md text-on-surface-variant">Match Accuracy</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Core Features ─────────────────────────────── */}
        <section className="py-24 px-4 md:px-12 bg-surface" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Precision Tools for Success</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Our platform combines academic rigor with high-velocity SaaS efficiency to streamline your scholarship journey.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="w-12 h-12 bg-primary-fixed flex items-center justify-center rounded-lg mb-6 text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>target</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-3">AI Matching</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Instantly find scholarships tailored to your GPA, major, and research interests with our proprietary deep-learning engine.
                </p>
              </div>
              <div className="group p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-tertiary transition-all duration-300 shadow-sm hover:shadow-md ai-glow">
                <div className="w-12 h-12 bg-tertiary-fixed flex items-center justify-center rounded-lg mb-6 text-tertiary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Intelligent Advisor</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Chat with Lumina, your personal AI copilot, to improve your Statement of Purpose and optimize your transcripts for specific committees.
                </p>
              </div>
              <div className="group p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-secondary transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="w-12 h-12 bg-secondary-fixed flex items-center justify-center rounded-lg mb-6 text-secondary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>view_kanban</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Application Tracker</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Never miss a deadline with our professional-grade Kanban management tool designed for complex academic submissions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Social Proof / Testimonial ─────────────────── */}
        <section className="py-24 bg-primary text-on-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-tertiary opacity-20 skew-x-12 translate-x-1/2" />
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex gap-1 mb-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
            <blockquote className="font-headline-md text-headline-md md:text-headline-lg italic mb-10 leading-snug">
              &ldquo;ScholarPilot didn&apos;t just find me money; it found me the exact program that matched my research ambitions. Lumina helped me refine my SOP until it was bulletproof. I start at Cambridge this fall, fully funded.&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-white text-xl font-bold ring-2 ring-secondary-container shrink-0">
                ER
              </div>
              <div className="text-left">
                <div className="font-label-md text-label-md font-bold">Elena Rodriguez</div>
                <div className="font-label-sm text-label-sm text-on-primary-container">M.Sc. Theoretical Physics, University of Cambridge</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────── */}
        <section className="py-24 px-4 md:px-12 bg-surface-bright">
          <div className="max-w-5xl mx-auto glass-card rounded-xl p-12 text-center border-none shadow-2xl relative overflow-hidden ai-glow">
            <div className="relative z-10">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-6">Ready to find your match?</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl mx-auto">
                Join 50,000+ students securing their academic future with the world&apos;s most advanced scholarship matching engine.
              </p>
              <Link href="/register" className="ai-button text-on-tertiary px-12 py-5 rounded-xl font-label-md text-label-md active:scale-95 transition-all shadow-lg inline-flex items-center gap-2">
                Sign Up Now - It&apos;s Free
              </Link>
              <p className="mt-6 font-label-sm text-label-sm text-outline">No credit card required. Cancel anytime.</p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="bg-surface-container-low border-t border-outline-variant">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 md:px-12 py-10 max-w-7xl mx-auto">
          <div className="col-span-2 md:col-span-1">
            <div className="text-headline-sm font-headline-sm font-bold text-primary mb-6">ScholarPilot</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
              Empowering academic excellence through intelligent profile matching and strategic advisor tools.
            </p>
          </div>
          <div>
            <h4 className="font-label-md text-label-md font-bold text-primary mb-4">Product</h4>
            <ul className="space-y-3 font-body-sm text-body-sm">
              <li><Link className="text-on-surface-variant hover:text-secondary transition-colors" href="#features">Features</Link></li>
              <li><Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/scholarships">Scholarship Feed</Link></li>
              <li><Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/assistant">Lumina AI</Link></li>
              <li><Link className="text-on-surface-variant hover:text-secondary transition-colors" href="#pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label-md text-label-md font-bold text-primary mb-4">Resources</h4>
            <ul className="space-y-3 font-body-sm text-body-sm">
              <li><Link className="text-on-surface-variant hover:text-secondary transition-colors" href="#">Guides</Link></li>
              <li><Link className="text-on-surface-variant hover:text-secondary transition-colors" href="#">Blog</Link></li>
              <li><Link className="text-on-surface-variant hover:text-secondary transition-colors" href="#">API</Link></li>
              <li><Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/scholarships">Universities</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label-md text-label-md font-bold text-primary mb-4">Company</h4>
            <ul className="space-y-3 font-body-sm text-body-sm">
              <li><Link className="text-on-surface-variant hover:text-secondary transition-colors" href="#">About</Link></li>
              <li><Link className="text-on-surface-variant hover:text-secondary transition-colors" href="#">Careers</Link></li>
              <li><Link className="text-on-surface-variant hover:text-secondary transition-colors" href="#">Privacy</Link></li>
              <li><Link className="text-on-surface-variant hover:text-secondary transition-colors" href="#">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 border-t border-outline-variant/30 text-center">
          <p className="font-body-sm text-body-sm text-outline-variant">&copy; {new Date().getFullYear()} ScholarPilot AI. Empowering academic excellence.</p>
        </div>
      </footer>
    </div>
  );
}

function HeroPreview() {
  const cards = [
    { name: 'Women in STEM Excellence Award', amount: '$12,000', match: 94, days: 12 },
    { name: 'Future Leaders Merit Scholarship', amount: '$15,000', match: 88, days: 23 },
    { name: 'Data Science Pioneers Fellowship', amount: '$22,000', match: 81, days: 45 },
  ];
  return (
    <div className="rounded-lg border bg-surface-container-lowest">
      <div className="flex items-center gap-2 border-b border-outline-variant/30 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-rose-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        <div className="mx-auto rounded-md bg-surface-container px-3 py-1 text-xs text-on-surface-variant">
          scholarpilot.ai/dashboard
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-3">
        {[
          { label: 'Saved', value: '14', icon: 'bookmark', tone: 'text-primary' },
          { label: 'In progress', value: '6', icon: 'description', tone: 'text-tertiary' },
          { label: 'Deadlines ≤ 30d', value: '3', icon: 'notifications', tone: 'text-warning' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">{s.label}</span>
              <span className={`material-symbols-outlined text-[18px] ${s.tone}`}>{s.icon}</span>
            </div>
            <p className="mt-2 font-headline-md text-headline-md text-primary">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3 px-5 pb-5">
        <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
          Top matches for you
        </p>
        {cards.map((c) => (
          <div key={c.name} className="flex items-center gap-4 rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-on-surface">{c.name}</p>
              <p className="mt-0.5 text-xs text-on-surface-variant">Deadline in {c.days} days</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-primary">{c.amount}</p>
              <p className="mt-0.5 text-xs text-secondary">{c.match}% match</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
