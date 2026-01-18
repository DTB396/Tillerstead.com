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
  OPTIMIZED HOMEPAGE - Tillerstead.com
  ============================================================
  
  Architecture:
  - Data-driven content from _data/home.yml
  - Modular section includes from _includes/sections/
  - External CSS in assets/css/pages/home.css
  - Clean, maintainable, scalable structure
  
  Sections:
  1. Hero - Primary value proposition with CTAs
  2. Services - Core offerings grid
  3. Process - How we work
  4. Materials - Standards & compliance
  5. Testimonials - Social proof
  6. CTA - Final conversion section
{%- endcomment -%}

{% assign data = site.data.home %}

<!-- Hero Section -->
{% include hero/hero.html data=data.hero %}

<!-- Services Section -->
{% include sections/section-services.html data=data.services %}

<!-- Process Section -->
{% include sections/section-process.html data=data.process %}

<!-- Materials Section -->
{% include sections/section-materials.html data=data.materials %}

<!-- Testimonials Section -->
{% include sections/section-testimonials.html data=data.testimonials %}

<!-- Final CTA Section -->
{% include sections/section-cta.html data=data.cta %}

<!-- Page-specific styles -->
<link rel="stylesheet" href="/assets/css/pages/home.css">
