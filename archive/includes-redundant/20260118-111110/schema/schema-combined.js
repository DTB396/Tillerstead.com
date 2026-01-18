<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": "{{ site.url }}/#organization",
  "name": "{{ site.company.name | default: site.title }}",
  "legalName": "Tillerstead LLC",
  "url": "{{ site.url }}",
  "logo": "{{ site.url }}/assets/img/logo/4k-logo.png",
  "image": "{{ site.url }}/assets/img/og.jpg",
  "description": "{{ site.description | escape }}",
  "telephone": "{{ site.company.phone_link }}",
  "email": "{{ site.company.email }}",
  "priceRange": "$$",
  "paymentAccepted": "Cash, Check, Credit Card, Financing Available",
  "currenciesAccepted": "USD",
  "foundingDate": "2020",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{ site.company.address_line }}",
    "addressLocality": "{{ site.company.address_locality }}",
    "addressRegion": "{{ site.company.address_region }}",
    "postalCode": "08205",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "39.4784",
    "longitude": "-74.4771"
  },
  "areaServed": [
    {
      "@type": "State",
      "name": "New Jersey"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Atlantic County",
      "containedInPlace": {
        "@type": "State",
        "name": "New Jersey"
      }
    },
    {
      "@type": "AdministrativeArea",
      "name": "Ocean County",
      "containedInPlace": {
        "@type": "State",
        "name": "New Jersey"
      }
    },
    {
      "@type": "AdministrativeArea",
      "name": "Cape May County",
      "containedInPlace": {
        "@type": "State",
        "name": "New Jersey"
      }
    }
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "https://schema.org/Monday",
        "https://schema.org/Tuesday",
        "https://schema.org/Wednesday",
        "https://schema.org/Thursday",
        "https://schema.org/Friday"
      ],
      "opens": "07:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "https://schema.org/Saturday",
      "opens": "08:00",
      "closes": "16:00"
    }
  ],
  "sameAs": [
    "https://www.thumbtack.com/nj/absecon/tile/tillerstead-llc/service/547437618353160199",
    "https://www.facebook.com/people/Tillerstead-LLC/61580414460056/"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Tile & Remodeling Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Custom Tile Installation",
          "description": "TCNA-compliant tile installation: showers, backsplashes, floors, and radiant heated systems. All work meets ANSI A108/A118 standards."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Waterproof Shower Systems",
          "description": "Certified waterproof assemblies using Schluter, RedGard, and ANSI A118.10-compliant membranes. New Jersey HIC# 13VH11744200."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Natural Stone Installation",
          "description": "Marble, granite, and natural stone set to TCNA guidelines. Professional fabrication coordination and substrate prep."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Bathroom Remodeling",
          "description": "Complete bath renovations: tile, fixtures, waterproofing, and code-compliant upgrades. All work documented and warrantied."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Property Maintenance Plans",
          "description": "Monthly property care: scheduled inspections, repairs, and maintenance logs. Transparent, contract-based service."
        }
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "{{ site.data.reviews.size | default: 15 }}",
    "bestRating": "5",
    "worstRating": "1"
  },
  "additionalType": [
    "https://www.wikidata.org/wiki/Q1080313",
    "https://www.wikidata.org/wiki/Q4287745"
  ],
  "knowsAbout": [
    "TCNA Methods",
    "ANSI A108/A118 Standards",
    "Tile Installation",
    "Waterproofing Systems",
    "Bathroom Remodeling",
    "Natural Stone Work",
    "Heated Floors",
    "Schluter Systems",
    "Large Format Tile",
    "Custom Showers"
  ],
  "slogan": "Expert Tile & Stone Installation. TCNA-Literate. New Jersey HIC# 13VH11744200.",
  "howTo": {
    "@type": "HowTo",
    "name": "How to Install Tile",
    "step": [
      {
        "@type": "HowToStep",
        "url": "/how-to-install-tile/step1",
        "name": "Step 1: Prepare the Surface",
        "description": "Make sure the surface is clean and smooth before starting the installation."
      },
      {
        "@type": "HowToStep",
        "url": "/how-to-install-tile/step2",
        "name": "Step 2: Apply Adhesive",
        "description": "Apply the right adhesive for the tile you're using and spread it evenly."
      },
      {
        "@type": "HowToStep",
        "url": "/how-to-install-tile/step3",
        "name": "Step 3: Place the Tiles",
        "description": "Place each tile correctly, leaving space for grout."
      }
    ]
  },
  "faqPage": {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is TCNA-compliant tile installation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "TCNA-compliant tile installation refers to tile installation methods that follow the guidelines and standards set by the Tile Council of North America (TCNA). This ensures the highest quality and durability of installations."
        }
      },
      {
        "@type": "Question",
        "name": "What areas do you serve?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We serve Atlantic, Ocean, and Cape May counties in New Jersey."
        }
      }
    ]
  },
  "schemaOrg": {
    "@type": "TechArticle",
    "headline": {{ page.title | jsonify }},
    "description": {{ page.description | jsonify }},
    "url": {{ page.url | absolute_url | jsonify }},
    "inLanguage": "en-US",
    "isPartOf": {
      "@type": "CollectionPage",
      "name": "Build Phase Guides",
      "url": {{ "/build/" | absolute_url | jsonify }}
    },
    "publisher": {
      "@type": "Organization",
      "name": {{ site.title | jsonify }},
      "url": {{ site.url | jsonify }}
    },
    "datePublished": {{ page.date | date_to_xmlschema | jsonify }},
    "dateModified": {{ page.date_modified | date_to_xmlschema | jsonify }}
  }
}
</script>
