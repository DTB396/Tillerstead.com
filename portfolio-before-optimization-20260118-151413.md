---
layout: default
title: "Our Work | Tillerstead Portfolio"
meta_title: "Tile & Bathroom Remodeling Portfolio | Tillerstead LLC"
meta_description: "See completed TCNA-compliant tile showers, waterproofing, and bathroom remodels by Tillerstead LLC in South Jersey."
description: "Real projects, real results. TCNA-compliant tile installations and bathroom remodels in Atlantic, Ocean, and Cape May Counties."
permalink: /portfolio/
body_class: page-portfolio
---

<!-- Hero Section -->
<section class="portfolio-hero">
  <div class="container">
    <header class="section-header">
      <h1 class="section-title">Our Work</h1>
      <p class="section-summary">
        Real projects built to TCNA standards. Every project documented, every detail verified, 
        every homeowner protected with licensed, insured workmanship.
      </p>
      <p class="hero-badge">Licensed NJ HIC #13VH10808800</p>
    </header>
  </div>
</section>

<!-- Portfolio Gallery -->
<section class="portfolio-gallery">
  <div class="container">
    <!-- Filter Buttons -->
    <div class="portfolio-filters">
      <button class="filter-btn active" data-filter="all">All Projects</button>
      <button class="filter-btn" data-filter="showers">Showers</button>
      <button class="filter-btn" data-filter="floors">Floors</button>
      <button class="filter-btn" data-filter="large-format">Large-Format Tile</button>
      <button class="filter-btn" data-filter="prep">Prep & Waterproofing</button>
    </div>

    <!-- Project Grid -->
    <div class="project-grid">
      {% assign projects = site.data.portfolio.projects | sort: 'priority' | reverse %}
      {% for project in projects %}
      <article class="project-card" data-tags="{{ project.tags | join: ' ' }}">
        <div class="project-image">
          <img 
            src="{{ project.file }}" 
            alt="{{ project.alt }}"
            loading="lazy"
          />
        </div>
        <div class="project-content">
          <h3 class="project-title">{{ project.title }}</h3>
          <p class="project-caption">{{ project.caption }}</p>
          {% if project.tags %}
          <div class="project-tags">
            {% for tag in project.tags %}
            <span class="tag">{{ tag }}</span>
            {% endfor %}
          </div>
          {% endif %}
        </div>
      </article>
      {% endfor %}
    </div>

    <!-- Compliance Note -->
    <div class="portfolio-note">
      <p>{{ site.data.portfolio.meta.compliance_note }}</p>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="portfolio-cta bg-primary">
  <div class="container">
    <div class="cta-content">
      <h2 class="cta-title">Ready to Start Your Project?</h2>
      <p class="cta-summary">
        Get a written estimate with clear scope, transparent pricing, and no surprises.
      </p>
      <div class="cta-actions">
        <a href="/contact/" class="btn btn--white btn--large">Request Estimate</a>
        <a href="/services/" class="btn btn--outline-white btn--large">View Services</a>
      </div>
    </div>
  </div>
</section>

<style>
/* Portfolio Page Styles */
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

.portfolio-hero {
  padding: var(--spacing-xl) 0;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8f0ed 100%);
}

.section-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.section-summary {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.hero-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-primary);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.portfolio-gallery {
  padding: var(--spacing-xl) 0;
}

.portfolio-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.filter-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: white;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.project-card {
  background: white;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.3s ease;
}

.project-card.hidden {
  display: none;
}

.project-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.project-image {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: #f5f5f5;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.project-card:hover .project-image img {
  transform: scale(1.05);
}

.project-content {
  padding: var(--spacing-lg);
}

.project-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.project-caption {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #f5f5f5;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 999px;
}

.portfolio-note {
  text-align: center;
  padding: var(--spacing-lg);
  background: #f9f9f9;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-primary);
}

.portfolio-note p {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.portfolio-cta {
  padding: var(--spacing-xl) 0;
}

.bg-primary {
  background: var(--color-primary);
  color: white;
}

.cta-content {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: var(--spacing-md);
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
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.btn--large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
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

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .project-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>

<script>
// Simple filtering without dependencies
document.addEventListener('DOMContentLoaded', function() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const filter = this.getAttribute('data-filter');
      
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Filter projects
      projectCards.forEach(card => {
        const tags = card.getAttribute('data-tags');
        
        if (filter === 'all' || tags.includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
});
</script>


