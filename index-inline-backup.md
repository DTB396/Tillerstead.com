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

{% assign data = site.data.home %}

<!-- Hero Section -->
<section class="home-hero">
  <div class="container">
    <div class="hero-grid">
      <div class="hero-text">
        <p class="hero-eyebrow">{{ data.hero.eyebrow }}</p>
        <h1 class="hero-title">{{ data.hero.title }}</h1>
        <p class="hero-subtitle">{{ data.hero.subtitle }}</p>
        <p class="hero-summary">{{ data.hero.summary }}</p>
        
        <div class="hero-actions">
          <a href="{{ data.hero.primary.url }}" class="btn btn--primary btn--large">
            {{ data.hero.primary.label }}
          </a>
          <a href="{{ data.hero.secondary.url }}" class="btn btn--secondary-outline btn--large">
            {{ data.hero.secondary.label }}
          </a>
        </div>

        <!-- Trust Facts -->
        <div class="hero-facts">
          {% for fact in data.hero.facts %}
          <div class="fact-item">
            <strong class="fact-label">{{ fact.label }}</strong>
            <span class="fact-text">{{ fact.text }}</span>
          </div>
          {% endfor %}
        </div>
      </div>

      <div class="hero-image">
        <img 
          src="/assets/img/tillerstead-work/bathrooms/after-entry-shot.jpg" 
          alt="TCNA-compliant bathroom tile installation by Tillerstead LLC"
          loading="eager"
        />
      </div>
    </div>

    <!-- Key Highlights -->
    <div class="hero-highlights">
      {% for highlight in data.hero.highlights %}
      <div class="highlight-item">
        <span class="highlight-icon">✓</span>
        <span class="highlight-text">{{ highlight }}</span>
      </div>
      {% endfor %}
    </div>
  </div>
</section>

<!-- Services Section -->
<section class="home-services">
  <div class="container">
    <header class="section-header">
      <p class="section-eyebrow">{{ data.services.eyebrow }}</p>
      <h2 class="section-title">{{ data.services.title }}</h2>
      <p class="section-summary">{{ data.services.summary }}</p>
      <p class="section-note">{{ data.services.homeowner_note }}</p>
    </header>

    <div class="services-grid">
      {% for card in data.services.cards %}
      <article class="service-card">
        <h3 class="service-title">{{ card.title }}</h3>
        <p class="service-description">{{ card.description }}</p>
        
        {% if card.details %}
        <ul class="service-details">
          {% for detail in card.details %}
          <li>{{ detail }}</li>
          {% endfor %}
        </ul>
        {% endif %}
        
        <a href="{{ card.url }}" class="service-link">Learn more →</a>
      </article>
      {% endfor %}
    </div>

    <div class="services-actions">
      <a href="{{ data.services.actions.primary.url }}" class="btn btn--primary">
        {{ data.services.actions.primary.label }}
      </a>
      <a href="{{ data.services.actions.secondary.url }}" class="btn btn--secondary-outline">
        {{ data.services.actions.secondary.label }}
      </a>
    </div>

    <p class="services-note">{{ data.services.note }}</p>
  </div>
</section>

<!-- Process Section -->
<section class="home-process bg-soft">
  <div class="container">
    <header class="section-header">
      <p class="section-eyebrow">{{ data.process.eyebrow }}</p>
      <h2 class="section-title">{{ data.process.title }}</h2>
      <p class="section-summary">{{ data.process.summary }}</p>
    </header>

    <div class="process-steps">
      {% for step in data.process.steps %}
      <div class="process-step">
        <div class="step-number">{{ forloop.index }}</div>
        <h3 class="step-title">{{ step.title }}</h3>
        <p class="step-description">{{ step.description }}</p>
      </div>
      {% endfor %}
    </div>

    <p class="process-fun-fact">
      <strong>Why this matters:</strong> {{ data.process.fun_fact }}
    </p>
  </div>
</section>

<!-- Materials Section -->
<section class="home-materials">
  <div class="container">
    <header class="section-header">
      <p class="section-eyebrow">{{ data.materials.eyebrow }}</p>
      <h2 class="section-title">{{ data.materials.title }}</h2>
      <p class="section-summary">{{ data.materials.summary }}</p>
    </header>

    <div class="materials-callout">
      <p>{{ data.materials.callout }}</p>
    </div>

    <div class="materials-grid">
      {% for item in data.materials.items %}
      <div class="material-card">
        <h3 class="material-title">{{ item.title }}</h3>
        <p class="material-description">{{ item.description }}</p>
        <ul class="material-points">
          {% for point in item.points %}
          <li>{{ point }}</li>
          {% endfor %}
        </ul>
      </div>
      {% endfor %}
    </div>

    <p class="materials-note">{{ data.materials.note }}</p>
  </div>
</section>

