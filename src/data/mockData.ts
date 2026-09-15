import {
  Prospect,
  Campaign,
  InboxThread,
  MailboxAccount,
  Integration,
  UsageRecord,
  Sequence,
  NeedsAttentionItem,
} from '../types';

export const mockUser = {
  id: 'usr_01',
  name: 'Alex Vance',
  email: 'alex@growthstudio.co',
  role: 'owner' as const,
  workspaceId: 'ws_01',
};

export const mockWorkspace = {
  id: 'ws_01',
  name: 'GrowthStudio Partners',
  plan: 'Growth' as const,
  slug: 'growthstudio',
  membersCount: 4,
};

export const mockUsage: UsageRecord = {
  prospectsResearched: 1284,
  prospectsResearchedLimit: 2000,
  aiResearchCredits: 684,
  aiResearchCreditsLimit: 1000,
  verifiedContacts: 438,
  verifiedContactsLimit: 500,
  emailsSent: 862,
  emailsSentLimit: 1500,
  plan: 'Growth Plan',
  billingDate: 'Oct 01, 2026',
  monthlyCost: 199,
};

export const mockNeedsAttention: NeedsAttentionItem[] = [
  {
    id: 'att_1',
    type: 'approval',
    title: '7 leads require manual approval',
    description: 'High-fit prospects from Texas Kitchen Remodelers pending email preview verification.',
    actionText: 'Review leads',
    targetTab: 'prospects',
  },
  {
    id: 'att_2',
    type: 'reply',
    title: '3 replies need your personal response',
    description: 'James Carter and 2 others requested mockups or pricing information.',
    actionText: 'Open Inbox',
    targetTab: 'inbox',
  },
  {
    id: 'att_3',
    type: 'limit',
    title: 'Mailbox approaching daily threshold',
    description: 'alex@growthstudio.co has sent 24 of 35 warm-up emails for today.',
    actionText: 'View Mailbox',
    targetTab: 'settings',
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'cmp_1',
    name: 'Texas Kitchen Remodelers',
    audienceQuery: 'High-end residential kitchen remodeling companies in Texas with outdated websites',
    targetIndustry: 'Kitchen & Bath',
    targetGeography: 'Texas, United States',
    status: 'active',
    stats: {
      prospects: 482,
      contacted: 417,
      sent: 319,
      replies: 24,
      positiveReplies: 8,
      meetings: 4,
    },
    createdAt: '2026-08-28',
    mailboxEmail: 'alex@growthstudio.co',
    dailyLimit: 35,
    sequenceStepsCount: 4,
  },
  {
    id: 'cmp_2',
    name: 'Florida Interior Designers',
    audienceQuery: 'Commercial and residential interior design firms in Florida with 5-30 employees',
    targetIndustry: 'Interior Design',
    targetGeography: 'Florida, United States',
    status: 'active',
    stats: {
      prospects: 315,
      contacted: 270,
      sent: 208,
      replies: 17,
      positiveReplies: 6,
      meetings: 3,
    },
    createdAt: '2026-09-02',
    mailboxEmail: 'alex@growthstudio.co',
    dailyLimit: 30,
    sequenceStepsCount: 4,
  },
  {
    id: 'cmp_3',
    name: 'Pacific Northwest Roofing Contractors',
    audienceQuery: 'Residential and commercial roofers in Washington and Oregon with slow mobile speeds',
    targetIndustry: 'Roofing & Exterior',
    targetGeography: 'Washington & Oregon',
    status: 'active',
    stats: {
      prospects: 240,
      contacted: 210,
      sent: 180,
      replies: 11,
      positiveReplies: 3,
      meetings: 1,
    },
    createdAt: '2026-09-08',
    mailboxEmail: 'outreach@growthstudio.co',
    dailyLimit: 25,
    sequenceStepsCount: 3,
  },
  {
    id: 'cmp_4',
    name: 'Midwest HVAC Specialists',
    audienceQuery: 'Family-owned HVAC and mechanical service contractors in Ohio and Michigan',
    targetIndustry: 'HVAC Services',
    targetGeography: 'Midwest, United States',
    status: 'draft',
    stats: {
      prospects: 185,
      contacted: 0,
      sent: 0,
      replies: 0,
      positiveReplies: 0,
      meetings: 0,
    },
    createdAt: '2026-09-12',
    mailboxEmail: 'alex@growthstudio.co',
    dailyLimit: 30,
    sequenceStepsCount: 4,
  },
];

