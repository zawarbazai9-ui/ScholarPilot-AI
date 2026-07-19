'use client';

import { useState } from 'react';
import {
  Search,
  Loader2,
  Plus,
  Check,
  ExternalLink,
  Sparkles,
  AlertCircle,
  GraduationCap,
  Globe,
  BookOpen,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

type FoundScholarship = {
  title: string;
  university: string;
  country: string;
  degree: string | null;
  funding: string;
  deadline: string;
  description: string;
  requirements: string | null;
  official_link: string;
};

const DEGREES = ['Undergraduate', 'Graduate', 'Postgraduate'];
const FIELDS = [
  'Computer Science', 'Engineering', 'Business', 'Medicine', 'Law',
  'Education', 'Sciences', 'Arts', 'Social Sciences', 'Environmental Science',
  'Public Health', 'Data Science', 'AI and Machine Learning', 'Any field',
];
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Germany', 'Australia',
  'France', 'Netherlands', 'Japan', 'South Korea', 'Singapore',
  'Switzerland', 'Sweden', 'China', 'India', 'International',
];

export function ScholarshipFinder({ session, onAdded }: { session?: { access_token?: string } | null; onAdded?: () => void }) {
  const { toast } = useToast();
  const [field, setField] = useState('');
  const [country, setCountry] = useState('');
  const [degree, setDegree] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FoundScholarship[]>([]);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [addingId, setAddingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!field && !country && !degree) return;
    setSearching(true);
    setResults([]);
    setError(null);
    setAddedIds(new Set());
    try {
      const res = await fetch('/api/scholarship-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, country, degree, count: 8 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Search failed');
      setResults(data.scholarships ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(s: FoundScholarship, index: number) {
    setAddingId(index);
    try {
      const res = await fetch('/api/admin/scholarships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify(s),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to add');
      }
      setAddedIds((prev) => new Set(prev).add(index));
      onAdded?.();
      toast({ title: 'Scholarship added', description: s.title });
    } catch (err: unknown) {
      toast({
        title: 'Failed to add',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Scholarship Finder</CardTitle>
              <CardDescription>
                Describe what you&apos;re looking for and AI will find matching scholarships.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Field of study
              </Label>
              <Select value={field} onValueChange={setField}>
                <SelectTrigger>
                  <SelectValue placeholder="Any field" />
                </SelectTrigger>
                <SelectContent>
                  {FIELDS.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Country
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Any country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                Degree level
              </Label>
              <Select value={degree} onValueChange={setDegree}>
                <SelectTrigger>
                  <SelectValue placeholder="Any level" />
                </SelectTrigger>
                <SelectContent>
                  {DEGREES.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSearch} disabled={searching || (!field && !country && !degree)}>
            {searching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {searching ? 'Searching...' : 'Find scholarships'}
          </Button>
        </CardContent>
      </Card>

      {/* Loading */}
      {searching && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Search failed</p>
              <p className="mt-1 text-xs text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Found <span className="font-medium text-foreground">{results.length}</span> scholarships.
            Review and add them to your database.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((s, i) => {
              const isAdded = addedIds.has(i);
              return (
                <Card key={i} className={isAdded ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20' : ''}>
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight">{s.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {s.university} · {s.country}
                        </p>
                      </div>
                      {isAdded ? (
                        <Badge className="shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          <Check className="mr-1 h-3 w-3" />
                          Added
                        </Badge>
                      ) : (
                        <div className="flex shrink-0 gap-1.5">
                          {s.degree && (
                            <Badge variant="secondary" className="text-[10px]">{s.degree}</Badge>
                          )}
                          <Badge variant="outline" className="text-[10px]">{s.funding}</Badge>
                        </div>
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
                    {s.requirements && (
                      <p className="line-clamp-1 text-[11px] text-muted-foreground italic">
                        Req: {s.requirements}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      Deadline: <span className="font-medium">{s.deadline}</span>
                    </p>
                    <div className="flex gap-2 pt-1">
                      {!isAdded && (
                        <Button
                          size="sm"
                          disabled={addingId === i}
                          onClick={() => handleAdd(s, i)}
                        >
                          {addingId === i ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Add to database
                        </Button>
                      )}
                      {s.official_link && (
                        <Button asChild size="sm" variant="ghost">
                          <a href={s.official_link} target="_blank" rel="noopener noreferrer">
                            Visit
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
