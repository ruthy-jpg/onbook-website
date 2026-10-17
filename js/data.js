/* Demo data for the Onbook prototype. Every company, person, number and proof point is invented.
   The customer is Tideline, a growth studio run by Sam Rivera that sells launch campaigns to fintech and crypto products.
   The prototype's clock is Wed 7 Oct 2026, 10:30 AM (OB.TODAY). */
(function () {
  'use strict';
  const OB = window.OB;

  /* Flow steps: ch = channel, kind = what the step does */
  const FLOW_DEFAULT = [
    { id: 's1', ch: 'linkedin', kind: 'invite', title: 'LinkedIn invite', when: 'Day 1', wait: null, purpose: 'Connect. A short note on Premium accounts; no note on free ones.' },
    { id: 's2', ch: 'email', kind: 'email', title: 'Email', when: 'Day 3', wait: '2 days later', purpose: 'The reason to reach out, one proof point and an easy question. No link.' },
    { id: 's3', ch: 'linkedin', kind: 'message', title: 'LinkedIn message', when: 'After they accept', wait: 'When they accept, not before day 4', purpose: 'One human line and a question. No link.' },
    { id: 's4', ch: 'x', kind: 'dm', title: 'X DM', when: 'Day 6', wait: '3 days later', purpose: 'Only if they accept DMs. Under 50 words, no link.' },
    { id: 's5', ch: 'email', kind: 'email', title: 'Email', when: 'Day 9', wait: '3 days later', purpose: 'Your offer, plus the booking link.' },
    { id: 's6', ch: 'email', kind: 'email', title: 'Last email', when: 'Day 14', wait: '5 days later', purpose: 'A short last note. Only the last person at a company gets it.' },
  ];

  const D = (OB.data = {
    me: { id: 'u1', name: 'Sam Rivera', first: 'Sam', email: 'sam@tideline.studio', role: 'Owner', company: 'Tideline', site: 'tideline.studio' },

    profile: {
      sell: 'Launch and growth campaigns for fintech and crypto products: creator programmes, trading communities and paid acquisition, run as a monthly retainer.',
      industries: ['Fintech apps', 'Exchanges and trading', 'DeFi protocols', 'Payments'],
      sizes: 'Any size',
      regions: ['United States', 'United Kingdom', 'European Union', 'Singapore', 'United Arab Emirates'],
      /* Companies like these: 10 examples, some of the customer's own clients and some Onbook suggested, never labelled */
      examples: ['Ledgerly', 'Halcyon Pay', 'Nimbus Swap', 'Quanta Wallet', 'Corelane Pay', 'Sable Exchange', 'Ferro Wallet', 'Pebble Finance', 'Rivet Exchange', 'Atlas Perps'],
      titles: ['Co-founder', 'CEO', 'Head of Growth', 'CMO'],
      never: ['Agencies', 'VCs and funds', 'Media and events', 'Public companies', 'Memecoins and gambling'],
      reasons: ['Raised money in the last 60 days', 'Launching a product', 'New exchange listing', 'Hiring a growth lead', 'Entered a new market'],
      proof: [
        { id: 'p1', client: 'Ledgerly', named: true, result: '0 to 40,000 funded accounts in 12 weeks', segment: 'Fintech apps', source: 'tideline.studio/work/ledgerly', found: '2026-09-30', confirmed: true },
        { id: 'p2', client: 'A top-10 perp DEX', named: false, result: '$2.1B in trading volume in the first 90 days', segment: 'Exchanges and trading', source: 'Added by you', found: '2026-10-02', confirmed: true },
        { id: 'p3', client: 'Corelane Pay', named: true, result: 'Waitlist from 3,000 to 52,000 before launch', segment: 'Payments', source: 'tideline.studio/work', found: '2025-03-14', confirmed: false, stale: true },
      ],
      offer: 'A free 20-minute launch teardown: what is working for three of their competitors, and where the gaps are.',
      voice: 'Direct and friendly. Short sentences, no hype. Lowercase is fine on X.',
      extra: 'We do not take on memecoins or gambling products. Most clients are 6 to 18 months from launch.',
      privateNotes: 'Retainers start at $15,000 a month.',
      booking: 'cal.com/sam-tideline/intro',
      address: 'Tideline Studio Ltd, 14 Wharf Road, London N1 7GR',
      matches: 1860,
    },

    accounts: [
      { id: 'a-email', ch: 'email', name: 'sam@tideline.studio', provider: 'Google Workspace', status: 'healthy', newPerDay: 15, newToday: 5, sendCap: 40, sentToday: 9, checks: { spf: true, dkim: true, dmarc: true, blocklists: true }, since: '2026-09-01' },
      { id: 'a-li', ch: 'linkedin', name: 'Sam Rivera', provider: 'LinkedIn Premium, connected through Unipile', status: 'healthy', newPerDay: 15, newToday: 6, weekInvites: 41, weekCap: 75, acceptance: 34, since: '2026-09-01' },
      { id: 'a-x', ch: 'x', name: '@samrivera', provider: 'Onbook for Chrome', status: 'warming', newPerDay: 7, target: 10, rampDay: 6, rampDays: 14, newToday: 3, since: '2026-10-01' },
      { id: 'a-cal', ch: 'calendar', name: 'Google Calendar', provider: 'sam@tideline.studio', status: 'healthy', since: '2026-09-01' },
    ],

    plan: {
      price: 199, annualPrice: 159, allowance: 1000, used: 84, credits: 0, autoCredits: false, autoCap: 100,
      periodStart: '2026-10-01', periodEnd: '2026-10-31', nextBill: '2026-11-01', card: 'Visa ending 4242', expectedReach: 330,
      usageByCampaign: [{ campaign: 'c1', count: 54 }, { campaign: 'c2', count: 24 }, { campaign: 'c3', count: 6 }],
      invoices: [
        { id: 'inv-1003', date: '2026-10-01', label: 'Onbook, October', amount: 199, status: 'Paid' },
        { id: 'inv-1002', date: '2026-09-01', label: 'Onbook, September', amount: 199, status: 'Paid' },
      ],
    },

    flows: {
      f1: { id: 'f1', steps: FLOW_DEFAULT, approved: '2026-09-21', approvedBy: 'Sam Rivera' },
      f2: {
        id: 'f2', approved: '2026-09-30', approvedBy: 'Sam Rivera',
        steps: [
          { id: 's1', ch: 'x', kind: 'dm', title: 'X DM', when: 'Day 1', wait: null, purpose: 'Only if they accept DMs. Under 50 words, no link.' },
          { id: 's2', ch: 'linkedin', kind: 'invite', title: 'LinkedIn invite', when: 'Day 2', wait: '1 day later', purpose: 'Connect, no note.' },
          { id: 's3', ch: 'email', kind: 'email', title: 'Email', when: 'Day 4', wait: '2 days later', purpose: 'The reason, one proof point and an easy question.' },
          { id: 's4', ch: 'x', kind: 'dm', title: 'X DM', when: 'Day 7', wait: '3 days later', purpose: 'Your offer, plus the booking link. The last X DM unless they reply.' },
          { id: 's5', ch: 'email', kind: 'email', title: 'Last email', when: 'Day 11', wait: '4 days later', purpose: 'A short last note.' },
        ],
      },
      f3: {
        id: 'f3', approved: '2026-09-14', approvedBy: 'Sam Rivera',
        steps: [
          { id: 's1', ch: 'email', kind: 'email', title: 'Email', when: 'Day 1', wait: null, purpose: 'Mentions where you met, from the notes column of the import.' },
          { id: 's2', ch: 'linkedin', kind: 'invite', title: 'LinkedIn invite', when: 'Day 2', wait: '1 day later', purpose: 'Connect with a note about the event.' },
          { id: 's3', ch: 'email', kind: 'email', title: 'Last email', when: 'Day 6', wait: '4 days later', purpose: 'Your offer, plus the booking link.' },
        ],
      },
    },

    /* Three example people the flow is previewed on: strong news, weak news, no news */
    examples: {
      strong: {
        key: 'strong', label: 'Strong news', person: 'Maya Chen', title: 'Co-founder', company: 'Kestrel Exchange',
        reason: 'Raised an $8M seed round', source: 'CryptoRank', date: '2026-09-24', proof: 'p2',
        why: { s1: 'Mentions the raise, which is dated and sourced.', s2: 'Proof closest to an exchange (the perp DEX result). Asks about timing, which is easy to answer.', s3: 'One line after they accept, no pitch.', s4: 'Lowercase, as your voice allows on X. Under 50 words.', s5: 'Your offer, and the booking link for the first time.', s6: 'Leaves the door open and asks who else to speak to.' },
        messages: {
          s1: { body: "Hi Maya, saw Kestrel's seed round. I run Tideline; we help trading products find their first traders. Would be good to connect." },
          s2: { subject: "Kestrel's first traders", body: "Hi Maya,\n\nSaw Kestrel closed an $8M seed last month.\n\nWe run launch campaigns for trading products. One example: a top-10 perp DEX, $2.1B in trading volume in the first 90 days.\n\nIs getting traders onto the book something you're planning now, or closer to launch?\n\nSam" },
          s3: { body: 'Thanks for connecting, Maya. How are you thinking about the first few thousand traders for Kestrel?' },
          s4: { body: 'maya, congrats on the seed. when does the book open to traders?' },
          s5: { subject: "Re: Kestrel's first traders", body: "Hi Maya,\n\nOne idea before launch: a free 20-minute teardown of what's working for three of your competitors, and where the gaps are.\n\nIf useful, pick a time: cal.com/sam-tideline/intro\n\nSam" },
          s6: { subject: "Re: Kestrel's first traders", body: "Hi Maya,\n\nI'll leave it here. If growth lands on your desk after launch, I'm easy to find. Is there someone else at Kestrel I should speak to?\n\nSam" },
        },
      },
      weak: {
        key: 'weak', label: 'Weak news', person: 'Daniel Price', title: 'CEO', company: 'Halcyon Pay',
        reason: 'Hiring a Head of Growth', source: 'Job post on LinkedIn', date: '2026-10-01', proof: 'p1',
        why: { s1: 'Mentions the open role, the only recent news.', s2: 'Fintech proof (Ledgerly). The question is about who covers growth until the hire starts.', s3: 'One line after they accept, no pitch.', s4: 'Short and lowercase, no link.', s5: 'Your offer, and the booking link for the first time.', s6: 'A short last note.' },
        messages: {
          s1: { body: 'Hi Daniel, saw Halcyon is hiring a Head of Growth. I run Tideline; we run launch campaigns for payments apps. Would be good to connect.' },
          s2: { subject: "Halcyon's growth hire", body: "Hi Daniel,\n\nSaw Halcyon is hiring a Head of Growth.\n\nWhile the role is open, we can run campaigns alongside the team. One example: Ledgerly, 0 to 40,000 funded accounts in 12 weeks.\n\nIs the new hire taking over campaigns, or are you covering them until then?\n\nSam" },
          s3: { body: 'Thanks for connecting, Daniel. Are you running growth yourself until the new hire starts?' },
          s4: { body: "daniel, saw the head of growth role at halcyon. who's covering campaigns until it's filled?" },
          s5: { subject: "Re: Halcyon's growth hire", body: "Hi Daniel,\n\nOne idea while the role is open: a free 20-minute teardown of what's working for three of your competitors.\n\nIf useful, pick a time: cal.com/sam-tideline/intro\n\nSam" },
          s6: { subject: "Re: Halcyon's growth hire", body: "Hi Daniel,\n\nI'll leave it here. If you'd like a hand while the role is open, I'm easy to find.\n\nSam" },
        },
      },
      none: {
        key: 'none', label: 'No news', person: 'Lena Fischer', title: 'Head of Marketing', company: 'Northpoint Credit',
        reason: null, source: null, date: null, proof: 'p1',
        why: { s1: 'No recent news, so the note says who you are and nothing invented.', s2: 'No event to mention. Proof closest to a lending app, and a question about who owns growth.', s3: 'One line after they accept.', s4: 'Short and lowercase, no link.', s5: 'Your offer, and the booking link for the first time.', s6: 'A short last note.' },
        messages: {
          s1: { body: 'Hi Lena, I run Tideline; we help fintech apps grow their first users. Would be good to connect.' },
          s2: { subject: 'Growth at Northpoint', body: "Hi Lena,\n\nWe run launch and growth campaigns for fintech apps. One example: Ledgerly, 0 to 40,000 funded accounts in 12 weeks.\n\nWho looks after growth campaigns at Northpoint today, your team or an agency?\n\nSam" },
          s3: { body: 'Thanks for connecting, Lena. Is growth mostly in-house at Northpoint, or do you work with partners?' },
          s4: { body: 'lena, who looks after growth campaigns at northpoint these days?' },
          s5: { subject: 'Re: Growth at Northpoint', body: "Hi Lena,\n\nOne idea: a free 20-minute teardown of what's working for three of your competitors.\n\nIf useful, pick a time: cal.com/sam-tideline/intro\n\nSam" },
          s6: { subject: 'Re: Growth at Northpoint', body: "Hi Lena,\n\nI'll leave it here. If growth campaigns come up, I'm easy to find.\n\nSam" },
        },
      },
    },

    campaigns: [
      { id: 'c1', name: 'Fintech launches, autumn', status: 'running', list: 'l1', flow: 'f1', started: '2026-09-21', people: 186, companies: 97, contacted: 142, inFlow: 61, needsYou: 3, positive: 9, calls: 4, keepFinding: true, noNews: 'skip', nextSend: '2026-10-07T11:05', perDay: 15 },
      { id: 'c2', name: 'Exchanges and perp DEXs', status: 'running', list: 'l2', flow: 'f2', started: '2026-09-30', people: 120, companies: 62, contacted: 48, inFlow: 39, needsYou: 0, positive: 3, calls: 1, keepFinding: true, noNews: 'skip', nextSend: '2026-10-07T11:40', perDay: 8 },
      { id: 'c3', name: 'Token2049 follow-ups', status: 'paused', list: 'l3', flow: 'f3', started: '2026-09-14', pausedOn: '2026-10-02', people: 64, companies: 41, contacted: 30, inFlow: 12, needsYou: 0, positive: 5, calls: 2, keepFinding: false, noNews: 'role' },
      { id: 'c4', name: 'UK payments companies', status: 'draft', list: 'l4', flow: null, created: '2026-10-06', people: 104, companies: 52, contacted: 0, inFlow: 0, needsYou: 0, positive: 0, calls: 0, keepFinding: true, noNews: 'skip', draftStep: 'flow' },
      { id: 'c5', name: 'DeFi protocols launching v2', status: 'finished', list: 'l5', flow: 'f1', started: '2026-07-20', ended: '2026-09-11', people: 150, companies: 80, contacted: 150, inFlow: 0, needsYou: 0, positive: 11, calls: 5, keepFinding: false, noNews: 'skip' },
    ],

    lists: [
      { id: 'l1', name: 'Fintech launches, autumn', people: 186, companies: 97, source: 'Built from your profile', created: '2026-09-21', campaign: 'c1' },
      { id: 'l2', name: 'Exchanges and perp DEXs', people: 120, companies: 62, source: 'Built from your profile', created: '2026-09-30', campaign: 'c2' },
      { id: 'l3', name: 'Token2049 contacts', people: 64, companies: 41, source: 'Imported from token2049-contacts.csv', created: '2026-09-14', campaign: 'c3' },
      { id: 'l4', name: 'UK payments companies', people: 104, companies: 52, source: 'Built from your profile', created: '2026-10-06', campaign: 'c4' },
      { id: 'l5', name: 'DeFi v2 launches', people: 150, companies: 80, source: 'Built from your profile', created: '2026-07-20', campaign: 'c5' },
      { id: 'l6', name: 'Partners and friends', people: 23, companies: 19, source: 'Imported from partners.csv', created: '2026-09-02', campaign: null },
    ],

    companies: [
      { id: 'kestrel', name: 'Kestrel Exchange', domain: 'kestrel.exchange', industry: 'Exchanges and trading', size: 24, location: 'Singapore', fit: 'Perp exchange before launch, 24 staff. Like your perp DEX client.', news: { text: 'Raised an $8M seed round', source: 'CryptoRank', date: '2026-09-24', type: 'Raised money' }, stopped: { by: 'p-maya', at: '2026-10-07T09:12', why: 'Maya Chen replied on X' } },
      { id: 'halcyon', name: 'Halcyon Pay', domain: 'halcyonpay.com', industry: 'Payments', size: 48, location: 'London', fit: 'Consumer payments app, 48 staff, growth role open.', news: { text: 'Hiring a Head of Growth', source: 'Job post on LinkedIn', date: '2026-10-01', type: 'Hiring a growth lead' }, stopped: { by: 'p-daniel', at: '2026-10-06T16:40', why: 'Daniel Price replied by email' } },
      { id: 'orbit', name: 'Orbit Lend', domain: 'orbitlend.xyz', industry: 'DeFi protocols', size: 15, location: 'Lisbon', fit: 'Lending protocol, mainnet next week.', news: { text: 'Mainnet launch set for 14 Oct', source: 'Company blog', date: '2026-10-05', type: 'Launching a product' }, stopped: { by: 'p-priya', at: '2026-10-07T08:05', why: 'Priya Natarajan replied on LinkedIn' } },
      { id: 'fernway', name: 'Fernway Money', domain: 'fernway.com', industry: 'Fintech apps', size: 85, location: 'Toronto', fit: 'Savings app expanding to the US.', news: { text: 'Launched in the United States', source: 'Company newsroom', date: '2026-09-16', type: 'Entered a new market' }, stopped: { by: 'p-grace', at: '2026-10-05T13:20', why: 'Grace Park booked a call' } },
      { id: 'quanta', name: 'Quanta Wallet', domain: 'quantawallet.io', industry: 'Fintech apps', size: 40, location: 'Dubai', fit: 'Self-custody wallet, Series A.', news: { text: 'Raised a $12M Series A', source: 'CryptoRank', date: '2026-09-28', type: 'Raised money' }, stopped: { by: 'p-ama', at: '2026-10-06T12:10', why: 'Ama Mensah booked a call' } },
      { id: 'brightwater', name: 'Brightwater Bank', domain: 'brightwater.co.uk', industry: 'Fintech apps', size: 160, location: 'London', fit: 'Digital bank opening in Asia.', news: { text: 'Opened a Singapore office', source: 'Company newsroom', date: '2026-09-25', type: 'Entered a new market' } },
      { id: 'oddsmith', name: 'Oddsmith', domain: 'oddsmith.io', industry: 'Exchanges and trading', size: 22, location: 'New York', fit: 'Prediction market app, recently listed.', news: { text: 'Listed its token on two exchanges', source: 'Exchange announcement', date: '2026-09-22', type: 'New exchange listing' }, stopped: { by: 'p-leo', at: '2026-10-05T15:10', why: 'Leo Brandt replied by email' } },
      { id: 'mintleaf', name: 'Mintleaf', domain: 'mintleaf.finance', industry: 'DeFi protocols', size: 12, location: 'Berlin', fit: 'Lending app, v2 just shipped.', news: { text: 'Launched v2 of its lending app', source: 'Company blog', date: '2026-09-30', type: 'Launching a product' }, stopped: { by: 'p-hana', at: '2026-10-05T11:30', why: 'Hana Sato asked to be removed' } },
      { id: 'tallyroll', name: 'Tallyroll', domain: 'tallyroll.com', industry: 'Payments', size: 30, location: 'Austin', fit: 'Stablecoin payroll, seed stage.', news: { text: 'Raised a $5M seed round', source: 'CryptoRank', date: '2026-09-18', type: 'Raised money' }, stopped: { by: 'p-omar', at: '2026-10-05T10:05', why: 'Omar Haddad replied by email' } },
      { id: 'northpoint', name: 'Northpoint Credit', domain: 'northpointcredit.com', industry: 'Fintech apps', size: 120, location: 'Chicago', fit: 'Consumer lending app, 120 staff.', news: null },
      { id: 'arcadia', name: 'Arcadia Wallet', domain: 'arcadiawallet.com', industry: 'Fintech apps', size: 36, location: 'Lisbon', fit: 'Wallet app, growth role open.', news: { text: 'Hiring a Growth Marketing Lead', source: 'Job post on LinkedIn', date: '2026-10-02', type: 'Hiring a growth lead' } },
      { id: 'pebble', name: 'Pebble Finance', domain: 'pebble.finance', industry: 'Fintech apps', size: 64, location: 'Amsterdam', fit: 'Business banking for freelancers.', news: { text: 'Launched a business account', source: 'Company blog', date: '2026-09-29', type: 'Launching a product' } },
      { id: 'lumen', name: 'Lumen Markets', domain: 'lumenmarkets.io', industry: 'Exchanges and trading', size: 55, location: 'Singapore', fit: 'Derivatives venue adding products.', news: { text: 'Announced a new options product', source: 'Company blog', date: '2026-09-27', type: 'Launching a product' } },
      { id: 'copperline', name: 'Copperline', domain: 'copperline.co', industry: 'Payments', size: 90, location: 'Dublin', fit: 'Payments platform for marketplaces.', news: null },
      { id: 'driftwood', name: 'Driftwood Bank', domain: 'driftwood.bank', industry: 'Fintech apps', size: 140, location: 'Manchester', fit: 'Challenger bank entering Ireland.', news: { text: 'Entered the Irish market', source: 'Company newsroom', date: '2026-09-12', type: 'Entered a new market' } },
      { id: 'vantage', name: 'Vantage Rails', domain: 'vantagerails.com', industry: 'Payments', size: 70, location: 'San Francisco', fit: 'Payment infrastructure, Series B.', news: { text: 'Raised a $20M Series B', source: 'CryptoRank', date: '2026-09-08', type: 'Raised money' } },
      { id: 'sable', name: 'Sable Exchange', domain: 'sable.trade', industry: 'Exchanges and trading', size: 18, location: 'Hong Kong', fit: 'Spot exchange in testnet.', news: { text: 'Opened its testnet to traders', source: 'Company blog', date: '2026-10-04', type: 'Launching a product' } },
      { id: 'tern', name: 'Tern Pay', domain: 'ternpay.com', industry: 'Payments', size: 26, location: 'Nairobi', fit: 'Cross-border payments, marketing role open.', news: { text: 'Hiring a Head of Marketing', source: 'Job post on LinkedIn', date: '2026-09-30', type: 'Hiring a growth lead' } },
      { id: 'cobalt', name: 'Cobalt Card', domain: 'cobaltcard.com', industry: 'Fintech apps', size: 75, location: 'Austin', fit: 'Rewards card, new launch.', news: { text: 'Launched a rewards card', source: 'Company newsroom', date: '2026-09-21', type: 'Launching a product' } },
      { id: 'harbor', name: 'Harbor Ledger', domain: 'harborledger.com', industry: 'Fintech apps', size: 52, location: 'Boston', fit: 'Accounting app for small firms.', news: null },
      { id: 'kite', name: 'Kite Credit', domain: 'kitecredit.com', industry: 'Fintech apps', size: 33, location: 'Atlanta', fit: 'Credit builder app, seed stage.', news: { text: 'Raised a $6M seed round', source: 'CryptoRank', date: '2026-09-24', type: 'Raised money' } },
      { id: 'juniper', name: 'Juniper Pay', domain: 'juniperpay.co', industry: 'Payments', size: 44, location: 'Sydney', fit: 'Payments app launching in the UK.', news: { text: 'Launched in the United Kingdom', source: 'Company newsroom', date: '2026-10-01', type: 'Entered a new market' } },
      { id: 'atlas', name: 'Atlas Perps', domain: 'atlasperps.xyz', industry: 'Exchanges and trading', size: 14, location: 'Remote', fit: 'Perp DEX, points programme starting.', news: { text: 'Points programme starts 20 Oct', source: 'Company post on X', date: '2026-09-26', type: 'Launching a product' }, stopped: { by: 'p-felix', at: '2026-10-05T17:30', why: 'Felix Wagner replied by email' } },
      { id: 'fathom', name: 'Fathom Wealth', domain: 'fathomwealth.com', industry: 'Fintech apps', size: 95, location: 'New York', fit: 'Investing app, growth leadership open.', news: { text: 'Hiring a VP of Growth', source: 'Job post on LinkedIn', date: '2026-09-26', type: 'Hiring a growth lead' } },
      { id: 'glasswing', name: 'Glasswing Pay', domain: 'glasswing.money', industry: 'Payments', size: 29, location: 'Mexico City', fit: 'Remittances app, just raised.', news: { text: 'Raised a $9M seed round', source: 'CryptoRank', date: '2026-10-02', type: 'Raised money' } },
      { id: 'meridian', name: 'Meridian Swap', domain: 'meridianswap.xyz', industry: 'DeFi protocols', size: 11, location: 'Remote', fit: 'DEX aggregator, small team.', news: null },
    ],

    /* progress aligns with the campaign's flow steps */
    people: [
      { id: 'p-maya', name: 'Maya Chen', title: 'Co-founder', company: 'kestrel', campaign: 'c1', stage: 'needs-you', progress: ['done', 'done', 'done', 'replied', 'stopped', 'stopped'], email: 'maya@kestrel.exchange', x: '@mayachen', revealed: true, thread: 't1', last: '2026-10-07T09:12' },
      { id: 'p-ben', name: 'Ben Ortiz', title: 'Head of Growth', company: 'kestrel', campaign: 'c1', stage: 'stopped', detail: 'Stopped: Maya replied', progress: ['stopped', 'stopped', 'stopped', 'stopped', 'stopped', 'stopped'], revealed: false },
      { id: 'p-daniel', name: 'Daniel Price', title: 'CEO', company: 'halcyon', campaign: 'c1', stage: 'needs-you', progress: ['done', 'replied', 'stopped', 'stopped', 'stopped', 'stopped'], email: 'daniel@halcyonpay.com', revealed: true, thread: 't2', last: '2026-10-06T16:40' },
      { id: 'p-rosa', name: 'Rosa Lind', title: 'Head of Marketing', company: 'halcyon', campaign: 'c1', stage: 'stopped', detail: 'Stopped: Daniel replied', progress: ['stopped', 'stopped', 'stopped', 'stopped', 'stopped', 'stopped'], revealed: false },
      { id: 'p-priya', name: 'Priya Natarajan', title: 'CMO', company: 'orbit', campaign: 'c1', stage: 'needs-you', progress: ['done', 'done', 'replied', 'stopped', 'stopped', 'stopped'], email: 'priya@orbitlend.xyz', revealed: true, thread: 't3', last: '2026-10-07T08:05' },
      { id: 'p-grace', name: 'Grace Park', title: 'Head of Growth', company: 'fernway', campaign: 'c1', stage: 'booked', detail: 'Call booked, Wed 7 Oct', progress: ['done', 'done', 'done', 'done', 'replied', 'stopped'], email: 'grace@fernway.com', revealed: true, thread: 't8', last: '2026-10-05T13:20' },
      { id: 'p-ama', name: 'Ama Mensah', title: 'Co-founder', company: 'quanta', campaign: 'c1', stage: 'booked', detail: 'Call booked, Fri 9 Oct', progress: ['done', 'done', 'skip', 'done', 'done', 'stopped'], email: 'ama@quantawallet.io', revealed: true, thread: 't10', bookedWithoutReply: true, last: '2026-10-06T12:10' },
      { id: 'p-leo', name: 'Leo Brandt', title: 'CEO', company: 'oddsmith', campaign: 'c1', stage: 'done', detail: 'Check back 15 Jan', progress: ['done', 'replied', 'stopped', 'stopped', 'stopped', 'stopped'], email: 'leo@oddsmith.io', revealed: true, thread: 't5', last: '2026-10-05T15:10' },
      { id: 'p-jonas', name: 'Jonas Weber', title: 'Head of Marketing', company: 'brightwater', campaign: 'c1', stage: 'paused', detail: 'Paused until Thu 15 Oct', progress: ['done', 'done', 'todo', 'todo', 'todo', 'todo'], email: 'jonas.weber@brightwater.co.uk', revealed: true, thread: 't6', last: '2026-10-06T07:02' },
      { id: 'p-hana', name: 'Hana Sato', title: 'Founder', company: 'mintleaf', campaign: 'c1', stage: 'done', detail: 'Opted out', progress: ['done', 'replied', 'stopped', 'stopped', 'stopped', 'stopped'], email: 'hana@mintleaf.finance', revealed: true, thread: 't7', last: '2026-10-05T11:30' },
      { id: 'p-omar', name: 'Omar Haddad', title: 'Founder', company: 'tallyroll', campaign: 'c1', stage: 'in-conversation', progress: ['done', 'replied', 'stopped', 'stopped', 'stopped', 'stopped'], email: 'omar@tallyroll.com', revealed: true, thread: 't9', last: '2026-10-06T09:15' },
      { id: 'p-lena', name: 'Lena Fischer', title: 'Head of Marketing', company: 'northpoint', campaign: 'c1', stage: 'in-flow', detail: 'Waiting for LinkedIn accept', progress: ['done', 'done', 'next', 'todo', 'todo', 'todo'], email: 'lena.fischer@northpointcredit.com', revealed: true, next: { step: 's3', at: null } },
      { id: 'p-sofia', name: 'Sofia Marques', title: 'Head of Growth', company: 'arcadia', campaign: 'c1', stage: 'in-flow', progress: ['done', 'next', 'todo', 'todo', 'todo', 'todo'], email: 'sofia@arcadiawallet.com', revealed: true, next: { step: 's2', at: '2026-10-08T09:40' } },
      { id: 'p-ruben', name: 'Ruben Visser', title: 'CMO', company: 'pebble', campaign: 'c1', stage: 'in-flow', progress: ['done', 'done', 'done', 'next', 'todo', 'todo'], email: 'ruben@pebble.finance', x: '@rubenvisser', revealed: true, next: { step: 's4', at: '2026-10-09T10:15' } },
      { id: 'p-chloe', name: 'Chloe Martin', title: 'VP Marketing', company: 'copperline', campaign: 'c1', stage: 'in-flow', progress: ['done', 'done', 'todo', 'skip', 'next', 'todo'], email: 'chloe@copperline.co', revealed: true, next: { step: 's5', at: '2026-10-12T09:20' } },
      { id: 'p-tom', name: 'Tom Reilly', title: 'Head of Growth', company: 'driftwood', campaign: 'c1', stage: 'in-flow', progress: ['done', 'done', 'done', 'done', 'done', 'next'], email: 'tom.reilly@driftwood.bank', revealed: true, next: { step: 's6', at: '2026-10-13T10:30' } },
      { id: 'p-isla', name: 'Isla Murray', title: 'Growth Lead', company: 'kite', campaign: 'c1', stage: 'in-flow', progress: ['done', 'next', 'todo', 'todo', 'todo', 'todo'], email: 'isla@kitecredit.com', revealed: true, next: { step: 's2', at: '2026-10-08T14:05' } },
      { id: 'p-yuki', name: 'Yuki Tanaka', title: 'Head of Growth', company: 'juniper', campaign: 'c1', stage: 'in-flow', progress: ['done', 'done', 'done', 'next', 'todo', 'todo'], email: 'yuki@juniperpay.co', x: '@yukitanaka', revealed: true, next: { step: 's4', at: '2026-10-08T09:00' } },
      { id: 'p-diego', name: 'Diego Alvarez', title: 'Co-founder', company: 'glasswing', campaign: 'c1', stage: 'in-flow', detail: 'Starts today', progress: ['next', 'todo', 'todo', 'todo', 'todo', 'todo'], email: 'diego@glasswing.money', revealed: true, next: { step: 's1', at: '2026-10-07T14:15' } },
      { id: 'p-elena', name: 'Elena Rossi', title: 'Head of Marketing', company: 'cobalt', campaign: 'c1', stage: 'done', detail: 'No reply', progress: ['done', 'done', 'done', 'skip', 'done', 'done'], email: 'elena@cobaltcard.com', revealed: true },
      { id: 'p-marcus', name: 'Marcus Bell', title: 'CEO', company: 'harbor', campaign: 'c1', stage: 'done', detail: 'No reply', progress: ['done', 'done', 'skip', 'done', 'done', 'done'], email: 'marcus@harborledger.com', revealed: true },
      { id: 'p-nadia', name: 'Nadia Rahman', title: 'Co-founder', company: 'vantage', campaign: 'c1', stage: 'not-contacted', detail: 'Starts Thu 8 Oct', progress: ['todo', 'todo', 'todo', 'todo', 'todo', 'todo'], revealed: false },
      { id: 'p-wei', name: 'Wei Zhang', title: 'CEO', company: 'sable', campaign: 'c1', stage: 'not-contacted', detail: 'Starts Fri 9 Oct', progress: ['todo', 'todo', 'todo', 'todo', 'todo', 'todo'], revealed: false },
      { id: 'p-kofi', name: 'Kofi Boateng', title: 'CEO', company: 'tern', campaign: 'c1', stage: 'not-contacted', progress: ['todo', 'todo', 'todo', 'todo', 'todo', 'todo'], revealed: false },
      { id: 'p-anika', name: 'Anika Shah', title: 'VP Growth', company: 'fathom', campaign: 'c1', stage: 'not-contacted', progress: ['todo', 'todo', 'todo', 'todo', 'todo', 'todo'], revealed: false },
      { id: 'p-jakub', name: 'Jakub Novak', title: 'Head of Marketing', company: 'orbit', campaign: 'c1', stage: 'stopped', detail: 'Stopped: Priya replied', progress: ['stopped', 'stopped', 'stopped', 'stopped', 'stopped', 'stopped'], revealed: false },
      { id: 'p-felix', name: 'Felix Wagner', title: 'Co-founder', company: 'atlas', campaign: 'c2', stage: 'booked', detail: 'Call booked, Tue 13 Oct', progress: ['done', 'done', 'replied', 'stopped', 'stopped'], email: 'felix@atlasperps.xyz', x: '@felixw', revealed: true, thread: 't11', last: '2026-10-06T09:40' },
      { id: 'p-rachel', name: 'Rachel Kim', title: 'Head of Growth', company: 'lumen', campaign: 'c2', stage: 'in-flow', progress: ['done', 'done', 'done', 'done', 'next'], email: 'rachel.kim@lumenmarkets.io', revealed: true, next: { step: 's5', at: '2026-10-12T09:30' } },
      { id: 'p-ines', name: 'Ines Costa', title: 'CMO', company: 'meridian', campaign: 'c2', stage: 'in-flow', progress: ['skip', 'done', 'next', 'todo', 'todo'], email: 'ines@meridianswap.xyz', revealed: true, next: { step: 's3', at: '2026-10-07T15:20' } },
    ],

    threads: [
      {
        id: 't1', person: 'p-maya', campaign: 'c1', type: 'reply', status: 'needs-you', channel: 'x', unread: true, at: '2026-10-07T09:12',
        preview: 'ha, good timing. we open the book on 20 oct. what would a creator push look like for us?',
        messages: [
          { dir: 'out', ch: 'linkedin', step: 's1', at: '2026-09-29T10:14', body: "Hi Maya, saw Kestrel's seed round. I run Tideline; we help trading products find their first traders. Would be good to connect." },
          { dir: 'out', ch: 'email', step: 's2', at: '2026-10-01T09:40', subject: "Kestrel's first traders", body: "Hi Maya,\n\nSaw Kestrel closed an $8M seed last month.\n\nWe run launch campaigns for trading products. One example: a top-10 perp DEX, $2.1B in trading volume in the first 90 days.\n\nIs getting traders onto the book something you're planning now, or closer to launch?\n\nSam" },
          { dir: 'out', ch: 'linkedin', step: 's3', at: '2026-10-02T11:02', body: 'Thanks for connecting, Maya. How are you thinking about the first few thousand traders for Kestrel?' },
          { dir: 'out', ch: 'x', step: 's4', at: '2026-10-06T10:20', body: 'maya, congrats on the seed. when does the book open to traders?' },
          { dir: 'in', ch: 'x', at: '2026-10-07T09:12', body: 'ha, good timing. we open the book on 20 oct. what would a creator push look like for us? happy to jump on a call next week' },
        ],
      },
      {
        id: 't2', person: 'p-daniel', campaign: 'c1', type: 'reply', status: 'needs-you', channel: 'email', unread: true, at: '2026-10-06T16:40',
        preview: 'Good timing actually. The role is still open and I am covering growth myself until then.',
        messages: [
          { dir: 'out', ch: 'linkedin', step: 's1', at: '2026-09-28T09:55', body: 'Hi Daniel, saw Halcyon is hiring a Head of Growth. I run Tideline; we run launch campaigns for payments apps. Would be good to connect.' },
          { dir: 'out', ch: 'email', step: 's2', at: '2026-09-30T09:31', subject: "Halcyon's growth hire", body: "Hi Daniel,\n\nSaw Halcyon is hiring a Head of Growth.\n\nWhile the role is open, we can run campaigns alongside the team. One example: Ledgerly, 0 to 40,000 funded accounts in 12 weeks.\n\nIs the new hire taking over campaigns, or are you covering them until then?\n\nSam" },
          { dir: 'in', ch: 'email', at: '2026-10-06T16:40', subject: "Re: Halcyon's growth hire", body: "Hi Sam,\n\nGood timing actually. The role is still open and I am covering growth myself until then. Could you send over how a retainer usually works?\n\nI'm free for a call on Thursday afternoon.\n\nDaniel" },
        ],
      },
      {
        id: 't3', person: 'p-priya', campaign: 'c1', type: 'reply', status: 'needs-you', channel: 'linkedin', unread: false, at: '2026-10-07T08:05',
        preview: 'We are, but budget is tight until after launch. What does a retainer usually cost?',
        messages: [
          { dir: 'out', ch: 'linkedin', step: 's1', at: '2026-10-01T10:30', body: "Hi Priya, saw Orbit Lend's mainnet is close. I run Tideline; we help DeFi teams find their first users. Would be good to connect." },
          { dir: 'out', ch: 'email', step: 's2', at: '2026-10-05T09:12', subject: "Orbit Lend's mainnet", body: "Hi Priya,\n\nSaw Orbit Lend's mainnet is set for 14 October.\n\nWe run launch campaigns for DeFi teams. One example: a top-10 perp DEX, $2.1B in trading volume in the first 90 days.\n\nAre you planning anything for users around the launch, or after it?\n\nSam" },
          { dir: 'out', ch: 'linkedin', step: 's3', at: '2026-10-06T14:30', body: 'Thanks for connecting, Priya. Are you planning anything for users around the mainnet launch?' },
          { dir: 'in', ch: 'linkedin', at: '2026-10-07T08:05', body: 'We are, but budget is tight until after launch. What does a retainer usually cost?' },
        ],
      },
      {
        id: 't4', type: 'match', status: 'needs-you', channel: 'calendar', unread: true, at: '2026-10-06T19:22',
        booking: { email: 'r.kim@gmail.com', at: '2026-10-08T11:00', title: 'Intro call with Sam', link: 'cal.com/sam-tideline/intro' },
        suggest: [{ person: 'p-rachel', why: 'Rachel Kim at Lumen Markets got your booking link by X DM on Mon 5 Oct' }],
        preview: 'r.kim@gmail.com booked Thu 8 Oct, 11:00 AM. We could not match the email to anyone you contacted.',
        messages: [],
      },
      {
        id: 't5', person: 'p-leo', campaign: 'c1', type: 'reply', status: 'done', doneReason: 'Check back 15 Jan', channel: 'email', unread: false, at: '2026-10-05T15:10',
        preview: 'Not this quarter. Maybe after our token launch in Q1.',
        messages: [
          { dir: 'out', ch: 'email', step: 's2', at: '2026-10-02T09:20', subject: "Oddsmith's new listings", body: "Hi Leo,\n\nSaw Oddsmith's token listed on two exchanges last month.\n\nWe run launch campaigns for trading products. One example: a top-10 perp DEX, $2.1B in trading volume in the first 90 days.\n\nIs growth after the listings something you're working on now?\n\nSam" },
          { dir: 'in', ch: 'email', at: '2026-10-05T15:10', subject: "Re: Oddsmith's new listings", body: 'Not this quarter. Maybe after our token launch in Q1.\n\nLeo' },
        ],
      },
      {
        id: 't6', person: 'p-jonas', campaign: 'c1', type: 'auto', status: 'auto', channel: 'email', unread: false, at: '2026-10-06T07:02',
        pausedUntil: '2026-10-15', preview: 'I am out of the office until Tuesday 13 October with limited access to email.',
        messages: [
          { dir: 'out', ch: 'email', step: 's2', at: '2026-10-05T09:48', subject: "Brightwater's Singapore office", body: "Hi Jonas,\n\nSaw Brightwater opened a Singapore office last month.\n\nWe run launch campaigns for fintech apps entering new markets. One example: Ledgerly, 0 to 40,000 funded accounts in 12 weeks.\n\nWho is looking after growth for the Singapore launch?\n\nSam" },
          { dir: 'in', ch: 'email', at: '2026-10-06T07:02', subject: 'Automatic reply', body: 'I am out of the office until Tuesday 13 October with limited access to email.' },
        ],
      },
      {
        id: 't7', person: 'p-hana', campaign: 'c1', type: 'optout', status: 'done', doneReason: 'Opted out', channel: 'email', unread: false, at: '2026-10-05T11:30',
        preview: 'Please remove me from your list.',
        messages: [
          { dir: 'out', ch: 'email', step: 's2', at: '2026-10-02T10:05', subject: "Mintleaf's v2", body: "Hi Hana,\n\nSaw Mintleaf shipped v2 of its lending app.\n\nWe run launch campaigns for DeFi teams. One example: a top-10 perp DEX, $2.1B in trading volume in the first 90 days.\n\nIs growth for v2 something you're planning now?\n\nSam" },
          { dir: 'in', ch: 'email', at: '2026-10-05T11:30', subject: "Re: Mintleaf's v2", body: 'Please remove me from your list.' },
        ],
      },
      {
        id: 't8', person: 'p-grace', campaign: 'c1', type: 'booking', status: 'booked', channel: 'email', unread: false, at: '2026-10-05T13:45',
        booking: { at: '2026-10-07T15:30', title: 'Intro call with Sam', link: 'cal.com/sam-tideline/intro' },
        preview: 'You: Looking forward to it.',
        messages: [
          { dir: 'out', ch: 'email', step: 's5', at: '2026-10-05T09:15', subject: "Re: Fernway's US launch", body: "Hi Grace,\n\nOne idea for the US launch: a free 20-minute teardown of what's working for three of your competitors.\n\nIf useful, pick a time: cal.com/sam-tideline/intro\n\nSam" },
          { dir: 'in', ch: 'email', at: '2026-10-05T13:20', subject: "Re: Fernway's US launch", body: 'Thanks Sam, booked a slot for Wednesday.\n\nGrace' },
          { dir: 'event', at: '2026-10-05T13:21', body: 'Grace booked Wed 7 Oct, 3:30 PM through your booking link' },
          { dir: 'out', ch: 'email', at: '2026-10-05T13:45', you: true, subject: "Re: Fernway's US launch", body: 'Looking forward to it.\n\nSam' },
        ],
      },
      {
        id: 't9', person: 'p-omar', campaign: 'c1', type: 'reply', status: 'in-conversation', channel: 'email', unread: false, at: '2026-10-06T09:15',
        preview: 'You: For payroll products we usually start with finance creators...',
        messages: [
          { dir: 'out', ch: 'email', step: 's2', at: '2026-10-01T10:40', subject: "Tallyroll's seed", body: "Hi Omar,\n\nSaw Tallyroll raised a $5M seed last month.\n\nWe run launch campaigns for payments products. One example: Ledgerly, 0 to 40,000 funded accounts in 12 weeks.\n\nIs growth something you're planning for now, or after the next product release?\n\nSam" },
          { dir: 'in', ch: 'email', at: '2026-10-05T10:05', subject: "Re: Tallyroll's seed", body: "Interesting. We've mostly grown through partnerships so far. What does a creator programme look like for a payroll product?\n\nOmar" },
          { dir: 'out', ch: 'email', at: '2026-10-06T09:15', you: true, subject: "Re: Tallyroll's seed", body: 'Hi Omar,\n\nFor payroll products we usually start with finance creators who already talk about getting paid in stablecoins, then build a referral loop for the teams that sign up.\n\nFree for a call next week? cal.com/sam-tideline/intro\n\nSam' },
        ],
      },
      {
        id: 't10', person: 'p-ama', campaign: 'c1', type: 'booking', status: 'booked', channel: 'calendar', unread: false, at: '2026-10-06T12:10',
        booking: { at: '2026-10-09T14:00', title: 'Intro call with Sam', link: 'cal.com/sam-tideline/intro', noReply: true },
        preview: 'Booked Fri 9 Oct, 2:00 PM without replying.',
        messages: [
          { dir: 'out', ch: 'email', step: 's5', at: '2026-10-05T10:30', subject: "Re: Quanta's Series A", body: "Hi Ama,\n\nOne idea after the Series A: a free 20-minute teardown of what's working for three of your competitors.\n\nIf useful, pick a time: cal.com/sam-tideline/intro\n\nSam" },
          { dir: 'event', at: '2026-10-06T12:10', body: 'Ama booked Fri 9 Oct, 2:00 PM through your booking link, without replying' },
        ],
      },
      {
        id: 't11', person: 'p-felix', campaign: 'c2', type: 'booking', status: 'booked', channel: 'email', unread: false, at: '2026-10-06T09:40',
        booking: { at: '2026-10-13T10:00', title: 'Intro call with Sam', link: 'cal.com/sam-tideline/intro' },
        preview: 'Booked Tue 13 Oct, 10:00 AM.',
        messages: [
          { dir: 'out', ch: 'x', step: 's1', at: '2026-09-30T10:20', body: 'felix, saw atlas is starting a points programme. how are you planning to bring traders in for it?' },
          { dir: 'out', ch: 'linkedin', step: 's2', at: '2026-10-01T09:45', body: 'Connection request, no note.' },
          { dir: 'out', ch: 'email', step: 's3', at: '2026-10-05T09:30', subject: "Atlas Perps' points programme", body: "Hi Felix,\n\nSaw Atlas Perps is starting its points programme on 20 October.\n\nWe run launch campaigns for trading products. One example: a top-10 perp DEX, $2.1B in trading volume in the first 90 days.\n\nIs getting traders in for the first season something you're planning now?\n\nSam" },
          { dir: 'in', ch: 'email', at: '2026-10-05T17:30', subject: "Re: Atlas Perps' points programme", body: 'Timing works. We kick off points on the 20th. Do you have time next week?\n\nFelix' },
          { dir: 'out', ch: 'email', at: '2026-10-06T09:05', you: true, subject: "Re: Atlas Perps' points programme", body: "Great. Here's my calendar: cal.com/sam-tideline/intro\n\nSam" },
          { dir: 'event', at: '2026-10-06T09:40', body: 'Felix booked Tue 13 Oct, 10:00 AM through your booking link' },
        ],
      },
    ],

    calls: [
      { id: 'call1', person: 'p-grace', at: '2026-10-07T15:30', title: 'Intro call', thread: 't8' },
      { id: 'call2', match: 't4', email: 'r.kim@gmail.com', at: '2026-10-08T11:00', title: 'Intro call', thread: 't4' },
      { id: 'call3', person: 'p-ama', at: '2026-10-09T14:00', title: 'Intro call', thread: 't10', noReply: true },
      { id: 'call4', person: 'p-felix', at: '2026-10-13T10:00', title: 'Intro call', thread: 't11' },
    ],

    never: [
      { id: 'n1', type: 'Company', value: 'Ledgerly', detail: 'ledgerly.com', reason: 'Client', added: '2026-09-01', by: 'You' },
      { id: 'n2', type: 'Company', value: 'Corelane Pay', detail: 'corelanepay.com', reason: 'Client', added: '2026-09-01', by: 'You' },
      { id: 'n3', type: 'Company', value: 'Bluefin Capital', detail: 'bluefin.vc', reason: 'Investor in Tideline', added: '2026-09-01', by: 'You' },
      { id: 'n4', type: 'Person', value: 'Hana Sato', detail: 'Mintleaf', reason: 'Asked to be removed', added: '2026-10-05', by: 'Onbook' },
      { id: 'n5', type: 'Rule', value: 'Public companies', detail: 'From your company profile', reason: 'Never these kinds', added: '2026-09-01', by: 'You' },
    ],

    team: [
      { id: 'u1', name: 'Sam Rivera', email: 'sam@tideline.studio', role: 'Owner', status: 'Active', campaigns: 5 },
      { id: 'u2', name: 'Alex Moreno', email: 'alex@tideline.studio', role: 'Member', status: 'Invited', invited: '2026-10-05', campaigns: 0 },
    ],

    notifications: { reply: true, booked: true, match: true, daily: false, weekly: true, account: true, billing: true },

    results: {
      c1: {
        weeks: [
          { label: '21 Sep', people: 38, positive: 1, calls: 0 },
          { label: '28 Sep', people: 61, positive: 4, calls: 2 },
          { label: '5 Oct', people: 43, positive: 4, calls: 2 },
        ],
        byChannel: [{ ch: 'email', sent: 214, positive: 4 }, { ch: 'linkedin', sent: 168, positive: 3 }, { ch: 'x', sent: 61, positive: 2 }],
        byStep: [{ step: 's2', positive: 3 }, { step: 's3', positive: 2 }, { step: 's4', positive: 2 }, { step: 's5', positive: 2 }],
        byReason: [
          { reason: 'Raised money', contacted: 48, positive: 4 },
          { reason: 'Hiring a growth lead', contacted: 31, positive: 2 },
          { reason: 'Launching a product', contacted: 27, positive: 2 },
          { reason: 'Entered a new market', contacted: 22, positive: 1 },
          { reason: 'No recent news', contacted: 14, positive: 0 },
        ],
        replies: { positive: 9, notInterested: 4, optOut: 1, auto: 6 },
      },
    },

    /* Setup demo: the list Onbook builds in step 3 */
    setup: {
      site: 'tideline.studio',
      matches: 1860,
      coverage: 34,
      rebuildsLeft: 3,
      list: ['kestrel', 'halcyon', 'orbit', 'quanta', 'glasswing', 'sable', 'atlas', 'arcadia', 'juniper', 'kite', 'brightwater', 'pebble', 'lumen', 'tern', 'fathom', 'northpoint', 'copperline', 'harbor'],
      people: {
        kestrel: [['Maya Chen', 'Co-founder'], ['Ben Ortiz', 'Head of Growth']],
        halcyon: [['Daniel Price', 'CEO'], ['Rosa Lind', 'Head of Marketing']],
        orbit: [['Priya Natarajan', 'CMO'], ['Jakub Novak', 'Head of Marketing']],
        quanta: [['Ama Mensah', 'Co-founder'], ['Theo Laurent', 'Head of Marketing']],
        glasswing: [['Diego Alvarez', 'Co-founder'], ['Lucia Ortega', 'Head of Growth']],
        sable: [['Wei Zhang', 'CEO'], ['Mei Lin', 'Head of Growth']],
        atlas: [['Felix Wagner', 'Co-founder']],
        arcadia: [['Sofia Marques', 'Head of Growth'], ['Rui Santos', 'CMO']],
        juniper: [['Yuki Tanaka', 'Head of Growth'], ['Liam Walsh', 'CMO']],
        kite: [['Isla Murray', 'Growth Lead'], ['Jordan Ellis', 'CMO']],
        brightwater: [['Jonas Weber', 'Head of Marketing'], ['Claire Dunn', 'CMO']],
        pebble: [['Ruben Visser', 'CMO'], ['Femke de Vries', 'Head of Marketing']],
        lumen: [['Rachel Kim', 'Head of Growth'], ['Arjun Mehta', 'CMO']],
        tern: [['Kofi Boateng', 'CEO'], ['Wanjiru Kamau', 'Head of Marketing']],
        fathom: [['Anika Shah', 'VP Growth'], ['Peter Hall', 'CMO']],
        northpoint: [['Lena Fischer', 'Head of Marketing'], ['Mark Ellison', 'VP Marketing']],
        copperline: [['Chloe Martin', 'VP Marketing'], ['Sean Byrne', 'CMO']],
        harbor: [['Marcus Bell', 'CEO'], ['Nora Quinn', 'Head of Growth']],
      },
      fiveQuestions: [
        { q: 'What do you sell, and who buys it?', a: '' },
        { q: 'Who is your best customer right now, and why did they buy?', a: '' },
        { q: 'What result can we quote? Name the client or describe them.', a: '' },
        { q: 'Which companies, or kinds of company, should we never contact?', a: '' },
        { q: 'How should your messages sound?', a: '' },
      ],
    },
  });

  /* ---------- Lookups ---------- */
  const byId = (arr) => (id) => arr.find((x) => x.id === id);
  OB.get = {
    campaign: byId(D.campaigns),
    company: byId(D.companies),
    person: byId(D.people),
    thread: byId(D.threads),
    list: byId(D.lists),
    account: byId(D.accounts),
    proof: byId(D.profile.proof),
    flow: (id) => D.flows[id],
    flowOf: (campaignId) => { const c = OB.get.campaign(campaignId); return c && c.flow ? D.flows[c.flow] : D.flows.f1; },
    peopleIn: (campaignId) => D.people.filter((p) => p.campaign === campaignId),
    peopleAt: (companyId) => D.people.filter((p) => p.company === companyId),
    threadOf: (personId) => D.threads.find((t) => t.person === personId),
    needsYou: () => D.threads.filter((t) => t.status === 'needs-you'),
    needsYouCounts: () => { const n = D.threads.filter((t) => t.status === 'needs-you'); return { replies: n.filter((t) => t.type !== 'match').length, matches: n.filter((t) => t.type === 'match').length, total: n.length }; },
    accountIssue: () => (OB.state.sim.linkedinIssue ? OB.get.account('a-li') : null),
    used: () => (OB.state.sim.outOfPeople ? D.plan.allowance : D.plan.used),
  };

  /* Words for a person's next step: "Email on Thu 8 Oct" */
  OB.nextText = (p) => {
    if (!p.next) return '';
    const flow = OB.get.flowOf(p.campaign);
    const step = flow.steps.find((s) => s.id === p.next.step);
    if (!step) return '';
    if (!p.next.at) return `${step.title} when they accept`;
    return `${step.title}, ${OB.fmt.rel(p.next.at)}`;
  };
})();
