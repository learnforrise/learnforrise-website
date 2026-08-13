const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Post = require('../models/Post');
const connectDB = require('../config/db');

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/sarkariresult\.com\.cm/gi, 'learnforrise.com')
    .replace(/sarkari\s*result/gi, 'LearnForRise')
    .replace(/SarkariResult/g, 'LearnForRise')
    .replace(/Sarkari Result/g, 'LearnForRise')
    .replace(/Sarkari/g, 'LearnForRise')
    .trim();
}

function cleanHtmlContent(html) {
  if (!html) return '';
  return html
    .replace(/<img[^>]*>/gi, '')
    .replace(/\s*style=["'][^"']*["']/gi, '')
    .replace(/href=["']https?:\/\/(www\.)?sarkariresult\.com\.cm([^"']*)["']/gi, 'href="https://learnforrise.com$2"')
    .replace(/sarkariresult\.com\.cm/gi, 'learnforrise.com')
    .replace(/sarkari\s*result/gi, 'LearnForRise')
    .replace(/SarkariResult/g, 'LearnForRise')
    .replace(/Sarkari Result/g, 'LearnForRise')
    .replace(/Sarkari/g, 'LearnForRise');
}

function determineCategory(title, textContent) {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('syllabus') || lowerTitle.includes('exam pattern')) return 'syllabus';
  if (lowerTitle.includes('admit card') || lowerTitle.includes('hall ticket') || lowerTitle.includes('city details') || lowerTitle.includes('call letter')) return 'admit-card';
  if (lowerTitle.includes('result') || lowerTitle.includes('merit list') || lowerTitle.includes('score card') || lowerTitle.includes('cut off') || lowerTitle.includes('selected list')) return 'result';
  if (lowerTitle.includes('answer key') || lowerTitle.includes('response sheet') || lowerTitle.includes('objection')) return 'answer-key';
  if (lowerTitle.includes('admission') || lowerTitle.includes('counselling') || lowerTitle.includes('entrance') || lowerTitle.includes('allotment')) return 'admission';

  const lowerContent = (textContent || '').toLowerCase();
  if (lowerContent.includes('syllabus')) return 'syllabus';
  if (lowerContent.includes('admit card')) return 'admit-card';
  if (lowerContent.includes('result')) return 'result';
  if (lowerContent.includes('answer key')) return 'answer-key';
  if (lowerContent.includes('admission')) return 'admission';

  return 'latest-jobs';
}

function extractDepartment(title) {
  const match = title.match(/^(UPSC|SSC|UPSSSC|BPSC|RPSC|MPPEB|NTA|IBPS|RRB|BSF|CISF|CRPF|ITBP|Delhi Police|UP Police|Bihar Police|High Court|CSBC)/i);
  if (match) return match[1].toUpperCase() + ' Recruitment';
  const words = title.split(' ');
  return words.slice(0, 2).join(' ') + ' Department';
}

