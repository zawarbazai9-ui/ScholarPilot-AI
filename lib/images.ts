// ─── Campus Photos (Unsplash) ────────────────────────────────
const CAMPUS_PHOTOS: Record<string, string> = {
  'United Kingdom': 'https://images.unsplash.com/photo-1579242514542-4c899d56a275?w=1600&h=900&fit=crop&q=80',
  'UK': 'https://images.unsplash.com/photo-1579242514542-4c899d56a275?w=1600&h=900&fit=crop&q=80',
  'United States': 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&h=900&fit=crop&q=80',
  'US': 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&h=900&fit=crop&q=80',
  'Canada': 'https://images.unsplash.com/photo-1568792923760-d70635a89fdc?w=1600&h=900&fit=crop&q=80',
  'Australia': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&h=900&fit=crop&q=80',
  'Germany': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600&h=900&fit=crop&q=80',
  'France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&h=900&fit=crop&q=80',
  'Japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&h=900&fit=crop&q=80',
  'Netherlands': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1600&h=900&fit=crop&q=80',
  'Switzerland': 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1600&h=900&fit=crop&q=80',
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600&h=900&fit=crop&q=80',
  'China': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1600&h=900&fit=crop&q=80',
  'India': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&h=900&fit=crop&q=80',
  'South Korea': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1600&h=900&fit=crop&q=80',
  'Korea, South': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1600&h=900&fit=crop&q=80',
  'Italy': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1600&h=900&fit=crop&q=80',
  'Spain': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600&h=900&fit=crop&q=80',
  'Sweden': 'https://images.unsplash.com/photo-1509356843151-3e7d96241015?w=1600&h=900&fit=crop&q=80',
  'Norway': 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&h=900&fit=crop&q=80',
  'New Zealand': 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600&h=900&fit=crop&q=80',
  'Ireland': 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=1600&h=900&fit=crop&q=80',
  'Brazil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600&h=900&fit=crop&q=80',
  'South Africa': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600&h=900&fit=crop&q=80',
  'Nigeria': 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=1600&h=900&fit=crop&q=80',
  'Kenya': 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=1600&h=900&fit=crop&q=80',
  'Mexico': 'https://images.unsplash.com/photo-1518638150281-c0974ba3826b?w=1600&h=900&fit=crop&q=80',
  'Argentina': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1600&h=900&fit=crop&q=80',
  'Israel': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&h=900&fit=crop&q=80',
  'Denmark': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1600&h=900&fit=crop&q=80',
  'Finland': 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=1600&h=900&fit=crop&q=80',
  'Austria': 'https://images.unsplash.com/photo-1516550113581-50773bdf8b06?w=1600&h=900&fit=crop&q=80',
  'Belgium': 'https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=1600&h=900&fit=crop&q=80',
  'Portugal': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600&h=900&fit=crop&q=80',
  'Poland': 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1600&h=900&fit=crop&q=80',
  'Czech Republic': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1600&h=900&fit=crop&q=80',
  'Greece': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1600&h=900&fit=crop&q=80',
  'Turkey': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600&h=900&fit=crop&q=80',
  'Thailand': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600&h=900&fit=crop&q=80',
  'Malaysia': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1600&h=900&fit=crop&q=80',
  'International': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&h=900&fit=crop&q=80',
  'Colombia': 'https://images.unsplash.com/photo-1536086845836-e53877c47d12?w=1600&h=900&fit=crop&q=80',
  'Chile': 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1600&h=900&fit=crop&q=80',
  'UAE': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&h=900&fit=crop&q=80',
  'Egypt': 'https://images.unsplash.com/photo-1539768942893-daf53e736b68?w=1600&h=900&fit=crop&q=80',
};

