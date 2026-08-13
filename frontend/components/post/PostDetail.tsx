'use client';

import React from 'react';
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

  return (
    <article className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header section */}
      <div className="space-y-4 border-b border-[var(--border-color)] pb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="category">{getCategoryDisplayName(post.category)}</Badge>
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
          <h3 className="font-heading font-bold text-lg text-[var(--text-main)]">
            Important Dates
          </h3>
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
          <h3 className="font-heading font-bold text-lg text-[var(--text-main)]">
            Full Details & Overview
          </h3>
          <div
            className="prose dark:prose-invert max-w-none text-sm text-[var(--text-main)] leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: cleanPostDescription(post.fullDescription) }}
          />
        </div>
      )}

      {/* Share Section */}
      <div className="border-t border-[var(--border-color)] pt-6">
        <ShareButtons title={post.title} />
      </div>
    </article>
  );
}
