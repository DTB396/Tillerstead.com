#!/usr/bin/env node
// Run via: VS Code Command Palette → "Run Task" → "Sync Thumbtack Reviews"
// Or via NPM Scripts panel → "sync:thumbtack"
/* eslint-env node */
/**
 * Sync live Thumbtack reviews into _data/reviews.yml.
 * Run locally with:
ode scripts/sync_thumbtack_reviews.js`
 * Requires network access and overwrites the reviews array with the latest
 * data scraped from the public Thumbtack service page.
 */

import fs from 'fs';
import https from 'https';
import path from 'path';
import { load } from 'cheerio';
import yaml from 'js-yaml';

const SERVICE_URL =
  'https://www.thumbtack.com/nj/absecon/tile/tillerstead-llc/service/547437618353160199';
const DATA_PATH = path.join(__dirname, '..', '_data', 'reviews.yml');
const BACKUP_PATH = path.join(__dirname, '..', '_data', 'reviews.backup.yml');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
          },
        },
        (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`Request failed with status ${res.statusCode}`));
            return;
          }

          let html = '';
          res.on('data', (chunk) => {
            html += chunk.toString();
          });
          res.on('end', () => resolve(html));
        },
      )
      .on('error', reject);
  });
}

function cleanHtml($, element) {
  const clone = $(element).clone();
  clone.find('script, style, noscript').remove();
  const html = clone.html() || '';
  return html.trim();
}

function textFrom($, element) {
  const value = $(element).text().trim();
  return value || null;
}

function parseRating(card) {
  const ratingValue = card.find('[itemprop="ratingValue"]').attr('content');
  if (ratingValue) return { rating: parseFloat(ratingValue), ratingMax: 5 };

  const ariaLabel = card
    .find('[aria-label*="star"], [data-test*="rating"], .tt-rating')
    .first()
    .attr('aria-label');

  if (ariaLabel) {
    const match = ariaLabel.match(/([0-9.]+)\s*(?:out of\s*([0-9.]+))?/i);
    if (match) {
      const rating = parseFloat(match[1]);
      const ratingMax = match[2] ? parseFloat(match[2]) : 5;
      if (!Number.isNaN(rating)) return { rating, ratingMax };
    }
  }

  const starCount = card.find('[data-test="star"], .tt-star').length;
  if (starCount) return { rating: starCount, ratingMax: 5 };

  return { rating: null, ratingMax: 5 };
}

function slugify(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toIsoDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split('T')[0];
}

function flattenArrayDeep(value) {
  if (!Array.isArray(value)) return [value];
  const out = [];
  for (const item of value) out.push(...flattenArrayDeep(item));
  return out;
}

function findJsonLdReviews(html) {
  const $ = load(html);
  const scripts = $('script[type="application/ld+json"]');
  if (!scripts.length) return [];

  const reviews = [];

  scripts.each((_, el) => {
    const raw = $(el).text();
    if (!raw) return;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    const candidates = [];
    if (Array.isArray(parsed)) candidates.push(...parsed);
    else candidates.push(parsed);

    for (const candidate of candidates) {
      const graph = candidate && candidate['@graph'];
      const nodes = Array.isArray(graph) ? graph : [candidate];

      for (const node of nodes) {
        if (!node || typeof node !== 'object') continue;
        if (!node.review) continue;

        const flattened = flattenArrayDeep(node.review);
        for (const review of flattened) {
          if (!review || typeof review !== 'object') continue;
          const authorName =
            (review.author && (review.author.name || review.author['@name'])) ||
            review.authorName ||
            'Client';
          const description = review.description || review.reviewBody || '';
          const date = toIsoDate(review.datePublished);
          const ratingValue =
            (review.reviewRating && review.reviewRating.ratingValue) ||
            review.ratingValue ||
            null;
          const rating = ratingValue != null ? Number(ratingValue) : null;

          const quote = escapeHtml(description).replace(/\n+/g, '<br>');
          const quoteHtml = quote ? `<p>${quote}</p>` : '';

          reviews.push({
            author: String(authorName).trim() || 'Client',
            date,
            rating: Number.isFinite(rating) ? rating : null,
            rating_max: 5,
            quote_html: quoteHtml,
          });
        }
      }
    }
  });

  return reviews;
}