// ─── University Domain Mappings ──────────────────────────────
const UNIVERSITY_DOMAINS: Record<string, string> = {
  // UK
  'university of oxford': 'ox.ac.uk',
  'oxford': 'ox.ac.uk',
  'university of cambridge': 'cam.ac.uk',
  'cambridge': 'cam.ac.uk',
  'imperial college london': 'imperial.ac.uk',
  'imperial': 'imperial.ac.uk',
  'university college london': 'ucl.ac.uk',
  'ucl': 'ucl.ac.uk',
  "king's college london": 'kcl.ac.uk',
  'london school of economics': 'lse.ac.uk',
  'lse': 'lse.ac.uk',
  'university of warwick': 'warwick.ac.uk',
  'university of manchester': 'manchester.ac.uk',
  'university of edinburgh': 'ed.ac.uk',
  'university of bristol': 'bristol.ac.uk',
  'university of bath': 'bath.ac.uk',
  'university of glasgow': 'glasgow.ac.uk',
  'university of birmingham': 'birmingham.ac.uk',
  'university of leeds': 'leeds.ac.uk',
  'university of sheffield': 'sheffield.ac.uk',
  'university of nottingham': 'nottingham.ac.uk',
  'university of liverpool': 'liverpool.ac.uk',
  'university of durham': 'durham.ac.uk',
  'durham university': 'durham.ac.uk',
  'university of st andrews': 'st-andrews.ac.uk',
  'university of southampton': 'southampton.ac.uk',
  'university of exeter': 'exeter.ac.uk',
  'university of york': 'york.ac.uk',
  'university of queen mary': 'qmul.ac.uk',
  'royal holloway': 'rhul.ac.uk',
  // US
  'massachusetts institute of technology': 'mit.edu',
  'mit': 'mit.edu',
  'stanford university': 'stanford.edu',
  'stanford': 'stanford.edu',
  'harvard university': 'harvard.edu',
  'harvard': 'harvard.edu',
  'yale university': 'yale.edu',
  'yale': 'yale.edu',
  'princeton university': 'princeton.edu',
  'princeton': 'princeton.edu',
  'columbia university': 'columbia.edu',
  'columbia': 'columbia.edu',
  'caltech': 'caltech.edu',
  'carnegie mellon': 'cmu.edu',
  'cornell university': 'cornell.edu',
  'duke university': 'duke.edu',
  'johns hopkins': 'jhu.edu',
  'university of chicago': 'uchicago.edu',
  'northwestern university': 'northwestern.edu',
  'university of pennsylvania': 'upenn.edu',
  'brown university': 'brown.edu',
  'dartmouth college': 'dartmouth.edu',
  'vanderbilt university': 'vanderbilt.edu',
  'rice university': 'rice.edu',
  'emory university': 'emory.edu',
  'georgetown university': 'georgetown.edu',
  'university of virginia': 'virginia.edu',
  'washington university': 'wustl.edu',
  'university of michigan': 'umich.edu',
  'university of north carolina': 'unc.edu',
  'georgia institute': 'gatech.edu',
  'georgia tech': 'gatech.edu',
  'university of texas': 'utexas.edu',
  'university of washington': 'washington.edu',
  'uc berkeley': 'berkeley.edu',
  'ucla': 'ucla.edu',
  'uc san diego': 'ucsd.edu',
  'uc davis': 'ucdavis.edu',
  'uc irvine': 'uci.edu',
  'uc santa barbara': 'ucsb.edu',
  'arizona state': 'asu.edu',
  'boston university': 'bu.edu',
  'northeastern university': 'northeastern.edu',
  'purdue university': 'purdue.edu',
  'ohio state': 'osu.edu',
  'penn state': 'psu.edu',
  'university of maryland': 'umd.edu',
  'virginia tech': 'vt.edu',
  'michigan state': 'msu.edu',
  // Canada
  'university of toronto': 'utoronto.ca',
  'toronto': 'utoronto.ca',
  'university of british columbia': 'ubc.ca',
  'mcgill university': 'mcgill.ca',
  'university of alberta': 'ualberta.ca',
  "queen's university": 'queensu.ca',
  'university of waterloo': 'uwaterloo.ca',
  'university of calgary': 'ucalgary.ca',
  // Australia
  'university of melbourne': 'unimelb.edu.au',
  'melbourne': 'unimelb.edu.au',
  'university of sydney': 'sydney.edu.au',
  'sydney': 'sydney.edu.au',
  'australian national university': 'anu.edu.au',
  'anu': 'anu.edu.au',
  'university of queensland': 'uq.edu.au',
  'monash university': 'monash.edu',
  'university of new south wales': 'unsw.edu.au',
  'unsw': 'unsw.edu.au',
  // Europe
  'eth zurich': 'ethz.ch',
  'eth': 'ethz.ch',
  'epfl': 'epfl.ch',
  'technical university of munich': 'tum.de',
  'ludwig maximilian university': 'lmu.de',
  'university of heidelberg': 'uni-heidelberg.de',
  'heidelberg university': 'uni-heidelberg.de',
  'rwth aachen': 'rwth-aachen.de',
  'sorbonne university': 'sorbonne-universite.fr',
  'sorbonne': 'sorbonne-universite.fr',
  'university of amsterdam': 'uva.nl',
  'delft university': 'tudelft.nl',
  'delft': 'tudelft.nl',
  'lund university': 'lu.se',
  'kth royal institute': 'kth.se',
  'kth': 'kth.se',
  'university of copenhagen': 'ku.dk',
  'aalto university': 'aalto.fi',
  'university of helsinki': 'helsinki.fi',
  'university of oslo': 'uio.no',
  'politecnico di milano': 'polimi.it',
  'university of bologna': 'unibo.it',
  'university of barcelona': 'ub.edu',
  // Asia
  'national university of singapore': 'nus.edu.sg',
  'nus': 'nus.edu.sg',
  'nanyang technological university': 'ntu.edu.sg',
  'ntu': 'ntu.edu.sg',
  'tsinghua university': 'tsinghua.edu.cn',
  'tsinghua': 'tsinghua.edu.cn',
  'peking university': 'pku.edu.cn',
  'fudan university': 'fudan.edu.cn',
  'zhejiang university': 'zju.edu.cn',
  'university of tokyo': 'u-tokyo.ac.jp',
  'kyoto university': 'kyoto-u.ac.jp',
  'seoul national university': 'snu.ac.kr',
  'korea advanced institute': 'kaist.ac.kr',
  'kaist': 'kaist.ac.kr',
  'hanyang university': 'hanyang.ac.kr',
  'university of hong kong': 'hku.hk',
  'hku': 'hku.hk',
  'chinese university of hong kong': 'cuhk.edu.hk',
  'hong kong polytechnic': 'polyu.edu.hk',
  'tongji university': 'tongji.edu.cn',
  // Middle East & Africa
  'king Abdullah university': 'kaust.edu.sa',
  'kaust': 'kaust.edu.sa',
  'king abdulaziz university': 'kau.edu.sa',
  'khalifa university': 'khalifauniversity.ac.ae',
  'technion': 'technion.ac.il',
  'hebrew university': 'huji.ac.il',
  'american university in cairo': 'aucegypt.edu',
  'university of cape town': 'uct.ac.za',
  'university of nairobi': 'uonbi.ac.ke',
  'stellenbosch university': 'sun.ac.za',
};

