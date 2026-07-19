const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://hwzsohenfaiehxebstwx.supabase.co',
  'REDACTED_SERVICE_ROLE_KEY'
);

const scholarships = [
  // ── NEAR DEADLINES (Aug–Sep 2026) ──────────────────────

  {
    title: 'Chevening Scholarships',
    university: 'UK Universities (Various)',
    country: 'United Kingdom',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-02',
    description: 'The UK government\'s global scholarship programme funded by the Foreign, Commonwealth and Development Office. Awards fully funded master\'s degrees at any UK university for future leaders with demonstrable leadership potential.',
    requirements: 'At least 2 years of work experience. Must return to home country for at least 2 years after studies. Strong leadership and networking skills required. English language proficiency (IELTS 6.5+).',
    official_link: 'https://www.chevening.org/scholarships/'
  },
  {
    title: 'Erasmus Mundus Joint Master Degree',
    university: 'European University Consortium',
    country: 'Netherlands',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-15',
    description: 'EU-funded programme offering fully funded master\'s degrees delivered by consortiums of at least 3 European universities. Students study in at least 2 countries and receive a joint or double degree.',
    requirements: 'Bachelor\'s degree with strong academic record. English proficiency (varies by programme). Not previously received an Erasmus Mundus scholarship. Open to all nationalities.',
    official_link: 'https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/studying-abroad'
  },
  {
    title: 'Australia Awards Scholarships',
    university: 'Australian Universities (Various)',
    country: 'Australia',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-30',
    description: 'Australian Government scholarships for students from developing countries to undertake master\'s or PhD studies at Australian universities. Covers tuition, living allowance, airfare, and health insurance.',
    requirements: 'Citizen of a participating developing country. At least 2 years of work experience. Meet English language requirements. Must return to home country for 2 years after completion.',
    official_link: 'https://www.dfat.gov.au/people-to-people/australia-awards'
  },
  {
    title: 'DAAD Helmut Schmidt Scholarship',
    university: 'German Universities (Various)',
    country: 'Germany',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-01',
    description: 'Full public policy and governance scholarships for future leaders from developing and newly industrialised countries. Programme taught in English at selected German universities.',
    requirements: 'Bachelor\'s degree in a relevant field. At least 2 years of professional experience. Strong English proficiency. From a developing or newly industrialised country.',
    official_link: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/'
  },
  {
    title: 'Vanier Canada Graduate Scholarships',
    university: 'Canadian Universities (Various)',
    country: 'Canada',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-05',
    description: 'Canada\'s most prestigious doctoral scholarships worth $50,000 per year for 3 years. Attracts world-class doctoral students who demonstrate leadership skills and a high standard of scholarly achievement.',
    requirements: 'Nominated by a Canadian university. Must be pursuing a PhD. First-class academic record. Demonstrated research leadership and academic excellence.',
    official_link: 'https://vanier.gc.ca/en/eligibility-admissibilite.html'
  },
  {
    title: 'Swiss Government Excellence Scholarships',
    university: 'Swiss Universities (Various)',
    country: 'Switzerland',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-10',
    description: 'Swiss Confederation scholarships for foreign researchers and artists. Covers PhD and postdoctoral research at Swiss universities. Includes a monthly stipend and tuition waiver.',
    requirements: 'Master\'s degree or equivalent. Academic excellence. Acceptance letter from a Swiss professor. Under 35 years of age. Not a Swiss citizen.',
    official_link: 'https://www.sbfi.admin.ch/en/scholarships-for-foreign-researchers.html'
  },

  // ── SEPT–OCT 2026 ──────────────────────────────────────

  {
    title: 'Fulbright Foreign Student Program',
    university: 'US Universities (Various)',
    country: 'United States',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-09-15',
    description: 'US government\'s flagship international educational exchange programme. Enables graduate students, young professionals, and artists from abroad to study and conduct research in the United States.',
    requirements: 'Bachelor\'s degree. English proficiency. Strong academic record. Must return to home country for 2 years after completion. Citizenship of participating country.',
    official_link: 'https://foreign.fulbrightonline.org/'
  },
  {
    title: 'Rhodes Scholarships',
    university: 'University of Oxford',
    country: 'United Kingdom',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-10-01',
    description: 'The world\'s oldest and most prestigious international scholarship. Provides full funding for master\'s or doctoral study at the University of Oxford. Selects scholars based on academic excellence, leadership, and commitment to service.',
    requirements: 'Bachelor\'s degree with first-class or upper second-class honours. Age 19-27. Outstanding academic achievement. Leadership and community engagement.',
    official_link: 'https://www.rhodeshouse.ox.ac.uk/scholarships/'
  },
  {
    title: 'Marshall Scholarships',
    university: 'UK Universities (Various)',
    country: 'United Kingdom',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-09-25',
    description: 'Funded by the UK Government, Marshall Scholarships finance young Americans of high ability to study for a degree in the UK. Up to 50 scholars selected annually.',
    requirements: 'US citizen. Under 26 years of age. Bachelor\'s degree with GPA 3.7+. Leadership potential and community involvement.',
    official_link: 'https://www.marshallscholarship.org/'
  },
  {
    title: 'Gates Cambridge Scholarship',
    university: 'University of Cambridge',
    country: 'United Kingdom',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-10-15',
    description: 'Full-cost awards for outstanding postgraduate study at the University of Cambridge. Covers tuition, living allowance, airfare, and development funding. Selects scholars based on intellectual ability, leadership, and commitment to improving lives of others.',
    requirements: 'Bachelor\'s degree with outstanding academic record. Must apply to and be accepted by Cambridge. Non-UK citizen. Strong commitment to improving the lives of others.',
    official_link: 'https://www.gatescambridge.org/'
  },
  {
    title: 'Commonwealth Scholarships',
    university: 'UK Universities (Various)',
    country: 'United Kingdom',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-10-10',
    description: 'Funded by the UK FCDO for students from Commonwealth countries. Covers master\'s and PhD study at UK universities. Aims to support sustainable development in Commonwealth nations.',
    requirements: 'Citizen of a Commonwealth country. Bachelor\'s degree. Commitment to development in home country. Not previously studied at UK university level.',
    official_link: 'https://cscuk.fcdo.gov.uk/scholarships/'
  },

  // ── PHD FOCUSED ─────────────────────────────────────────

  {
    title: 'ETH Zurich Doctoral Scholarships',
    university: 'ETH Zurich',
    country: 'Switzerland',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-08-31',
    description: 'Fully funded doctoral positions at one of the world\'s top technical universities. Covers a 3-4 year salary position with social benefits. Research in engineering, sciences, mathematics, and related fields.',
    requirements: 'Master\'s degree in a relevant field. Strong research background. Publications preferred. Supervision commitment from an ETH professor.',
    official_link: 'https://ethz.ch/students/en/studies/doctorate.html'
  },
  {
    title: 'Max Planck PhD Positions',
    university: 'Max Planck Institutes',
    country: 'Germany',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-09-20',
    description: 'Fully funded PhD positions across 86 Max Planck Institutes in Germany. Internationally competitive salary (TV-L E13). Cutting-edge research in natural sciences, social sciences, and humanities.',
    requirements: 'Master\'s degree or equivalent. Strong research potential. English proficiency. Must find a supervisor within the institute.',
    official_link: 'https://www.mpg.de/careers/phd'
  },
  {
    title: 'A*STAR Research Attachment Programme',
    university: 'A*STAR Research Institutes',
    country: 'Singapore',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-08-20',
    description: 'Singapore\'s Agency for Science, Technology and Research offers fully funded PhD positions in biomedical sciences, physical sciences, and engineering. Monthly stipend plus research allowance.',
    requirements: 'Strong honours or master\'s degree in STEM. Research interest aligned with A*STAR laboratories. English proficiency.',
    official_link: 'https://www.a-star.edu.sg/Scholarships-for-Graduate-Studies'
  },
  {
    title: 'KAUST Fellowship Program',
    university: 'King Abdullah University of Science and Technology',
    country: 'Saudi Arabia',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-09-15',
    description: 'Fully funded PhD programme at KAUST. Includes full tuition, monthly living stipend ($30,000+/year), housing, and relocation support. Research in water, food, energy, environment, and health.',
    requirements: 'Master\'s degree in a relevant field. Strong academic record. Research experience. English proficiency (TOEFL 79+ or IELTS 6+).',
    official_link: 'https://www.kaust.edu.sa/academics/graduate'
  },
  {
    title: 'CSC Scholarship – Chinese Government Scholarship',
    university: 'Chinese Universities (Various)',
    country: 'China',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-08-15',
    description: 'Chinese government fully funded scholarships for international PhD students. Covers tuition, accommodation, stipend, and medical insurance. Over 280 Chinese universities participate.',
    requirements: 'Master\'s degree. Under 40 years of age. Good health. Academic excellence. Two recommendation letters from professors.',
    official_link: 'https://www.campuschina.org/'
  },
  {
    title: 'CNRS Doctoral Fellowships',
    university: 'CNRS Research Labs (Various)',
    country: 'France',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-09-01',
    description: 'France\'s National Centre for Scientific Research funds doctoral positions across its labs. Competitive salary, social benefits, and research infrastructure. Open to all nationalities.',
    requirements: 'Master\'s degree. Acceptance by a CNRS research director. Research proposal aligned with CNRS themes. French or English proficiency.',
    official_link: 'https://www.cnrs.fr/en/doctoral-schools'
  },

  // ── ASIA ────────────────────────────────────────────────

  {
    title: 'MEXT Japanese Government Scholarship (Research)',
    university: 'Japanese Universities (Various)',
    country: 'Japan',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-08-25',
    description: 'Japan\'s Ministry of Education fully funded PhD scholarship. Covers tuition, monthly stipend (¥145,000+), and round-trip airfare. Study and research at top Japanese universities.',
    requirements: 'Under 35 years of age. Master\'s degree. Strong academic record. Japanese or English proficiency depending on programme.',
    official_link: 'https://www.studyinjapan.go.jp/en/smap-stopj-applications-scholarship.html'
  },
  {
    title: 'KAIST International Graduate Admission',
    university: 'Korea Advanced Institute of Science and Technology',
    country: 'South Korea',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-09-10',
    description: 'Fully funded PhD programme at South Korea\'s top research university. Full tuition waiver plus monthly stipend (KRW 3,000,000+). World-class labs in AI, quantum computing, biotechnology.',
    requirements: 'Bachelor\'s or master\'s degree in STEM. Strong GPA. Research publications preferred. English proficiency.',
    official_link: 'https://www.kaist.edu/admission/graduate.html'
  },
  {
    title: 'NUS Research Scholarship',
    university: 'National University of Singapore',
    country: 'Singapore',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-08-31',
    description: 'Fully funded PhD scholarships at Asia\'s top university. Monthly stipend (SGD 2,500-3,000), tuition waiver, and conference travel support. Over 30 research areas.',
    requirements: 'Honours degree or master\'s with strong academic record. Research potential demonstrated through publications or projects.',
    official_link: 'https://www.nus.edu.sg/gradstudies/prospective-students/graduate-research-programmes'
  },
  {
    title: 'SNU Graduate Scholarship',
    university: 'Seoul National University',
    country: 'South Korea',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-09-30',
    description: 'Full tuition waiver plus living stipend for PhD and master\'s students at South Korea\'s highest-ranked university. Research-focused programmes across all disciplines.',
    requirements: 'Bachelor\'s or master\'s degree. GPA 3.0+/4.0 or equivalent. TOEFL 80+ or TOPIK 3+.',
    official_link: 'https://www.snu.ac.kr/academics/graduate'
  },
  {
    title: 'University of Hong Kong Postgraduate Scholarships',
    university: 'University of Hong Kong',
    country: 'Hong Kong',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-09-01',
    description: 'HKU Postgraduate Scholarships cover full tuition plus monthly stipend (HKD 18,000+). Available for PhD and research master\'s programmes. Top-ranked university in Asia.',
    requirements: 'Bachelor\'s degree with first-class honours or equivalent. Research potential. English proficiency.',
    official_link: 'https://www.gradsch.hku.hk/admissions/scholarships'
  },
  {
    title: 'NTU Singapore PhD Scholarship',
    university: 'Nanyang Technological University',
    country: 'Singapore',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-09-15',
    description: 'Fully funded PhD positions at one of the world\'s top young universities. Monthly stipend (SGD 2,500-3,500), tuition waiver, and research funding. Strong in engineering, AI, and sustainability.',
    requirements: 'Bachelor\'s or master\'s degree with strong academic record. Research experience preferred.',
    official_link: 'https://www.ntu.edu.sg/education/graduate-programme'
  },

  // ── MIDDLE EAST & AFRICA ────────────────────────────────

  {
    title: 'King Abdullah Scholarship (KAUST) – Master\'s Track',
    university: 'King Abdullah University of Science and Technology',
    country: 'Saudi Arabia',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-20',
    description: 'Fully funded master\'s programme at KAUST. Full tuition, monthly stipend, housing, and relocation package. Research in water, food, energy, and environment.',
    requirements: 'Bachelor\'s degree in STEM. GPA 3.2+/4.0. English proficiency. Statement of research interest.',
    official_link: 'https://www.kaust.edu.sa/academics/graduate'
  },
  {
    title: 'Khalifa University Graduate Scholarships',
    university: 'Khalifa University',
    country: 'United Arab Emirates',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-09-20',
    description: 'Full tuition plus monthly stipend for master\'s and PhD students at the UAE\'s top-ranked university. Research in engineering, AI, health, and sustainability. No application fee.',
    requirements: 'Bachelor\'s degree (master\'s for PhD track). GPA 3.0+/4.0. English proficiency (IELTS 6.5+).',
    official_link: 'https://www.khalifauniversity.ac.ae/en/prospective-students/graduate-admissions'
  },
  {
    title: 'Mastercard Foundation Scholars Program',
    university: 'Partner Universities (Various)',
    country: 'International',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-15',
    description: 'Full scholarship for young Africans with academic talent and leadership potential. Covers tuition, accommodation, books, stipend, and career support at partner universities worldwide.',
    requirements: 'Citizen of an African country. Under 35 years of age. Academic excellence. Demonstrated leadership and community engagement. Financial need.',
    official_link: 'https://mastercardfdn.org/all/scholars/'
  },
  {
    title: 'Mandela Rhodes Scholarship',
    university: 'South African Universities (Various)',
    country: 'South Africa',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-09-01',
    description: 'Combines funding for postgraduate study with leadership development for young Africans. Covers tuition, living expenses, and a leadership programme. Honours Nelson Mandela\'s legacy.',
    requirements: 'Citizen of an African country. Under 30 years of age. Honours degree or equivalent. Leadership potential and academic excellence.',
    official_link: 'https://mandelarhodes.org/scholarships/'
  },
  {
    title: 'Egyptian Government Scholarship (Mission)',
    university: 'Egyptian Universities (Various)',
    country: 'Egypt',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-09-15',
    description: 'Egyptian government scholarships for international students from African and Arab countries. Full tuition and monthly stipend for master\'s and PhD studies.',
    requirements: 'Bachelor\'s degree (master\'s for PhD). Age under 35. Arabic or English proficiency. Good health.',
    official_link: 'https://www.scholarships.gov.eg/'
  },

  // ── SOUTH ASIA ──────────────────────────────────────────

  {
    title: 'Nehru Memorial Scholarship',
    university: 'UK Universities (Various)',
    country: 'United Kingdom',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-09-30',
    description: 'For Indian students to pursue master\'s or doctoral study at UK universities. Covers full tuition, living expenses, and airfare. Administered by the Indian High Commission.',
    requirements: 'Indian citizen. Under 30 years of age. Bachelor\'s degree with first-class. Not previously studied abroad.',
    official_link: 'https://highcommissionofindia.co.in/scholarships.html'
  },
  {
    title: 'Oxford India Centre Scholarships',
    university: 'University of Oxford',
    country: 'United Kingdom',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-10-01',
    description: 'Fully funded doctoral scholarships at the Oxford India Centre for Sustainable Development. Available to Indian nationals for DPhil study at Oxford. Covers all fees and living costs.',
    requirements: 'Indian citizen. Bachelor\'s or master\'s degree with outstanding record. Must be accepted into an Oxford DPhil programme.',
    official_link: 'https://www.ox.ac.uk/admissions/graduate/fees-and-funding/fees-scholarships-and-funding/scholarships/'
  },
  {
    title: 'Australian Government Research Training Program',
    university: 'Australian Universities (Various)',
    country: 'Australia',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-08-31',
    description: 'RTP provides fee offsets and living stipends for domestic and international research degree students at Australian universities. Covers tuition fees plus a stipend of AUD 32,000+/year.',
    requirements: 'Bachelor\'s honours degree or master\'s by research. Must meet university admission requirements. Research potential.',
    official_link: 'https://www.education.gov.au/research-training-program'
  },

  // ── LATIN AMERICA ───────────────────────────────────────

  {
    title: 'CONACYT Mexican Government Scholarship',
    university: 'Mexican Universities (Various)',
    country: 'Mexico',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-15',
    description: 'Mexico\'s National Council of Science and Technology offers fully funded scholarships for international students. Covers tuition, monthly stipend, health insurance, and research allowances.',
    requirements: 'Bachelor\'s or master\'s degree. Under 40 years of age. Academic excellence. Acceptance by a Mexican institution.',
    official_link: 'https://www.conacyt.gob.mx/en/becas-en-el-exterior'
  },
  {
    title: 'Colesio Scholarships – Brazil',
    university: 'Brazilian Universities (Various)',
    country: 'Brazil',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-09-01',
    description: 'CAPES/CNPq scholarships for international students pursuing master\'s and doctoral studies in Brazil. Monthly stipend, tuition waiver, and research support at top Brazilian universities.',
    requirements: 'Master\'s degree (for PhD). Portuguese or English proficiency depending on programme. Academic excellence.',
    official_link: 'https://www.gov.br/capes/en'
  },
  {
    title: 'Colciencias – Colombia PhD Scholarships',
    university: 'Colombian Universities (Various)',
    country: 'Colombia',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-09-15',
    description: 'Colombia\'s science agency funds PhD positions for international students. Monthly stipend, research allowance, and health insurance. Growing research ecosystem in biodiverse and tropical sciences.',
    requirements: 'Master\'s degree. Spanish proficiency (B2+). Research proposal aligned with Colombian research priorities.',
    official_link: 'https://www.minciencias.gov.co/'
  },
  {
    title: 'Becas Chile – Doctoral Programme',
    university: 'Chilean Universities (Various)',
    country: 'Chile',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-08-31',
    description: 'Chile\'s National Agency for Research and Development (ANID) fully funds doctoral studies. Monthly stipend, tuition, travel grants, and thesis completion bonus. Strong research infrastructure.',
    requirements: 'Master\'s degree or equivalent. Under 35 years of age. Academic excellence. Not Chilean citizen.',
    official_link: 'https://www.anid.cl/becas/'
  },

  // ── EUROPE (more countries) ─────────────────────────────

  {
    title: 'Swedish Institute Scholarships',
    university: 'Swedish Universities (Various)',
    country: 'Sweden',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-20',
    description: 'Fully funded master\'s scholarships for students from eligible countries. Covers tuition, living expenses (SEK 10,000/month), travel grant, and insurance. Sweden is a global leader in innovation and sustainability.',
    requirements: 'Citizen of an eligible country. Bachelor\'s degree. Work experience (3,000+ hours). Not previously studied in Sweden.',
    official_link: 'https://si.se/en/apply/scholarships/'
  },
  {
    title: 'Holland Scholarship',
    university: 'Dutch Universities (Various)',
    country: 'Netherlands',
    degree: 'Graduate',
    funding: 'Monetary',
    deadline: '2026-09-01',
    description: 'Dutch Ministry of Education scholarship for non-EEA international students. One-time grant of EUR 5,000 for the first year of study. Available at 21 Dutch research universities.',
    requirements: 'Non-EEA citizen. Applying for a full-time programme in the Netherlands. Meet specific university requirements.',
    official_link: 'https://www.studyinholland.nl/finances/scholarships'
  },
  {
    title: 'Eiffel Excellence Scholarship Programme',
    university: 'French Universities and Grandes Écoles',
    country: 'France',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-09-15',
    description: 'French government scholarship for international students. Monthly allowance (EUR 1,181 for master\'s, EUR 1,400 for PhD), plus travel, health insurance, and housing assistance. Applied through a French institution.',
    requirements: 'Non-French citizen. Under 30 for master\'s, under 35 for PhD. Must be sponsored by a French institution.',
    official_link: 'https://www.campusfrance.org/en/eiffel-scholarship-of-excellence'
  },
  {
    title: 'Italian Government Scholarships (Invest Your Talent)',
    university: 'Italian Universities (Various)',
    country: 'Italy',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-09-10',
    description: 'Italian Ministry of Foreign Affairs scholarships for master\'s students from selected countries. Covers tuition, monthly stipend, and health insurance at Italian universities.',
    requirements: 'Citizen of eligible countries. Bachelor\'s degree. English or Italian proficiency. Under 28 years of age.',
    official_link: 'https://studycampusitaly.esteri.it/en/'
  },
  {
    title: 'Turkish Government Turkiye Burslari',
    university: 'Turkish Universities (Various)',
    country: 'Turkey',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-15',
    description: 'Turkey\'s prestigious government scholarship for international students. Full tuition, monthly stipend (TRY 2,000+), accommodation, health insurance, and Turkish language course.',
    requirements: 'Under 30 for master\'s, under 35 for PhD. Bachelor\'s GPA 75%+. Good health. Not a Turkish citizen.',
    official_link: 'https://www.turkiyeburslari.gov.tr/'
  },
  {
    title: 'Polish Government Scholarship (NAWA)',
    university: 'Polish Universities (Various)',
    country: 'Poland',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-09-15',
    description: 'Polish National Agency for Academic Exchange (NAWA) scholarships for international students. Full tuition, monthly stipend (PLN 1,500+), and health insurance. Poland has affordable living costs.',
    requirements: 'Citizen of an eligible country. Bachelor\'s degree. English proficiency.',
    official_link: 'https://nawa.gov.pl/en/scholarships'
  },

  // ── MORE NEAR-DEADLINE ──────────────────────────────────

  {
    title: 'Schwarzman Scholars Programme',
    university: 'Tsinghua University',
    country: 'China',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-10',
    description: 'Fully funded master\'s in Global Affairs at Tsinghua University. Designed to build understanding between China and the world. Covers tuition, room and board, travel, and stipend. Intensive leadership development.',
    requirements: 'Bachelor\'s degree. 18-28 years of age. English proficiency. Leadership potential and entrepreneurial spirit.',
    official_link: 'https://www.schwarzmanscholars.org/'
  },
  {
    title: 'Clarendon Fund Scholarships',
    university: 'University of Oxford',
    country: 'United Kingdom',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-10-01',
    description: 'Oxford\'s largest scholarship scheme offering approximately 140 fully funded scholarships annually. Covers tuition and generous living expenses. Merit-based selection — open to all nationalities and all subjects.',
    requirements: 'Outstanding academic achievement. Must apply to Oxford. No separate application — automatically considered.',
    official_link: 'https://www.ox.ac.uk/clarendon/'
  },
  {
    title: 'Heinrich Böll Foundation Scholarships',
    university: 'German Universities (Various)',
    country: 'Germany',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-15',
    description: 'Scholarships for students committed to ecology, sustainability, democracy, and human rights. Monthly stipend, tuition support, and networking opportunities. Open to international students at German universities.',
    requirements: 'Bachelor\'s degree. Commitment to green politics and social justice. Academic excellence. German or English proficiency.',
    official_link: 'https://www.boell.de/en/scholarships'
  },
  {
    title: 'Adelina Foundation Scholarships',
    university: 'European Universities (Various)',
    country: 'Germany',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-09-01',
    description: 'Fully funded master\'s scholarships at German universities for outstanding students from developing countries. Monthly stipend, tuition waiver, and health insurance.',
    requirements: 'Bachelor\'s degree with strong academic record. From a developing country. German or English proficiency.',
    official_link: 'https://www.adelina-stiftung.de/'
  },
  {
    title: 'Joint Japan World Bank Scholarship Program',
    university: 'Partner Universities (Various)',
    country: 'International',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-08-20',
    description: 'Fully funded master\'s programme for mid-career professionals from developing countries. Study at leading partner universities worldwide. Focus on development-related fields.',
    requirements: 'Citizen of a World Bank member developing country. At least 3 years of development-related work experience. Bachelor\'s degree. Admission to a partner university programme.',
    official_link: 'https://www.worldbank.org/en/programs/scholarships'
  },
  {
    title: 'Schuman Scholarships – European Parliament',
    university: 'EU Institutions',
    country: 'European Union',
    degree: 'Graduate',
    funding: 'Stipend',
    deadline: '2026-09-30',
    description: 'Three-month paid traineeships at the European Parliament for university graduates. Monthly allowance of EUR 860. Gain hands-on experience in European governance and policy-making.',
    requirements: 'Bachelor\'s degree. EU citizen or long-term resident. English or French proficiency. Knowledge of another EU language.',
    official_link: 'https://www.europarl.europa.eu/work/en/visiting-your-parliament/schuman-traineeships'
  },
  {
    title: 'Turing Scheme',
    university: 'UK and Partner Institutions',
    country: 'United Kingdom',
    degree: 'Graduate',
    funding: 'Stipend',
    deadline: '2026-09-01',
    description: 'UK Government programme funding students to study and work abroad. Monthly maintenance grant based on destination. Build international skills and employability.',
    requirements: 'UK-domiciled student. Enrolled at a UK university. Applying for a study or work placement abroad.',
    official_link: 'https://www.turing-scheme.org.uk/'
  },

  // ── SOUTH AMERICA SPECIFIC ──────────────────────────────

  {
    title: 'OAS Academic Scholarship Program',
    university: 'Americas Universities (Various)',
    country: 'International',
    degree: 'Graduate',
    funding: 'Full funding',
    deadline: '2026-09-15',
    description: 'Organization of American States scholarships for graduate studies in any OAS member state. Covers tuition and living expenses. Available across all disciplines.',
    requirements: 'Citizen of an OAS member state. Bachelor\'s degree with strong academic record. Not currently studying in the scholarship country.',
    official_link: 'https://www.oas.org/en/scholarships/'
  },
  {
    title: 'Universidad de Chile – CONICYT Doctoral',
    university: 'University of Chile',
    country: 'Chile',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-08-31',
    description: 'Fully funded doctoral programme at Chile\'s oldest and most prestigious university. Monthly stipend, tuition waiver, and research support. Strong in natural sciences, engineering, and social sciences.',
    requirements: 'Master\'s degree. Spanish proficiency (B2+). Academic excellence. Research proposal.',
    official_link: 'https://www.uchile.cl/doctorado'
  },

  // ── ADDITIONAL PHD ──────────────────────────────────────

  {
    title: 'EMBL International PhD Programme',
    university: 'European Molecular Biology Laboratory',
    country: 'Germany',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-08-15',
    description: 'Fully funded PhD programme at one of the world\'s leading life science research laboratories. Competitive salary, health insurance, and relocation support. Campuses in Germany, France, and beyond.',
    requirements: 'Master\'s degree in life sciences or related field. Strong research experience. English proficiency.',
    official_link: 'https://www.embl.org/education/phd-programme/'
  },
  {
    title: 'CERN Technical Student Programme',
    university: 'CERN',
    country: 'Switzerland',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-09-01',
    description: 'Join the world\'s largest particle physics laboratory for your thesis. Fully funded, paid internship position. Work alongside leading physicists and engineers on cutting-edge experiments.',
    requirements: 'Registered as a full-time student in physics, engineering, or computer science. At least 18 months of studies remaining.',
    official_link: 'https://careers.cern/programs-and-internships'
  },
  {
    title: 'Simons Foundation International Fellowship',
    university: 'Partner Research Institutions',
    country: 'International',
    degree: 'Postgraduate',
    funding: 'Full funding',
    deadline: '2026-10-01',
    description: 'Fellowships for early-career researchers in mathematics and theoretical physics. Annual stipend of $60,000 plus research allowance. Opportunity to work at leading research institutions worldwide.',
    requirements: 'PhD in mathematics or theoretical physics. Within 5 years of PhD completion. Outstanding research record.',
    official_link: 'https://www.simonsfoundation.org/grant/international-fellowships/'
  },
];

(async () => {
  console.log(`Inserting ${scholarships.length} scholarships...`);
  
  // Get existing titles to skip duplicates
  const { data: existing } = await s.from('scholarships').select('title');
  const existingTitles = new Set((existing ?? []).map(e => e.title));
  const newOnly = scholarships.filter(s => !existingTitles.has(s.title));

  console.log(`Skipping ${scholarships.length - newOnly.length} duplicates, inserting ${newOnly.length} new`);

  let data = null;
  let error = null;
  if (newOnly.length > 0) {
    const result = await s.from('scholarships').insert(newOnly).select();
    data = result.data;
    error = result.error;
  }
  
  if (error) {
    console.error('Error:', error.message);
    console.error('Details:', error.details);
  } else {
    console.log(`Successfully upserted ${data?.length ?? 0} scholarships`);
  }

  // Verify total count
  const { data: all } = await s.from('scholarships').select('id, title, degree, country, deadline');
  console.log(`\nTotal scholarships in DB: ${all?.length ?? 0}`);
  all?.sort((a, b) => a.deadline.localeCompare(b.deadline)).forEach(s => 
    console.log(`  ${s.deadline} | ${s.degree.padEnd(13)} | ${s.country.padEnd(15)} | ${s.title}`)
  );
})();
