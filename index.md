---
layout: default
title: Home
permalink: /
meta_title: "Expert Tile & Waterproofing Contractor in South Jersey | Tillerstead LLC"
meta_description: "South Jersey's trusted tile installation & waterproofing experts. Licensed NJ HIC #13VH10808800. TCNA-compliant showers, bathroom remodeling & leak-proof systems. 5-Star rated. Free estimates in Atlantic, Ocean & Cape May Counties."
description: "Professional tile installation and waterproofing services for South Jersey homeowners. Expert craftsmanship, industry-leading warranties, and TCNA-compliant methods. Licensed NJ HIC #13VH10808800."
body_class: page-home
is_home: true
schema_type: LocalBusiness
canonical_url: "https://tillerstead.com/"
priority: 1.0
sitemap:
  changefreq: weekly
  priority: 1.0
preload_assets:
  - type: style
    href: /assets/css/pages/home.css
    as: style
  - type: image
    href: /assets/images/hero/hero-main.webp
    as: image
    fetchpriority: high
robots: index, follow
og_type: website
og_image: /assets/images/og-home.webp
og_title: "South Jersey's Premier Tile & Waterproofing Experts | Tillerstead LLC"
og_description: "Transform your bathroom with leak-proof tile showers & expert waterproofing. Licensed, insured & 5-star rated. Serving Atlantic, Ocean & Cape May Counties."
twitter_card: summary_large_image
twitter_title: "Expert Tile & Waterproofing in South Jersey | Tillerstead LLC"
twitter_description: "TCNA-compliant tile installation & waterproofing. Licensed NJ contractor with 5-star reviews. Free estimates!"
keywords: "tile contractor South Jersey, waterproofing contractor NJ, bathroom remodeling Atlantic County, tile shower installation, TCNA certified, Ocean County tile installer, Cape May bathroom contractor"
---

{%- comment -%}
  ====
  TILLERSTEAD HOMEPAGE - Conversion-Optimized Architecture
  ====
  
  Performance & SEO Optimizations:
  - Critical CSS inlined via layout
  - Lazy loading for below-fold content
  - Structured data for rich snippets
  - Core Web Vitals optimized (LCP, FID, CLS)

  1. Hero - ATTENTION: Bold value prop + social proof + urgency
  2. Trust Bar - INTEREST: Instant credibility (license, 5-star reviews)
  3. Services - INTEREST: Solution-focused offerings
  4. Social Proof - DESIRE: Testimonials near decision point
  5. Why Us - DESIRE: Unique differentiators
  6. Process - DESIRE: Remove friction, build confidence
  7. Portfolio - DESIRE: Visual proof of quality
  8. Materials - DESIRE: Technical authority
  9. FAQ - DESIRE: Objection handling
  10. CTA - ACTION: Low-friction conversion
  
  A/B Testing Notes:
  - Hero CTA variations tracked
  - Trust bar position tested (winner: after hero)
  - Testimonials moved higher for social proof impact
{%- endcomment -%}

{% assign data = site.data.home %}

<!-- Hero Section - Above the Fold Priority -->
<section id="hero" aria-label="Welcome to Tillerstead" class="page-depth hero-3d scroll-fade-in">
{% include hero/unified-hero-home.html %}
</section>

<!-- Trust Bar - Immediate Credibility (Critical for Conversion) -->
{% if data.trust_bar %}
<section id="trust" aria-label="{{ data.trust_bar.aria_label | default: 'Credentials and protections' }}" class="scroll-fade-in">
{% include sections/section-trust-bar.html data=data.trust_bar %}
</section>
{% endif %}

<!-- Services Section - Core Value Proposition -->
<section id="services" aria-labelledby="services-heading" class="scroll-scale-in">
{% include sections/section-services.html data=data.services %}
</section>

<!-- Testimonials Section - Social Proof (Moved Higher for Impact) -->
<section id="testimonials" aria-labelledby="testimonials-heading" class="scroll-fade-in">
{% include sections/section-testimonials.html data=data.testimonials %}
</section>

<!-- Why Choose Us - Competitive Differentiation -->
{% if data.why_us %}
<section id="why-us" aria-labelledby="why-us-heading" class="scroll-scale-in">
{% include sections/section-why-us.html data=data.why_us %}
</section>
{% endif %}

<!-- Process Section - Reduce Anxiety, Build Confidence -->
<section id="process" aria-labelledby="process-heading" class="scroll-fade-in">
{% include sections/section-process.html data=data.process %}
</section>

<!-- Portfolio/Gallery - Visual Social Proof -->
{% if data.portfolio %}
<section id="portfolio" aria-labelledby="portfolio-heading" loading="lazy" class="scroll-scale-in">
{% include sections/section-portfolio.html data=data.portfolio %}
</section>
{% endif %}

<!-- Materials Section - Technical Authority & Trust -->
<section id="materials" aria-labelledby="materials-heading" class="scroll-fade-in">
{% include sections/section-materials.html data=data.materials %}
</section>

<!-- FAQ Section - Objection Handling -->
{% if data.faq %}
<section id="faq" aria-labelledby="faq-heading" class="scroll-scale-in">
{% include sections/section-faq.html data=data.faq %}
</section>
{% endif %}

<!-- Visual Divider - Tile Grout Line -->
<div class="ts-grout-divider" role="presentation" aria-hidden="true"></div>

<!-- Final CTA Section - Clear Conversion Path -->
<section id="contact" aria-labelledby="cta-heading">
{% include sections/section-cta.html data=data.cta %}
</section>

<!-- Structured Data for Rich Snippets -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://tillerstead.com/#business",
  "name": "Tillerstead LLC",
  "description": "{{ page.description }}",
  "url": "https://tillerstead.com/",
  "telephone": "{{ site.company.phone_link }}",
  "address": {
    "@type": "PostalAddress",
    "addressRegion": "NJ",
    "addressCountry": "US"
  },
  "areaServed": ["Atlantic County", "Ocean County", "Cape May County"],
  "priceRange": "$$",
  "image": "{{ site.logo | absolute_url }}",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": "{{ site.data.reviews.size | default: 10 }}"
  }
}
</script>

<!-- Page-specific styles with preload hint -->
<link rel="stylesheet" href="/assets/css/pages/home.css" media="print" onload="this.media='all'">
<link rel="stylesheet" href="/assets/css/pages/home-enhanced.css" media="print" onload="this.media='all'">
<noscript>
  <link rel="stylesheet" href="/assets/css/pages/home.css">
  <link rel="stylesheet" href="/assets/css/pages/home-enhanced.css">
</noscript>

<!-- Homepage enhancement JavaScript -->
<script src="/assets/js/home-enhancements.js" defer></script>
