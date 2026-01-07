# scaffold-tillerstead.ps1
# Creates a clean, compliant Jekyll skeleton + Build Phase wiring.
# Safe: will not overwrite existing files unless -ForceWrite is used.

param(
  [switch]$ForceWrite
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$p) { if (!(Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null } }

function Write-IfMissing([string]$Path, [string]$Content) {
  $exists = Test-Path -LiteralPath $Path
  if ($exists -and -not $ForceWrite) {
    Write-Host "Skip (exists): $Path" -ForegroundColor DarkGray
    return
  }
  $dir = Split-Path -Parent $Path
  Ensure-Dir $dir
  $Content | Set-Content -LiteralPath $Path -Encoding utf8
  Write-Host "Wrote: $Path" -ForegroundColor Green
}

$Root = (Resolve-Path ".").Path

# ---- Core dirs
Ensure-Dir "$Root\_layouts"
Ensure-Dir "$Root\_includes"
Ensure-Dir "$Root\assets\css"
Ensure-Dir "$Root\assets\js"
Ensure-Dir "$Root\_data"
Ensure-Dir "$Root\pages"
Ensure-Dir "$Root\pages\build"

# ---- _config.yml (minimal + pro SEO defaults)
$Config = @"
title: Tillerstead
description: "NJ licensed home improvement contractor focused on TCNA/ANSI-aligned tile assemblies, waterproof shower systems, and documentation-forward remodeling in South Jersey."
url: ""
baseurl: ""

markdown: kramdown
permalink: pretty

plugins:
  - jekyll-sitemap
  - jekyll-seo-tag

collections:
  pages:
    output: true
    permalink: /:path/

defaults:
  - scope:
      path: ""
    values:
      layout: default
      image: /assets/img/og.jpg

# Company (pulled into templates)
company:
  name: "Tillerstead"
  legal_name: "Tillerstead LLC"
  phone_display: "(609) 862-8808"
  phone_link: "+16098628808"
  email: "dTb33@pm.me"
  address_line: "325 East Jimmie Leeds Road, Suite 7-333"
  address_locality: "Galloway Township"
  address_region: "NJ"
  postal_code: "08205"

Write-IfMissing "$Root\_config.yml" $Config

# ---- Build phase nav data (drives prev/next + sidebar)
$BuildPhases = @"
- key: nj-codes-permits
  step: 1
  title: "NJ Codes, Permits & Inspections"
  url: /pages/build/nj-codes-permits/
- key: shower-pans-slopes-drains
  step: 2
  title: "Shower Pans, Slopes & Drains"
  url: /pages/build/shower-pans-slopes-drains/
- key: waterproofing-systems
  step: 3
  title: "Waterproofing Systems"
  url: /pages/build/waterproofing-systems/
- key: curbs-curbless
  step: 4
  title: "Curbs, Thresholds & Curbless Showers"
  url: /pages/build/curbs-curbless/
- key: framing-benches-niches
  step: 5
  title: "Framing for Benches, Seats & Niches"
  url: /pages/build/framing-benches-niches/
- key: tile-installation-standards
  step: 6
  title: "Tile Installation Standards"
  url: /pages/build/tile-installation-standards/
- key: flood-testing
  step: 7
  title: "Flood Testing & Verification"
  url: /pages/build/flood-testing/
- key: common-build-failures
  step: 8
  title: "Common Failures & Red Flags"
  url: /pages/build/common-build-failures/

Write-IfMissing "$Root\_data\build-phases.yml" $BuildPhases

# ---- Includes: head / header / footer / structured data
$Head = @"
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="{{ '/assets/css/main.css' | relative_url }}" />
{% seo %}

$Header = @"
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="{{ '/' | relative_url }}">
      <span class="brand-mark">T</span>
      <span class="brand-text">{{ site.title }}</span>
    </a>

    <nav class="nav">
      <a href="{{ '/pages/build/' | relative_url }}">Build Phase</a>
      <a href="{{ '/portfolio/' | relative_url }}">Portfolio</a>
      <a href="{{ '/reviews/' | relative_url }}">Reviews</a>
      <a href="{{ '/faq/' | relative_url }}">FAQ</a>
      <a class="btn" href="{{ '/contact/' | relative_url }}">Request Estimate</a>
    </nav>
  </div>
</header>

$Footer = @"
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-title">{{ site.company.legal_name | default: site.company.name }}</div>
        <div class="muted">
          {{ site.company.address_line }}<br/>
          {{ site.company.address_locality }}, {{ site.company.address_region }} {{ site.company.postal_code }}
        </div>
      </div>

      <div>
        <div class="footer-title">Contact</div>
        <div><a href="tel:{{ site.company.phone_link }}">{{ site.company.phone_display }}</a></div>
        <div><a href="mailto:{{ site.company.email }}">{{ site.company.email }}</a></div>
      </div>

      <div>
        <div class="footer-title">Compliance</div>
        {% assign c = site.data.compliance %}
        {% if c.license.number %}
          <div class="muted">NJ HIC #{{ c.license.number }}</div>
        {% endif %}
        {% if c.insurance.general_liability %}
          <div class="muted">Insured (GL {{ c.insurance.general_liability }})</div>
        {% endif %}
        <div class="muted">Written contracts • documented scope • milestones</div>
      </div>
    </div>

    <div class="fineprint">
      <span>© {{ "now" | date: "%Y" }} {{ site.company.legal_name | default: site.title }}.</span>
      <span>Educational content is general information, not installation instructions.</span>
    </div>
  </div>
</footer>

# LocalBusiness JSON-LD include (uses compliance.yml as truth)
$JsonLdLocal = @"
{% assign c = site.data.compliance %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": "{{ site.url }}{{ '/' | relative_url }}#organization",
  "name": "{{ site.company.name | default: site.title }}",
  "legalName": "{{ site.company.legal_name }}",
  "url": "{{ site.url }}{{ '/' | relative_url }}",
  "telephone": "{{ site.company.phone_link }}",
  "email": "{{ site.company.email }}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{ site.company.address_line }}",
    "addressLocality": "{{ site.company.address_locality }}",
    "addressRegion": "{{ site.company.address_region }}",
    "postalCode": "{{ site.company.postal_code }}",
    "addressCountry": "US"
  },
  "areaServed": [
    { "@type": "State", "name": "New Jersey" }
  ],
  "knowsAbout": [
    "TCNA methods",
    "ANSI A108/A118 standards",
    "Tile assemblies",
    "Bonded waterproofing (ANSI A118.10)"
  ],
  "identifier": "NJ HIC #{{ c.license.number }}"
}
</script>
"@

