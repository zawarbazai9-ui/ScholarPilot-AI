/*
# Extend scholarships with discovery & filter fields

## Overview
Adds columns to `scholarships` so the discovery/list view can filter and sort by
country, degree level, field of study, funding type, deadline, and AI match score.
The detail page already used name/university/overview/total_award etc.; this keeps
those intact and adds structured filter data alongside them.

## Changes to `scholarships`
- `match_score` (int) — AI match score 0-100 used for "Match Score" sort and the badge.
- `degree_level` (text) — e.g. 'Postgraduate', 'Undergraduate', 'PhD', 'Research'.
- `field_of_study` (text) — e.g. 'Any', 'Social Sciences', 'Physics'.
- `funding_type` (text) — e.g. 'Full Funding', 'Tuition Only', 'Partial Funding'.
- `country` (text) — e.g. 'United Kingdom', 'United States'.
- `region` (text) — e.g. 'UK', 'USA', 'EU'.
- `deadline_date` (date) — sortable deadline; `next_deadline` (text) stays for display.
- `amount_label` (text) — short human label for the card, e.g. 'Full Tuition + Stipend'.

## Security
- No RLS changes; existing anon/authenticated CRUD policies still apply.

## Notes
- All additions are additive (ALTER TABLE ADD COLUMN IF NOT EXISTS) — safe to re-run.
- No data is lost; existing Gates Cambridge row keeps its old values.
*/

ALTER TABLE scholarships
  ADD COLUMN IF NOT EXISTS match_score int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS degree_level text NOT NULL DEFAULT 'Postgraduate',
  ADD COLUMN IF NOT EXISTS field_of_study text NOT NULL DEFAULT 'Any',
  ADD COLUMN IF NOT EXISTS funding_type text NOT NULL DEFAULT 'Full Funding',
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'United Kingdom',
  ADD COLUMN IF NOT EXISTS region text NOT NULL DEFAULT 'UK',
  ADD COLUMN IF NOT EXISTS deadline_date date,
  ADD COLUMN IF NOT EXISTS amount_label text;
