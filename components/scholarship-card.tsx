'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { saveScholarship, unsaveScholarship, eligibilityScore } from '@/lib/db';
import { getUniversityBadge } from '@/lib/images';
import { formatDate } from '@/components/scholarship-utils';
import type { Scholarship } from '@/lib/types';

export function ScholarshipCard({
  scholarship,
  saved: savedProp,
  onSavedChange,
}: {
  scholarship: Scholarship;
  saved?: boolean;
  onSavedChange?: (saved: boolean) => void;
}) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = React.useState(savedProp ?? false);
  const [saving, setSaving] = React.useState(false);
  const [crestError, setCrestError] = React.useState(false);

  React.useEffect(() => {
    setSaved(savedProp ?? false);
  }, [savedProp]);

  const { score } = eligibilityScore(scholarship, profile);
  const crest = getUniversityBadge(scholarship.university, scholarship.country, scholarship.official_link);

  const deadlineDate = new Date(scholarship.deadline);
  const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isImminent = daysLeft >= 0 && daysLeft <= 45;

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile) return;
    setSaving(true);
    try {
      if (saved) {
        await unsaveScholarship(scholarship.id);
        setSaved(false);
        onSavedChange?.(false);
        toast({ title: 'Removed from saved' });
      } else {
        await saveScholarship(scholarship.id);
        setSaved(true);
        onSavedChange?.(true);
        toast({ title: 'Saved to your workspace' });
      }
    } catch (err) {
      toast({
        title: 'Could not update',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden animate-fade-in-up card-hover group">
      {/* Header: crest + title + match badge */}
      <div className="flex justify-between items-start gap-2.5">
        <div className="flex gap-2.5 min-w-0">
          <div className="w-[44px] h-[44px] rounded-[10px] bg-surface-dim flex items-center justify-center p-0.5 overflow-hidden shrink-0">
            {crestError ? (
              <span className="material-symbols-outlined text-primary text-[18px]">school</span>
            ) : (
              <img
                src={crest}
                alt=""
                className="w-full h-full object-contain"
                onError={() => setCrestError(true)}
              />
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/scholarships/${scholarship.id}`}
              className="text-[15px] leading-[20px] font-semibold text-on-surface hover:text-secondary transition-colors duration-200 line-clamp-2 block"
            >
              {scholarship.title}
            </Link>
            <p className="text-[13px] text-on-surface-variant truncate mt-0.5">
              {scholarship.university} &middot; {scholarship.country}
            </p>
          </div>
        </div>
        {score > 0 && (
          <div className="ai-inner-glow px-2 py-0.5 rounded-full bg-tertiary-container/10 flex items-center gap-0.5 shrink-0">
            <span
              className="material-symbols-outlined text-[9px] text-on-tertiary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span className="text-[10px] font-bold text-on-tertiary-container tracking-wide">
              {score}% Match
            </span>
          </div>
        )}
      </div>

      {/* Stats: Amount + Deadline */}
      <div className="grid grid-cols-2 gap-3 py-2 border-y border-outline-variant/30">
        <div>
          <p className="font-label-sm text-[12px] text-on-surface-variant mb-0.5 tracking-wide uppercase font-semibold">Amount</p>
          <p className="text-[16px] font-semibold text-on-surface">
            {scholarship.funding}
          </p>
        </div>
        <div>
          <p className="font-label-sm text-[12px] text-on-surface-variant mb-0.5 tracking-wide uppercase font-semibold">Deadline</p>
          <p className={`text-[16px] font-semibold ${isImminent ? 'text-error' : 'text-on-surface'}`}>
            {formatDate(scholarship.deadline)}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-auto">
        <a
          href={scholarship.official_link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold text-[14px] hover:bg-primary-container active:scale-95 transition-all duration-200 text-center flex items-center justify-center"
        >
          Apply Now
        </a>
        <button
          onClick={toggleSave}
          disabled={saving}
          className={cn(
            'w-12 h-12 flex items-center justify-center rounded-xl border transition-colors duration-200 shrink-0',
            saved
              ? 'border-on-tertiary-container/30 text-on-tertiary-container bg-tertiary-container/10'
              : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
          )}
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <span
            className="material-symbols-outlined"
            style={saved ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            bookmark
          </span>
        </button>
        <Link
          href={`/scholarships/${scholarship.id}`}
          onClick={(e) => e.stopPropagation()}
          className="w-12 h-12 flex items-center justify-center border border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors duration-200 shrink-0"
          aria-label="View details"
        >
          <span className="material-symbols-outlined">visibility</span>
        </Link>
      </div>
    </div>
  );
}
