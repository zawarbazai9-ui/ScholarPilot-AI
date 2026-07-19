import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { ScholarPilotLogo } from '@/components/brand';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Benefits', href: '/#benefits' },
      { label: 'How it works', href: '/#how' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/#' },
      { label: 'Blog', href: '/#' },
      { label: 'Careers', href: '/#' },
      { label: 'Contact', href: '/#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Scholarships', href: '/scholarships' },
      { label: 'AI Assistant', href: '/assistant' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Support', href: '/#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/#' },
      { label: 'Terms', href: '/#' },
      { label: 'Security', href: '/#' },
      { label: 'Cookies', href: '/#' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <ScholarPilotLogo className="h-8 w-8" />
              <span className="font-display text-lg font-semibold tracking-tight">
                ScholarPilot
                <span className="text-primary"> AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Discover scholarships, assess your eligibility with AI, and track
              every application — all in one focused workspace.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Github, label: 'GitHub' },
                { Icon: Linkedin, label: 'LinkedIn' },
                { Icon: Mail, label: 'Email' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold">{col.title}</h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} ScholarPilot AI. All rights reserved.</p>
          <p>Built for students, powered by AI.</p>
        </div>
      </div>
    </footer>
  );
}
