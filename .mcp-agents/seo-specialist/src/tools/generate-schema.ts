import { formatTimestamp } from '@tillerstead/shared';
import type { AgentResult } from '@tillerstead/shared';

interface SchemaData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export async function generateSchema(
  _rootPath: string,
  schemaType: string,
  page: string
): Promise<AgentResult<SchemaData>> {
  try {
    let schema: SchemaData;
    
    switch (schemaType) {
      case 'LocalBusiness':
        schema = generateLocalBusinessSchema();
        break;
      
      case 'Organization':
        schema = generateOrganizationSchema();
        break;
      
      case 'Service':
        schema = generateServiceSchema(page);
        break;
      
      case 'BreadcrumbList':
        schema = generateBreadcrumbSchema(page);
        break;
      
      case 'FAQPage':
        schema = generateFAQSchema();
        break;
      
      case 'Product':
        schema = generateProductSchema(page);
        break;
      
      default:
        throw new Error(`Unknown schema type: ${schemaType}`);
    }
    
    return {
      success: true,
      data: schema,
      timestamp: formatTimestamp(),
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : String(error)],
      timestamp: formatTimestamp(),
    };
  }
}

function generateLocalBusinessSchema(): SchemaData {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Tillerstead LLC',
    description: 'Professional tile installation and design services in Southern New Jersey',
    url: 'https://tillerstead.com',
    telephone: '+1-XXX-XXX-XXXX',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '',
      addressLocality: 'New Jersey',
      addressRegion: 'NJ',
      postalCode: '',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 39.5,
      longitude: -74.5,
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Atlantic County, NJ',
      },
      {
        '@type': 'City',
        name: 'Cape May County, NJ',
      },
      {
        '@type': 'City',
        name: 'Ocean County, NJ',
      },
    ],
    priceRange: '$$',
    image: 'https://tillerstead.com/assets/img/logo.png',
    sameAs: [
      'https://www.facebook.com/tillerstead',
      'https://www.instagram.com/tillerstead',
    ],
  };
}

function generateOrganizationSchema(): SchemaData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tillerstead LLC',
    url: 'https://tillerstead.com',
    logo: 'https://tillerstead.com/assets/img/logo.png',
    description: 'TCNA 2024 compliant professional tile installation services in Southern New Jersey',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'Customer Service',
      areaServed: 'US',
      availableLanguage: 'English',
    },
  };
}

function generateServiceSchema(_page: string): SchemaData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Tile Installation',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Tillerstead LLC',
    },
    areaServed: {
      '@type': 'State',
      name: 'New Jersey',
    },
    description: 'Professional tile installation following TCNA 2024 standards',
  };
}

function generateBreadcrumbSchema(page: string): SchemaData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://tillerstead.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page,
        item: `https://tillerstead.com/${page}`,
      },
    ],
  };
}

function generateFAQSchema(): SchemaData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [],
  };
}

function generateProductSchema(_page: string): SchemaData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Tile Installation Service',
    description: 'Professional tile installation service',
    brand: {
      '@type': 'Brand',
      name: 'Tillerstead LLC',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };
}
