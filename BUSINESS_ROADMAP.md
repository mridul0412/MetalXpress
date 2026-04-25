# BhavX — Business Roadmap (6-Month Fundraise Plan)

> **Purpose**: This is the *business* roadmap (fundraise, traction, team, investor strategy).
> The *product* roadmap lives in [ROADMAP.md](./ROADMAP.md) — keep them separate.
>
> **Ideal goal**: ₹50 Cr raise in 6 months at 5-10x valuation (₹250-500 Cr post-money)
> **Realistic goal**: ₹10-25 Cr in 6 months at ₹50-150 Cr post-money
> **Floor goal**: ₹2-5 Cr angel round in 4 months — buys 12-18 months runway, validates
>
> **Update cadence**: Review every Sunday evening. Tick boxes as items complete. Update `## 🎯 Current Focus` block in CLAUDE.md as we progress.

---

## 🎯 The Big Picture

| Path | Probability | Cap Table Outcome | Trigger |
|------|-------------|-------------------|---------|
| **Floor**: ₹2-5 Cr angel | 80% | Founder keeps 80-85% | Need: deployed product + 50-100 active users |
| **Realistic**: ₹10-25 Cr seed | 40% | Founder keeps 60-70% | Need: 200+ users + ₹5-10L MRR + co-founder |
| **Stretch**: ₹50 Cr Pre-Series A | 10% | Founder keeps 50-60% | Need: ₹50L+ MRR by Month 4 + competing term sheets + ex-unicorn advisor |

⚠️ **Reality check**: Indian VCs at seed stage rarely write >₹15 Cr without revenue. ₹50 Cr cheques into pre-revenue solo-founder companies in B2B SaaS are rare. We're aiming high but planning for the realistic case.

---

## 🔴 Month 1 — Foundation (Weeks 1-4)

**Theme**: Get to a defensible "VC-ready" state. Product live, first users, co-founder hunt started.

### Week 1: Production Deploy
- [ ] **Cloudinary migration** — move uploads from local disk to Cloudinary CDN (Railway redeploy will wipe local files)
- [ ] **Real contact numbers on Contact page** — replace placeholder `XXXXX XXXXX`
- [ ] **Production env vars** — generate strong JWT_SECRET, ADMIN_PASSWORD, prod DATABASE_URL
- [ ] **Deploy backend → Railway** (PostgreSQL plugin)
- [ ] **Deploy frontend → Vercel**
- [ ] **DNS** — point bhavx.com → Vercel, Hostinger DNS update
- [ ] **Run seed on prod DB** + paste first real WhatsApp rate
- [ ] **Smoke test**: signup, KYC, post listing, make offer, complete deal end-to-end on production

### Week 2: Beta Recruitment
- [ ] **Identify 20 hand-picked traders** (Delhi + Mumbai, mix of buyers/sellers)
- [ ] **Personally onboard each one** — phone call, screen-share walkthrough
- [ ] **Get them posting real listings** + having real conversations
- [ ] **Daily check-ins** — they're your alpha cohort; their feedback rewrites your product
- [ ] **Set up analytics** — PostHog or Mixpanel free tier (track DAU, retention, deal flow)
- [ ] **Set up customer support** — at minimum a WhatsApp business number you respond to within 1 hour

### Week 3: Co-Founder Hunt (CRITICAL)
- [ ] **Decide co-founder profile**: Technical (CTO) OR Business (CBO/COO)
  - If you stay product+tech: find someone with metal-trade industry contacts
  - If you go biz/sales: find a senior engineer to take CTO role
- [ ] **Post on**: LinkedIn, Y Combinator Co-Founder Matching, Lepton.so, founderpair.com, AngelList
- [ ] **Talk to 20+ candidates** in 2 weeks (high volume — 1-2 will be right)
- [ ] **Reference checks on the 2-3 finalists** — call ex-bosses, ex-colleagues
- [ ] **Equity discussion**: prepare to offer 25-40% with 4-year vesting + 1-year cliff
- [ ] **Trial period**: 4-6 weeks before formally bringing on board

### Week 4: Pitch Materials v1
- [ ] **Pitch deck v1** (10-12 slides):
  - Problem (WhatsApp chaos for metal traders)
  - Solution (BhavX) + live demo
  - Market (TAM ₹12-15L Cr / SAM ₹3-4L Cr / SOM ₹5-15K Cr)
  - Traction (users, deals, MRR)
  - Business model (SaaS + commission, with embedded financing roadmap)
  - Competition (IndiaMART, Metalbook, OfBusiness positioning)
  - Team
  - Ask (₹X Cr at ₹Y post-money)
  - Use of funds
  - Vision (Bloomberg Terminal for Indian commodities)