export const mockProspects: Prospect[] = [
  {
    id: 'pr_1',
    companyId: 'co_1',
    company: {
      id: 'co_1',
      name: 'Stone & Oak Remodeling',
      domain: 'stoneandoak.com',
      industry: 'Kitchen Remodeling',
      location: 'Austin, TX',
      city: 'Austin',
      state: 'TX',
      country: 'United States',
      employeeCount: '12-25',
      websiteUrl: 'https://stoneandoak.com',
      websiteQualityScore: 54,
      phone: '+1 (512) 489-2011',
      description:
        'Stone & Oak is a premier residential remodeling company specializing in kitchen renovations, custom cabinetry, and full-home architectural transformations.',
    },
    contact: {
      id: 'ct_1',
      fullName: 'James Carter',
      firstName: 'James',
      lastName: 'Carter',
      role: 'Owner & Managing Principal',
      email: 'jcarter@stoneandoak.com',
      emailVerified: true,
      phone: '+1 (512) 489-2011 ext. 101',
      linkedinUrl: 'https://linkedin.com/in/jamescarter-stoneandoak',
    },
    fitScore: 92,
    fitScoreBreakdown: {
      businessRelevance: 25,
      commercialValue: 20,
      websiteOpportunity: 19,
      activity: 14,
      contactability: 9,
      digitalPresence: 8,
    },
    fitLabel: 'Excellent fit',
    primaryProblem: 'Quote CTA buried on mobile navigation',
    status: 'ready',
    campaignId: 'cmp_1',
    campaignName: 'Texas Kitchen Remodelers',
    createdAt: '2026-09-10',
    research: {
      summary:
        'Stone & Oak is a residential remodeling company specializing in luxury kitchen renovations, custom cabinetry and full-home transformations.',
      whyTheyFit: [
        'High-ticket residential service ($45k–$150k avg project size)',
        'Active and recent portfolio with verified 2026 project photography',
        'Strong Google Reviews profile (4.9 stars, 84 reviews)',
        'Owner-operated decision structure with direct commercial accountability',
        'Weak website conversion path losing mobile inquiries',
      ],
      websiteOpportunities: [
        {
          id: 'wo_1',
          issue: 'Primary consultation CTA is below the fold',
          detail: 'On viewport heights under 800px, the hero text pushes the "Book Design Consultation" action off-screen.',
          sourceUrl: 'https://stoneandoak.com/',
        },
        {
          id: 'wo_2',
          issue: 'Mobile navigation hides the quote action',
          detail: 'Mobile hamburger drawer nests the contact action inside a sub-menu labeled "Company".',
          sourceUrl: 'https://stoneandoak.com/nav',
        },
        {
          id: 'wo_3',
          issue: 'Project portfolio lacks clear project outcomes',
          detail: 'Projects feature high quality visuals but omit timeline, scope details, and budget brackets.',
          sourceUrl: 'https://stoneandoak.com/portfolio',
        },
        {
          id: 'wo_4',
          issue: 'No strong social proof near conversion points',
          detail: 'Client reviews are isolated to a separate testimonials page rather than embedded alongside the inquiry form.',
          sourceUrl: 'https://stoneandoak.com/contact',
        },
      ],
      techStack: ['WordPress', 'Elementor', 'Google Analytics 4', 'WP Engine'],
      recentSignals: [
        'Featured in Austin Home & Design Q2 2026 issue',
        'Added 4 completed kitchen remodel galleries in August 2026',
        'Active hiring post for Senior Estimator on LinkedIn',
      ],
      suggestedAngle: 'Lead with specific mobile quote CTA friction and offering a clean visual Figma redesign mockup.',
    },
    generatedEmail: {
      subject: 'Quick idea for Stone & Oak',
      body: `Hi James,

I was looking through Stone & Oak and your kitchen work genuinely stands out.

I noticed the consultation CTA is quite easy to miss on mobile, even though most homeowners will probably discover you there first.

I mocked up a cleaner direction that puts the project work and quote flow front and center.

Happy to send it over if you'd like to see it.

— Alex`,
      personalizations: [
        {
          text: 'your kitchen work',
          source: 'https://stoneandoak.com/portfolio/rollingwood-kitchen',
          explanation: 'Referencing their recent Rollingwood and Westlake custom cabinetry showcases.',
        },
        {
          text: 'consultation CTA',
          source: 'https://stoneandoak.com/ (Mobile viewport 390px)',
          explanation: 'Directly points out that the Book Consultation button is 420px below screen viewport.',
        },
      ],
      charCount: 382,
    },
    activities: [
      {
        id: 'act_1',
        type: 'discovered',
        title: 'Discovered via Texas Kitchen Remodelers search',
        timestamp: 'Sep 10, 10:14 AM',
      },
      {
        id: 'act_2',
        type: 'researched',
        title: 'AI crawler extracted 18 pages & analyzed mobile viewports',
        description: 'Identified 4 conversion opportunities; calculated fit score 92/100.',
        timestamp: 'Sep 10, 10:15 AM',
      },
      {
        id: 'act_3',
        type: 'verified',
        title: 'Email verified via MX and SMTP handshake',
        description: 'jcarter@stoneandoak.com marked 100% deliverable.',
        timestamp: 'Sep 10, 10:16 AM',
      },
      {
        id: 'act_4',
        type: 'added_to_campaign',
        title: 'Assigned to Texas Kitchen Remodelers campaign',
        timestamp: 'Sep 10, 10:18 AM',
      },
    ],
  },
  {
    id: 'pr_2',
    companyId: 'co_2',
    company: {
      id: 'co_2',
      name: 'Northline Kitchens',
      domain: 'northlinekitchens.com',
      industry: 'Cabinetry & Remodel',
      location: 'Dallas, TX',
      city: 'Dallas',
      state: 'TX',
      country: 'United States',
      employeeCount: '8-15',
      websiteUrl: 'https://northlinekitchens.com',
      websiteQualityScore: 62,
      phone: '+1 (214) 772-8830',
      description:
        'Bespoke kitchen design showroom and full architectural remodeling group serving the Park Cities and Lakewood areas.',
    },
    contact: {
      id: 'ct_2',
      fullName: 'Sarah Jenkins',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: 'Founder & Lead Designer',
      email: 'sjenkins@northlinekitchens.com',
      emailVerified: true,
      linkedinUrl: 'https://linkedin.com/in/sarahjenkins-northline',
    },
    fitScore: 89,
    fitScoreBreakdown: {
      businessRelevance: 24,
      commercialValue: 19,
      websiteOpportunity: 18,
      activity: 13,
      contactability: 8,
      digitalPresence: 7,
    },
    fitLabel: 'Excellent fit',
    primaryProblem: 'No project outcome metrics on case studies',
    status: 'in_sequence',
    campaignId: 'cmp_1',
    campaignName: 'Texas Kitchen Remodelers',
    createdAt: '2026-09-09',
    research: {
      summary:
        'Northline Kitchens operates a high-end showroom in Dallas with dedicated installation crews for architectural cabinetry.',
      whyTheyFit: [
        'Luxury residential clientele with $60k+ average contract',
        'Strong brand photography on Instagram and Houzz',
        'Website lacks lead magnet or digital consultation scheduler',
      ],
      websiteOpportunities: [
        {
          id: 'wo_21',
          issue: 'No instant consultation booking link',
          detail: 'Requires visitors to manually type their phone and await an unconfirmed email callback.',
          sourceUrl: 'https://northlinekitchens.com/contact',
        },
      ],
      techStack: ['Squarespace', 'Typeform'],
      recentSignals: ['Expanded into Lakewood showroom in July 2026'],
      suggestedAngle: 'Propose an interactive kitchen cost estimator tool to capture high-intent leads.',
    },
    generatedEmail: {
      subject: 'Question regarding Northline consultation flow',
      body: `Hi Sarah,

Your Park Cities kitchen builds are exceptional — the custom fluted oak cabinetry on the Mockingbird project in particular.

I noticed high-intent visitors still have to fill out an open text field and wait for manual follow-up rather than picking a direct showroom slot.

Put together an idea for a clean instant booking flow that preserves your boutique feel. 

Would you be open to seeing a 2-minute overview?

— Alex`,
      personalizations: [
        {
          text: 'custom fluted oak cabinetry on the Mockingbird project',
          source: 'https://northlinekitchens.com/mockingbird-lane',
          explanation: 'Referencing recent custom installation showcased on home page.',
        },
      ],
      charCount: 420,
    },
    activities: [
      {
        id: 'act_21',
        type: 'discovered',
        title: 'Discovered via Texas Kitchen Remodelers search',
        timestamp: 'Sep 09, 02:20 PM',
      },
      {
        id: 'act_22',
        type: 'sent',
        title: 'Initial cold email dispatched',
        description: 'Delivered via alex@growthstudio.co',
        timestamp: 'Sep 10, 09:00 AM',
      },
    ],
  },
  {
    id: 'pr_3',
    companyId: 'co_3',
    company: {
      id: 'co_3',
      name: 'Arbor Interior Studio',
      domain: 'arborinterior.com',
      industry: 'Interior Design',
      location: 'Houston, TX',
      city: 'Houston',
      state: 'TX',
      country: 'United States',
      employeeCount: '15-30',
      websiteUrl: 'https://arborinterior.com',
      websiteQualityScore: 48,
      description:
        'Award-winning interior architecture firm specializing in luxury residential estates and boutique hospitality.',
    },
    contact: {
      id: 'ct_3',
      fullName: 'David Chen',
      firstName: 'David',
      lastName: 'Chen',
      role: 'Principal Architect & Partner',
      email: 'david@arborinterior.com',
      emailVerified: true,
      linkedinUrl: 'https://linkedin.com/in/davidchen-arbor',
    },
    fitScore: 94,
    fitScoreBreakdown: {
      businessRelevance: 25,
      commercialValue: 20,
      websiteOpportunity: 20,
      activity: 14,
      contactability: 8,
      digitalPresence: 7,
    },
    fitLabel: 'Excellent fit',
    primaryProblem: 'Slow portfolio asset loading & missing booking link',
    status: 'interested',
    campaignId: 'cmp_1',
    campaignName: 'Texas Kitchen Remodelers',
    createdAt: '2026-09-08',
    research: {
      summary:
        'Arbor Interior Studio is a premier Texas architecture collective with projects featured in Architectural Digest.',
      whyTheyFit: [
        'Highest commercial contract tier in the region',
        'Large unoptimized 14MB images severely degrading mobile page experience (PageSpeed 24/100)',
      ],
      websiteOpportunities: [
        {
          id: 'wo_31',
          issue: 'Uncompressed hero media causing 4.8s initial render',
          detail: 'Mobile users on cellular experience high bounce before project gallery renders.',
          sourceUrl: 'https://arborinterior.com/',
        },
      ],
      techStack: ['Webflow', 'Cloudflare'],
      recentSignals: ['Announced new Memorial Drive residential estate project'],
      suggestedAngle: 'Demonstrate performance gains and streamlined client intake.',
    },
    generatedEmail: {
      subject: 'Idea for Arbor Interior Studio portfolio',
      body: `Hi David,

The lighting design on the River Oaks estate project was remarkable.

I noticed the mobile gallery takes around 5 seconds to load on mobile because of uncompressed assets, which might be losing interested prospects before they see the full build.

I put together a quick breakdown of how to keep full retina quality while cutting load time under 1s.

Would you be open to taking a look?

— Alex`,
      personalizations: [
        {
          text: 'River Oaks estate project',
          source: 'https://arborinterior.com/projects/river-oaks',
          explanation: 'Mentioning recent headline residential project in Houston.',
        },
      ],
      charCount: 395,
    },
    activities: [
      {
        id: 'act_31',
        type: 'sent',
        title: 'Email 1 dispatched',
        timestamp: 'Sep 08, 11:30 AM',
      },
      {
        id: 'act_32',
        type: 'reply_received',
        title: 'Reply received from David Chen',
        description: '"We\'re actually looking at a portfolio redesign in Q4. What does your turnaround look like?"',
        timestamp: 'Sep 09, 04:12 PM',
      },
      {
        id: 'act_33',
        type: 'marked_interested',
        title: 'Classified as Positive / Interested lead',
        timestamp: 'Sep 09, 04:15 PM',
      },
    ],
  },
  {
    id: 'pr_4',
    companyId: 'co_4',
    company: {
      id: 'co_4',
      name: 'Summit Roofing Co.',
      domain: 'summitroofingfl.com',
      industry: 'Roofing & Exterior',
      location: 'Tampa, FL',
      city: 'Tampa',
      state: 'FL',
      country: 'United States',
      employeeCount: '25-50',
      websiteUrl: 'https://summitroofingfl.com',
      websiteQualityScore: 58,
      description: 'Full-service commercial and residential storm restoration roofing contractor.',
    },
    contact: {
      id: 'ct_4',
      fullName: 'Marcus Vance',
      firstName: 'Marcus',
      lastName: 'Vance',
      role: 'Managing Director',
      email: 'mvance@summitroofingfl.com',
      emailVerified: true,
    },
    fitScore: 88,
    fitScoreBreakdown: {
      businessRelevance: 23,
      commercialValue: 19,
      websiteOpportunity: 18,
      activity: 12,
      contactability: 9,
      digitalPresence: 7,
    },
    fitLabel: 'Excellent fit',
    primaryProblem: 'Emergency repair contact number not click-to-call',
    status: 'contacted',
    campaignId: 'cmp_2',
    campaignName: 'Florida Interior Designers',
    createdAt: '2026-09-07',
    research: {
      summary: 'Summit Roofing specializes in tile, metal and hurricane-rated exterior roofing systems.',
      whyTheyFit: ['High ticket repair contracts and urgent consumer demand needing instant call triggers.'],
      websiteOpportunities: [
        {
          id: 'wo_41',
          issue: 'Plain text phone number without tel: markup',
          detail: 'Mobile visitors cannot tap to dial during storm repair inquiries.',
          sourceUrl: 'https://summitroofingfl.com/emergency',
        },
      ],
      techStack: ['WordPress', 'Divi'],
      recentSignals: ['Expanded fleet with 6 new service trucks'],
      suggestedAngle: 'Click-to-call conversion rate boost during peak weather events.',
    },
    generatedEmail: {
      subject: 'Quick mobile fix for Summit Roofing',
      body: `Hi Marcus,

Saw Summit's recent expansion in Hillsborough County — great work.

Noticed the emergency response header on your site has plain text numbers that aren't tap-to-call on mobile, forcing customers to copy-paste.

Created a quick preview showing how a sticky quick-dispatch button would look.

Happy to share if relevant.

— Alex`,
      personalizations: [
        {
          text: 'expansion in Hillsborough County',
          source: 'https://summitroofingfl.com/about',
          explanation: 'Referenced regional coverage update published last month.',
        },
      ],
      charCount: 350,
    },
    activities: [
      {
        id: 'act_41',
        type: 'sent',
        title: 'Initial cold email dispatched',
        timestamp: 'Sep 09, 01:15 PM',
      },
    ],
  },
  {
    id: 'pr_5',
    companyId: 'co_5',
    company: {
      id: 'co_5',
      name: 'Mason & Reed Construction',
      domain: 'masonreed.com',
      industry: 'General Contracting',
      location: 'Atlanta, GA',
      city: 'Atlanta',
      state: 'GA',
      country: 'United States',
      employeeCount: '30-75',
      websiteUrl: 'https://masonreed.com',
      websiteQualityScore: 66,
      description: 'Commercial interior build-outs, corporate tenant improvements, and historical renovations.',
    },
    contact: {
      id: 'ct_5',
      fullName: 'Elena Rostova',
      firstName: 'Elena',
      lastName: 'Rostova',
      role: 'VP Business Development',
      email: 'erostova@masonreed.com',
      emailVerified: true,
      linkedinUrl: 'https://linkedin.com/in/elena-rostova-mr',
    },
    fitScore: 91,
    fitScoreBreakdown: {
      businessRelevance: 25,
      commercialValue: 20,
      websiteOpportunity: 18,
      activity: 13,
      contactability: 8,
      digitalPresence: 7,
    },
    fitLabel: 'Excellent fit',
    primaryProblem: 'Commercial bid qualification form has 14 required fields',
    status: 'ready',
    campaignId: 'cmp_1',
    campaignName: 'Texas Kitchen Remodelers',
    createdAt: '2026-09-11',
    research: {
      summary: 'Mason & Reed handles large-scale commercial retrofits and historical restorations across the Southeast.',
      whyTheyFit: ['High contract values ($250k–$2M) with high friction online lead qualification form.'],
      websiteOpportunities: [
        {
          id: 'wo_51',
          issue: '14-step single page form causing 82% abandonment rate estimate',
          detail: 'Asking for blueprints and tax IDs on step 1 stops preliminary developer inquiries.',
          sourceUrl: 'https://masonreed.com/rfp',
        },
      ],
      techStack: ['Custom React', 'HubSpot Form Embed'],
      recentSignals: ['Won 2026 AGC Building Excellence Award'],
      suggestedAngle: 'Multi-step conversational qualification for commercial developers.',
    },
    generatedEmail: {
      subject: 'Bid inquiry flow at Mason & Reed',
      body: `Hi Elena,

Congrats on the AGC Building Excellence Award — the Midtown historical restoration was a masterclass in detail.

I took a look at your commercial RFP page and noticed the 14-field upfront form might be giving developers pause before they even share basic project parameters.

Put together a simplified 3-step intake that pre-qualifies developer intent without the friction.

Would you be open to taking a look?

— Alex`,
      personalizations: [
        {
          text: 'AGC Building Excellence Award',
          source: 'https://masonreed.com/news/agc-award-2026',
          explanation: 'Recent industry award announced on their media page.',
        },
      ],
      charCount: 430,
    },
    activities: [
      {
        id: 'act_51',
        type: 'discovered',
        title: 'Prospect identified',
        timestamp: 'Sep 11, 08:30 AM',
      },
    ],
  },
  {
    id: 'pr_6',
    companyId: 'co_6',
    company: {
      id: 'co_6',
      name: 'Apex Mechanical Services',
      domain: 'apexmech.com',
      industry: 'HVAC Services',
      location: 'Denver, CO',
      city: 'Denver',
      state: 'CO',
      country: 'United States',
      employeeCount: '40-100',
      websiteUrl: 'https://apexmech.com',
      websiteQualityScore: 52,
      description: 'Industrial and commercial heating, ventilation, air conditioning and building controls.',
    },
    contact: {
      id: 'ct_6',
      fullName: 'Thomas Keller',
      firstName: 'Thomas',
      lastName: 'Keller',
      role: 'Operations Director',
      email: 'tkeller@apexmech.com',
      emailVerified: true,
    },
    fitScore: 84,
    fitScoreBreakdown: {
      businessRelevance: 22,
      commercialValue: 18,
      websiteOpportunity: 19,
      activity: 11,
      contactability: 7,
      digitalPresence: 7,
    },
    fitLabel: 'Strong fit',
    primaryProblem: 'Maintenance page lacks pricing transparency or instant quoting',
    status: 'in_sequence',
    createdAt: '2026-09-06',
    research: {
      summary: 'Apex Mechanical provides continuous preventive maintenance contracts for corporate campuses and logistics facilities.',
      whyTheyFit: ['Recurring commercial revenue model with outdated static sales pages.'],
      websiteOpportunities: [
        {
          id: 'wo_61',
          issue: 'No online scope builder for preventive service agreements',
          detail: 'Commercial property managers cannot estimate annual maintenance tiers.',
          sourceUrl: 'https://apexmech.com/commercial',
        },
      ],
      techStack: ['Joomla', 'Apache'],
      recentSignals: ['Secured municipal transit facility HVAC upgrade'],
      suggestedAngle: 'Interactive maintenance package configurator.',
    },
    generatedEmail: {
      subject: 'Preventive service pages at Apex',
      body: `Hi Thomas,

Saw Apex's recent work on the transit center retrofit — impressive turnaround time.

Noticed facility managers looking for preventive service contracts currently have to download a static PDF to review coverage tiers.

Created a quick mock showing an interactive scope selector for commercial accounts.

Would love to send over the Figma preview if you're interested.

— Alex`,
      personalizations: [
        {
          text: 'transit center retrofit',
          source: 'https://apexmech.com/case-studies/transit-center',
          explanation: 'Cites newly completed municipal facility overhaul.',
        },
      ],
      charCount: 390,
    },
    activities: [
      {
        id: 'act_61',
        type: 'sent',
        title: 'Step 1 delivered',
        timestamp: 'Sep 06, 09:14 AM',
      },
    ],
  },
  {
    id: 'pr_7',
    companyId: 'co_7',
    company: {
      id: 'co_7',
      name: 'Timberline Custom Homes',
      domain: 'timberlinehomes.com',
      industry: 'Luxury Residential',
      location: 'Bozeman, MT',
      city: 'Bozeman',
      state: 'MT',
      country: 'United States',
      employeeCount: '10-20',
      websiteUrl: 'https://timberlinehomes.com',
      websiteQualityScore: 51,
      description: 'Mountain contemporary timber frame and high-efficiency custom residences across Big Sky and Paradise Valley.',
    },
    contact: {
      id: 'ct_7',
      fullName: 'Garrett Stone',
      firstName: 'Garrett',
      lastName: 'Stone',
      role: 'Principal Builder & Founder',
      email: 'garrett@timberlinehomes.com',
      emailVerified: true,
      linkedinUrl: 'https://linkedin.com/in/garrettstone-timberline',
    },
    fitScore: 93,
    fitScoreBreakdown: {
      businessRelevance: 25,
      commercialValue: 20,
      websiteOpportunity: 19,
      activity: 14,
      contactability: 8,
      digitalPresence: 7,
    },
    fitLabel: 'Excellent fit',
    primaryProblem: 'Virtual model home tour broken on Safari iOS',
    status: 'interested',
    createdAt: '2026-09-05',
    research: {
      summary: 'Timberline builds $3M–$12M custom mountain estates with heavy emphasis on sustainable thermal envelope engineering.',
      whyTheyFit: ['Ultra high ticket buyers discovering properties remotely on iPhones.'],
      websiteOpportunities: [
        {
          id: 'wo_71',
          issue: 'Matterport 3D embed throws WebGL context crash on iOS Safari',
          detail: 'Wealthy out-of-state buyers on iPads experience black screens on the main showcase.',
          sourceUrl: 'https://timberlinehomes.com/virtual-tour',
        },
      ],
      techStack: ['Squarespace', 'Matterport Embed'],
      recentSignals: ['Completed Big Sky ridge estate featured in Mountain Living'],
      suggestedAngle: 'Fixing Safari WebGL virtual walkthroughs for remote luxury buyers.',
    },
    generatedEmail: {
      subject: 'Safari walkthrough on Timberline site',
      body: `Hi Garrett,

The timber architecture on the Big Sky ridge home is stunning — that south-facing curtain wall is remarkable.

I was testing the virtual walkthrough on an iPhone and noticed the 3D tour container fails to render on Safari due to a WebGL script conflict.

Since a lot of out-of-state buyers review homes on their phones, I put together a quick fix to make it load instantly without crashes.

Happy to share the code snippet if useful.

— Alex`,
      personalizations: [
        {
          text: 'Big Sky ridge home',
          source: 'https://timberlinehomes.com/portfolio/big-sky',
          explanation: 'Flagship luxury residence featured on homepage.',
        },
      ],
      charCount: 425,
    },
    activities: [
      {
        id: 'act_71',
        type: 'meeting_booked',
        title: 'Meeting booked for Thursday, 2:00 PM MT',
        description: 'Garrett booked via Calendly link after positive email reply.',
        timestamp: 'Sep 08, 10:30 AM',
      },
    ],
  },
  {
    id: 'pr_8',
    companyId: 'co_8',
    company: {
      id: 'co_8',
      name: 'Vanguard Millwork',
      domain: 'vanguardmillwork.com',
      industry: 'Architectural Woodwork',
      location: 'Chicago, IL',
      city: 'Chicago',
      state: 'IL',
      country: 'United States',
      employeeCount: '15-40',
      websiteUrl: 'https://vanguardmillwork.com',
      websiteQualityScore: 44,
      description: 'Precision architectural millwork and casework for premier corporate headquarters and cultural institutions.',
    },
    contact: {
      id: 'ct_8',
      fullName: 'Julian Ortiz',
      firstName: 'Julian',
      lastName: 'Ortiz',
      role: 'Founder & Managing Director',
      email: 'jortiz@vanguardmillwork.com',
      emailVerified: false,
    },
    fitScore: 79,
    fitScoreBreakdown: {
      businessRelevance: 21,
      commercialValue: 18,
      websiteOpportunity: 19,
      activity: 10,
      contactability: 5,
      digitalPresence: 6,
    },
    fitLabel: 'Moderate fit',
    primaryProblem: 'Email address needs secondary MX verification check',
    status: 'unverified',
    createdAt: '2026-09-12',
    research: {
      summary: 'Vanguard manufactures custom acoustic wood paneling and boardroom tables for Fortune 500 offices.',
      whyTheyFit: ['High contract size but secondary verification required before outbound sequence.'],
      websiteOpportunities: [
        {
          id: 'wo_81',
          issue: 'Portfolio images lack high resolution zoom',
          detail: 'Architects specifying millwork cannot verify grain match quality.',
          sourceUrl: 'https://vanguardmillwork.com/projects',
        },
      ],
      techStack: ['WordPress'],
      recentSignals: ['Supplied paneling for Chicago Symphony Orchestra rehearsal hall'],
      suggestedAngle: 'Architect specification portals and high-res grain viewers.',
    },
    generatedEmail: {
      subject: 'Architect showcase for Vanguard Millwork',
      body: `Hi Julian,

Your acoustic panel work for the Symphony Orchestra hall was extraordinary.

I noticed that architects visiting your digital catalog can't zoom in to inspect wood grain matching or joinery details, which often delays specification in bid packages.

Created a quick concept of an interactive architectural specimen viewer.

Would you like me to send over the link?

— Alex`,
      personalizations: [
        {
          text: 'Symphony Orchestra hall',
          source: 'https://vanguardmillwork.com/culture',
          explanation: 'Major civic project referenced in company case study.',
        },
      ],
      charCount: 398,
    },
    activities: [
      {
        id: 'act_81',
        type: 'discovered',
        title: 'Discovered in Midwest Woodworking scan',
        timestamp: 'Sep 12, 11:45 AM',
      },
    ],
  },
];