function parseDate($, card) {
  const time = card.find('time').first();
  const datetime = time.attr('datetime');
  if (datetime) return datetime.trim();

  const text = textFrom($, time);
  if (text) {
    const parsed = new Date(text);
    if (!isNaN(parsed)) return parsed.toISOString().split('T')[0];
  }
  return null;
}

function extractReviews(html) {
  const jsonLd = findJsonLdReviews(html);
  if (jsonLd.length) {
    return jsonLd.map((review, index) => {
      const baseSlug = slugify(review.author);
      const dateSlug = review.date ? review.date : 'unknown-date';
      return {
        id: `thumbtack-${baseSlug || 'client'}-${dateSlug}-${index + 1}`,
        source: 'Thumbtack',
        platform: 'Thumbtack',
        rating: review.rating,
        rating_max: review.rating_max || 5,
        quote_html: review.quote_html,
        author: review.author,
        location: null,
        job_type: null,
        date: review.date,
        badges: [],
        url: SERVICE_URL,
      };
    });
  }

  const $ = load(html);

  const reviewCards = $(
    [
      '[data-test="review-card"]',
      '[data-testid="review-card"]',
      'article:has([data-test="review-card-header"])',
      '.review-card',
      'section:has([itemprop="reviewBody"])',
    ].join(', '),
  );

  if (!reviewCards.length) {
    throw new Error(
      'No review cards found in JSON-LD or DOM. Thumbtack may have changed their markup.',
    );
  }

  return reviewCards
    .map((index, el) => {
      const card = $(el);

      const body = card
        .find(
          '[data-test="review-card-body"], [data-testid="review-body"], [itemprop="reviewBody"], .review-body',
        )
        .first();
      const author =
        textFrom(
          $,
          card
            .find(
              '[data-test*="consumer-name"], [itemprop="author"], [data-testid*="reviewer"], .reviewer, .reviewer-name',
            )
            .first(),
        ) || 'Client';
      const location =
        textFrom(
          $,
          card
            .find(
              '[data-test*="location"], .consumer-location, .reviewer-location',
            )
            .first(),
        ) || null;
      const jobType =
        textFrom(
          $,
          card
            .find(
              '[data-test*="project"], [data-test*="job"], .project-type, .job-type',
            )
            .first(),
        ) || null;
      const date = parseDate($, card);
      const badgeEls = card.find('[data-test*="badge"], .badge, .pill, .chip');
      const badges = badgeEls
        .map((_, badgeEl) => textFrom($, badgeEl))
        .get()
        .filter(Boolean);

      const { rating, ratingMax } = parseRating(card);

      const quoteHtml = body.length ? cleanHtml($, body) : '';
      const baseSlug = slugify(author);
      const id = `thumbtack-${baseSlug || 'client'}-${index + 1}`;

      return {
        id,
        source: 'Thumbtack',
        platform: 'Thumbtack',
        rating: rating || null,
        rating_max: ratingMax || 5,
        quote_html: quoteHtml,
        author,
        location,
        job_type: jobType,
        date,
        badges,
        url: SERVICE_URL,
      };
    })
    .get();
}

function backupExisting() {
  if (fs.existsSync(DATA_PATH)) {
    fs.copyFileSync(DATA_PATH, BACKUP_PATH);
    console.log(`Backed up existing data to ${BACKUP_PATH}`);
  }
}

function writeYaml(reviews) {
  const yamlBody = yaml.dump({ reviews }, { lineWidth: 1000 });
  fs.writeFileSync(DATA_PATH, yamlBody);
  console.log(`Wrote ${reviews.length} review(s) to ${DATA_PATH}`);
}

async function main() {
  try {
    console.log(`Fetching Thumbtack reviews from ${SERVICE_URL}`);
    const html = await fetchHtml(SERVICE_URL);
    const reviews = extractReviews(html);

    if (!reviews.length) {
      throw new Error(
        'Parsed review list is empty; aborting write to prevent data loss.',
      );
    }

    backupExisting();
    writeYaml(reviews);
  } catch (error) {
    console.error('Failed to sync Thumbtack reviews:', error.message);
    process.exitCode = 1;
  }
}

main();
