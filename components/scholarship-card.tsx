'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  MapPin,
  GraduationCap,
  Sparkles,
  Building2,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { saveScholarship, unsaveScholarship } from '@/lib/db';
import { DeadlinePill } from '@/components/scholarship-utils';
import { eligibilityScore, scoreTone } from '@/lib/db';
import type { Scholarship } from '@/lib/types';

export function ScholarshipCard({
  scholarship,
  saved: savedProp,
  onSavedChange,
  showMatch = true,
}: {
  scholarship: Scholarship;
  saved?: boolean;
  onSavedChange?: (saved: boolean) => void;
  showMatch?: boolean;
}) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = React.useState(savedProp ?? false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setSaved(savedProp ?? false);
  }, [savedProp]);

  const { score, reasons } = eligibilityScore(scholarship, profile);
  const tone = scoreTone(score);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
        title: 'Could not update saved scholarships',
        description:
          err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link href={`/scholarships/${scholarship.id}`} className="block">
      <Card className="group flex h-full flex-col transition-all hover:shadow-md hover:border-primary/20">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{scholarship.university}</span>
              </div>
              <h3 className="mt-1.5 line-clamp-2 font-display text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                {scholarship.title}
              </h3>
            </div>
            <button
              onClick={toggleSave}
              disabled={saving}
              aria-label={saved ? 'Unsave scholarship' : 'Save scholarship'}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors',
                saved
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
              )}
            >
              {saved ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/10 text-primary">{scholarship.funding}</Badge>
            <DeadlinePill dateStr={scholarship.deadline} />
            {showMatch && profile && score > 0 && (
              <Badge
                variant="outline"
                className={cn('gap-1.5', tone.className)}
                title={reasons.join('\n')}
              >
                <Sparkles className="h-3 w-3" />
                {score}% {tone.label}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {scholarship.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {scholarship.country}
            </span>
            {scholarship.degree && (
              <span className="inline-flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {scholarship.degree}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Due {new Date(scholarship.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </CardContent>

        <CardFooter className="gap-2 pt-0">
          <Button size="sm" variant="outline" className="flex-1 pointer-events-none">
            View details
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            asChild
          >
            <a
              href={scholarship.official_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