export const mockInboxThreads: InboxThread[] = [
  {
    id: 'th_1',
    prospectId: 'pr_1',
    prospectName: 'James Carter',
    prospectRole: 'Owner & Managing Principal',
    companyName: 'Stone & Oak Remodeling',
    companyDomain: 'stoneandoak.com',
    email: 'jcarter@stoneandoak.com',
    classification: 'interested',
    lastMessageSnippet: 'Yeah, send it over. If you have any examples of kitchen remodelers you’ve improved mobile flow for, send those too.',
    timestamp: '14m ago',
    unread: true,
    category: 'interested',
    messages: [
      {
        id: 'm_1',
        sender: 'user',
        from: 'alex@growthstudio.co',
        timestamp: 'Yesterday, 10:18 AM',
        body: `Hi James,

I was looking through Stone & Oak and your kitchen work genuinely stands out.

I noticed the consultation CTA is quite easy to miss on mobile, even though most homeowners will probably discover you there first.

I mocked up a cleaner direction that puts the project work and quote flow front and center.

Happy to send it over if you'd like to see it.

— Alex`,
      },
      {
        id: 'm_2',
        sender: 'prospect',
        from: 'jcarter@stoneandoak.com',
        timestamp: 'Today, 09:42 AM',
        body: `Yeah, send it over. If you have any examples of kitchen remodelers you’ve improved mobile flow for, send those too.

We've known our mobile site has been clunky since we updated WordPress last spring.

Best,
James Carter
Owner | Stone & Oak Remodeling`,
      },
    ],
    suggestedReply: {
      text: `Hi James,

Great to hear. Here is the link to the interactive Figma prototype: [Figma Link: Stone & Oak Mobile Flow]

I also attached a quick 90-second Loom recording walking through the quote drawer and showing before/after conversion benchmarks from two similar custom builders we worked with in Texas.

Would you be open to a 10-minute call this Thursday at 2 PM CT to see if this makes sense for Stone & Oak?

— Alex`,
      rationale: 'Addresses his direct request for examples, provides immediate value (prototype + case study), and proposes a specific low-friction meeting time.',
    },
  },
  {
    id: 'th_2',
    prospectId: 'pr_3',
    prospectName: 'David Chen',
    prospectRole: 'Principal Architect & Partner',
    companyName: 'Arbor Interior Studio',
    companyDomain: 'arborinterior.com',
    email: 'david@arborinterior.com',
    classification: 'interested',
    lastMessageSnippet: "We're actually looking at a portfolio redesign in Q4. What does your turnaround look like?",
    timestamp: '2h ago',
    unread: false,
    category: 'interested',
    messages: [
      {
        id: 'm_3',
        sender: 'user',
        from: 'alex@growthstudio.co',
        timestamp: 'Sep 08, 11:30 AM',
        body: `Hi David,

The lighting design on the River Oaks estate project was remarkable.

I noticed the mobile gallery takes around 5 seconds to load on mobile because of uncompressed assets, which might be losing interested prospects before they see the full build.

I put together a quick breakdown of how to keep full retina quality while cutting load time under 1s.

Would you be open to taking a look?

— Alex`,
      },
      {
        id: 'm_4',
        sender: 'prospect',
        from: 'david@arborinterior.com',
        timestamp: 'Today, 07:15 AM',
        body: `Alex,

Good eye on the image weights — our marketing coordinator has been uploading raw camera files directly.

We're actually looking at a portfolio redesign in Q4. What does your turnaround look like and do you handle Webflow migrations directly?

David`,
      },
    ],
    suggestedReply: {
      text: `Hi David,

Yes, Webflow is our primary stack for architecture portfolios — we usually complete the full redesign, image asset pipeline, and responsive QA in 3 to 4 weeks without any downtime to your live site.

I can share a sample scope sheet and two live Webflow architectural builds we delivered last month.

Do you have 15 minutes Friday morning to discuss your Q4 timeline?

— Alex`,
      rationale: 'Directly confirms Webflow expertise, clarifies the 3-4 week turnaround, and invites to a short qualification call.',
    },
  },
  {
    id: 'th_3',
    prospectId: 'pr_4',
    prospectName: 'Marcus Vance',
    prospectRole: 'Managing Director',
    companyName: 'Summit Roofing Co.',
    companyDomain: 'summitroofingfl.com',
    email: 'mvance@summitroofingfl.com',
    classification: 'follow_up',
    lastMessageSnippet: "Can you follow up mid-month? We're wrapped up with seasonal storm repairs right now.",
    timestamp: 'Yesterday',
    unread: false,
    category: 'follow_up',
    messages: [
      {
        id: 'm_5',
        sender: 'user',
        from: 'alex@growthstudio.co',
        timestamp: 'Sep 09, 01:15 PM',
        body: `Hi Marcus,

Saw Summit's recent expansion in Hillsborough County — great work.

Noticed the emergency response header on your site has plain text numbers that aren't tap-to-call on mobile, forcing customers to copy-paste.

Created a quick preview showing how a sticky quick-dispatch button would look.

Happy to share if relevant.

— Alex`,
      },
      {
        id: 'm_6',
        sender: 'prospect',
        from: 'mvance@summitroofingfl.com',
        timestamp: 'Sep 13, 03:40 PM',
        body: `Can you follow up mid-month? We're wrapped up with seasonal storm repairs right now and don't have bandwidth to review tech until the end of the month.

Marcus`,
      },
    ],
    suggestedReply: {
      text: `Understood Marcus, good luck with the storm repair surge. I'll put a note on my calendar for September 28th and ping you then with the mock ready.

Stay safe out there.

— Alex`,
      rationale: 'Respects his current operational strain, confirms exact follow-up date, and leaves a warm professional impression.',
    },
  },
  {
    id: 'th_4',
    prospectId: 'pr_8',
    prospectName: 'Julian Ortiz',
    prospectRole: 'Founder & Managing Director',
    companyName: 'Vanguard Millwork',
    companyDomain: 'vanguardmillwork.com',
    email: 'jortiz@vanguardmillwork.com',
    classification: 'not_interested',
    lastMessageSnippet: "Not something we need right now, but appreciate the thorough research on our work.",
    timestamp: '2d ago',
    unread: false,
    category: 'not_interested',
    messages: [
      {
        id: 'm_7',
        sender: 'user',
        from: 'alex@growthstudio.co',
        timestamp: 'Sep 11, 10:00 AM',
        body: `Hi Julian,

Your acoustic panel work for the Symphony Orchestra hall was extraordinary...`,
      },
      {
        id: 'm_8',
        sender: 'prospect',
        from: 'jortiz@vanguardmillwork.com',
        timestamp: 'Sep 12, 11:20 AM',
        body: `Not something we need right now, but appreciate the thorough research on our work. All our work comes through word of mouth from general contractors. Thanks.`,
      },
    ],
    suggestedReply: {
      text: `Appreciate the quick reply, Julian. Glad to hear your GC referral network is strong. If that ever changes down the line, feel free to reach back out anytime.

All the best with the fall projects!

— Alex`,
      rationale: 'Polite close with no pushiness, honoring their preference while leaving the door open.',
    },
  },
];