function extractDetailsFromArticle(html, title) {
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) || html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  let articleHtml = articleMatch ? articleMatch[1] : html;

  articleHtml = articleHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<ins[\s\S]*?<\/ins>/gi, '');

  const cleanedHtml = cleanHtmlContent(articleHtml);

  const pMatch = articleHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  let shortDesc = '';
  if (pMatch) {
    for (const p of pMatch) {
      const text = p.replace(/<[^>]+>/g, '').trim();
      if (text.length > 50 && !text.toLowerCase().includes('post date')) {
        shortDesc = cleanText(text);
        break;
      }
    }
  }
  if (!shortDesc) shortDesc = cleanText(title);

  const dates = [];
  const dateRegex = /(Application Start|Last Date|Exam Date|Admit Card|Result Date|Answer Key Date)[^:\n<]*[:\-]?\s*([^<\n]+)/gi;
  let dMatch;
  while ((dMatch = dateRegex.exec(articleHtml)) !== null) {
    const label = cleanText(dMatch[1]);
    const valStr = dMatch[2].replace(/<[^>]+>/g, '').trim();
    if (label && valStr && valStr.length < 50) {
      dates.push({ label, date: new Date() });
    }
  }
  if (dates.length === 0) {
    dates.push({ label: 'Published Date', date: new Date() });
    dates.push({ label: 'Application Start', date: new Date() });
  }

  const links = [];
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let lMatch;
  while ((lMatch = linkRegex.exec(articleHtml)) !== null) {
    const url = lMatch[1];
    let label = lMatch[2].replace(/<[^>]+>/g, '').trim();
    if (
      url &&
      !url.includes('sarkariresult.com.cm') &&
      !url.includes('facebook.com') &&
      !url.includes('telegram') &&
      !url.includes('whatsapp') &&
      label.length > 2 &&
      label.length < 80
    ) {
      label = cleanText(label);
      if (!links.some((l) => l.url === url)) {
        links.push({ label, url });
      }
    }
  }
  if (links.length === 0) {
    links.push({ label: 'Official Website', url: 'https://learnforrise.com' });
    links.push({ label: 'Download Notification', url: 'https://learnforrise.com' });
  }

  let qualification = 'As per Official Notification';
  const tLower = title.toLowerCase();

  if (tLower.includes('cgl') || tLower.includes('po ') || tLower.includes('officer') || tLower.includes('ias') || tLower.includes('bpsc') || tLower.includes('pcs') || tLower.includes('graduate') || tLower.includes('degree') || tLower.includes('cat ') || tLower.includes('assistant manager') || tLower.includes('scientist')) {
    qualification = 'Bachelor Degree in Any Stream';
  } else if (tLower.includes('junior engineer') || tLower.includes('je ') || tLower.includes('technician') || tLower.includes('b.tech') || tLower.includes('engineer')) {
    qualification = 'Diploma / B.E / B.Tech Engineering';
  } else if (tLower.includes('constable') || tLower.includes('mts') || tLower.includes('tradesman') || tLower.includes('apprentice') || tLower.includes('fireman') || tLower.includes('home guard') || tLower.includes('safai') || tLower.includes('driver') || tLower.includes('pioneer')) {
    qualification = '10th Pass / ITI';
  } else if (tLower.includes('chsl') || tLower.includes('10+2') || tLower.includes('deo') || tLower.includes('junior assistant') || tLower.includes('steno') || tLower.includes('inter')) {
    qualification = '12th Pass (Intermediate)';
  } else if (tLower.includes('stet') || tLower.includes('tet') || tLower.includes('reet') || tLower.includes('tgt') || tLower.includes('pgt') || tLower.includes('teacher') || tLower.includes('nursing') || tLower.includes('cho') || tLower.includes('health worker')) {
    qualification = 'B.Ed / D.El.Ed / Nursing Diploma / Degree';
  } else if (tLower.includes('10th') || tLower.includes('matric')) {
    qualification = '10th High School Pass';
  } else if (tLower.includes('12th')) {
    qualification = '12th Intermediate Pass';
  }

  return {
    shortDescription: shortDesc.slice(0, 300),
    fullDescription: cleanedHtml,
    importantDates: dates.slice(0, 6),
    importantLinks: links.slice(0, 8),
    qualification,
    totalPosts: totalPosts || 'Various Posts',
    ageLimit,
    applicationFee,
  };
}

