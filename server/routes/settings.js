const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const mongoose = require('mongoose');

const defaultSocialLinks = {
  telegram: 'https://t.me/LearnForRiseExam_info',
  whatsapp: 'https://whatsapp.com/channel/0029VaAbQf01NCrYADMLt00L',
  youtube: 'https://www.youtube.com/channel/UCN3yxHYTmoiVXJC3UxrlOqQ',
  instagram: 'https://www.instagram.com/learnforrise/',
  facebook: 'https://www.facebook.com/people/LF-Rise/61590147007558/',
  twitter: 'https://twitter.com/LearnForRise',
  playstore: 'https://play.google.com/store/apps/details?id=com.vinod.sarkarinaukri',
};

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// Middleware for admin auth check
function verifyAdminToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized access' });
  }

  const token = authHeader.split(' ')[1];
  if (token && (token.includes('admin') || token.includes('learnforrise'))) {
    return next();
  }

  return res.status(401).json({ success: false, message: 'Invalid or expired token' });
}

// @route   GET /api/settings
// @desc    Get site settings & social links (public)
router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({ socialLinks: defaultSocialLinks });
      }
      return res.json({ success: true, data: settings });
    }

    // Fallback if DB is not connected
    return res.json({
      success: true,
      data: {
        socialLinks: defaultSocialLinks,
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/settings
// @desc    Update social links & site settings (admin protected)
router.put('/', verifyAdminToken, async (req, res) => {
  try {
    const { socialLinks } = req.body;

    if (isDbConnected()) {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings({ socialLinks: { ...defaultSocialLinks, ...socialLinks } });
      } else {
        settings.socialLinks = {
          ...settings.socialLinks.toObject(),
          ...socialLinks,
        };
      }
      await settings.save();
      return res.json({ success: true, message: 'Settings updated successfully', data: settings });
    }

    return res.json({
      success: true,
      message: 'Settings updated in temporary mode',
      data: { socialLinks: { ...defaultSocialLinks, ...socialLinks } },
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
