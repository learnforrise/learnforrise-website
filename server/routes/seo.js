const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const fallbackPosts = require('../data/postsFallback.json');
const mongoose = require('mongoose');

const baseUrl = 'https://learnforrise.com';

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// @route   GET /sitemap.xml
// @desc    Generate dynamic XML sitemap for all categories & posts
router.get('/sitemap.xml', async (req, res) => {
  try {
    let posts = [];
    if (isDbConnected()) {
      posts = await Post.find({ status: 'published' }).select('slug category updatedAt createdAt').lean();
    }
    if (!posts || posts.length === 0) {
      posts = fallbackPosts;
    }

    const categories = ['latest-jobs', 'result', 'admit-card', 'answer-key', 'syllabus', 'admission'];
    const staticPages = ['', 'about', 'contact', 'privacy-policy', 'disclaimer'];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    staticPages.forEach((page) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page ? `/${page}` : ''}</loc>\n`;
      xml += `    <changefreq>${page === '' ? 'always' : 'monthly'}</changefreq>\n`;
      xml += `    <priority>${page === '' ? '1.0' : '0.5'}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Categories
    categories.forEach((cat) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/${cat}</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    });

    // Posts
    posts.forEach((post) => {
      const cat = post.category || 'latest-jobs';
      const lastMod = post.updatedAt || post.createdAt || new Date().toISOString();
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/${cat}/${post.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(lastMod).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap XML:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// @route   GET /feed.xml or /rss.xml
// @desc    Generate RSS 2.0 feed for Google News & RSS Readers
const handleRssFeed = async (req, res) => {
  try {
    let posts = [];
    if (isDbConnected()) {
      posts = await Post.find({ status: 'published' }).sort({ createdAt: -1 }).limit(100).lean();
    }
    if (!posts || posts.length === 0) {
      posts = fallbackPosts.slice(0, 100);
    }

    const itemsXml = posts
      .map((post) => {
        const postUrl = `${baseUrl}/${post.category || 'latest-jobs'}/${post.slug}`;
        const pubDate = post.publishedAt || post.createdAt ? new Date(post.publishedAt || post.createdAt).toUTCString() : new Date().toUTCString();
        const description = (post.shortDescription || post.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <category><![CDATA[${post.category || 'latest-jobs'}]]></category>
    </item>`;
      })
      .join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LearnForRise — Government Jobs, Results, Admit Cards &amp; Notifications</title>
    <link>${baseUrl}</link>
    <description>Real-time Sarkari Result, Latest Jobs, Admit Card, Answer Key, and Syllabus updates across India.</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

    res.header('Content-Type', 'application/xml');
    res.send(rssXml);
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    res.status(500).send('Error generating RSS feed');
  }
};

router.get('/feed.xml', handleRssFeed);
router.get('/rss.xml', handleRssFeed);

// @route   GET /robots.txt
// @desc    Serve robots.txt
router.get('/robots.txt', (req, res) => {
  const robotsText = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/feed.xml`;

  res.header('Content-Type', 'text/plain');
  res.send(robotsText);
});

// @route   GET /llms.txt
// @desc    Serve llms.txt manifest for AI crawlers
router.get('/llms.txt', (req, res) => {
  const llmsText = `# LearnForRise — Official Government Job & Exam Result Information Portal

> LearnForRise (learnforrise.com) is a premier Indian government job portal providing real-time notifications for Latest Sarkari Jobs, Exam Results, Admit Cards, Official Answer Keys, Syllabus PDFs, and Admissions.

## Site Structure & API Documentation
- Primary URL: https://learnforrise.com
- OpenAPI Health Check: https://learnforrise.com/api/health
- XML Sitemap: https://learnforrise.com/sitemap.xml
- RSS Feed: https://learnforrise.com/feed.xml

## Main Content Categories
- Latest Jobs: https://learnforrise.com/latest-jobs
- Exam Results: https://learnforrise.com/result
- Admit Cards: https://learnforrise.com/admit-card
- Answer Keys: https://learnforrise.com/answer-key
- Syllabus & Exam Pattern: https://learnforrise.com/syllabus
- Admissions: https://learnforrise.com/admission
`;

  res.header('Content-Type', 'text/plain');
  res.send(llmsText);
});

module.exports = router;
