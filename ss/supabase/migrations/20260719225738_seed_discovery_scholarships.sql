/*
# Seed Rhodes, Fulbright, Erasmus Mundus + enrich Gates Cambridge

## Overview
1. Updates the existing Gates Cambridge row with discovery fields (match_score, degree,
   field, funding_type, country/region, deadline_date, amount_label) and crest image.
2. Inserts three new scholarships (Rhodes, Fulbright Foreign Student, Erasmus Mundus JMD)
   each with a funding item and the same card-shaped data.
3. Seeds a user_profile row if missing (with the list-page avatar).

## Notes
- Uses `WHERE NOT EXISTS` guards so re-running is idempotent.
- Child funding_items only get a single representative row per scholarship to keep the
  card data consistent; the detail page reads funding_items but cards use amount_label.
*/

-- Enrich Gates Cambridge with discovery fields
UPDATE scholarships
SET
  match_score = 89,
  degree_level = 'Postgraduate',
  field_of_study = 'Any',
  funding_type = 'Full Funding',
  country = 'United Kingdom',
  region = 'UK',
  deadline_date = DATE '2024-12-05',
  amount_label = '£18,744 Per Year',
  crest_image_url = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyJGaqQ8RLjG-oo8taHWvHxfEzNjq1Lz5PO2Kj_LV1tx0MCK6venQfldpSvuy1tBtvmpIsx85Qx-k-mdaOol_tiVbCwUk2c7efJXOzsdIkjG4ppeQQSbxZtsRt9_V2wJ3VFHkTlV_wrdxZ8LlZejGF1ren5alIGaR8QUBZzNr8vwEwmb3XlyQPpuVdF0f6-z4FNgPx5hSNQliSnZf8xuHG9K-QsUsqOoZ9lsVUWiA_7WO8KkgHKIO95g5OrUv4oLOlXb6Iq-7Ubg',
  next_deadline = 'Dec 05, 2024',
  updated_at = now()
WHERE name = 'Gates Cambridge Scholarship';

-- Rhodes Scholarship
INSERT INTO scholarships (
  name, university, location, hero_image_url, crest_image_url, overview,
  total_award, slots, next_deadline, competition, acceptance, is_saved,
  match_score, degree_level, field_of_study, funding_type, country, region,
  deadline_date, amount_label
)
SELECT
  'Rhodes Scholarship', 'University of Oxford', 'Oxford, UK',
  null,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBB2lV6ynXy6dfAgDA6AtMgwl8CiEsgeVo1zImiFFmskqoADFpsPOkw8RLFP3zAS0kMEm9ZixwDb4Jyk-xvDI8pN6QSYkK8ldFxuFNbqAUaUcZMV3FdtYWlREhYZjkEtfwNT28IoBXwbulW9WVPLtWLjQ046a-eeCsgMovq2D9WNQ5TxRNidUi6ocNPr7CjLz9p-dn8z768aOw7-4XjXRd_JwO-8pbrvhhzwXrwcwl-vi0Fc2M0L-xSAitqRmRY5P3rs7VPDkeBNA',
  'The Rhodes Scholarship is the oldest (first awarded in 1903) and perhaps most celebrated international fellowship in the world. Each year it brings together 100 exceptional young people from around the world to study at the University of Oxford, funded fully for two or more years of postgraduate study.',
  'Full Tuition + Stipend', '100 Awards', 'Oct 15, 2024', 'High', '0.7%', false,
  94, 'Postgraduate', 'Any', 'Full Tuition + Stipend', 'United Kingdom', 'UK',
  DATE '2024-10-15', 'Full Tuition + Stipend'
WHERE NOT EXISTS (SELECT 1 FROM scholarships WHERE name = 'Rhodes Scholarship');

-- Fulbright Foreign Student
INSERT INTO scholarships (
  name, university, location, hero_image_url, crest_image_url, overview,
  total_award, slots, next_deadline, competition, acceptance, is_saved,
  match_score, degree_level, field_of_study, funding_type, country, region,
  deadline_date, amount_label
)
SELECT
  'Fulbright Foreign Student', 'Multiple Universities', 'USA',
  null,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCWF6kKa77_Y_FCO55F7kvxJqNlgnKIIIyo7xCpxjU3cPztw5E6enosB_kgcmbK-Y_6qSEB1hvMIxQ-yC_oX0G1fAEwT4OC0_kM00vAhI26aLKQEJmgiKa4UprUPVHMq_yXeAL4jrM7lge-SnQ_oWxCwBPpzWCz1n_JJ9Gnc9pREO7ZaW7kyMuQQ1_bKEUBX1Iv9fEG6P7eIBeRof3l86M_U2HtS9uHPbxZAwxb2nQ4R3-1u11-0SSHth5zEiLb7xdxWXkV0EPzLw',
  'The Fulbright Foreign Student Program enables graduate students, young professionals and artists from abroad to study and conduct research in the United States. The program operates in more than 160 countries and awards approximately 8,000 grants annually.',
  'Full Funding', '8,000 Awards', 'Varies by Country', 'Medium', '1.2%', false,
  82, 'Postgraduate', 'Any', 'Full Funding', 'United States', 'USA',
  DATE '2024-11-01', 'Full Funding'
