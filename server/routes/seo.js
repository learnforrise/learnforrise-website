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

// @route   GET /robots.txt
// @desc    Serve robots.txt
router.get('/robots.txt', (req, res) => {
  const robotsText = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`;

  res.header('Content-Type', 'text/plain');
  res.send(robotsText);
});

module.exports = router;