// ─── Country → ISO for flag API ──────────────────────────────
const COUNTRY_ISO: Record<string, string> = {
  'United Kingdom': 'gb', 'UK': 'gb',
  'United States': 'us', 'US': 'us',
  'Canada': 'ca', 'Australia': 'au',
  'Germany': 'de', 'France': 'fr',
  'Japan': 'jp', 'Netherlands': 'nl',
  'Switzerland': 'ch', 'Singapore': 'sg',
  'China': 'cn', 'India': 'in',
  'South Korea': 'kr', 'Korea, South': 'kr',
  'Italy': 'it', 'Spain': 'es',
  'Sweden': 'se', 'Norway': 'no',
  'New Zealand': 'nz', 'Ireland': 'ie',
  'Brazil': 'br', 'South Africa': 'za',
  'Nigeria': 'ng', 'Kenya': 'ke',
  'Mexico': 'mx', 'Argentina': 'ar',
  'Israel': 'il', 'Denmark': 'dk',
  'Finland': 'fi', 'Austria': 'at',
  'Belgium': 'be', 'Portugal': 'pt',
  'Poland': 'pl', 'Czech Republic': 'cz',
  'Greece': 'gr', 'Turkey': 'tr',
  'Thailand': 'th', 'Malaysia': 'my',
  'Colombia': 'co', 'Chile': 'cl',
  'UAE': 'ae', 'Egypt': 'eg',
  'International': 'un',
};