export const mockMailboxes: MailboxAccount[] = [
  {
    id: 'mb_1',
    email: 'alex@growthstudio.co',
    provider: 'Google',
    status: 'Healthy',
    dailyLimit: 35,
    sentToday: 24,
    warmupStatus: 'Active (Week 3)',
  },
  {
    id: 'mb_2',
    email: 'outreach@growthstudio.co',
    provider: 'Microsoft',
    status: 'Healthy',
    dailyLimit: 35,
    sentToday: 18,
    warmupStatus: 'Active (Week 3)',
  },
];

export const mockIntegrations: Integration[] = [
  {
    id: 'int_1',
    name: 'Google Workspace',
    category: 'Email Provider',
    description: 'Send personalized sequences through OAuth Gmail and Google Workspace accounts with real mailbox reputation.',
    state: 'Connected',
    connectedAccount: 'alex@growthstudio.co',
    iconType: 'google',
  },
  {
    id: 'int_2',
    name: 'Microsoft Outlook',
    category: 'Email Provider',
    description: 'Connect Microsoft 365 and Outlook commercial inboxes with automatic SPF/DKIM verification.',
    state: 'Connected',
    connectedAccount: 'outreach@growthstudio.co',
    iconType: 'microsoft',
  },
  {
    id: 'int_3',
    name: 'SMTP / IMAP Custom Server',
    category: 'Email Provider',
    description: 'Use custom dedicated sending servers, Mailgun, Amazon SES, or custom private hostnames.',
    state: 'Connect',
    iconType: 'server',
  },
  {
    id: 'int_4',
    name: 'Calendly',
    category: 'Calendar & Scheduling',
    description: 'Automatically detect when an interested lead books a call on your Calendly link and mark positive conversion.',
    state: 'Connected',
    connectedAccount: 'alex@growthstudio.co/15min',
    iconType: 'calendar',
  },
  {
    id: 'int_5',
    name: 'Google Calendar',
    category: 'Calendar & Scheduling',
    description: 'Sync booked meetings and view your availability directly inside the CRM reply drawer.',
    state: 'Connect',
    iconType: 'calendar',
  },
  {
    id: 'int_6',
    name: 'HubSpot CRM',
    category: 'CRM & Contacts',
    description: 'Automatically push interested prospects and email activity logs directly into your HubSpot deal pipeline.',
    state: 'Connect',
    iconType: 'hubspot',
  },
  {
    id: 'int_7',
    name: 'Slack Notifications',
    category: 'Notifications & Webhooks',
    description: 'Receive instant notifications in a dedicated channel whenever a prospect replies positively.',
    state: 'Coming in next build',
    iconType: 'slack',
  },
  {
    id: 'int_8',
    name: 'Outbound Webhooks',
    category: 'Notifications & Webhooks',
    description: 'Trigger Zapier, Make, or custom backend HTTP endpoints on prospect events (replied, interested, meeting).',
    state: 'Connect',
    iconType: 'webhook',
  },
];

