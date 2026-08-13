'use client';

import React from 'react';
import Link from 'next/link';
import { Post } from '@/types/post';
import { Badge } from '../ui/Badge';
import { ImportantLinks } from './ImportantLinks';
import { ShareButtons } from '../ui/ShareButtons';
import { formatDate, isNewPost, getCategoryDisplayName, cleanPostDescription } from '@/lib/utils';
import { Countdown } from '../ui/Countdown';

interface PostDetailProps {
  post: Post;
}

export function PostDetail({ post }: PostDetailProps) {
  const isNew = isNewPost(post.publishedAt || post.createdAt);
  const categoryLabel = getCategoryDisplayName(post.category);

  return (
    <article className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Breadcrumb Navigation for SXO & Search Crawlers */}
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)] flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-[var(--text-main)] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href={`/${post.category}`} className="hover:text-[var(--text-main)] transition-colors">
          {categoryLabel}
        </Link>
        <span>/</span>
        <span className="text-[var(--text-main)] font-medium truncate max-w-[240px] sm:max-w-md">
          {post.title}
        </span>
      </nav>

      {/* Header section */}
      <div className="space-y-4 border-b border-[var(--border-color)] pb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="category">{categoryLabel}</Badge>
          {post.isTrending && <Badge variant="urgent">Trending</Badge>}
          {isNew && <Badge variant="new">New</Badge>}
          {post.state && <Badge variant="default">{post.state}</Badge>}
        </div>

        <h1 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-[var(--text-main)] leading-tight">
          {post.title}
        </h1>

        {post.department && (
          <p className="text-sm font-medium text-[var(--text-muted)]">
            {post.department}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--text-muted)] pt-2">
          <span>Published on {formatDate(post.publishedAt || post.createdAt)}</span>
          {post.views > 0 && <span>{post.views.toLocaleString('en-IN')} views</span>}
        </div>
      </div>

      {/* Quick summary grid: Eligibility, Fee, Age limit, Vacancies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {post.totalPosts && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">Total Vacancies</span>
            <span className="font-heading font-bold text-base text-[var(--text-main)]">
              {post.totalPosts}
            </span>
          </div>
        )}

        {post.qualification && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">Qualification</span>
            <span className="font-heading font-semibold text-xs md:text-sm text-[var(--text-main)] line-clamp-2">
              {post.qualification}
            </span>
          </div>
        )}

        {post.ageLimit && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">Age Limit</span>
            <span className="font-heading font-semibold text-xs md:text-sm text-[var(--text-main)]">
              {post.ageLimit}
            </span>
          </div>
        )}

        {post.applicationFee && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">Application Fee</span>
            <span className="font-heading font-semibold text-xs md:text-sm text-[var(--text-main)]">
              {post.applicationFee}
            </span>
          </div>
        )}
      </div>

      {/* Important Dates Table */}
      {post.importantDates && post.importantDates.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-heading font-bold text-lg text-[var(--text-main)]">
            Important Dates
          </h2>
          <div className="divide-y divide-[var(--border-color)]">
            {post.importantDates.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--text-main)]">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--text-muted)]">{formatDate(item.date)}</span>
                  <Countdown targetDate={item.date} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important Links Box */}
      <ImportantLinks links={post.importantLinks || []} />

      {/* Full Description / HTML Content */}
      {post.fullDescription && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-heading font-bold text-lg text-[var(--text-main)]">
            Full Details & Overview
          </h2>
          <div
            className="prose dark:prose-invert max-w-none text-sm text-[var(--text-main)] leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: cleanPostDescription(post.fullDescription) }}
          />
        </div>
      )}

      {/* AEO (Answer Engine Optimization) & Q&A Summary Box */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-heading font-bold text-lg text-[var(--text-main)]">
          Frequently Asked Questions (FAQ)
        </h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-[var(--text-main)]">Q: What is the post name for this notification?</h3>
            <p className="text-[var(--text-muted)] mt-1">{post.title}</p>
          </div>
          {post.totalPosts && (
            <div>
              <h3 className="font-semibold text-[var(--text-main)]">Q: How many total posts are available?</h3>
              <p className="text-[var(--text-muted)] mt-1">A total of {post.totalPosts} vacancies have been announced.</p>
            </div>
          )}
          {post.qualification && (
            <div>
              <h3 className="font-semibold text-[var(--text-main)]">Q: What is the eligibility qualification required?</h3>
              <p className="text-[var(--text-muted)] mt-1">{post.qualification}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-[var(--text-main)]">Q: Where can I apply for this notification?</h3>
            <p className="text-[var(--text-muted)] mt-1">
              You can check official apply and notification download links in the Important Links section above on LearnForRise.
            </p>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="border-t border-[var(--border-color)] pt-6">
        <ShareButtons title={post.title} />
      </div>
    </article>
  );
}