// ─── University Crest / Emblem URLs (Wikimedia Commons) ──────
const UNIVERSITY_CRESTS: Record<string, string> = {
  // UK
  'university of cambridge': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Cambridge_University_Coat_of_Arms.svg/200px-Cambridge_University_Coat_of_Arms.svg.png',
  'cambridge': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Cambridge_University_Coat_of_Arms.svg/200px-Cambridge_University_Coat_of_Arms.svg.png',
  'university of oxford': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Coat_of_Arms_of_the_University_of_Oxford.svg/200px-Coat_of_Arms_of_the_University_of_Oxford.svg.png',
  'oxford': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Coat_of_Arms_of_the_University_of_Oxford.svg/200px-Coat_of_Arms_of_the_University_of_Oxford.svg.png',
  'imperial college london': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Imperial_College_London_crest.svg/200px-Imperial_College_London_crest.svg.png',
  'imperial': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Imperial_College_London_crest.svg/200px-Imperial_College_London_crest.svg.png',
  'university college london': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/UCL_Logo.svg/200px-UCL_Logo.svg.png',
  'ucl': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/UCL_Logo.svg/200px-UCL_Logo.svg.png',
  "king's college london": 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/King%27s_College_London_logo.svg/200px-King%27s_College_London_logo.svg.png',
  'london school of economics': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/LSE_Logo.svg/200px-LSE_Logo.svg.png',
  'lse': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/LSE_Logo.svg/200px-LSE_Logo.svg.png',
  'university of manchester': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/University_of_Manchester_Logo.svg/200px-University_of_Manchester_Logo.svg.png',
  'university of edinburgh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Edinburgh_University_Crest.svg/200px-Edinburgh_University_Crest.svg.png',
  'university of bristol': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/University_of_Bristol_coat_of_arms.svg/200px-University_of_Bristol_coat_of_arms.svg.png',
  'university of glasgow': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/University_of_Glasgow_Coat_of_Arms.svg/200px-University_of_Glasgow_Coat_of_Arms.svg.png',
  'university of warwick': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Warwick_University_logo.svg/200px-Warwick_University_logo.svg.png',
  'university of bath': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/University_of_Bath_logo.svg/200px-University_of_Bath_logo.svg.png',
  // US
  'massachusetts institute of technology': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png',
  'mit': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png',
  'stanford university': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Stanford_University_seal.svg/200px-Stanford_University_seal.svg.png',
  'stanford': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Stanford_University_seal.svg/200px-Stanford_University_seal.svg.png',
  'harvard university': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Harvard_University_coat_of_arms.svg/200px-Harvard_University_coat_of_arms.svg.png',
  'harvard': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Harvard_University_coat_of_arms.svg/200px-Harvard_University_coat_of_arms.svg.png',
  'yale university': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Yale_University_Shield_1.svg/200px-Yale_University_Shield_1.svg.png',
  'yale': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Yale_University_Shield_1.svg/200px-Yale_University_Shield_1.svg.png',
  'princeton university': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Princeton_seal.svg/200px-Princeton_seal.svg.png',
  'princeton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Princeton_seal.svg/200px-Princeton_seal.svg.png',
  'columbia university': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Columbia_University_shield.svg/200px-Columbia_University_shield.svg.png',
  'columbia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Columbia_University_shield.svg/200px-Columbia_University_shield.svg.png',
  'caltech': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Seal_of_the_California_Institute_of_Technology.svg/200px-Seal_of_the_California_Institute_of_Technology.svg.png',
  'carnegie mellon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/CMU_Logo.svg/200px-CMU_Logo.svg.png',
  'cornell university': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Cornell_University_logo.svg/200px-Cornell_University_logo.svg.png',
  'duke university': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Duke_University_logo.svg/200px-Duke_University_logo.svg.png',
  'johns hopkins': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Johns_Hopkins_University_logo.svg/200px-Johns_Hopkins_University_logo.svg.png',
  'university of chicago': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/University_of_Chicago_shield.svg/200px-University_of_Chicago_shield.svg.png',
  'northwestern university': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Northwestern_University_logo.svg/200px-Northwestern_University_logo.svg.png',
  'university of pennsylvania': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Penn_Seal.svg/200px-Penn_Seal.svg.png',
  'uc berkeley': 'https://upload.wikimedia.org/wikipedia/thumb/4/4a/UC_Berkeley_logo.svg/200px-UC_Berkeley_logo.svg.png',
  'berkeley': 'https://upload.wikimedia.org/wikipedia/thumb/4/4a/UC_Berkeley_logo.svg/200px-UC_Berkeley_logo.svg.png',
  'georgia tech': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Georgia_Tech_logo.svg/200px-Georgia_Tech_logo.svg.png',
  'georgia institute': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Georgia_Tech_logo.svg/200px-Georgia_Tech_logo.svg.png',
  // Canada
  'university of toronto': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Utoronto_coa.svg/200px-Utoronto_coa.svg.png',
  'mcgill university': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/McGill_University_coat_of_arms.svg/200px-McGill_University_coat_of_arms.svg.png',
  'university of british columbia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UBC_coat_of_arms.svg/200px-UBC_coat_of_arms.svg.png',
  // Australia
  'university of melbourne': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/University_of_Melbourne_Logo.svg/200px-University_of_Melbourne_Logo.svg.png',
  'university of sydney': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/University_of_Sydney_coat_of_arms.svg/200px-University_of_Sydney_coat_of_arms.svg.png',
  'australian national university': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c1/Australian_National_University_logo.svg/200px-Australian_National_University_logo.svg.png',
  'anu': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c1/Australian_National_University_logo.svg/200px-Australian_National_University_logo.svg.png',
  'university of new south wales': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/96/UNSW_coat_of_arms.svg/200px-UNSW_coat_of_arms.svg.png',
  'unsw': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/96/UNSW_coat_of_arms.svg/200px-UNSW_coat_of_arms.svg.png',
  // Europe
  'eth zurich': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Eth-zurich-logo.svg/200px-Eth-zurich-logo.svg.png',
  'eth': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Eth-zurich-logo.svg/200px-Eth-zurich-logo.svg.png',
  'epfl': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/EPFL_Logo.svg/200px-EPFL_Logo.svg.png',
  'delft university': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Technische_Universiteit_Delft_logo.svg/200px-Technische_Universiteit_Delft_logo.svg.png',
  'delft': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Technische_Universiteit_Delft_logo.svg/200px-Technische_Universiteit_Delft_logo.svg.png',
  'sorbonne university': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sorbonne_Universit%C3%A9_logo.svg/200px-Sorbonne_Universit%C3%A9_logo.svg.png',
  'sorbonne': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sorbonne_Universit%C3%A9_logo.svg/200px-Sorbonne_Universit%C3%A9_logo.svg.png',
  // Asia
  'national university of singapore': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/NUS_coat_of_arms.svg/200px-NUS_coat_of_arms.svg.png',
  'nus': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/NUS_coat_of_arms.svg/200px-NUS_coat_of_arms.svg.png',
  'university of tokyo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/The_University_of_Tokyo_logo.svg/200px-The_University_of_Tokyo_logo.svg.png',
  'tsinghua university': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Tsinghua_University_logo.svg/200px-Tsinghua_University_logo.svg.png',
  'tsinghua': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Tsinghua_University_logo.svg/200px-Tsinghua_University_logo.svg.png',
  'seoul national university': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Seoul_National_University_logo.svg/200px-Seoul_National_University_logo.svg.png',
  // Middle East
  'technion': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Technion-logo.svg/200px-Technion-logo.svg.png',
  'hebrew university': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Hebrew_University_logo.svg/200px-Hebrew_University_logo.svg.png',
};