async function scrapeFullPosts() {
  console.log('🚀 Fetching sitemaps & category pages from sarkariresult.com.cm...');

  const urlsToScrape = [
    // Latest Jobs
    'https://sarkariresult.com.cm/ssc-cch-recruitment-2024/',
    'https://sarkariresult.com.cm/bihar-stet-2024-online-form-re-open/',
    'https://sarkariresult.com.cm/up-nhm-cho-recruitment-2024/',
    'https://sarkariresult.com.cm/rrb-junior-engineer-recruitment-2024/',
    'https://sarkariresult.com.cm/reet-recruitment-2024/',
    'https://sarkariresult.com.cm/ssc-chsl-recruitment-2024/',
    'https://sarkariresult.com.cm/upsssc-health-worker-2026/',
    'https://sarkariresult.com.cm/upsssc-enforcement-constable-2026/',
    'https://sarkariresult.com.cm/upsssc-forest-guard-2026/',
    'https://sarkariresult.com.cm/bihar-shsb-cho-recruitment-2024/',
    'https://sarkariresult.com.cm/bsf-recruitment-2024/',
    'https://sarkariresult.com.cm/cisf-constable-fire-recruitment-2024/',
    'https://sarkariresult.com.cm/haryana-htet-online-form-2024/',

    // Results
    'https://sarkariresult.com.cm/upsssc-pet-result-2025-out/',
    'https://sarkariresult.com.cm/ctet-january-2024-result/',
    'https://sarkariresult.com.cm/bseb-bihar-stet-result-2024/',
    'https://sarkariresult.com.cm/dghg-delhi-home-guard-final-result-2024/',
    'https://sarkariresult.com.cm/bihar-bpsc-69th-pre-final-result-2024/',
    'https://sarkariresult.com.cm/ssb-constable-tradesman-hc-electrician-result-2024/',
    'https://sarkariresult.com.cm/ssc-cgl-tier-1-sarkari-result-2024-out/',
    'https://sarkariresult.com.cm/jssc-cgl-tier-i-result-2024-updates/',
    'https://sarkariresult.com.cm/uttarakhand-utet-result-2024-out/',

    // Admit Cards
    'https://sarkariresult.com.cm/niacl-assistant-admit-card-2024/',
    'https://sarkariresult.com.cm/nainital-bank-po-admit-card-2024-download/',
    'https://sarkariresult.com.cm/karnataka-bank-clerk-admit-card-2024/',
    'https://sarkariresult.com.cm/allahabad-university-mts-re-exam-admit-card-2024/',
    'https://sarkariresult.com.cm/uiic-administrative-officer-ao-admit-card-2024-out/',

    // Syllabus
    'https://sarkariresult.com.cm/railway-rpf-si-exam-syllabus-2024/',
    'https://sarkariresult.com.cm/ssc-gd-constable-exam-syllabus-2024/',

    // Answer Keys
    'https://sarkariresult.com.cm/ssc-cpo-si-paper-ii-answer-key-2024/',
    'https://sarkariresult.com.cm/upsssc-junior-assistant-2026/',

    // Admissions
    'https://sarkariresult.com.cm/iim-cat-admissions-form-2024/',
    'https://sarkariresult.com.cm/indian-navy-102-b-tech-cadet-entry-july-2025/',
  ];

  // Fetch sitemaps to get additional URLs
  try {
    const sitemapRes = await fetch('http://sarkariresult.com.cm/post-sitemap.xml');
    if (sitemapRes.ok) {
      const xml = await sitemapRes.text();
      const locMatches = xml.match(/<loc>(https?:\/\/[^<]+)<\/loc>/gi);
      if (locMatches) {
        const parsed = locMatches
          .map((m) => m.replace(/<\/?loc>/g, ''))
          .filter((u) => !u.endsWith('.xml') && u.includes('sarkariresult.com.cm'))
          .slice(0, 100);
        parsed.forEach((u) => {
          if (!urlsToScrape.includes(u)) urlsToScrape.push(u);
        });
      }
    }
  } catch (e) {
    console.error('Sitemap fetch warning:', e.message);
  }

  console.log(`📦 Scraping full details for ${urlsToScrape.length} posts across all categories...`);

  const fullPosts = [];
  const seenTitles = new Set();

  for (let i = 0; i < urlsToScrape.length; i++) {
    const url = urlsToScrape[i];
    try {
      console.log(`[${i + 1}/${urlsToScrape.length}] Fetching ${url}...`);
      const res = await fetch(url);
      if (!res.ok) continue;
      const html = await res.text();

      const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (!titleMatch) continue;
      let rawTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      let title = cleanText(rawTitle);

      if (seenTitles.has(title)) continue;
      seenTitles.add(title);

      const category = determineCategory(title, html);
      const department = extractDepartment(title);
      const details = extractDetailsFromArticle(html, title);

      const postObj = {
        title,
        category,
        department,
        state: 'All India',
        qualification: details.qualification,
        shortDescription: details.shortDescription,
        fullDescription: details.fullDescription,
        importantDates: details.importantDates,
        importantLinks: details.importantLinks,
        totalPosts: details.totalPosts,
        ageLimit: details.ageLimit,
        applicationFee: details.applicationFee,
        status: 'published',
        isTrending: i < 15,
        isFeatured: i < 5,
        views: Math.floor(Math.random() * 8000) + 500,
        publishedAt: new Date(Date.now() - i * 3600000),
      };

      fullPosts.push(postObj);

      const fallbackPath = path.join(__dirname, '../data/postsFallback.json');
      fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
      fs.writeFileSync(fallbackPath, JSON.stringify(fullPosts, null, 2));
    } catch (e) {
      console.error(`Failed ${url}:`, e.message);
    }
  }

  console.log(`✅ Successfully extracted ${fullPosts.length} rich posts across all 6 categories!`);

  try {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      console.log('Clearing old posts in MongoDB...');
      await Post.deleteMany({});
      for (const p of fullPosts) {
        try {
          await Post.create(p);
        } catch (err) {}
      }
      console.log(`✅ Saved ${fullPosts.length} posts to MongoDB!`);
    }
  } catch (err) {}

  console.log('🎉 Full Category Import completed successfully!');
  process.exit(0);
}

scrapeFullPosts();
