# Email Drip Campaign Templates for Tillerstead LLC
# Automated follow-up sequence for Netlify form submissions

## Email 1: Immediate Response (Auto-reply)
**Subject:** Thanks for contacting Tillerstead - We'll respond within 24 hours

**Body:**
```
Hi [Name],

Thank you for reaching out to Tillerstead LLC! We received your inquiry about [Project Type] in [County/City].

**What happens next:**

1. **Review** - I'm reviewing your project details and will respond within 24 hours (usually much sooner!)
2. **Follow-up** - I'll reach out by [phone/email] to discuss your timeline, answer questions, and confirm details
3. **Estimate** - You'll receive a detailed written proposal with pricing, timeline, and warranty information

**Need faster service?**
- 📱 Text photos to (609) 862-8808 for 2-4 hour quote turnaround
- 📞 Call directly: (609) 862-8808
- 🚨 Emergency repairs? Call immediately - we prioritize water damage

**In the meantime:**
- Check out our [portfolio](/portfolio/) of recent South Jersey projects
- Read our [5-star reviews](/reviews/) from Atlantic, Ocean & Cape May County customers
- Download our [Free NJ Tile Installation Guide](/download/nj-tile-guide/)

Thanks for considering Tillerstead for your project!

Tyler
Tillerstead LLC
Licensed NJ Home Improvement Contractor
HIC #13VH10808800
(609) 862-8808
tillerstead.com
```

---

## Email 2: Day 3 Follow-up (if no response)
**Subject:** Still planning your [Project Type]? I'm here to help

**Body:**
```
Hi [Name],

I wanted to follow up on your inquiry from [Date] about [Project Type] in [County].

I know contractor decisions take time - I'm here when you're ready to move forward.

**Common questions I can answer:**
- What's a realistic timeline for my project?
- How do I choose between tile options?
- What waterproofing system is best for NJ?
- Can you work around my schedule?
- Do you offer financing options?

**Ready for your estimate?**
Reply to this email, text/call (609) 862-8808, or [schedule a consultation](https://tillerstead.com/contact/).

Best,
Tyler
```

---

## Email 3: Day 7 - Value Email
**Subject:** 5 Things Every NJ Homeowner Should Know About Tile Installation

**Body:**
```
Hi [Name],

Whether you're moving forward with Tillerstead or hiring another contractor, here are 5 critical things every New Jersey homeowner should know about tile projects:

**1. License Verification is Non-Negotiable**
Always verify NJ HIC licensing at njconsumeraffairs.gov. Unlicensed contractors can't pull permits and you have no legal recourse if something goes wrong.

**2. Waterproofing Makes or Breaks a Shower**
A beautiful tile job over improper waterproofing = expensive water damage. Look for ANSI A118.10 certified membrane systems (Schluter, RedGard, Hydroban) installed per manufacturer specs.

**3. Written Estimates Protect You**
Verbal quotes lead to disputes. Get everything in writing: scope, materials, timeline, payment schedule, change order process, and warranty terms.

**4. Change Orders Should Be Expected**
The best contractors document scope changes in writing before proceeding. This protects both parties and prevents billing surprises.

**5. Cheap Usually Means Shortcuts**
The lowest bid often means cutting corners on waterproofing, substrate prep, or material quality. Average South Jersey bathroom tile: $3,500-$8,500 depending on size and materials.

**Want the full list?** Download our [Free NJ Tile Installation Guide](/download/nj-tile-guide/) with 25 pages of expert advice.

**Ready to discuss your project?** I'm just a text/call away: (609) 862-8808

Best,
Tyler
Tillerstead LLC
```

---

## Email 4: Day 14 - Last Check-in
**Subject:** Checking in one last time - any questions?

**Body:**
```
Hi [Name],

This is my last follow-up email about your [Project Type] inquiry.

I don't want to be pushy - if you've decided to go another direction, I totally understand! But if you're still in the planning phase and have questions, I'm happy to help.

**No-pressure conversation:**
- Answer your tile/remodeling questions
- Provide ballpark pricing guidance
- Recommend materials for your specific situation
- Share references from [County] customers

**Three ways to reach me:**
1. Reply to this email
2. Text/call: (609) 862-8808  
3. Schedule online: [tillerstead.com/contact](https://tillerstead.com/contact/)

Thanks for considering Tillerstead. Best of luck with your project!

Tyler
Tillerstead LLC
Licensed NJ HIC #13VH10808800
```

---

## Netlify Forms Integration Setup

Add to `netlify.toml`:

```toml
[build]
  publish = "_site"

[[plugins]]
  package = "@netlify/plugin-emails"

[plugins.inputs]
  email_templates = "email-templates/"
  
[build.environment]
  CONTACT_EMAIL = "info@tillerstead.com"

# Email notifications
[[notifications]]
  type = "email"
  event = "submission-created"
  form = "homepage-contact"
  subject = "New Contact Form Submission - {{ name }}"
  to = "info@tillerstead.com"

[[notifications]]
  type = "email"
  event = "submission-created"
  form = "tile-guide-download"
  subject = "New Guide Download - {{ name }}"
  to = "info@tillerstead.com"
```

---

## Implementation Notes:

1. **Automated Responses:** Use Netlify Forms + Zapier/Make.com to trigger email sequence
2. **Segmentation:** Tag leads by project type, county, and urgency level
3. **SMS Integration:** Forward high-urgency leads to SMS notifications
4. **CRM Sync:** Connect to ActiveCampaign, Mailchimp, or ConvertKit for drip campaigns
5. **Analytics:** Track open rates, click-through rates, and conversion by email in sequence

**Recommended Tools:**
- Netlify Forms (form capture)
- Zapier (automation)
- ConvertKit or ActiveCampaign (email drip)
- Twilio (SMS notifications)
