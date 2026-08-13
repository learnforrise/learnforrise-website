'use client';

import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings, SocialLinks } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    telegram: '',
    whatsapp: '',
    youtube: '',
    instagram: '',
    facebook: '',
    twitter: '',
    playstore: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await getSettings();
        if (res.success && res.data?.socialLinks) {
          setSocialLinks(res.data.socialLinks);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (field: keyof SocialLinks, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('lfr_admin_token') : null;
    if (!token) {
      setMessage({ type: 'error', text: 'Authentication token missing. Please log in again.' });
      setSaving(false);
      return;
    }

    try {
      const res = await updateSettings(socialLinks, token);
      if (res.success) {
        setMessage({ type: 'success', text: 'Social media links updated successfully!' });
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update social links.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error connecting to server.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-sm text-[var(--text-muted)]">
        Loading site settings...
      </div>
    );
  }

  const fields: { key: keyof SocialLinks; label: string; placeholder: string; icon: string }[] = [
    {
      key: 'telegram',
      label: 'Telegram Channel / Group Link',
      placeholder: 'https://t.me/LearnForRiseExam_info',
      icon: '✈️',
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp Channel Link',
      placeholder: 'https://whatsapp.com/channel/...',
      icon: '💬',
    },
    {
      key: 'youtube',
      label: 'YouTube Channel Link',
      placeholder: 'https://youtube.com/@LearnForRise',
      icon: '▶️',
    },
    {
      key: 'instagram',
      label: 'Instagram Profile Link',
      placeholder: 'https://instagram.com/learnforrise',
      icon: '📸',
    },
    {
      key: 'facebook',
      label: 'Facebook Page Link',
      placeholder: 'https://facebook.com/people/LF-Rise/...',
      icon: '🌐',
    },
    {
      key: 'twitter',
      label: 'Twitter / X Profile Link',
      placeholder: 'https://twitter.com/LearnForRise',
      icon: '🐦',
    },
    {
      key: 'playstore',
      label: 'Google Play Store Android App Link',
      placeholder: 'https://play.google.com/store/apps/details?id=...',
      icon: '📱',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-6 space-y-1">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
          Manage Social Media Links & Platforms
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Configure social channels, WhatsApp & Telegram groups, and Play Store app links displayed across LearnForRise.
        </p>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-medium border transition-all ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-5">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-main)] flex items-center gap-2">
                <span>{field.icon}</span>
                <span>{field.label}</span>
              </label>
              <input
                type="url"
                value={socialLinks[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#0F9D6E] transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-end gap-4">
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? 'Saving...' : 'Save Social Links'}
          </Button>
        </div>
      </form>
    </div>
  );
}
