---
layout: default
title: Home
permalink: /
meta_title: "NJ Tile & Waterproofing Contractor | Tillerstead LLC"
meta_description: "Licensed NJ HIC contractor specializing in TCNA-compliant tile showers, waterproofing systems, and bathroom remodeling. Serving Atlantic, Ocean & Cape May Counties."
description: "Standards-based tile installation and waterproofing for South Jersey homeowners. Licensed NJ HIC #13VH10808800."
body_class: page-home
is_home: true
---

{%- comment -%}
  ============================================================
  TILLERSTEAD HOMEPAGE - Professional Yet Personable
  ============================================================
  
  Brand Personality: Serious craftsmanship + approachable attitude
  - Lead with trust signals (credentials, standards, experience)
  - Balance professionalism with personality
  - Clear path to conversion without being pushy
  
  Optimized Flow:
  1. Hero - Bold intro with personality + immediate trust
  2. Trust Bar - Quick credibility boost (license, reviews, certifications)
  3. Services - What we do best
  4. Why Choose Us - Differentiators with character
  5. Process - Transparent, no-surprises workflow
  6. Portfolio/Gallery - Show don't tell
  7. Testimonials - Real people, real results
  8. CTA - Friendly, low-pressure next step
{%- endcomment -%}

{% assign data = site.data.home %}

<!-- Hero Section - First Impression Matters -->
{% include hero/hero.html data=data.hero %}

<!-- Trust Bar - Quick Credibility -->
{% if data.trust_bar %}
{% include sections/section-trust-bar.html data=data.trust_bar %}
{% endif %}

<!-- Services Section - Core Offerings -->
{% include sections/section-services.html data=data.services %}

<!-- Why Choose Us - Stand Out From Competition -->
{% if data.why_us %}
{% include sections/section-why-us.html data=data.why_us %}
{% endif %}

<!-- Process Section - Transparency Builds Trust -->
{% include sections/section-process.html data=data.process %}

<!-- Portfolio/Gallery - Proof of Quality -->
{% if data.portfolio %}
{% include sections/section-portfolio.html data=data.portfolio %}
{% endif %}

<!-- Materials Section - Standards & Compliance -->
{% include sections/section-materials.html data=data.materials %}

<!-- Testimonials Section - Social Proof -->
{% include sections/section-testimonials.html data=data.testimonials %}

<!-- Final CTA Section - Friendly Conversion -->
{% include sections/section-cta.html data=data.cta %}

<!-- Page-specific styles -->
<link rel="stylesheet" href="/assets/css/pages/home.css">