<!-- Testimonials Section -->
<section class="home-testimonials bg-light">
  <div class="container">
    <header class="section-header">
      <p class="section-eyebrow">{{ data.testimonials.eyebrow }}</p>
      <h2 class="section-title">{{ data.testimonials.title }}</h2>
    </header>

    <div class="testimonials-grid">
      {% assign reviews = site.data.reviews.reviews %}
      {% assign limit = data.testimonials.limit | default: 3 %}
      {% for review in reviews limit: limit %}
      <div class="testimonial-card">
        <div class="testimonial-rating">
          {% for i in (1..review.rating) %}★{% endfor %}
        </div>
        <div class="testimonial-quote">
          {{ review.quote_html }}
        </div>
        <div class="testimonial-author">
          <strong>{{ review.author }}</strong>
          {% if review.job_type %}<span class="job-type">{{ review.job_type }}</span>{% endif %}
        </div>
        {% if review.platform %}
        <div class="testimonial-source">
          <small>via {{ review.platform }}</small>
        </div>
        {% endif %}
      </div>
      {% endfor %}
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="home-cta bg-primary">
  <div class="container">
    <div class="cta-content">
      <p class="cta-eyebrow">{{ data.cta.eyebrow }}</p>
      <h2 class="cta-title">{{ data.cta.title }}</h2>
      <p class="cta-summary">{{ data.cta.summary }}</p>
      
      <div class="cta-actions">
        <a href="{{ data.cta.primary.url }}" class="btn btn--white btn--large">
          {{ data.cta.primary.label }}
        </a>
        <a href="{{ data.cta.secondary.url }}" class="btn btn--outline-white btn--large">
          {{ data.cta.secondary.label }}
        </a>
      </div>

      <p class="cta-note">{{ data.cta.note }}</p>
    </div>
  </div>
</section>

<style>
/* Homepage Styles */
:root {
  --color-primary: #1a3d2e;
  --color-text: #1a2018;
  --color-text-secondary: #4a5048;
  --color-border: #e8e4dc;
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
  --radius-sm: 4px;
  --radius-md: 8px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Hero Section */
.home-hero {
  padding: var(--spacing-xl) 0;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8f0ed 100%);
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.hero-eyebrow {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-sm);
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.hero-summary {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.hero-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 2px solid var(--color-border);
}

.fact-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.fact-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  letter-spacing: 0.05em;
}

.fact-text {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-primary);
}

.hero-image {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.hero-image img {
  width: 100%;
  height: auto;
  object-fit: cover;
  object-position: center top;
  max-height: 500px;
}

.hero-highlights {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.highlight-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.highlight-text {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  text-align: center;
  border: 2px solid transparent;
}

.btn--large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--primary:hover {
  background: #1f4539;
  transform: translateY(-1px);
}

.btn--secondary-outline {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn--secondary-outline:hover {
  background: var(--color-primary);
  color: white;
}

.btn--white {
  background: white;
  color: var(--color-primary);
}

.btn--white:hover {
  background: #f5f5f5;
  transform: translateY(-1px);
}

.btn--outline-white {
  background: transparent;
  color: white;
  border-color: white;
}

.btn--outline-white:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Section Headers */
.section-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto var(--spacing-xl);
}

.section-eyebrow {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-sm);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
  line-height: 1.2;
}

.section-summary {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.section-note {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  font-style: italic;
}

/* Services Section */
.home-services {
  padding: var(--spacing-xl) 0;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.service-card {
  padding: var(--spacing-lg);
  background: white;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.service-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.service-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.service-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.service-details {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-md) 0;
}

.service-details li {
  padding-left: 1.5rem;
  margin-bottom: var(--spacing-xs);
  position: relative;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.service-details li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: 700;
}

.service-link {
  display: inline-block;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}

.service-link:hover {
  text-decoration: underline;
}

.services-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.services-note {
  text-align: center;
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  max-width: 700px;
  margin: 0 auto;
}

/* Process Section */
.home-process {
  padding: var(--spacing-xl) 0;
}

.bg-soft {
  background: #f9f9f9;
}

.process-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.process-step {
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
}

.step-number {
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

.step-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.step-description {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.process-fun-fact {
  text-align: center;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  max-width: 700px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-primary);
}

/* Materials Section */
.home-materials {
  padding: var(--spacing-xl) 0;
}

.materials-callout {
  padding: var(--spacing-lg);
  background: #fff8e1;
  border-left: 4px solid #ffc107;
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-xl);
  text-align: center;
  font-weight: 600;
  color: var(--color-text);
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.material-card {
  padding: var(--spacing-lg);
  background: white;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
}

.material-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.material-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.material-points {
  list-style: none;
  padding: 0;
  margin: 0;
}

.material-points li {
  padding-left: 1.5rem;
  margin-bottom: var(--spacing-xs);
  position: relative;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.material-points li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: 700;
}

.materials-note {
  text-align: center;
  font-size: 0.9375rem;
  font-style: italic;
  color: var(--color-text-secondary);
}

/* Testimonials Section */
.home-testimonials {
  padding: var(--spacing-xl) 0;
}

.bg-light {
  background: #f5f5f5;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.testimonial-card {
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
}

.testimonial-rating {
  color: #ffc107;
  font-size: 1.25rem;
  margin-bottom: var(--spacing-sm);
}

.testimonial-quote {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.testimonial-quote p {
  margin-bottom: var(--spacing-sm);
}

.testimonial-author {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.job-type {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.testimonial-source {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* CTA Section */
.home-cta {
  padding: var(--spacing-xl) 0;
}

.bg-primary {
  background: var(--color-primary);
  color: white;
}

.cta-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.cta-eyebrow {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-sm);
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: var(--spacing-md);
  line-height: 1.2;
}

.cta-summary {
  font-size: 1.125rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: var(--spacing-lg);
}

.cta-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.cta-note {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
  }
  
  .hero-facts {
    grid-template-columns: 1fr;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .hero-highlights {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .cta-title {
    font-size: 2rem;
  }
  
  .services-actions,
  .cta-actions {
    flex-direction: column;
  }
}
</style>