export const mockDefaultSequence: Sequence = {
  id: 'seq_default',
  name: 'Value-Led 4-Step Outbound Sequence',
  templateType: 'Value-led',
  steps: [
    {
      id: 'step_1',
      stepNumber: 1,
      type: 'email',
      subject: 'Quick idea for {{company.name}}',
      bodyPreview: 'Hi {{contact.firstName}}, I was looking through {{company.name}} and noticed {{research.primaryProblem}}...',
      channel: 'email',
      isAvailable: true,
    },
    {
      id: 'step_2',
      stepNumber: 2,
      type: 'wait',
      delayDays: 3,
      channel: 'email',
      isAvailable: true,
    },
    {
      id: 'step_3',
      stepNumber: 3,
      type: 'email',
      subject: 'Re: Quick idea for {{company.name}}',
      bodyPreview: 'Hi {{contact.firstName}}, quick follow-up to see if you had 2 minutes to inspect that mobile mockup...',
      channel: 'email',
      isAvailable: true,
    },
    {
      id: 'step_4',
      stepNumber: 4,
      type: 'wait',
      delayDays: 4,
      channel: 'email',
      isAvailable: true,
    },
    {
      id: 'step_5',
      stepNumber: 5,
      type: 'email',
      subject: 'Another angle on {{company.name}} conversion',
      bodyPreview: 'Hi {{contact.firstName}}, one more specific example from a Texas remodeler that increased quote requests by 34%...',
      channel: 'email',
      isAvailable: true,
    },
    {
      id: 'step_6',
      stepNumber: 6,
      type: 'wait',
      delayDays: 7,
      channel: 'email',
      isAvailable: true,
    },
    {
      id: 'step_7',
      stepNumber: 7,
      type: 'email',
      subject: 'Permission to close file for {{company.name}}?',
      bodyPreview: 'Hi {{contact.firstName}}, assume this isn’t a priority right now. Won’t follow up again unless you’d like...',
      channel: 'email',
      isAvailable: true,
    },
  ],
};

