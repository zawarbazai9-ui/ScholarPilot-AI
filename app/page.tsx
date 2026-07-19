'use client';

import Link from 'next/link';
import {
  Sparkles,
  Search,
  Bookmark,
  ClipboardList,
  Brain,
  Bell,
  ArrowRight,
  Check,
  ShieldCheck,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Star,
  Quote,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const features = [
  {
    icon: Search,
    title: 'Smart scholarship discovery',
    description:
      'Browse a curated catalog filtered by field, level, country, and GPA. Stop scrolling endless lists — find what fits in seconds.',
  },
  {
    icon: Brain,
    title: 'AI eligibility assessment',
    description:
      'Our AI compares your profile against each scholarship’s criteria and scores your match so you focus only on opportunities you can win.',
  },
  {
    icon: Bookmark,
    title: 'Save & organize',
    description:
      'Bookmark scholarships into a personal workspace and revisit them anytime without losing your shortlist.',
  },
  {
    icon: ClipboardList,
    title: 'Application tracking',
    description:
      'Track status, progress, and notes for every application in a kanban-style board that keeps deadlines visible.',
  },
  {
    icon: Bell,
    title: 'Deadline reminders',
    description:
      'Never miss a due date. Upcoming deadlines surface on your dashboard with urgency cues that prioritize your time.',
  },
  {
    icon: Sparkles,
    title: 'AI Assistant',
    description:
      'Ask questions, draft essays, and get tailored advice from an assistant that understands your scholarship journey.',
  },
];

const benefits = [
  {
    icon: Zap,
    title: 'Save hours every week',
    description:
      'Eligibility scoring and saved searches cut the time from discovery to a submitted application dramatically.',
    stat: '10x',
    statLabel: 'faster shortlisting',
  },
  {
    icon: Target,
    title: 'Apply with confidence',
    description:
      'AI-driven match scores mean you spend energy on scholarships where you genuinely qualify — not long shots.',
    stat: '92%',
    statLabel: 'avg. match accuracy',
  },
  {
    icon: TrendingUp,
    title: 'Maximize your funding',
    description:
      'Track every application in one place so nothing slips. More complete applications means more awards.',
    stat: '$48k',
    statLabel: 'avg. awards tracked',
  },
];

const steps = [
  {
    n: '01',
    title: 'Create your profile',
    description:
      'Tell us your field of study, GPA, education level, and country. It takes under a minute.',
  },
  {
    n: '02',
    title: 'Discover & save',
    description:
      'Browse scholarships and save the ones that fit. AI scores your eligibility for each.',
  },
  {
    n: '03',
    title: 'Track & apply',
    description:
      'Move applications through statuses, monitor deadlines, and ship winning applications.',
  },
];

const testimonials = [
  {
    quote:
      'ScholarPilot cut my search from weeks to an afternoon. The eligibility scores are scarily accurate.',
    name: 'Maya R.',
    role: 'CS, UC Berkeley',
  },
  {
    quote:
      'I finally have one place to track every application. Deadlines used to sneak up on me — not anymore.',
    name: 'Daniel K.',
    role: 'Grad, Georgia Tech',
  },
  {
    quote:
      'The AI assistant helped me draft a personal statement that actually got me an interview.',
    name: 'Aisha N.',
    role: 'Pre-med, NYU',
  },
];

const faqs = [
  {
    q: 'Is ScholarPilot AI free to use?',
    a: 'Yes. Core features — discovery, saving, tracking, and AI eligibility — are free for students. Premium features may be added later, but the essentials stay free.',
  },
  {
    q: 'How does the AI eligibility assessment work?',
    a: 'We compare your profile (GPA, field, level, country) against each scholarship’s published criteria and return a match score. It’s guidance, not a guarantee — always review the official requirements.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'You can browse the public catalog without an account. Saving scholarships, tracking applications, and using the AI assistant require a free account so your data stays private to you.',
  },
  {
    q: 'Is my data secure?',
    a: 'Your profile and applications are protected by row-level security in our database — only you can read or modify your own data. We never sell your information.',
  },
  {
    q: 'Can I use ScholarPilot outside the US?',
    a: 'Yes. The catalog includes international scholarships and our filters support multiple countries. More regional opportunities are added regularly.',
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-fade-b opacity-60"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-primary/10 via-accent/5 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-24 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
          />

          <div className="mx-auto max-w-6xl px-4 text-center lg:px-6">
            <div className="animate-fade-up">
              <Badge
                variant="outline"
                className="mx-auto mb-6 gap-1.5 border-primary/20 bg-background/60 px-3 py-1 text-primary backdrop-blur"
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI-powered scholarship discovery
              </Badge>
            </div>

            <h1 className="animate-fade-up font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Find scholarships you can{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                actually win
              </span>
            </h1>

            <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance [animation-delay:80ms]">
              ScholarPilot AI matches your profile to thousands of
              scholarships, scores your eligibility, and keeps every
              application on track — so you never miss a deadline or waste
              effort on long shots.
            </p>

            <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 [animation-delay:160ms] sm:flex-row">
              <Button asChild size="lg" className="group h-12 px-6">
                <Link href="/register">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link href="/scholarships">Browse scholarships</Link>
              </Button>
            </div>

            <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground [animation-delay:240ms]">
              {[
                'No credit card required',
                'Free for students',
                'Privacy-first',
              ].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-success" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Product preview mockup */}
          <div className="animate-scale-in mx-auto mt-16 max-w-5xl px-4 [animation-delay:320ms] lg:px-6">
            <HeroPreview />
          </div>
        </section>

        {/* Logos / trust strip */}
        <section className="border-y bg-muted/30 py-10">
          <div className="mx-auto max-w-6xl px-4 lg:px-6">
            <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Trusted by students at
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-base font-semibold text-muted-foreground/70">
              {['Stanford', 'MIT', 'Harvard', 'Oxford', 'Berkeley', 'NYU'].map(
                (name) => (
                  <span key={name} className="font-display tracking-tight">
                    {name}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 lg:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-4 text-primary">
                Features
              </Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to land funding
              </h2>
              <p className="mt-4 text-muted-foreground">
                A focused workspace that turns scholarship chaos into a clear,
                trackable process.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <Card
                  key={f.title}
                  className="group relative overflow-hidden border-border/70 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 transition-transform group-hover:scale-150"
                  />
                  <CardHeader>
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="mt-4 text-lg">{f.title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {f.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="bg-muted/30 py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 lg:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-4 text-accent">
                Benefits
              </Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Why students choose ScholarPilot
              </h2>
              <p className="mt-4 text-muted-foreground">
                Measurable outcomes, not just pretty dashboards.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {benefits.map((b) => (
                <Card
                  key={b.title}
                  className="overflow-hidden border-border/70"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <b.icon className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="font-display text-3xl font-bold text-foreground">
                          {b.stat}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {b.statLabel}
                        </p>
                      </div>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{b.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {b.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 lg:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-4 text-primary">
                How it works
              </Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                From overwhelmed to applied in 3 steps
              </h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <div
                  key={s.n}
                  className="relative rounded-xl border bg-card p-6"
                >
                  <span className="font-display text-5xl font-bold text-primary/15">
                    {s.n}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-y bg-muted/30 py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 lg:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-4 text-accent">
                Testimonials
              </Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Students are winning with ScholarPilot
              </h2>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.name} className="border-border/70">
                  <CardContent className="pt-6">
                    <Quote className="h-7 w-7 text-primary/30" />
                    <p className="mt-3 text-sm leading-relaxed text-foreground">
                      “{t.quote}”
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {t.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 lg:px-6">
            <div className="text-center">
              <Badge variant="outline" className="mb-4 text-primary">
                FAQ
              </Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Questions, answered
              </h2>
            </div>
            <Accordion type="single" collapsible className="mt-10">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-24 lg:px-6">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-gradient-to-br from-primary to-accent px-6 py-16 text-center text-primary-foreground lg:px-16 lg:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-dotted opacity-20"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
            />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Your next scholarship is one search away
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                Join thousands of students using ScholarPilot AI to find and
                win funding. Free to start — no credit card required.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="h-12 bg-background px-6 text-foreground hover:bg-background/90"
                >
                  <Link href="/register">
                    Create your free account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 border-primary-foreground/30 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/scholarships">Browse scholarships</Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-primary-foreground/80">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Privacy-first
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Set up in minutes
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4" /> Free for students
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
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
    <div className="relative rounded-xl border bg-card p-2 shadow-2xl shadow-primary/10">
      <div className="rounded-lg border bg-background">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="mx-auto rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
            scholarpilot.ai/dashboard
          </div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          {[
            { label: 'Saved', value: '14', icon: Bookmark, tone: 'text-primary' },
            { label: 'In progress', value: '6', icon: ClipboardList, tone: 'text-accent' },
            { label: 'Deadlines ≤ 30d', value: '3', icon: Bell, tone: 'text-warning' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.tone}`} />
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3 px-5 pb-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Top matches for you
          </p>
          {cards.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-4 rounded-lg border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Deadline in {c.days} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">{c.amount}</p>
                <p className="mt-0.5 text-xs text-success">{c.match}% match</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