# FAQ JSON-LD include: builds from _data/home-faq.yml + _data/build-faq.yml if present
$JsonLdFaq = @"
{% assign homeFaq = site.data.home-faq | default: empty %}
{% assign buildFaq = site.data.build-faq | default: empty %}
{% assign faqs = homeFaq | concat: buildFaq %}

{% if faqs and faqs.size > 0 %}
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"FAQPage",
  "mainEntity":[
    {% for f in faqs %}
    {
      "@type":"Question",
      "name": {{ f.question | jsonify }},
      "acceptedAnswer": {
        "@type":"Answer",
        "text": {{ f.answer | strip_newlines | jsonify }}
      }
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ]
}
</script>
{% endif %}

Write-IfMissing "$Root\_includes\head.html" $Head
Write-IfMissing "$Root\_includes\header.html" $Header
Write-IfMissing "$Root\_includes\footer.html" $Footer
Write-IfMissing "$Root\_includes\jsonld-local-business.html" $JsonLdLocal
Write-IfMissing "$Root\_includes\jsonld-faq.html" $JsonLdFaq

# ---- Layouts
$DefaultLayout = @"
<!doctype html>
<html lang="en">
  <head>
    {% include head.html %}
    {% include jsonld-local-business.html %}
    {% include jsonld-faq.html %}
  </head>
  <body>
    {% include header.html %}
    <main class="site-main">
      <div class="container">
        {{ content }}
      </div>
    </main>
    {% include footer.html %}
  </body>
