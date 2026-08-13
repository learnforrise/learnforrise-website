const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    socialLinks: {
      telegram: {
        type: String,
        default: 'https://t.me/LearnForRiseExam_info',
      },
      whatsapp: {
        type: String,
        default: 'https://whatsapp.com/channel/0029VaAbQf01NCrYADMLt00L',
      },
      youtube: {
        type: String,
        default: 'https://www.youtube.com/channel/UCN3yxHYTmoiVXJC3UxrlOqQ',
      },
      instagram: {
        type: String,
        default: 'https://www.instagram.com/learnforrise/',
      },
      facebook: {
        type: String,
        default: 'https://www.facebook.com/people/LF-Rise/61590147007558/',
      },
      twitter: {
        type: String,
        default: 'https://twitter.com/LearnForRise',
      },
      playstore: {
        type: String,
        default: 'https://play.google.com/store/apps/details?id=com.vinod.sarkarinaukri',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', SettingsSchema);