export const mockAnalyticsData = {
  summary: {
    totalSent: 862,
    totalReplies: 47,
    replyRate: 5.45,
    positiveReplies: 18,
    positiveRate: 2.08,
    meetingsBooked: 8,
    meetingRate: 0.93,
    avgFitScore: 89.2,
  },
  trendData: [
    { date: 'Sep 01', sent: 32, replies: 1, positive: 0, meetings: 0 },
    { date: 'Sep 03', sent: 48, replies: 2, positive: 1, meetings: 0 },
    { date: 'Sep 05', sent: 65, replies: 4, positive: 1, meetings: 1 },
    { date: 'Sep 07', sent: 70, replies: 5, positive: 2, meetings: 1 },
    { date: 'Sep 09', sent: 82, replies: 6, positive: 3, meetings: 2 },
    { date: 'Sep 11', sent: 94, replies: 8, positive: 4, meetings: 1 },
    { date: 'Sep 13', sent: 88, replies: 7, positive: 3, meetings: 2 },
  ],
  topIndustries: [
    { name: 'Kitchen & Bath Remodeling', sent: 380, replyRate: 6.8, positiveRate: 2.9 },
    { name: 'Interior Architecture & Design', sent: 270, replyRate: 5.9, positiveRate: 2.2 },
    { name: 'Commercial Roofing', sent: 142, replyRate: 4.2, positiveRate: 1.4 },
    { name: 'Luxury Custom Homebuilding', sent: 70, replyRate: 8.5, positiveRate: 4.2 },
  ],
  topAngles: [
    { angle: 'Mobile quote CTA friction + custom Figma mockup', sent: 340, replyRate: 7.3, positiveRate: 3.2 },
    { angle: 'Portfolio page speed & retina asset optimization', sent: 280, replyRate: 5.4, positiveRate: 2.1 },
    { angle: 'Instant showroom consultation booking flow', sent: 242, replyRate: 4.8, positiveRate: 1.6 },
  ],
  scoreCorrelation: [
    { bracket: 'Score 90–100', replyRate: '7.8%', multiplier: '2.6×', leads: 412 },
    { bracket: 'Score 80–89', replyRate: '5.2%', multiplier: '1.7×', leads: 540 },
    { bracket: 'Score 70–79', replyRate: '3.0%', multiplier: '1.0× (Baseline)', leads: 248 },
    { bracket: 'Score < 70', replyRate: '1.4%', multiplier: '0.4×', leads: 84 },
  ],
};