WHERE NOT EXISTS (SELECT 1 FROM scholarships WHERE name = 'Fulbright Foreign Student');

-- Erasmus Mundus JMD
INSERT INTO scholarships (
  name, university, location, hero_image_url, crest_image_url, overview,
  total_award, slots, next_deadline, competition, acceptance, is_saved,
  match_score, degree_level, field_of_study, funding_type, country, region,
  deadline_date, amount_label
)
SELECT
  'Erasmus Mundus JMD', 'Multiple Universities', 'EU',
  null,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD6x69TuogM4TCqJ01bgdu5DtkhHje9KvNOBw1bGK7ErJkgMiLEL0G7PUStOTGcLXtzD6JpmjG2EFu6nGUzBaBvOd1QNf3NoZj7Txl9SlUQMqWd6NxN4W0Zbg8tZfIEZLzt91cdNKwHU7UjEUqvNQYCRDFm6d82ZcqtBOqLz_lTxUNTXXNtIyhNhQnihgfziLS4T1eVorG14mSf6LNfoD4wrYkiJ4Pv9Qk72Dgbs0mVUJ3zn_peYgyk3k-Kmosfyx8ziexuI0rM-w',
  'Erasmus Mundus Joint Master Degrees are prestigious integrated study programmes delivered by an international consortium of higher education institutions. They involve at least two institutions in two different countries and offer full scholarships to the best students worldwide.',
  '€24,000 / Year', '2,000 Awards', 'Jan 15, 2025', 'Medium', '2.5%', false,
  78, 'Postgraduate', 'Any', 'Full Funding', 'European Union', 'EU',
  DATE '2025-01-15', '€24,000 / Year'
WHERE NOT EXISTS (SELECT 1 FROM scholarships WHERE name = 'Erasmus Mundus JMD');

-- One representative funding item per new scholarship
INSERT INTO funding_items (scholarship_id, label, coverage, percent, sort_order)
SELECT s.id, 'Full Tuition + Stipend', 'Fully Funded', 100, 0
FROM scholarships s
WHERE s.name = 'Rhodes Scholarship'
  AND NOT EXISTS (SELECT 1 FROM funding_items WHERE scholarship_id = s.id);

INSERT INTO funding_items (scholarship_id, label, coverage, percent, sort_order)
SELECT s.id, 'Full Funding', 'Fully Funded', 100, 0
FROM scholarships s
WHERE s.name = 'Fulbright Foreign Student'
  AND NOT EXISTS (SELECT 1 FROM funding_items WHERE scholarship_id = s.id);

INSERT INTO funding_items (scholarship_id, label, coverage, percent, sort_order)
SELECT s.id, 'Maintenance & Travel', '€24,000 / Year', 100, 0
FROM scholarships s
WHERE s.name = 'Erasmus Mundus JMD'
  AND NOT EXISTS (SELECT 1 FROM funding_items WHERE scholarship_id = s.id);

-- Ensure a user profile exists (list-page avatar)
INSERT INTO user_profile (singleton, name, avatar_url, gpa, ielts)
SELECT true, 'Maya Chen',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAX3KqC_8FEqWYNe35rTsT_suwHZnGPLU9zo-5Ra-z3dAih9hWkFv8uhiiwWBs_QMWaQLfrFRzIsG4mZFZ6uv3wgsx5pK1ScYprMucHH0UHDo1AUcuQbhSHeJWtpEGRE3yCUztn01Y_p6Jnd2emxxwv8OYbAus8Y8EgS-GE6uxa-QD7SiXDETRUvu-acsuHHLGSFzGYrhyozyJWS5C-9XT6BEUZeCQSdtDm6pwpqrA4stVtbWqi1_QYKDBxOYoEEWlKzrltQOSWAA',
  '3.92', '8.5'
WHERE NOT EXISTS (SELECT 1 FROM user_profile);
