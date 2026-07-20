import Link from 'next/link';
import { ScholarPilotLogo } from '@/components/brand';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="relative flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to home
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <p className="text-center text-xs text-on-surface-variant/60">
          &copy; {new Date().getFullYear()} ScholarPilot AI
        </p>
      </div>

      {/* Right: brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-tertiary lg:block">
        <div aria-hidden className="absolute inset-0 bg-dotted opacity-20" />
        <div
          aria-hidden
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-on-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-on-primary/10 blur-3xl"
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-on-primary">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-on-primary/15 backdrop-blur">
              <ScholarPilotLogo className="h-6 w-6" />
            </div>
            <span className="font-headline-lg text-xl font-semibold tracking-tight">
              ScholarPilot AI
            </span>
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-on-primary/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              AI eligibility scoring
            </div>
            <h2 className="mt-6 font-headline-lg text-3xl font-bold leading-tight">
              Find scholarships you can actually win.
            </h2>
            <p className="mt-4 text-on-primary/80">
              Build a profile, get matched in seconds, and track every
              application in one focused workspace built for students.
            </p>

            <div className="mt-10 space-y-4">
              {[
                'Personalized match scores on every scholarship',
                'Deadline reminders so nothing slips through',
                'A clear application pipeline from saved to awarded',
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-on-primary/20">
                    <span className="material-symbols-outlined text-[12px]">check</span>
                  </span>
                  <p className="text-sm text-on-primary/90">{t}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-on-primary/60">
            "ScholarPilot cut my search from weeks to an afternoon."
            <span className="block mt-1 text-on-primary/80">
              — Maya R., UC Berkeley
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