- [ ] **Founder LinkedIn polish** — credentials, project highlights, 3-4 strong posts about industry insights
- [ ] **One-pager / 30-second pitch** memorized
- [ ] **Demo video** (2-3 min screen recording walking through user flow)

**Month 1 success criteria**: Live in production, 20 onboarded traders, co-founder identified (or 2-3 finalists in trial), pitch deck v1 ready.

---

## 🟡 Month 2 — Public Launch (Weeks 5-8)

**Theme**: Go from 20 alpha users to 100-200 active users. First paying customers. Industry advisors signed.

### Week 5: Open Launch in Delhi + Mumbai
- [ ] **Launch on ProductHunt + Indie Hackers** (one-time press boost)
- [ ] **LinkedIn launch post** — long-form story of why BhavX
- [ ] **Twitter/X thread** with screenshots
- [ ] **Reach out to metal trade media**: Recycling Today India, Steelmint, Scrap Magazine
- [ ] **Inflection moment marketing**: Free Pro for first 100 signups (3-month comp)

### Week 6: WhatsApp Group Infiltration (with permission)
- [ ] **Identify 10-15 active WhatsApp metal trader groups**
- [ ] **Get permission from group admins** to share BhavX (offer them free Pro lifetime)
- [ ] **Don't spam** — share value first (e.g., daily LME/MCX summary post linking to BhavX)
- [ ] **Track conversion**: which groups convert best, which traders sign up

### Week 7: Advisors + Industry Credibility
- [ ] **Approach 5 metal-industry seniors** for advisor roles:
  - Ex-OfBusiness, ex-Metalbook, ex-MMTC, ex-Hindalco operations
  - Retired senior dealers from Delhi/Mumbai metal markets
- [ ] **Equity grant**: 0.25-0.5% over 2-year vesting per advisor
- [ ] **Get 2-3 commitments minimum** — they unlock VC intros
- [ ] **Get them on calls with your beta users** (validates their interest)

### Week 8: Metrics Documentation
- [ ] **Active users**: aim 100-200 weekly active
- [ ] **Paying users**: 5-15 (Pro ₹299/mo)
- [ ] **MRR**: ₹2-5K (small but trend-positive)
- [ ] **Deals closed on platform**: 5-10 (real GMV number)
- [ ] **Retention curve documented** — Week 1 vs Week 4 cohort
- [ ] **NPS survey** — at least 30 responses, target NPS > 40
- [ ] **Press mentions**: minimum 1 (Inc42, YourStory, or industry outlet)

**Month 2 success criteria**: 200+ active users, ₹2-5K MRR, 5-10 deals on platform, 2-3 advisors signed, 1 press mention.

---

## 🟢 Month 3 — Angel Round Sprint (Weeks 9-12)

**Theme**: Close ₹1-3 Cr angel round. Use angel money + traction as launchpad for institutional VCs.

### Week 9: Angel List Building
- [ ] **Build target list of 50 angels** in 4 buckets:
  1. **Operator angels** (founders/ex-founders): Kunal Shah (CRED), Asish Mohapatra (OfBusiness), Sandeep Kumar (Metalbook), Sandeep Tandon, Naval Ravikant
  2. **Industry angels**: ex-IndiaMART, ex-Mjunction, retired metal industry execs
  3. **Platform angels** (active investors via platforms): Inflection Point Ventures syndicate leads, LetsVenture lead investors
  4. **Domain angels**: B2B SaaS-focused (look at Stellaris/Together fund LP networks)
- [ ] **For each: warm intro path** — who in your network can intro you?
- [ ] **Cold outreach is OK if warm fails**, but warm is 10x conversion

### Week 10: Pitch Marathon
- [ ] **Take 30+ angel meetings** in 2 weeks (15/week, 3/day)
- [ ] **Format**: 30-min Zoom — 5min intro, 15min deck/demo, 10min Q&A
- [ ] **Track in spreadsheet**: name, contact, status, follow-up date, $ commit
- [ ] **Send recap email after every meeting** with deck + asks
- [ ] **Get 5+ verbal commits** at ₹25L-₹2 Cr each → target ₹2-3 Cr round size

### Week 11: Angel Term Sheet
- [ ] **Decide round size**: ₹1.5-3 Cr at ₹15-25 Cr post-money (raise 10-15% dilution)
- [ ] **Use SAFE notes or CCPS** — simpler than priced equity at this stage
- [ ] **Engage startup lawyer**: Khaitan, AZB, Cyril Amarchand, Veritas Legal (₹50K-1L)
- [ ] **Issue SAFEs to lead angel** first, then circulate
- [ ] **Set hard close date**: 4 weeks max from first commit