// ─── Color palette for generated crests ──────────────────────
const CREST_COLORS = [
  { bg: '#031632', fg: '#ffffff', accent: '#006591' },
  { bg: '#1a237e', fg: '#ffffff', accent: '#7c4dff' },
  { bg: '#0d47a1', fg: '#ffffff', accent: '#40c4ff' },
  { bg: '#1b5e20', fg: '#ffffff', accent: '#69f0ae' },
  { bg: '#b71c1c', fg: '#ffffff', accent: '#ff8a80' },
  { bg: '#4a148c', fg: '#ffffff', accent: '#ea80fc' },
  { bg: '#e65100', fg: '#ffffff', accent: '#ffab40' },
  { bg: '#006064', fg: '#ffffff', accent: '#84ffff' },
];

// ─── Public API ──────────────────────────────────────────────

/** Get a campus photo URL for a given country. */
export function getCampusPhoto(country: string): string | null {
  const normalized = country.trim();
  if (CAMPUS_PHOTOS[normalized]) return CAMPUS_PHOTOS[normalized];

  const lower = normalized.toLowerCase();
  for (const [key, url] of Object.entries(CAMPUS_PHOTOS)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return url;
    }
  }
  return null;
}

/** Get a country flag emoji for a country name. */
export function getCountryFlag(country: string): string {
  const iso = COUNTRY_ISO[country.trim()];
  if (!iso) {
    // Fallback: try partial match
    const lower = country.toLowerCase();
    for (const [key, code] of Object.entries(COUNTRY_ISO)) {
      if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
        return isoToEmoji(code);
      }
    }
    return '🌍';
  }
  return isoToEmoji(iso);
}