</html>

$BuildPageLayout = @"
---
layout: default
---
<div class="build-grid">
  <aside class="build-sidebar">
    <div class="sidebar-title">Build Phase</div>
    <ol class="phase-list">
      {% for p in site.data.build-phases %}
        <li class="{% if page.url == p.url %}active{% endif %}">
          <a href="{{ p.url | relative_url }}">
            <span class="step">Step {{ p.step }}</span>
            <span class="title">{{ p.title }}</span>
          </a>
        </li>
      {% endfor %}
    </ol>
  </aside>

  <article class="build-content">
    <header class="page-head">
      <h1>{{ page.title }}</h1>
      {% if page.description %}<p class="lead">{{ page.description }}</p>{% endif %}
      <div class="meta">
        {% assign c = site.data.compliance %}
        <span>NJ HIC #{{ c.license.number }}</span>
        <span>Standards: TCNA/ANSI (tile assemblies)</span>
      </div>
    </header>

    {{ content }}

    {% assign phases = site.data.build-phases %}
    {% assign currentIndex = nil %}
    {% for p in phases %}
      {% if page.url == p.url %}
        {% assign currentIndex = forloop.index0 %}
      {% endif %}
    {% endfor %}

    <nav class="pager">
      {% if currentIndex != nil and currentIndex > 0 %}
        {% assign prev = phases[currentIndex | minus: 1] %}
        <a class="prev" href="{{ prev.url | relative_url }}">← Step {{ prev.step }}: {{ prev.title }}</a>
      {% else %}
        <span></span>
      {% endif %}

      {% if currentIndex != nil and currentIndex < phases.size | minus: 1 %}
        {% assign nxt = phases[currentIndex | plus: 1] %}
        <a class="next" href="{{ nxt.url | relative_url }}">Step {{ nxt.step }}: {{ nxt.title }} →</a>
      {% else %}
        <span></span>
      {% endif %}
    </nav>
  </article>
</div>

Write-IfMissing "$Root\_layouts\default.html" $DefaultLayout
Write-IfMissing "$Root\_layouts\build-page.html" $BuildPageLayout

# ---- CSS (clean, modern, readable)
$Css = @"
:root{
  --bg:#0b0f0e;
  --panel:#0f1715;
  --text:#e9f3ef;
  --muted:#b8c9c3;
  --line:#1f2f2a;
  --accent:#23c483;
  --accent2:#d6b15f;
  --max:1100px;
  --r:14px;
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
  background: radial-gradient(1200px 800px at 20% 0%, rgba(35,196,131,.14), transparent 60%),
              radial-gradient(1000px 700px at 80% 0%, rgba(214,177,95,.10), transparent 55%),
              var(--bg);
  color:var(--text);
}

a{color:inherit; text-decoration:none}
a:hover{opacity:.92}
.container{max-width:var(--max); margin:0 auto; padding:0 18px}

.site-header{
  position:sticky; top:0; z-index:50;
  background: rgba(11,15,14,.78);
  backdrop-filter: blur(10px);
  border-bottom:1px solid var(--line);
}
.header-inner{display:flex; align-items:center; justify-content:space-between; padding:14px 0}
.brand{display:flex; gap:10px; align-items:center; font-weight:700; letter-spacing:.3px}
.brand-mark{
  width:28px; height:28px; border-radius:10px;
  display:grid; place-items:center;
  background: linear-gradient(145deg, rgba(35,196,131,.25), rgba(214,177,95,.18));
  border:1px solid var(--line);
}
.nav{display:flex; gap:14px; align-items:center}
.btn{
  padding:10px 12px;
  border-radius:12px;
  border:1px solid rgba(35,196,131,.35);
  background: rgba(35,196,131,.14);
}