### Week 12: Money in Bank
- [ ] **Wire transfers received**
- [ ] **Cap table updated**
- [ ] **Announce on LinkedIn**: photo with cap table or first wire transfer (don't disclose amounts publicly unless strategic)
- [ ] **Hire first 2 employees**:
  - Engineer #1 (frontend or full-stack, ₹15-25L/year)
  - Business development / customer success (₹10-15L/year)

**Month 3 success criteria**: ₹1-3 Cr in bank, 2 employees hired, runway extended to 18+ months.

---

## 🔵 Month 4 — VC Pipeline Building (Weeks 13-16)

**Theme**: With angel money + traction, start serious institutional VC conversations. Don't ask yet. Build relationships.

### Week 13: Scale Operations
- [ ] **Active users**: target 500+
- [ ] **Paying users**: 50-80 (₹15-25K MRR)
- [ ] **Deals closed**: 25-40 cumulative
- [ ] **GMV**: ₹50L-₹2 Cr cumulative
- [ ] **Expand to 1 new city**: Ahmedabad or Ludhiana
- [ ] **Retention metrics**: Week 4 retention > 40%, Pro churn < 10% monthly

### Week 14: VC List + Warm Intros
- [ ] **Target VC list** (15-20 firms):
  - **Stellaris Venture Partners** (B2B SaaS specialists)
  - **Together Fund** (founder-led B2B)
  - **Saama Capital**
  - **Elevation Capital** (Paytm/Swiggy backers)
  - **Z47** (formerly Matrix India)
  - **Nexus Venture Partners**
  - **Lightspeed India**
  - **Peak XV** (Sequoia India) — apply to Surge program
  - **Blume Ventures** (industrial tech)
  - **Bessemer India** (B2B commerce)
  - **A91 Partners**
  - **Fundamentum** (Nilekani fund — growth stage but track)
  - **Tribe Capital** (Metalbook backer — domain match)
  - **3one4 Capital**
  - **Chiratae Ventures**
- [ ] **For each: identify partner** (LinkedIn research, recent portfolio)
- [ ] **Warm intro path via**: angels (best), advisors, founder network, LinkedIn 2nd-degree

### Week 15: Exploratory Meetings (NO ASK)
- [ ] **Take 10-15 VC partner meetings** — frame as "I'd love your perspective on the space"
- [ ] **No deck, no fundraise pitch** — just conversation about market, your traction, their portfolio
- [ ] **Ask THEM smart questions**: "What patterns do you see in B2B commerce in India?" "What worked for Metalbook?"
- [ ] **End with**: "Would you be open to staying in touch as we grow?" (90% will say yes)

### Week 16: Deck v2 + Data Room Prep
- [ ] **Update pitch deck v2** with angel-round metrics + improved traction graphs
- [ ] **Build VC data room** (Google Drive folder, controlled access):
  - Cap table (current)
  - Financial model (5-year projections)
  - Customer cohort retention
  - User testimonials (5-10 video clips from real traders)
  - Demo videos
  - Press mentions
  - Team bios + LinkedIn
  - Legal docs (incorporation, IP)
- [ ] **Prepare reference list**: 5 customers willing to take VC reference calls

**Month 4 success criteria**: 500+ active users, ₹15-25K MRR, 10+ exploratory VC meetings done, data room ready.

---

## 🟣 Month 5 — VC Pitch Sprint (Weeks 17-20)

**Theme**: Convert exploratory meetings into pitches. Generate competing interest.

### Week 17: First Formal Pitches
- [ ] **From the 10-15 exploratory meetings, 5-7 will be interested**
- [ ] **Schedule formal pitch with each** (60-90 min, full partner team if possible)
- [ ] **Lead with**: traction in last 30 days (growth velocity matters more than absolute numbers)
- [ ] **Goal**: Get 3 firms into IC (Investment Committee) review
- [ ] **Continue traction**: 700+ active users, ₹30-50K MRR

### Week 18: Customer Reference Calls
- [ ] **Each interested VC will request reference calls** with 3-5 customers
- [ ] **Prep your customers**: brief them on what to say (not script, but topics — pain BhavX solved, willingness to pay, what they'd want next)
- [ ] **Founder reference calls**: VCs will also call other founders who know you — make sure those are positive
- [ ] **Advisor calls**: VCs call your advisors to validate your team

### Week 19: First Term Sheets
- [ ] **Goal: receive 1-2 term sheets**
- [ ] **Structure to push for**:
  - **Pre-money**: ₹50-150 Cr (depends on traction)
  - **Round size**: ₹10-25 Cr
  - **Lead investor**: 60-70% of round
  - **Pro-rata for angels**: yes
  - **Liquidation preference**: 1x non-participating (NEVER accept participating preferred at seed)
  - **Anti-dilution**: broad-based weighted average (NEVER full ratchet)
  - **Founder vesting**: 4-year reverse vesting with 1-year cliff (some VCs ask for this — push back to 3-year)
  - **Board composition**: 1 investor seat, 1 founder seat, 1 independent (you nominate)
- [ ] **Don't sign first one** — use it to negotiate competing offers

### Week 20: Negotiation
- [ ] **Get 2-3 competing offers** if possible
- [ ] **Use angel investors as advisors** in negotiations — they've seen many term sheets
- [ ] **Lawyer reviews EVERY clause** before signing
- [ ] **Watch out for**:
  - Founder departure clauses (bad leaver provisions)
  - Drag-along rights without protections
  - Aggressive milestones tied to founder removal
  - Excessive board control
  - "Most favored nation" clauses that handcuff future rounds

**Month 5 success criteria**: 1-2 term sheets in hand, 700+ users, ₹30-50K MRR.

---

## 🌟 Month 6 — Close + Announce (Weeks 21-24)

**Theme**: Close the round. Announce. Hire aggressively. Deploy capital.

### Week 21: Pick Your Lead
- [ ] **Compare term sheets on 5 axes**:
  1. Valuation (matters less than you think)
  2. Lead partner — will they champion you internally?
  3. Portfolio fit — synergies vs conflicts
  4. Reputation among founders (call 5 of their portfolio founders)
  5. Value-add beyond money (intros, hiring help, follow-on capacity)
- [ ] **Pick your lead** — sign the term sheet
- [ ] **Use lead's brand to fill remainder of round** in 2-3 weeks

### Week 22: Due Diligence
- [ ] **Legal DD**: data room, incorporation docs, IP assignments, employee contracts
- [ ] **Financial DD**: bank statements, books, GST returns, customer contracts
- [ ] **Customer DD**: VC may interview 10+ of your users
- [ ] **Reference DD**: VCs talk to your prior employers, college mates, prior VCs (if any)
- [ ] **Background check**: criminal record, civil suits, financial history (legitimate VCs run these)

### Week 23: Closing Mechanics
- [ ] **SHA (Shareholder Agreement)** + SSA (Share Subscription Agreement) finalized with lawyer
- [ ] **Cap table**: founder ~50-65%, angels ~10-15%, VCs ~25-35%, ESOP pool 10-15%
- [ ] **Establish ESOP pool** — 10-15% for next 24 months of hires
- [ ] **Wire transfer instructions** signed
- [ ] **Money received** ✅

### Week 24: Announce + Deploy
- [ ] **Press release**: TechCrunch, Inc42, YourStory, Entrackr (give exclusive to one for max impact)
- [ ] **LinkedIn announcement**: founder post + co-founder post + lead VC post (coordinated)
- [ ] **Twitter/X thread** about journey
- [ ] **Customer email**: thank early users, announce roadmap
- [ ] **Hiring sprint**: post 8-10 roles (engineering, BD, ops, marketing)
- [ ] **Engagement update**: investors get monthly KPI email starting Month 7

**Month 6 success criteria**: ₹10-25 Cr in bank (₹50 Cr stretch), funded to scale, hiring underway.

---

## 📊 Progress Metrics (Update Weekly)

### Product Metrics
| Metric | Month 1 | Month 2 | Month 3 | Month 4 | Month 5 | Month 6 |
|--------|---------|---------|---------|---------|---------|---------|
| Active users (WAU) | 20 | 200 | 350 | 500 | 700 | 1,000 |
| Paying users (Pro) | 0 | 10 | 30 | 70 | 120 | 200 |
| MRR (₹) | 0 | 3K | 9K | 21K | 36K | 60K |
| Deals closed | 0 | 10 | 30 | 60 | 100 | 150 |
| GMV (₹) | 0 | 10L | 50L | 1.5 Cr | 3 Cr | 5 Cr |
| Cities live | 2 | 2 | 3 | 3 | 4 | 5 |

### Business Metrics
| Metric | Month 1 | Month 2 | Month 3 | Month 4 | Month 5 | Month 6 |
|--------|---------|---------|---------|---------|---------|---------|
| Co-founder | Search | Identified | Trial | Onboarded | Equity vested | Vested |
| Advisors | 0 | 1-2 | 3 | 3-4 | 4 | 5 |
| Capital raised | ₹0 | ₹0 | ₹1-3 Cr | ₹1-3 Cr | ₹1-3 Cr | ₹10-25 Cr |
| Team size | 1 | 1 | 3 | 4-5 | 5-6 | 12-15 |

---

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **No co-founder found by Month 2** | Solo-founder seed rounds are 50% of VCs. Lean into ex-unicorn advisors instead. Make it work. |
| **MRR stuck at ₹5-10K by Month 3** | Pivot pricing — try ₹999/mo with more value, or B2B contracts with mills directly |
| **No press coverage** | Hire freelance PR (Plus91, Konnect Insights) for ₹50K-1L for launch push |
| **Angels stall at "interested"** | Set hard close date in pitch — "round closes in 3 weeks" — creates FOMO |
| **VCs ghost after first meeting** | This is 70% of meetings. Don't take personal. Move on, follow up after milestones. |
| **Term sheet has bad terms** | Walk away. ₹10 Cr at terrible terms is worse than no money. Lawyer reviews EVERYTHING. |
| **Cofounder dispute** | 4-year vesting with 1-year cliff. Founder agreement signed Day 1. IP assignments clear. |
| **Cyclical commodity crash mid-fundraise** | Lead with platform metrics (users, retention) not GMV. Frame as "we benefit from volatility — traders need our data more in choppy markets." |

---

## 💰 Use of Funds (₹15 Cr scenario)

| Category | % | ₹ Amount | Detail |
|----------|---|----------|--------|
| Engineering team | 30% | ₹4.5 Cr | 5 engineers × 18 months |
| Sales + Customer Success | 25% | ₹3.75 Cr | 4 BD + 2 CS × 18 months |
| Marketing + Growth | 15% | ₹2.25 Cr | Performance marketing, content, PR |
| Cloud + Tooling | 5% | ₹75L | AWS/Railway/Cloudinary, Mixpanel, MSG91 |
| Embedded financing R&D | 10% | ₹1.5 Cr | NBFC partnership setup, underwriting model |
| Compliance + Legal | 5% | ₹75L | CA, lawyer retainer, GST, audits |
| Working capital + buffer | 10% | ₹1.5 Cr | Founder + co-founder salaries, contingency |

**18-month runway target.** Plan to raise Series A from position of strength at month 14-16.

---

## 🎯 Investor-Ready Story (the elevator pitch)

> **"India's metal trade is a $150B/year market that runs on WhatsApp broadcasts and personal trust. We're the Bloomberg Terminal for Indian commodity traders — live LME/MCX/local rates, verified PAN-KYC marketplace, and embedded trade financing. We've onboarded 700+ traders in 3 cities, doing ₹3 Cr GMV/month at 0.1% commission, with ₹35K MRR from Pro subscriptions. Raising ₹15 Cr to scale to 5,000 traders, launch embedded financing with our NBFC partner, and expand into adjacent commodities. OfBusiness did this in raw materials — we're doing it deeper in metals where the data moat is sharpest."**

(Practice this. Memorize it. Adjust numbers as you progress.)

---

## 📞 Key Contacts to Build NOW

(Spend 30 min/week on this — networking compounds)

1. **5 founders who've raised B2B seed in India in last 18 months** (LinkedIn outreach)
2. **2-3 partners at target VCs** (no ask, just relationship)
3. **3 startup lawyers** for retainer comparison (Khaitan, AZB, Cyril, Veritas)
4. **1 startup CA** for tax + GIFT City consultation
5. **2-3 PR contacts** at Inc42, YourStory, Entrackr

---

## 🤖 Automation & Reminders

- **CLAUDE.md** has a `## 🎯 Current Business Focus` block at top — auto-loaded each session, shows current month + top 3 priorities. Update it weekly.
- **SessionStart hook** (optional, opt-in): can be configured in `.claude/settings.json` to print current month's targets every time a Claude session starts. See README for setup.
- **Weekly review**: every Sunday evening, tick boxes on this file, update CLAUDE.md focus block, push to GitHub.
- **Progress diary**: maintain a `progress-log.md` (one paragraph per week) — useful for VC updates later.

---

## 📅 Session Log

| Date | Session | Milestone Hit |
|------|---------|---------------|
| 2026-04-26 | Created | Roadmap drafted, fundraise plan locked in |

---

> ⚠️ **Disclaimers**: This roadmap reflects general Indian VC market knowledge as of 2026-04-26. Specific funding terms, valuations, and VC firm preferences shift constantly. Talk to 3-4 founders who've raised in your stage/sector before key decisions. Engage a startup lawyer (Khaitan, AZB, Cyril Amarchand, Veritas Legal) before signing any term sheet. This is not investment or legal advice.
