export type Scholarship = {
  id: string;
  name: string;
  university: string;
  location: string;
  hero_image_url: string | null;
  crest_image_url: string | null;
  overview: string;
  total_award: string | null;
  slots: string | null;
  next_deadline: string | null;
  competition: string | null;
  acceptance: string | null;
  is_saved: boolean;
  match_score: number;
  degree_level: string;
  field_of_study: string;
  funding_type: string;
  country: string;
  region: string;
  deadline_date: string | null;
  amount_label: string | null;
  created_at: string;
  updated_at: string;
};

export type SortMode = 'match' | 'amount' | 'deadline';

export type Filters = {
  country: string;
  degreeLevels: string[];
  field: string;
  fundingTypes: string[];
  deadlineFrom: string;
  deadlineTo: string;
  search: string;
};

export type FundingItem = {
  id: string;
  scholarship_id: string;
  label: string;
  coverage: string;
  percent: number;
  sort_order: number;
};

export type TimelineStep = {
  id: string;
  scholarship_id: string;
  step_number: number;
  label: string;
  date_label: string | null;
  status: 'current' | 'upcoming' | 'complete';
  icon: string;
  description: string | null;
  sort_order: number;
};

export type EligibilityStatus = 'qualified' | 'missing' | 'pending';

export type EligibilityItem = {
  id: string;
  scholarship_id: string;
  label: string;
  status: EligibilityStatus;
  detail: string | null;
  icon: string;
  sort_order: number;
};

export type AiTip = {
  id: string;
  scholarship_id: string;
  title: string;
  body: string;
  sort_order: number;
};

export type UserProfile = {
  id: string;
  name: string;
  avatar_url: string | null;
  gpa: string;
  ielts: string;
  university: string;
  class_year: string;
  major: string;
  research_interests: string[];
  completion_percent: number;
  email_notifications: boolean;
  public_profile: boolean;
};

export type DocumentItem = {
  id: string;
  name: string;
  icon: string;
  updated_at: string;
  sort_order: number;
};

export type ApplicationStatus = 'not_started' | 'in_progress' | 'submitted' | 'interview' | 'awarded' | 'rejected';

export type Application = {
  id: string;
  scholarship_id: string;
  status: ApplicationStatus;
  started_at: string | null;
  updated_at: string;
  created_at: string;
};

export type ScholarshipDetail = Scholarship & {
  funding_items: FundingItem[];
  timeline_steps: TimelineStep[];
  eligibility_items: EligibilityItem[];
  ai_tips: AiTip[];
  application: Application | null;
};

export type ViewName = 'list' | 'detail' | 'profile';