.site-main{padding:26px 0 40px}
.page-head h1{margin:0 0 10px; font-size:32px}
.lead{margin:0 0 14px; color:var(--muted); line-height:1.5}
.meta{display:flex; gap:12px; flex-wrap:wrap; color:var(--muted); font-size:13px}

.site-footer{margin-top:40px; border-top:1px solid var(--line); background: rgba(15,23,21,.35)}
.footer-grid{display:grid; grid-template-columns: 1.3fr 1fr 1fr; gap:18px; padding:22px 0}
.footer-title{font-weight:700; margin-bottom:8px}
.muted{color:var(--muted); line-height:1.5}
.fineprint{display:flex; gap:14px; flex-wrap:wrap; padding:12px 0 22px; color:var(--muted); font-size:12px}

.build-grid{display:grid; grid-template-columns: 280px 1fr; gap:18px}
.build-sidebar{
  border:1px solid var(--line);
  background: rgba(15,23,21,.50);
  border-radius: var(--r);
  padding:14px;
  height: fit-content;
}
.sidebar-title{font-weight:800; margin-bottom:10px}
.phase-list{list-style:none; margin:0; padding:0; display:grid; gap:8px}
.phase-list a{
  display:block;
  border:1px solid transparent;
  padding:10px 10px;
  border-radius:12px;
  background: rgba(0,0,0,.12);
}
.phase-list li.active a{
  border-color: rgba(35,196,131,.40);
  background: rgba(35,196,131,.12);
}
.step{display:block; font-size:12px; color:var(--muted)}
.title{display:block; font-weight:700}

.build-content{
  border:1px solid var(--line);
  background: rgba(15,23,21,.35);
  border-radius: var(--r);
  padding:18px;
}

.pager{
  display:flex; justify-content:space-between; gap:12px;
  margin-top:22px; padding-top:14px; border-top:1px solid var(--line);
}
.pager a{
  border:1px solid var(--line);
  background: rgba(0,0,0,.16);
  padding:10px 12px; border-radius:12px;
}
@media (max-width: 900px){
  .build-grid{grid-template-columns: 1fr}
  .footer-grid{grid-template-columns:1fr}
  .nav{display:none}
}

Write-IfMissing "$Root\assets\css\main.css" $Css

# ---- Ensure Build Phase index exists (you already have one; this won’t overwrite unless -ForceWrite)
$BuildIndex = @"
---
layout: build-page
title: Build Phase Guides - TCNA/ANSI Aligned Construction
description: Eight phases that mirror properly sequenced, permitted bathroom & shower work in New Jersey—focused on assemblies, verification, and documentation.
permalink: /pages/build/
---

## Build Phase: Your Complete Guide to Bathroom & Shower Construction

This series exists to help homeowners **spot shortcuts early**, understand what should happen **before tile hides the system**, and communicate clearly with contractors and inspectors.

- NJ permitting & inspection sequence
- Shower pan slope & drain integration
- Waterproofing continuity (ANSI A118.10)
- Thresholds/curbless planning
- Structural framing for benches & niches
- Tile setting basics (coverage, movement joints)
- Flood testing & verification
- Common failure patterns and red flags

Start here:

**[Step 1: NJ Codes, Permits & Inspections →](/pages/build/nj-codes-permits/)**

Write-IfMissing "$Root\pages\build\index.md" $BuildIndex

Write-Host "`nDone. Next:" -ForegroundColor Cyan
Write-Host "  1) Ensure your 8 build pages exist under: $Root\pages\build" -ForegroundColor Cyan
Write-Host "  2) Run: bundle exec jekyll serve" -ForegroundColor Cyan

# ---- End script


