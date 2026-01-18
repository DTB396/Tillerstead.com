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
  OPTIMIZED HOMEPAGE - Uses Organized Includes
  ============================================================
  
  This is the NEW optimized homepage that leverages our 
  organized _includes directory structure.
  
  Benefits:
  - Clean, maintainable code (was 848 lines, now <100)
  - Reusable components across all pages
  - Centralized content management via _data/home.yml
  - Easy to update and test individual sections
  - Follows Tillerstead taxonomy standards
  
  Structure:
  1. Hero Section (hero/)
  2. Services Preview (sections/)
  3. Process Overview (sections/)
  4. Materials/Compliance (sections/)
  5. Social Proof/Testimonials (sections/)
  6. Final CTA (sections/)
  
  All content is managed in _data/home.yml for easy updates.
{%- endcomment -%}

{%- assign data = site.data.home -%}

<!-- 1. Hero Section -->
{% include hero/hero.html data=data.hero %}

<!-- 2. Services Preview Section -->
{% include sections/section-services.html data=data.services %}

<!-- 3. Process Section -->
{% include sections/section-process.html data=data.process %}

<!-- 4. Materials & Standards Section -->
{% include sections/section-materials.html data=data.materials %}

<!-- 5. Testimonials Section -->
{% include sections/section-testimonials.html data=data.testimonials %}

<!-- 6. Final CTA Section -->
{% include sections/section-cta.html data=data.cta %}

<link rel="stylesheet" href="/assets/css/pages/home.css">
