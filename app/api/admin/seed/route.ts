import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdminAuth } from '@/lib/admin';

const SEED_SCHOLARSHIPS = [
  {
    title: 'Harry S. Truman Scholarship',
    university: 'Truman Scholarship Foundation',
    country: 'US',
    degree: 'Undergraduate',
    funding: '$30,000',
    deadline: '2026-02-03',
    description: 'A prestigious merit-based award for college juniors committed to careers in public service. Supports graduate or professional school expenses.',
    requirements: 'US citizen; college junior; demonstrated commitment to public service; record of leadership and service.',
    official_link: 'https://www.truman.gov/apply/applying/2026-announcements',
  },
  {
    title: 'AAUW International Fellowships',
    university: 'American Association of University Women',
    country: 'US',
    degree: 'Graduate',
    funding: '$20,000',
    deadline: '2026-09-17',
    description: 'Promotes education and equity for women by investing in international applicants pursuing graduate studies in STEM disciplines in the US.',
    requirements: 'Non-US citizen or permanent resident; pursuing full-time postgraduate studies in STEM in the US; academic excellence; track record of empowering women.',
    official_link: 'https://www.aauw.org/resources/programs/fellowships-grants/aauw-international-fellowships/',
  },
  {
    title: 'UNESCO/Japan Young Researchers Fellowship',
    university: 'UNESCO',
    country: 'International',
    degree: 'Graduate',
    funding: '$10,000',
    deadline: '2026-09-30',
    description: 'Fellowships for young researchers from Africa, SIDS, Ukraine and Türkiye to conduct postgraduate research in Japan on heritage conservation and sustainable development.',
    requirements: 'Nationals of invited Member States; no more than 40 years old; Master\'s degree or equivalent; acceptance from a Japanese academic supervisor.',
    official_link: 'https://www.unesco.org/en/fellowships/keizo-obuchi',
  },
  {
    title: 'Barry Goldwater Scholarship',
    university: 'Goldwater Scholarship Foundation',
    country: 'US',
    degree: 'Undergraduate',
    funding: '$7,500',
    deadline: '2026-01-31',
    description: 'Premier undergraduate scholarship for students intending to pursue research careers in natural sciences, engineering, or mathematics.',
    requirements: 'US citizen or permanent resident; college sophomore or junior; GPA >= 3.0; intend to pursue research in STEM.',
    official_link: 'https://goldwaterscholarship.gov/steps-in-process/',
  },
  {
    title: 'Dorrance Scholarship',
    university: 'Dorrance Scholarship Programs',
    country: 'US',
    degree: 'Undergraduate',
    funding: '$12,000',
    deadline: '2026-02-04',
    description: 'Supports first-generation Arizona students who will be the first in their families to earn a four-year college degree.',
    requirements: 'Arizona resident; first-generation college student; minimum 3.0 GPA; minimum 1110 SAT / 22 ACT; plan to attend ASU, NAU, or UA.',
    official_link: 'https://dorrancescholarship.org/application/',
  },
  {
    title: 'DOE Nuclear Energy Undergraduate Scholarship',
    university: 'US Department of Energy',
    country: 'US',
    degree: 'Undergraduate',
    funding: '$10,000',
    deadline: '2026-07-02',
    description: 'One-year scholarships for undergraduates pursuing science and engineering disciplines related to nuclear energy at US institutions.',
    requirements: 'US citizen or legal permanent resident; enrolled at a US college or university; pursuing nuclear energy-related degree; minimum 3.0 GPA.',
    official_link: 'https://neup.inl.gov/content/uploads/14/2026/05/FY-2025-UNLP-Scholarship-Request-for-Applications-Approved-2026-05-15.pdf',
  },
  {
    title: 'UNESCO/China Great Wall Fellowship',
    university: 'UNESCO & Chinese Government',
    country: 'International',
    degree: 'Graduate',
    funding: '$15,000',
    deadline: '2026-01-23',
    description: 'Co-sponsored fellowships for advanced studies at Chinese universities. Supports master\'s, doctoral, and visiting scholar programs across various fields.',
    requirements: 'Nationals of invited developing Member States; bachelor\'s degree for Master\'s applicants; pre-admission letter from a Chinese university.',
    official_link: 'https://www.unesco.org/en/fellowships/greatwall',
  },
  {
    title: 'Bayer Foundation Scientific Fellowship',
    university: 'Bayer Foundation',
    country: 'International',
    degree: 'Graduate',
    funding: '€10,000',
    deadline: '2026-04-15',
    description: 'Fellowships for outstanding master, PhD, and medical students to pursue international research projects and internships at German or international research institutions.',
    requirements: 'Enrolled master, PhD, or medical student; pursuing international research project or internship; placement at a German research institution or abroad.',
    official_link: 'https://www.bayer-foundation.com/fellowships-applications-our-fellowships-program-2026-are-now-open',
  },
  {
    title: 'Global Korea Scholarship',
    university: 'Korean Government (NIIED)',
    country: 'International',
    degree: 'Graduate',
    funding: 'Full tuition + stipend',
    deadline: '2026-02-25',
    description: 'Fully funded scholarships for international students to study at Korean higher education institutions. Includes tuition, living expenses, airfare, and Korean language training.',
    requirements: 'Citizenship of NIIED designated countries; hold required degree or expected to graduate by July 31, 2026; TOPIK level 3 for degree programs.',
    official_link: 'https://www.studyinkorea.go.kr',
  },
  {
    title: 'IMU Breakout Graduate Fellowship',
    university: 'International Mathematical Union',
    country: 'International',
    degree: 'Graduate',
    funding: '$10,000/year',
    deadline: '2026-05-30',
    description: 'Up to 4 years of funding for PhD students in mathematics from developing countries. Covers tuition, travel, living expenses, and research costs.',
    requirements: 'Citizen and resident of IMU-defined developing country; enrolled in PhD program in mathematical sciences; nominated by a qualified professor.',
    official_link: 'https://grants.mathunion.org/',
  },
  {
    title: 'Ireland Fellows Programme',
    university: 'Irish Government (Irish Aid)',
    country: 'International',
    degree: 'Graduate',
    funding: 'Fully funded',
    deadline: '2026-07-28',
    description: 'Fully funded Master\'s degree fellowship at an Irish university. Covers tuition, accommodation, travel, and monthly living allowance.',
    requirements: 'Citizen and resident of eligible country; commit to returning home after fellowship; meet English language requirements of chosen Irish university.',
    official_link: 'https://opportunitiesnexus.com/ireland-fellows-programme-2026-2027/',
  },
  {
    title: 'University of Tokyo Todai Fellowship',
    university: 'University of Tokyo',
    country: 'International',
    degree: 'Graduate',
    funding: '¥200,000/month',
    deadline: '2026-06-10',
    description: 'Fellowship for international doctoral students at the University of Tokyo Graduate School of Frontier Sciences. Provides monthly stipend and research support.',
    requirements: 'Applying for admission to doctoral course at UTokyo Graduate School of Frontier Sciences; valid student visa for Japan; not receiving other scholarships.',
    official_link: 'https://www.k.u-tokyo.ac.jp/en/assets/files/TodaiFellow_2026_EN_Aver.2_0526.pdf',
  },
];

export async function POST(request: Request) {
  const { user, error } = await verifyAdminAuth(request);
  if (error) {
    return NextResponse.json({ error }, { status: error === 'Not authorized as admin' ? 403 : 401 });
  }

  let seeded = 0;
  let skipped = 0;

  for (const s of SEED_SCHOLARSHIPS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbErr } = await supabaseAdmin
      .from('scholarships')
      .upsert(s as any, { onConflict: 'title', ignoreDuplicates: true });

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    seeded++;
  }

  return NextResponse.json({ seeded, skipped, total: SEED_SCHOLARSHIPS.length });
}