function isoToEmoji(code: string): string {
  const base = 0x1f1e6;
  return String.fromCodePoint(base + code.charCodeAt(0) - 65, base + code.charCodeAt(1) - 65);
}

/**
 * Get a university logo URL.
 * Returns a Google favicon URL for known universities, or null.
 */
export function getUniversityLogo(universityName: string): string | null {
  const lower = universityName.toLowerCase().trim();

  // Direct match
  if (UNIVERSITY_DOMAINS[lower]) {
    return `https://www.google.com/s2/favicons?domain=${UNIVERSITY_DOMAINS[lower]}&sz=128`;
  }

  // Partial match
  for (const [key, domain] of Object.entries(UNIVERSITY_DOMAINS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }
  }

  return null;
}

/**
 * Generate a university crest/badge as an SVG data URI.
 * Uses the university's initials with a shield shape.
 * Falls back to a country flag themed badge for "Various" universities.
 */
export function getUniversityCrest(universityName: string, country?: string): string {
  const name = universityName.trim();

  // For "Various" or generic names, create a country-themed badge
  if (name.toLowerCase().includes('various') || name.toLowerCase().includes('partner')) {
    const flag = country ? getCountryFlag(country) : '🎓';
    const initials = '🎓';
    return generateShieldSVG(initials, getColorsForText(name));
  }

  // Extract initials from university name
  const initials = extractInitials(name);
  const colors = getColorsForText(name);
  return generateShieldSVG(initials, colors);
}

function extractInitials(name: string): string {
  // Remove common prefixes
  const cleaned = name
    .replace(/^(university of|institute of|school of|college of)\s+/i, '')
    .replace(/\s+(university|institute|college|school)$/i, '')
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function getColorsForText(text: string): { bg: string; fg: string; accent: string } {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CREST_COLORS[Math.abs(hash) % CREST_COLORS.length];
}

function generateShieldSVG(initials: string, colors: { bg: string; fg: string; accent: string }): string {
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 100 100" width="96" height="96">
    <defs>
      <linearGradient id="sg${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1"/>
        <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1"/>
      </linearGradient>
    </defs>
    <path d="M48 6 L86 18 L86 44 C86 62 70 80 48 88 C26 80 10 62 10 44 L10 18 Z" fill="url(#sg${uid})" stroke="${colors.accent}" stroke-width="1.5"/>
    <text x="48" y="56" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${initials.length > 2 ? '22' : '26'}" font-weight="700" fill="${colors.fg}" letter-spacing="2">${initials}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Get a university crest/badge.
 * Priority: Wikimedia crest → Google favicon → generated SVG shield.
 * @param officialLink - optional scholarship URL to extract favicon domain from
 */
export function getUniversityBadge(universityName: string, country?: string, officialLink?: string): string {
  const lower = universityName.toLowerCase().trim();

  // 1. Wikimedia crest — direct match
  if (UNIVERSITY_CRESTS[lower]) return UNIVERSITY_CRESTS[lower];

  // 2. Wikimedia crest — partial match
  for (const [key, url] of Object.entries(UNIVERSITY_CRESTS)) {
    if (lower.includes(key) || key.includes(lower)) return url;
  }

  // 3. Google favicon from domain map
  const logo = getUniversityLogo(universityName);
  if (logo) return logo;

  // 4. Google favicon from official link domain
  if (officialLink) {
    try {
      const hostname = new URL(officialLink).hostname.replace('www.', '');
      if (hostname) return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch { /* invalid URL, ignore */ }
  }

  // 5. Generated SVG shield
  return getUniversityCrest(universityName, country);
}

/** Generate a gradient CSS string as a fallback when no photo is available. */
export function getFallbackGradient(country: string): string {
  const hash = country.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 30%), hsl(${hue2}, 60%, 20%))`;
}
